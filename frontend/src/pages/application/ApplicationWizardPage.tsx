import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { SIERRA_LEONE_REGIONS } from '../../utils/sierraLeoneData';
import { Course, Department, AcademicYear } from '../../types/academic';
import {
  User,
  MapPin,
  Users,
  ShieldAlert,
  BookOpen,
  GraduationCap,
  Save,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export const ApplicationWizardPage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [application, setApplication] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState<any>({
    personal: {
      firstName: '',
      middleName: '',
      surname: '',
      dateOfBirth: '',
      gender: 'Male',
      nationality: 'Sierra Leonean',
      placeOfBirth: '',
      maritalStatus: 'Single',
    },
    contact: {
      phone: '',
      residentialAddress: '',
      townCity: '',
      regionProvince: 'Eastern Province',
      district: 'Kenema',
      chiefdom: 'Nongowa',
      postalAddress: '',
    },
    parent: {
      parentFullName: '',
      parentRelationship: 'Parent',
      parentPhone: '',
      parentAltPhone: '',
      parentAddress: '',
      parentEmail: '',
      parentOccupation: '',
    },
    emergency: {
      emergencyFullName: '',
      emergencyRelationship: 'Relative',
      emergencyPhone: '',
      emergencyAddress: '',
    },
    programme: {
      academicYearId: '',
      intakeId: '',
      qualificationLevel: 'DEGREE',
      departmentId: '',
      courseId: '',
      studyMode: 'Full-Time',
      preferredCampus: 'Kenema Main Campus',
    },
  });

  // Education Records
  const [educations, setEducations] = useState<any[]>([]);
  const [newEdu, setNewEdu] = useState({
    institutionName: '',
    institutionLocation: '',
    examinationType: 'WASSCE',
    examinationYear: 2024,
    candidateNumber: '',
    qualificationObtained: 'West African Senior School Certificate',
    subjectsAndGrades: [
      { subject: 'English Language', grade: 'B3' },
      { subject: 'Mathematics', grade: 'B2' },
    ],
  });

  const loadData = async () => {
    try {
      setIsLoading(true);

      // 1. Get or create draft
      const draftData: any = await api.post('/applications/draft');
      setApplication(draftData);
      setStep(draftData.currentStep || 1);
      setEducations(draftData.educations || []);

      // 2. Fetch courses, departments, academic years
      const [coursesData, deptsData, yearsData] = await Promise.all([
        api.get<Course[]>('/courses?isActive=true'),
        api.get<Department[]>('/departments'),
        api.get<AcademicYear[]>('/academic-years?activeOnly=true'),
      ]);

      setCourses(Array.isArray(coursesData) ? coursesData : (coursesData as any)?.courses || []);
      setDepartments(Array.isArray(deptsData) ? deptsData : (deptsData as any)?.departments || []);
      setAcademicYears(yearsData);

      // Prepopulate form state from draft and profile
      const prof = draftData.applicant?.studentProfile || user?.profile || {};
      setFormData({
        personal: {
          firstName: draftData.applicant?.firstName || user?.firstName || '',
          middleName: draftData.applicant?.middleName || user?.middleName || '',
          surname: draftData.applicant?.surname || user?.surname || '',
          dateOfBirth: prof.dateOfBirth ? new Date(prof.dateOfBirth).toISOString().split('T')[0] : '',
          gender: prof.gender || 'Male',
          nationality: prof.nationality || 'Sierra Leonean',
          placeOfBirth: prof.placeOfBirth || '',
          maritalStatus: prof.maritalStatus || 'Single',
        },
        contact: {
          phone: draftData.applicant?.phone || user?.phone || '',
          residentialAddress: prof.residentialAddress || '',
          townCity: prof.townCity || '',
          regionProvince: prof.regionProvince || 'Eastern Province',
          district: prof.district || 'Kenema',
          chiefdom: prof.chiefdom || 'Nongowa',
          postalAddress: prof.postalAddress || '',
        },
        parent: {
          parentFullName: prof.parentFullName || '',
          parentRelationship: prof.parentRelationship || 'Parent',
          parentPhone: prof.parentPhone || '',
          parentAltPhone: prof.parentAltPhone || '',
          parentAddress: prof.parentAddress || '',
          parentEmail: prof.parentEmail || '',
          parentOccupation: prof.parentOccupation || '',
        },
        emergency: {
          emergencyFullName: prof.emergencyFullName || '',
          emergencyRelationship: prof.emergencyRelationship || 'Relative',
          emergencyPhone: prof.emergencyPhone || '',
          emergencyAddress: prof.emergencyAddress || '',
        },
        programme: {
          academicYearId: draftData.academicYearId || yearsData[0]?.id || '',
          intakeId: draftData.intakeId || yearsData[0]?.intakes?.[0]?.id || '',
          qualificationLevel: draftData.course?.qualificationLevel || 'DEGREE',
          departmentId: draftData.course?.departmentId || deptsData[0]?.id || '',
          courseId: draftData.courseId || coursesData[0]?.id || '',
          studyMode: draftData.studyMode || 'Full-Time',
          preferredCampus: draftData.preferredCampus || 'Kenema Main Campus',
        },
      });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Failed to initialize draft application' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveDraft = async (nextStep?: number) => {
    if (!application) return;
    setIsSaving(true);
    setMessage(null);

    try {
      const payload: any = {
        currentStep: nextStep || step,
        academicYearId: formData.programme.academicYearId || undefined,
        intakeId: formData.programme.intakeId || undefined,
        courseId: formData.programme.courseId || undefined,
        studyMode: formData.programme.studyMode,
        preferredCampus: formData.programme.preferredCampus,
        personal: {
          ...formData.personal,
          dateOfBirth: formData.personal.dateOfBirth
            ? new Date(formData.personal.dateOfBirth).toISOString()
            : null,
        },
        contact: formData.contact,
        parent: formData.parent,
        emergency: formData.emergency,
      };

      const updated = await api.patch(`/applications/${application.id}`, payload);
      setApplication(updated);
      setMessage({ type: 'success', text: 'Application draft saved successfully.' });
      if (nextStep) setStep(nextStep);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save draft' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application) return;

    try {
      const created = await api.post(`/applications/${application.id}/educations`, {
        ...newEdu,
        examinationYear: Number(newEdu.examinationYear),
      });
      setEducations((prev) => [...prev, created]);
      setNewEdu({
        institutionName: '',
        institutionLocation: '',
        examinationType: 'WASSCE',
        examinationYear: 2024,
        candidateNumber: '',
        qualificationObtained: 'West African Senior School Certificate',
        subjectsAndGrades: [
          { subject: 'English Language', grade: 'B3' },
          { subject: 'Mathematics', grade: 'B2' },
        ],
      });
    } catch (err: any) {
      alert(`Failed to add education: ${err.message}`);
    }
  };

  const handleDeleteEducation = async (eduId: string) => {
    if (!application) return;
    try {
      await api.delete(`/applications/${application.id}/educations/${eduId}`);
      setEducations((prev) => prev.filter((e) => e.id !== eduId));
    } catch (err: any) {
      alert(`Failed to remove record: ${err.message}`);
    }
  };

  // Dependent geographic filtering
  const currentProvinceData = SIERRA_LEONE_REGIONS.find(
    (p) => p.province === formData.contact.regionProvince
  );
  const districtList = currentProvinceData ? currentProvinceData.districts : [];
  const currentDistrictData = districtList.find((d) => d.name === formData.contact.district);
  const chiefdomList = currentDistrictData?.chiefdoms || [];

  // Dependent course filtering by level & department
  const filteredCourses = courses.filter((c) => {
    const matchesLevel = c.qualificationLevel === formData.programme.qualificationLevel;
    const matchesDept =
      !formData.programme.departmentId || c.departmentId === formData.programme.departmentId;
    return matchesLevel && matchesDept;
  });

  const selectedCourse = courses.find((c) => c.id === formData.programme.courseId);

  const stepsList = [
    { number: 1, label: 'Programme', title: 'Programme Selection', subtitle: 'Select your preferred academic intake, faculty, and degree or diploma programme.' },
    { number: 2, label: 'Personal Info', title: 'Personal Information', subtitle: 'Please provide your personal details as they appear on your official documents.' },
    { number: 3, label: 'Guardian', title: 'Parent / Guardian & Contacts', subtitle: 'Provide your residential address and parent/guardian contact information.' },
    { number: 4, label: 'Education', title: 'Educational Background', subtitle: 'Record your WASSCE or secondary school academic qualifications and examination results.' },
    { number: 5, label: 'Documents', title: 'Document Verification Uploads', subtitle: 'Upload certified copies of your academic certificates, birth certificate, and passport photo.' },
    { number: 6, label: 'Review', title: 'Application Review & Declaration', subtitle: 'Review all entered application details carefully before final submission.' },
  ];

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-navy-800 border-t-gold-500 rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-600">Loading your application draft...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Step Title Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
          {stepsList[step - 1]?.title || 'Personal Information'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          {stepsList[step - 1]?.subtitle || 'Please provide your personal details as they appear on your official documents.'}
        </p>
      </div>

      {/* Connected Nodes Stepper Bar Matching Reference Image */}
      <div className="py-2">
        <div className="relative flex items-center justify-between max-w-2xl mx-auto px-4">
          <div className="absolute top-4 left-8 right-8 h-0.5 bg-slate-200 z-0" />
          {stepsList.map((s) => {
            const isCompleted = step > s.number;
            const isCurrent = step === s.number;

            return (
              <button
                key={s.number}
                type="button"
                onClick={() => handleSaveDraft(s.number)}
                className="flex flex-col items-center relative z-10 group"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : isCurrent
                      ? 'bg-[#10223B] text-white ring-4 ring-slate-100 shadow-xs'
                      : 'bg-white border-2 border-slate-300 text-slate-400 group-hover:border-slate-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle className="w-4 h-4 stroke-[2.5]" /> : s.number}
                </div>
                <span
                  className={`text-[11px] font-medium mt-1.5 transition-colors ${
                    isCurrent ? 'text-slate-900 font-bold' : 'text-slate-500'
                  }`}
                >
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notification Banner */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border border-rose-200 text-rose-900'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Step Forms */}
      <Card>
        {/* STEP 1: PERSONAL INFORMATION */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-navy-900 border-b border-slate-100 pb-2">
              Step 1: Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="First Name"
                value={formData.personal.firstName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    personal: { ...formData.personal, firstName: e.target.value },
                  })
                }
                required
              />
              <Input
                label="Middle Name"
                value={formData.personal.middleName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    personal: { ...formData.personal, middleName: e.target.value },
                  })
                }
                placeholder="Optional"
              />
              <Input
                label="Surname"
                value={formData.personal.surname}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    personal: { ...formData.personal, surname: e.target.value },
                  })
                }
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Date of Birth"
                type="date"
                value={formData.personal.dateOfBirth}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    personal: { ...formData.personal, dateOfBirth: e.target.value },
                  })
                }
                required
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                <select
                  className="block w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-600"
                  value={formData.personal.gender}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      personal: { ...formData.personal, gender: e.target.value },
                    })
                  }
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Marital Status</label>
                <select
                  className="block w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-600"
                  value={formData.personal.maritalStatus}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      personal: { ...formData.personal, maritalStatus: e.target.value },
                    })
                  }
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nationality"
                value={formData.personal.nationality}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    personal: { ...formData.personal, nationality: e.target.value },
                  })
                }
                required
              />
              <Input
                label="Place of Birth"
                placeholder="e.g. Kenema City"
                value={formData.personal.placeOfBirth}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    personal: { ...formData.personal, placeOfBirth: e.target.value },
                  })
                }
              />
            </div>
          </div>
        )}

        {/* STEP 2: CONTACT & ADDRESS */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-navy-900 border-b border-slate-100 pb-2">
              Step 2: Contact and Address Details (Sierra Leone)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Region / Province
                </label>
                <select
                  className="block w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-600"
                  value={formData.contact.regionProvince}
                  onChange={(e) => {
                    const newProv = e.target.value;
                    const provData = SIERRA_LEONE_REGIONS.find((p) => p.province === newProv);
                    const defaultDist = provData?.districts[0]?.name || '';
                    const defaultChief = provData?.districts[0]?.chiefdoms?.[0] || '';
                    setFormData({
                      ...formData,
                      contact: {
                        ...formData.contact,
                        regionProvince: newProv,
                        district: defaultDist,
                        chiefdom: defaultChief,
                      },
                    });
                  }}
                >
                  {SIERRA_LEONE_REGIONS.map((p) => (
                    <option key={p.province} value={p.province}>
                      {p.province}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">District</label>
                <select
                  className="block w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-600"
                  value={formData.contact.district}
                  onChange={(e) => {
                    const newDist = e.target.value;
                    const distObj = districtList.find((d) => d.name === newDist);
                    const defaultChief = distObj?.chiefdoms?.[0] || '';
                    setFormData({
                      ...formData,
                      contact: {
                        ...formData.contact,
                        district: newDist,
                        chiefdom: defaultChief,
                      },
                    });
                  }}
                >
                  {districtList.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name} District
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Chiefdom</label>
                <select
                  className="block w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-600"
                  value={formData.contact.chiefdom}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contact: { ...formData.contact, chiefdom: e.target.value },
                    })
                  }
                >
                  {chiefdomList.map((ch) => (
                    <option key={ch} value={ch}>
                      {ch} Chiefdom
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Town / City"
                placeholder="e.g. Kenema City"
                value={formData.contact.townCity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contact: { ...formData.contact, townCity: e.target.value },
                  })
                }
                required
              />
              <Input
                label="Residential Street Address"
                placeholder="e.g. 14 Hangha Road"
                value={formData.contact.residentialAddress}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contact: { ...formData.contact, residentialAddress: e.target.value },
                  })
                }
                required
              />
            </div>
          </div>
        )}

        {/* STEP 3: PARENT / GUARDIAN */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-navy-900 border-b border-slate-100 pb-2">
              Step 3: Parent or Guardian Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Parent / Guardian Full Name"
                placeholder="e.g. Pa Brima Bangura"
                value={formData.parent.parentFullName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parent: { ...formData.parent, parentFullName: e.target.value },
                  })
                }
                required
              />
              <Input
                label="Relationship to Applicant"
                placeholder="e.g. Father, Mother, Uncle"
                value={formData.parent.parentRelationship}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parent: { ...formData.parent, parentRelationship: e.target.value },
                  })
                }
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Primary Phone Number"
                placeholder="e.g. +23278123456"
                value={formData.parent.parentPhone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parent: { ...formData.parent, parentPhone: e.target.value },
                  })
                }
                required
              />
              <Input
                label="Alternative Phone Number"
                placeholder="Optional"
                value={formData.parent.parentAltPhone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parent: { ...formData.parent, parentAltPhone: e.target.value },
                  })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Residential Address"
                placeholder="e.g. 14 Hangha Road, Kenema"
                value={formData.parent.parentAddress}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parent: { ...formData.parent, parentAddress: e.target.value },
                  })
                }
              />
              <Input
                label="Occupation"
                placeholder="e.g. Teacher, Civil Servant, Merchant"
                value={formData.parent.parentOccupation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parent: { ...formData.parent, parentOccupation: e.target.value },
                  })
                }
              />
            </div>
          </div>
        )}

        {/* STEP 4: EMERGENCY CONTACT */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-navy-900 border-b border-slate-100 pb-2">
              Step 4: Emergency Contact Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Emergency Contact Name"
                placeholder="e.g. Pa Brima Bangura"
                value={formData.emergency.emergencyFullName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emergency: { ...formData.emergency, emergencyFullName: e.target.value },
                  })
                }
                required
              />
              <Input
                label="Relationship"
                placeholder="e.g. Brother, Guardian"
                value={formData.emergency.emergencyRelationship}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emergency: { ...formData.emergency, emergencyRelationship: e.target.value },
                  })
                }
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Emergency Phone Number"
                placeholder="e.g. +232..."
                value={formData.emergency.emergencyPhone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emergency: { ...formData.emergency, emergencyPhone: e.target.value },
                  })
                }
                required
              />
              <Input
                label="Emergency Address"
                placeholder="e.g. Kenema City"
                value={formData.emergency.emergencyAddress}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emergency: { ...formData.emergency, emergencyAddress: e.target.value },
                  })
                }
              />
            </div>
          </div>
        )}

        {/* STEP 5: PROGRAMME SELECTION */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-navy-900 border-b border-slate-100 pb-2">
              Step 5: Academic Programme Selection
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Academic Session
                </label>
                <select
                  className="block w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-600"
                  value={formData.programme.academicYearId}
                  onChange={(e) => {
                    const yId = e.target.value;
                    const yObj = academicYears.find((y) => y.id === yId);
                    setFormData({
                      ...formData,
                      programme: {
                        ...formData.programme,
                        academicYearId: yId,
                        intakeId: yObj?.intakes?.[0]?.id || '',
                      },
                    });
                  }}
                >
                  {academicYears.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Admission Intake
                </label>
                <select
                  className="block w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-600"
                  value={formData.programme.intakeId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      programme: { ...formData.programme, intakeId: e.target.value },
                    })
                  }
                >
                  {academicYears
                    .find((y) => y.id === formData.programme.academicYearId)
                    ?.intakes?.map((inItem) => (
                      <option key={inItem.id} value={inItem.id}>
                        {inItem.name} (Deadline:{' '}
                        {new Date(inItem.applicationDeadline).toLocaleDateString()})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Qualification Level
                </label>
                <select
                  className="block w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-600"
                  value={formData.programme.qualificationLevel}
                  onChange={(e) => {
                    const newLvl = e.target.value;
                    const matched = courses.find((c) => c.qualificationLevel === newLvl);
                    setFormData({
                      ...formData,
                      programme: {
                        ...formData.programme,
                        qualificationLevel: newLvl,
                        courseId: matched?.id || '',
                      },
                    });
                  }}
                >
                  <option value="DEGREE">Degree (BSc)</option>
                  <option value="HIGHER_DIPLOMA">Higher National Diploma (HND)</option>
                  <option value="LOWER_DIPLOMA">Lower Diploma</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Department / Faculty
                </label>
                <select
                  className="block w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-600"
                  value={formData.programme.departmentId}
                  onChange={(e) => {
                    const deptId = e.target.value;
                    const matched = courses.find(
                      (c) =>
                        c.departmentId === deptId &&
                        c.qualificationLevel === formData.programme.qualificationLevel
                    );
                    setFormData({
                      ...formData,
                      programme: {
                        ...formData.programme,
                        departmentId: deptId,
                        courseId: matched?.id || formData.programme.courseId,
                      },
                    });
                  }}
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Select Course / Major
              </label>
              <select
                className="block w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-600 font-semibold"
                value={formData.programme.courseId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    programme: { ...formData.programme, courseId: e.target.value },
                  })
                }
              >
                {filteredCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedCourse && (
              <div className="p-4 bg-navy-50 border border-navy-200 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-navy-900 text-sm">
                    {selectedCourse.name}
                  </span>
                  <Badge variant="navy">{selectedCourse.code}</Badge>
                </div>
                <p className="text-slate-600">{selectedCourse.description}</p>
                <div className="flex flex-wrap gap-4 pt-2 border-t border-navy-100">
                  <div>
                    <span className="text-slate-500 block">Application Processing Fee:</span>
                    <span className="font-bold text-emerald-800 text-sm">
                      SLE {(selectedCourse.applicationFeeMinor / 100).toFixed(2)}{' '}
                      ({selectedCourse.currency})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Admission Requirement:</span>
                    <span className="text-slate-700 font-medium">
                      {selectedCourse.admissionRequirements}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 6: EDUCATIONAL BACKGROUND */}
        {step === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-navy-900 border-b border-slate-100 pb-2">
                Step 6: Previous Educational Background
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Add all secondary schools, examinations, or prior diplomas you have completed.
              </p>
            </div>

            {/* List of Added Educations */}
            {educations.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
                No educational qualifications added yet. Fill out the form below to add your school and exam records.
              </div>
            ) : (
              <div className="space-y-3">
                {educations.map((edu) => (
                  <div
                    key={edu.id}
                    className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex items-start justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-navy-900">
                          {edu.institutionName}
                        </span>
                        <Badge variant="navy">{edu.examinationType}</Badge>
                        <span className="text-xs text-slate-500">Year: {edu.examinationYear}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Location: {edu.institutionLocation} • Qualification: {edu.qualificationObtained}
                        {edu.candidateNumber ? ` • Index/Candidate: ${edu.candidateNumber}` : ''}
                      </p>

                      {/* Display subjects if present */}
                      {Array.isArray(edu.subjectsAndGrades) && edu.subjectsAndGrades.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {edu.subjectsAndGrades.map((sg: any, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-medium text-slate-700 border border-slate-200"
                            >
                              {sg.subject}: <strong>{sg.grade}</strong>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteEducation(edu.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Remove Record"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Form to Add School Record */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-2">
                <Plus className="h-3.5 w-3.5 text-navy-700" />
                Add School / Examination Record
              </h3>

              <form onSubmit={handleAddEducation} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="School / Institution Name"
                    placeholder="e.g. Kenema Government Secondary School"
                    value={newEdu.institutionName}
                    onChange={(e) =>
                      setNewEdu({ ...newEdu, institutionName: e.target.value })
                    }
                    required
                  />
                  <Input
                    label="Institution Location"
                    placeholder="e.g. Kenema City"
                    value={newEdu.institutionLocation}
                    onChange={(e) =>
                      setNewEdu({ ...newEdu, institutionLocation: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Exam Type
                    </label>
                    <select
                      className="block w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-600"
                      value={newEdu.examinationType}
                      onChange={(e) =>
                        setNewEdu({ ...newEdu, examinationType: e.target.value })
                      }
                    >
                      <option value="WASSCE">WASSCE (West African Senior School Cert)</option>
                      <option value="BECE">BECE</option>
                      <option value="GCE_O_LEVEL">GCE O-Level</option>
                      <option value="DIPLOMA">Diploma</option>
                      <option value="OTHER">Other Qualification</option>
                    </select>
                  </div>

                  <Input
                    label="Exam Year"
                    type="number"
                    value={newEdu.examinationYear}
                    onChange={(e) =>
                      setNewEdu({ ...newEdu, examinationYear: parseInt(e.target.value, 10) })
                    }
                    required
                  />

                  <Input
                    label="Candidate / Index Number"
                    placeholder="e.g. 1040201099"
                    value={newEdu.candidateNumber}
                    onChange={(e) =>
                      setNewEdu({ ...newEdu, candidateNumber: e.target.value })
                    }
                  />
                </div>

                <Button type="submit" variant="secondary" className="w-full text-xs">
                  <Plus className="h-4 w-4 mr-1.5" />
                  Save Education Record
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Wizard Navigation Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
          <Button
            type="button"
            variant="secondary"
            disabled={step === 1}
            onClick={() => handleSaveDraft(step - 1)}
            className="gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous Step</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleSaveDraft()}
              isLoading={isSaving}
              className="gap-1.5"
            >
              <Save className="h-4 w-4" />
              <span>Save Progress</span>
            </Button>

            {step < 6 ? (
              <Button
                type="button"
                onClick={() => handleSaveDraft(step + 1)}
                className="gap-1.5"
              >
                <span>Save & Continue</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="gold"
                onClick={() => navigate('/documents')}
                className="gap-1.5"
              >
                <span>Continue to Document Uploads</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
