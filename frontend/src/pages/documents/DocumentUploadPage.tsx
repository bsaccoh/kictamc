import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DocumentType } from '../../types/academic';
import {
  UploadCloud,
  FileCheck,
  FileX,
  Clock,
  Eye,
  Trash2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';

interface RequiredDocItem {
  type: DocumentType;
  title: string;
  description: string;
  mandatory: boolean;
}

const REQUIRED_DOCS: RequiredDocItem[] = [
  {
    type: 'EXAM_RESULT',
    title: 'WASSCE / GCE Result Slip or Certificate',
    description: 'Official examination results certificate or verified online scratch card printout.',
    mandatory: true,
  },
  {
    type: 'TESTIMONIAL',
    title: 'Secondary School Testimonial',
    description: 'Signed testimonial issued by the principal of your last attended secondary school.',
    mandatory: true,
  },
  {
    type: 'BIRTH_CERTIFICATE',
    title: 'Birth Certificate',
    description: 'Certified birth certificate from the National Civil Registration Authority (NCRA).',
    mandatory: true,
  },
  {
    type: 'PASSPORT_PHOTO',
    title: 'Recent Passport-size Photograph',
    description: 'Clear, front-facing portrait photograph with white or plain background.',
    mandatory: true,
  },
  {
    type: 'ID_DOCUMENT',
    title: 'National Identity / Voter Card / Passport',
    description: 'Valid national ID card or international passport biodata page.',
    mandatory: false,
  },
];

export const DocumentUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [application, setApplication] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchApplication = async () => {
    try {
      setIsLoading(true);
      const data: any = await api.post('/applications/draft');
      setApplication(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load application draft.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, []);

  const handleFileUpload = async (type: DocumentType, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !application) return;
    const file = e.target.files[0];

    // Client-side file size check (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds the 5MB maximum limit. Please select a smaller file.');
      return;
    }

    setUploadingType(type);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', type);

    try {
      await api.post(`/applications/${application.id}/documents`, formData);
      await fetchApplication();
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploadingType(null);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!application || !confirm('Are you sure you want to remove this uploaded document?')) return;
    try {
      await api.delete(`/applications/${application.id}/documents/${docId}`);
      await fetchApplication();
    } catch (err: any) {
      alert(`Failed to delete document: ${err.message}`);
    }
  };

  const uploadedDocsMap = new Map<string, any>();
  if (application?.documents) {
    application.documents.forEach((d: any) => {
      uploadedDocsMap.set(d.documentType, d);
    });
  }

  // Check if all mandatory documents have been uploaded
  const mandatoryCount = REQUIRED_DOCS.filter((d) => d.mandatory).length;
  const mandatoryUploadedCount = REQUIRED_DOCS.filter(
    (d) => d.mandatory && uploadedDocsMap.has(d.type)
  ).length;
  const isAllMandatoryUploaded = mandatoryUploadedCount >= mandatoryCount;

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-8 h-8 border-4 border-navy-800 border-t-gold-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-navy-950">Step 7: Document Upload & Verification</h1>
            <Badge variant="navy">{application?.applicationReference}</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Upload clear digital copies of your credentials (PDF, JPEG, or PNG, max 5MB).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={isAllMandatoryUploaded ? 'success' : 'warning'}>
            {mandatoryUploadedCount} of {mandatoryCount} Mandatory Uploaded
          </Badge>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm">
          {error}
        </div>
      )}

      {/* Document Checklist Items */}
      <div className="space-y-4">
        {REQUIRED_DOCS.map((docItem) => {
          const uploaded = uploadedDocsMap.get(docItem.type);
          const isUploading = uploadingType === docItem.type;

          return (
            <Card key={docItem.type} className="hover:border-slate-300 transition">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-navy-900">{docItem.title}</h3>
                    {docItem.mandatory ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                        Mandatory
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        Optional
                      </span>
                    )}

                    {uploaded && (
                      <Badge
                        variant={
                          uploaded.status === 'VERIFIED'
                            ? 'success'
                            : uploaded.status === 'REJECTED'
                            ? 'danger'
                            : 'neutral'
                        }
                      >
                        {uploaded.status}
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 mt-1">{docItem.description}</p>

                  {/* If uploaded, show file info and preview link */}
                  {uploaded && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <FileCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span className="font-semibold text-slate-800 truncate max-w-xs">
                          {uploaded.originalFilename}
                        </span>
                        <span className="text-slate-400">
                          ({(uploaded.fileSizeBytes / 1024).toFixed(1)} KB)
                        </span>
                        <span className="text-slate-400">
                          • Uploaded {new Date(uploaded.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`/api/v1/documents/${uploaded.id}/file`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-navy-800 hover:text-navy-950 font-medium hover:underline"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Preview File</span>
                        </a>

                        {uploaded.status !== 'VERIFIED' && (
                          <button
                            onClick={() => handleDeleteDocument(uploaded.id)}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                            title="Remove document"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Rejection Alert Box */}
                  {uploaded && uploaded.status === 'REJECTED' && (
                    <div className="mt-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Admissions Officer Remarks:</span>
                        <span>{uploaded.rejectionReason}</span>
                        <p className="mt-1 font-semibold text-rose-900">
                          Please select a replacement file below to re-submit this document.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Upload Action */}
                <div className="shrink-0 flex items-center">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={(e) => handleFileUpload(docItem.type, e)}
                      disabled={isUploading}
                    />
                    <span
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition border ${
                        uploaded
                          ? 'bg-white hover:bg-slate-50 border-slate-300 text-navy-900'
                          : 'bg-navy-900 hover:bg-navy-950 text-white border-transparent'
                      }`}
                    >
                      <UploadCloud className="h-4 w-4" />
                      <span>
                        {isUploading
                          ? 'Uploading...'
                          : uploaded
                          ? 'Replace File'
                          : 'Select Document'}
                      </span>
                    </span>
                  </label>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <Link to="/apply">
          <Button variant="secondary" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Application Form</span>
          </Button>
        </Link>

        <Link to="/review">
          <Button
            variant="gold"
            disabled={!isAllMandatoryUploaded}
            className="gap-1.5"
            title={
              !isAllMandatoryUploaded
                ? 'Please upload all mandatory documents before continuing to review'
                : ''
            }
          >
            <span>Proceed to Review & Declaration</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
