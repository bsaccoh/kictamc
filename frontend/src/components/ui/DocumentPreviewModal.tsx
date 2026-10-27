import React, { useEffect, useState } from 'react';
import { X, Download, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { getAuthToken } from '../../services/api';

interface DocumentPreviewModalProps {
  open: boolean;
  onClose: () => void;
  documentId: string | null;
  title?: string;
  filename?: string;
  mimeType?: string;
  endpoint?: string;
}

const API_ORIGIN = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
  : '';

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  open,
  onClose,
  documentId,
  title = 'Document Preview',
  filename,
  mimeType,
  endpoint,
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [resolvedMime, setResolvedMime] = useState<string | undefined>(mimeType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !documentId) return;

    let revoked = false;
    let localUrl: string | null = null;
    setLoading(true);
    setError(null);
    setBlobUrl(null);

    const url = endpoint
      ? `${API_ORIGIN}${endpoint}`
      : `${API_ORIGIN}/api/v1/documents/${documentId}/file`;

    const token = getAuthToken();
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    fetch(url, { headers, credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(
            res.status === 403
              ? 'You do not have permission to view this file.'
              : res.status === 404
                ? 'Document not found.'
                : `Could not load document (HTTP ${res.status}).`
          );
        }
        const contentType = res.headers.get('content-type') || mimeType || 'application/octet-stream';
        const blob = await res.blob();
        if (revoked) return;
        localUrl = URL.createObjectURL(blob);
        setResolvedMime(contentType);
        setBlobUrl(localUrl);
      })
      .catch((err) => {
        if (!revoked) setError(err.message || 'Failed to load document.');
      })
      .finally(() => {
        if (!revoked) setLoading(false);
      });

    return () => {
      revoked = true;
      if (localUrl) URL.revokeObjectURL(localUrl);
    };
  }, [open, documentId, endpoint, mimeType]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const isPdf = resolvedMime?.includes('pdf');
  const isImage = resolvedMime?.startsWith('image/');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-5xl h-[90vh] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50 flex-shrink-0">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-slate-900 truncate">{title}</h3>
            {filename && (
              <p className="text-[11px] text-slate-500 truncate">{filename}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            {blobUrl && (
              <a
                href={blobUrl}
                download={filename || 'document'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-navy-800 border border-navy-200 hover:bg-navy-50 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 transition-colors"
              aria-label="Close preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden bg-slate-100 flex items-center justify-center">
          {loading && (
            <div className="flex flex-col items-center gap-3 text-slate-600">
              <Loader2 className="w-8 h-8 animate-spin text-navy-700" />
              <p className="text-sm">Loading document…</p>
            </div>
          )}
          {error && !loading && (
            <div className="flex flex-col items-center gap-3 text-slate-700 max-w-md text-center px-6">
              <AlertCircle className="w-10 h-10 text-rose-500" />
              <p className="text-sm font-semibold">Preview unavailable</p>
              <p className="text-xs text-slate-500">{error}</p>
            </div>
          )}
          {!loading && !error && blobUrl && isPdf && (
            <iframe
              src={blobUrl}
              className="w-full h-full border-0 bg-white"
              title={title}
            />
          )}
          {!loading && !error && blobUrl && isImage && (
            <div className="w-full h-full overflow-auto flex items-center justify-center p-4">
              <img
                src={blobUrl}
                alt={filename || title}
                className="max-w-full max-h-full object-contain shadow-md"
              />
            </div>
          )}
          {!loading && !error && blobUrl && !isPdf && !isImage && (
            <div className="flex flex-col items-center gap-3 text-slate-700 max-w-md text-center px-6">
              <FileText className="w-10 h-10 text-slate-400" />
              <p className="text-sm font-semibold">No in-browser preview</p>
              <p className="text-xs text-slate-500">
                This file type ({resolvedMime || 'unknown'}) can't be previewed. Use Download to open it.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
