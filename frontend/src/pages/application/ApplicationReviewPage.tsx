import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  FileCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  User,
  GraduationCap,
  Paperclip,
} from 'lucide-react';

export const ApplicationReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [application, setApplication] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!declarationAccepted || !application) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const submitted: any = await api.post(`/applications/${application.id}/submit`, {
        declarationAccepted: true,
      });

      // Navigate to payment options or tracking
      navigate(`/payment/${application.id}`);
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please check required fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-8 h-8 border-4 border-navy-800 border-t-gold-500 rounded-full animate-spin" />
      </div>
    );
  }

  const profile = application?.applicant?.studentProfile || {};
  const feeInSLE = application?.course?.applicationFeeMinor
    ? (application.course.applicationFeeMinor / 100).toFixed(2)
    : '0.00';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-navy-950">
              Step 8: Final Review & Submission Declaration
            </h1>
            <Badge variant="navy">{application?.applicationReference}</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Carefully verify all details before submitting. Once submitted, your application will be queued for payment & admissions review.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Section 1: Selected Programme */}
      <Card title="1. Selected Academic Programme">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block">Programme / Course:</span>
            <span className="font-bold text-sm text-navy-900 block mt-0.5">
              {application?.course?.name} ({application?.course?.code})
            </span>
            <span className="text-slate-600">
              Qualification: {application?.course?.qualificationLevel?.replace('_', ' ')}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">Academic Intake & Fees:</span>
            <span className="font-semibold text-slate-800 block mt-0.5">
              {application?.academicYear?.name} • {application?.intake?.name}
            </span>
            <span className="font-bold text-emerald-700 block mt-1 text-sm">
              Application Fee: SLE {feeInSLE} ({application?.course?.currency})
            </span>
          </div>
        </div>
      </Card>

      {/* Summary Section 2: Personal & Contact Information */}
      <Card title="2. Personal & Contact Information">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block">Full Name:</span>
            <span className="font-semibold text-slate-900">
              {application?.applicant?.firstName} {application?.applicant?.middleName || ''}{' '}
              {application?.applicant?.surname}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Date of Birth / Gender:</span>
            <span className="font-semibold text-slate-900">
              {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'N/A'} (
              {profile.gender || 'N/A'})
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Nationality / Marital Status:</span>
            <span className="font-semibold text-slate-900">
              {profile.nationality || 'Sierra Leonean'} • {profile.maritalStatus || 'Single'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Email Address:</span>
            <span className="font-semibold text-slate-900">{application?.applicant?.email}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Primary Mobile Phone:</span>
            <span className="font-semibold text-slate-900">{application?.applicant?.phone}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Residential Address:</span>
            <span className="font-semibold text-slate-900">
              {profile.residentialAddress || 'N/A'}, {profile.townCity || 'Kenema'},{' '}
              {profile.district || 'Kenema'} District
            </span>
          </div>
        </div>
      </Card>

      {/* Summary Section 3: Parent & Emergency Contacts */}
      <Card title="3. Parent, Guardian & Emergency Contacts">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-bold text-navy-900 block mb-1">Parent / Guardian:</span>
            <p>
              {profile.parentFullName || 'Not specified'} ({profile.parentRelationship || 'Parent'})
            </p>
            <p className="text-slate-500">Phone: {profile.parentPhone || 'N/A'}</p>
            <p className="text-slate-500">Address: {profile.parentAddress || 'N/A'}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-bold text-navy-900 block mb-1">Emergency Contact:</span>
            <p>
              {profile.emergencyFullName || 'Not specified'} (
              {profile.emergencyRelationship || 'Contact'})
            </p>
            <p className="text-slate-500">Phone: {profile.emergencyPhone || 'N/A'}</p>
            <p className="text-slate-500">Address: {profile.emergencyAddress || 'N/A'}</p>
          </div>
        </div>
      </Card>

      {/* Summary Section 4: Educational History & Uploaded Documents */}
      <Card title="4. Qualifications & Uploaded Supporting Documents">
        <div className="space-y-4">
          <div>
            <span className="text-xs font-semibold text-slate-700 block mb-2">
              Educational Qualifications ({application?.educations?.length || 0}):
            </span>
            {(!application?.educations || application.educations.length === 0) ? (
              <p className="text-xs text-rose-600 font-medium">
                No educational qualifications added. Please go back to Step 6.
              </p>
            ) : (
              <div className="space-y-2 text-xs">
                {application.educations.map((edu: any) => (
                  <div key={edu.id} className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between">
                    <div>
                      <span className="font-semibold text-slate-900">{edu.institutionName}</span>
                      <span className="text-slate-500"> — {edu.qualificationObtained} ({edu.examinationYear})</span>
                    </div>
                    <Badge variant="navy">{edu.examinationType}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-700 block mb-2">
              Uploaded Documents ({application?.documents?.length || 0}):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {(application?.documents || []).map((doc: any) => (
                <div key={doc.id} className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Paperclip className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                    <span className="truncate max-w-[180px] font-medium text-slate-800">
                      {doc.documentType.replace('_', ' ')}
                    </span>
                  </div>
                  <Badge variant={doc.status === 'VERIFIED' ? 'success' : 'neutral'}>
                    {doc.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Declaration & Submission Box */}
      <form onSubmit={handleSubmit}>
        <Card className="bg-amber-50/60 border-amber-200">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-6 w-6 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm text-navy-950">Applicant Declaration & Agreement</h3>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  I solemnly declare that all statements and documents submitted in this application
                  are complete, truthful, and genuine. I understand that any false declaration or
                  forged certificate will lead to immediate disqualification and possible referral
                  to law enforcement authorities under Sierra Leone regulations.
                </p>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-amber-200/80">
              <input
                type="checkbox"
                checked={declarationAccepted}
                onChange={(e) => setDeclarationAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 text-navy-800 rounded border-slate-300 focus:ring-navy-600"
                required
              />
              <span className="text-xs font-semibold text-navy-950">
                I agree to the declaration terms and request to submit my application to Kenema ICT & Management College.
              </span>
            </label>

            <div className="flex items-center justify-between pt-4 border-t border-amber-200/80">
              <Link to="/documents">
                <Button variant="secondary" type="button" className="gap-1.5">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Documents</span>
                </Button>
              </Link>

              <Button
                type="submit"
                variant="gold"
                disabled={!declarationAccepted || isSubmitting}
                isLoading={isSubmitting}
                className="gap-2 px-6"
              >
                <span>Submit Application</span>
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
};
