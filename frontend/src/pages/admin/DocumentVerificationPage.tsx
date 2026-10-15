import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  CheckSquare,
  FileText,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ExternalLink,
  ShieldCheck,
  Check,
  Download,
  Clock,
  Sparkles,
  Filter,
  User,
  GraduationCap
} from 'lucide-react';
import { ActionMenu } from '../../components/ui/ActionMenu';

const REJECTION_PRESETS = [
  'Scanned document is blurred or low resolution; grades and candidate details are illegible.',
  'Missing official examination board (WAEC) or school embossed seal and certified signature.',
  'Incomplete result slip; only partial subjects are shown or required 5 credits cannot be verified.',
  'Wrong document uploaded under this category; please upload the requested credential.',
  'Name on certificate does not match candidate application dossier without legal name change affidavit.',
  'Document expired or photographic identification is illegible.'
];

export const DocumentVerificationPage: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Side-by-side inspection drawer/modal
  const [inspectingDoc, setInspectingDoc] = useState<any | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [checklist, setChecklist] = useState({
    nameMatches: false,
    stampVisible: false,
    creditsValid: false,
    authenticDoc: false,
  });

  // Rejection state inside inspection modal & standalone modal
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const apps: any[] = await api.get('/admin/applications');
      const allDocs: any[] = [];
      apps.forEach((app) => {
        (app.documents || []).forEach((doc: any) => {
          allDocs.push({
            ...doc,
            applicantName: `${app.applicant.firstName} ${app.applicant.surname}`,
            applicantEmail: app.applicant.email,
            applicantPhone: app.applicant.phone,
            applicationReference: app.applicationReference,
            courseName: app.course?.name || app.courseNameSnapshot,
            courseCode: app.course?.code,
          });
        });
      });
      setDocuments(allDocs);
    } catch (err) {
      console.error('Failed to load documents', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const openInspector = (doc: any) => {
    setInspectingDoc(doc);
    setZoomLevel(1);
    setRotation(0);
    setChecklist({
      nameMatches: doc.status === 'VERIFIED',
      stampVisible: doc.status === 'VERIFIED',
      creditsValid: doc.status === 'VERIFIED',
      authenticDoc: doc.status === 'VERIFIED',
    });
    setRejectionReason(doc.rejectionReason || '');
    setActionError('');
  };

  const closeInspector = () => {
    setInspectingDoc(null);
    setZoomLevel(1);
    setRotation(0);
    setRejectionReason('');
    setActionError('');
  };

  const handleVerify = async (docId: string) => {
    setIsSubmitting(true);
    try {
      await api.post(`/admin/documents/${docId}/verify`);
      setDocuments((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, status: 'VERIFIED', rejectionReason: null } : d))
      );
      if (inspectingDoc && inspectingDoc.id === docId) {
        setInspectingDoc({ ...inspectingDoc, status: 'VERIFIED', rejectionReason: null });
      }
      setActionError('');
    } catch (err: any) {
      setActionError(`Verification failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (docId: string) => {
    if (!rejectionReason.trim()) {
      setActionError('Please specify or select a rejection reason before rejecting.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/admin/documents/${docId}/reject`, {
        reason: rejectionReason.trim(),
      });

      setDocuments((prev) =>
        prev.map((d) =>
          d.id === docId
            ? { ...d, status: 'REJECTED', rejectionReason: rejectionReason.trim() }
            : d
        )
      );

      if (inspectingDoc && inspectingDoc.id === docId) {
        setInspectingDoc({ ...inspectingDoc, status: 'REJECTED', rejectionReason: rejectionReason.trim() });
      }
      setActionError('');
    } catch (err: any) {
      setActionError(`Rejection failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Metrics
  const pendingCount = documents.filter((d) => d.status === 'PENDING').length;
  const verifiedCount = documents.filter((d) => d.status === 'VERIFIED').length;
  const rejectedCount = documents.filter((d) => d.status === 'REJECTED').length;

  const filteredDocs = documents.filter((doc) => {
    const matchesFilter = filter === 'ALL' || doc.status === filter;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      doc.applicationReference?.toLowerCase().includes(q) ||
      doc.applicantName?.toLowerCase().includes(q) ||
      doc.documentType?.toLowerCase().includes(q) ||
      doc.originalFilename?.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-navy-950">
              Document Verification Suite
            </h1>
            <Badge variant="navy">{documents.length} Total Files</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Side-by-side credential inspection, pan/zoom authentication, and structured verification remarks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={fetchDocuments}
            className="text-xs"
          >
            Refresh Queue
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-slate-400 block">Total Credentials</span>
          <span className="text-2xl font-bold text-navy-950 mt-1 block">{documents.length}</span>
          <span className="text-[10px] text-slate-500">Across active dossiers</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-amber-600 block">Pending Verification</span>
          <span className="text-2xl font-bold text-amber-600 mt-1 block">{pendingCount}</span>
          <span className="text-[10px] text-slate-500">Awaiting officer review</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-emerald-600 block">Verified &amp; Authenticated</span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">{verifiedCount}</span>
          <span className="text-[10px] text-slate-500">Cleared for admission</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-rose-600 block">Flagged / Corrections</span>
          <span className="text-2xl font-bold text-rose-600 mt-1 block">{rejectedCount}</span>
          <span className="text-[10px] text-slate-500">Requires candidate action</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
          <input
            placeholder="Search by candidate name, application ref (e.g. KICTAMC-2026-000101), or file..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-600"
          />
        </div>

        <div className="flex gap-1.5 bg-white p-1 rounded-lg border border-slate-200 shadow-sm overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Credentials' },
            { id: 'PENDING', label: `Pending (${pendingCount})` },
            { id: 'VERIFIED', label: `Verified (${verifiedCount})` },
            { id: 'REJECTED', label: `Flagged (${rejectedCount})` },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setFilter(st.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition whitespace-nowrap ${
                filter === st.id
                  ? 'bg-navy-900 text-gold-400 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Documents List */}
      {isLoading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-navy-800 border-t-gold-500 rounded-full animate-spin" />
        </div>
      ) : filteredDocs.length === 0 ? (
        <Card className="text-center py-12">
          <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-600 font-medium">No documents found matching criteria.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredDocs.map((doc) => (
            <Card key={doc.id} className="p-4 hover:border-slate-300 transition">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-bold text-sm text-navy-950">{doc.applicantName}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                      {doc.applicationReference}
                    </span>
                    <Badge
                      variant={
                        doc.status === 'VERIFIED'
                          ? 'success'
                          : doc.status === 'REJECTED'
                          ? 'danger'
                          : 'warning'
                      }
                    >
                      {doc.status}
                    </Badge>
                  </div>

                  <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    <span>
                      Type: <strong>{doc.documentType.replace('_', ' ')}</strong>
                    </span>
                    <span>File: <strong className="font-mono text-slate-700">{doc.originalFilename}</strong></span>
                    <span>Size: {(doc.fileSizeBytes / 1024).toFixed(1)} KB</span>
                    <span>Uploaded: {new Date(doc.createdAt).toLocaleDateString('en-GB')}</span>
                    {doc.courseName && (
                      <span className="text-navy-900 font-medium">Program: {doc.courseName}</span>
                    )}
                  </div>

                  {doc.rejectionReason && (
                    <p className="mt-2 text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                      <strong>Rejection remarks sent to applicant:</strong> {doc.rejectionReason}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => openInspector(doc)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-navy-900 hover:bg-navy-800 text-gold-400 transition shadow-xs cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Inspect &amp; Verify</span>
                  </button>

                  <ActionMenu
                    label={`Actions for ${doc.originalFilename}`}
                    items={[
                      {
                        label: 'Side-by-Side Inspection',
                        icon: <Eye className="w-4 h-4 text-navy-800" />,
                        onClick: () => openInspector(doc),
                      },
                      {
                        label: 'Open Raw File (New Tab)',
                        icon: <ExternalLink className="w-4 h-4 text-slate-600" />,
                        onClick: () => window.open(`/api/v1/documents/${doc.id}/file`, '_blank'),
                      },
                      ...(doc.status !== 'VERIFIED'
                        ? [
                            {
                              label: 'Quick Approve',
                              icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
                              onClick: () => handleVerify(doc.id),
                            },
                          ]
                        : []),
                      ...(doc.status !== 'REJECTED'
                        ? [
                            {
                              label: 'Flag / Reject',
                              icon: <XCircle className="w-4 h-4 text-rose-600" />,
                              onClick: () => openInspector(doc),
                              variant: 'danger' as const,
                            },
                          ]
                        : []),
                    ]}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* STATE-OF-THE-ART SIDE-BY-SIDE INSPECTION MODAL */}
      {inspectingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-6xl w-full h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="p-4 sm:px-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gold-500/20 text-gold-400 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-white font-serif">
                      Document Inspection &amp; Credential Authentication
                    </h3>
                    <Badge
                      variant={
                        inspectingDoc.status === 'VERIFIED'
                          ? 'success'
                          : inspectingDoc.status === 'REJECTED'
                          ? 'danger'
                          : 'warning'
                      }
                    >
                      {inspectingDoc.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400">
                    Candidate: <strong className="text-slate-200">{inspectingDoc.applicantName}</strong> ({inspectingDoc.applicationReference})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`/api/v1/documents/${inspectingDoc.id}/file`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                  title="Open file in separate browser tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Open New Tab</span>
                </a>
                <button
                  type="button"
                  onClick={closeInspector}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body: Side-by-Side Panels */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
              {/* Left Column (7 cols = ~58%): Interactive Document Viewer */}
              <div className="lg:col-span-7 bg-slate-950 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 relative overflow-hidden">
                {/* Viewer Toolbar */}
                <div className="p-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300 flex-shrink-0 z-10">
                  <div className="flex items-center gap-2 font-mono text-[11px] truncate max-w-[280px]">
                    <span className="text-gold-400 font-bold uppercase">{inspectingDoc.documentType.replace('_', ' ')}:</span>
                    <span className="text-slate-300 truncate">{inspectingDoc.originalFilename}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.2))}
                      className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="font-mono text-[11px] px-1 text-slate-400">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.min(3, z + 0.2))}
                      className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition"
                      title="Rotate 90° Clockwise"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setZoomLevel(1);
                        setRotation(0);
                      }}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[11px] rounded font-semibold text-slate-200 transition"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Document Display Canvas */}
                <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950 relative">
                  {inspectingDoc.mimeType === 'application/pdf' ? (
                    <iframe
                      src={`/api/v1/documents/${inspectingDoc.id}/file#toolbar=0`}
                      title="PDF Document Viewer"
                      className="w-full h-full rounded border border-slate-800 bg-white"
                      style={{
                        transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                        transformOrigin: 'center center',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  ) : (
                    <img
                      src={`/api/v1/documents/${inspectingDoc.id}/file`}
                      alt={inspectingDoc.originalFilename}
                      className="max-h-full max-w-full object-contain rounded shadow-lg select-none"
                      style={{
                        transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                        transformOrigin: 'center center',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Right Column (5 cols = ~42%): Verification Dossier & Action Console */}
              <div className="lg:col-span-5 bg-white flex flex-col overflow-y-auto p-5 sm:p-6 space-y-5">
                {actionError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {actionError}
                  </div>
                )}

                {/* Candidate & Application Summary Card */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Candidate Dossier</span>
                    <span className="font-mono text-xs font-bold text-navy-900">{inspectingDoc.applicationReference}</span>
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Applicant:</span>
                      <strong className="text-navy-950 font-bold">{inspectingDoc.applicantName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Program:</span>
                      <span className="text-slate-800 font-medium">{inspectingDoc.courseName || 'Computer Science'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Email:</span>
                      <span className="font-mono text-slate-700">{inspectingDoc.applicantEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Phone:</span>
                      <span className="font-mono text-slate-700">{inspectingDoc.applicantPhone || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Verification Checklist */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-navy-950 mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-gold-600" />
                    Authentication Criteria Checklist
                  </h4>
                  <div className="space-y-2 text-xs">
                    {[
                      { key: 'nameMatches', label: 'Candidate full name matches application dossier exactly' },
                      { key: 'stampVisible', label: 'Official WAEC / School embossed stamp and signature verified' },
                      { key: 'creditsValid', label: 'Minimum 5 credit passes (including English & Maths) present' },
                      { key: 'authenticDoc', label: 'Credential is clean, un-tampered, and genuine' },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer border border-slate-100"
                      >
                        <input
                          type="checkbox"
                          checked={(checklist as any)[item.key]}
                          onChange={(e) =>
                            setChecklist({ ...checklist, [item.key]: e.target.checked })
                          }
                          className="mt-0.5 rounded text-navy-800 focus:ring-navy-600 w-4 h-4"
                        />
                        <span className="text-slate-700">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Structured Rejection Presets & Feedback */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900 mb-2 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    Correction Feedback / Rejection Presets
                  </h4>
                  <select
                    onChange={(e) => {
                      if (e.target.value) setRejectionReason(e.target.value);
                    }}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 mb-2 focus:ring-2 focus:ring-navy-600"
                  >
                    <option value="">-- Choose Standard Rejection Reason --</option>
                    {REJECTION_PRESETS.map((preset, idx) => (
                      <option key={idx} value={preset}>
                        {preset.slice(0, 75)}...
                      </option>
                    ))}
                  </select>

                  <textarea
                    rows={3}
                    placeholder="Enter or customize remarks to be sent directly to the applicant's portal & email..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                {/* Verification Action Buttons */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleVerify(inspectingDoc.id)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Approve &amp; Mark Credential Verified
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting || !rejectionReason.trim()}
                    onClick={() => handleReject(inspectingDoc.id)}
                    className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    Flag for Correction / Reject with Remarks
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
