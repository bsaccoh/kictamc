import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User,
  MapPin,
  Users,
  Save,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Phone,
  Mail,
  Check
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';

const SL_REGIONS = [
  {
    name: 'Eastern Province',
    districts: ['Kenema', 'Kailahun', 'Kono'],
  },
  {
    name: 'Southern Province',
    districts: ['Bo', 'Bonthe', 'Moyamba', 'Pujehun'],
  },
  {
    name: 'Northern Province',
    districts: ['Bombali', 'Falaba', 'Koinadugu', 'Tonkolili'],
  },
  {
    name: 'North West Province',
    districts: ['Kambia', 'Karene', 'Port Loko'],
  },
  {
    name: 'Western Area',
    districts: ['Western Area Urban (Freetown)', 'Western Area Rural'],
  },
];

export const StudentProfilePage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'personal' | 'contact' | 'guardian'>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    surname: '',
    dateOfBirth: '',
    gender: 'Male',
    nationality: 'Sierra Leonean',
    placeOfBirth: 'Kenema',
    maritalStatus: 'Single',
    residentialAddress: '123 Main Street, Kenema',
    townCity: 'Kenema',
    regionProvince: 'Eastern Province',
    district: 'Kenema District',
    chiefdom: 'Nongowa',
    postalAddress: '',

    // Guardian
    parentFullName: 'Pa Brima Bangura',
    parentRelationship: 'Father',
    parentPhone: '+232 76 998877',
    parentAltPhone: '',
    parentAddress: '14 Hangha Road, Kenema',
    parentEmail: 'parent@example.com',
    parentOccupation: 'Trader',

    // Emergency Contact
    emergencyFullName: 'Mary Sesay',
    emergencyRelationship: 'Aunt',
    emergencyPhone: '+232 77 445566',
    emergencyAddress: 'Kenema City',
  });

  // Fetch full profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => api.get<any>('/users/me'),
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        middleName: profile.middleName || '',
        surname: profile.surname || '',
        dateOfBirth: profile.studentProfile?.dateOfBirth
          ? profile.studentProfile.dateOfBirth.slice(0, 10)
          : '2005-01-15',
        gender: profile.studentProfile?.gender || 'Male',
        nationality: profile.studentProfile?.nationality || 'Sierra Leonean',
        placeOfBirth: profile.studentProfile?.placeOfBirth || 'Kenema',
        maritalStatus: profile.studentProfile?.maritalStatus || 'Single',
        residentialAddress: profile.studentProfile?.residentialAddress || '123 Main Street, Kenema',
        townCity: profile.studentProfile?.townCity || 'Kenema',
        regionProvince: profile.studentProfile?.regionProvince || 'Eastern Province',
        district: profile.studentProfile?.district || 'Kenema District',
        chiefdom: profile.studentProfile?.chiefdom || 'Nongowa',
        postalAddress: profile.studentProfile?.postalAddress || '',

        parentFullName: profile.studentProfile?.parentFullName || 'Pa Brima Bangura',
        parentRelationship: profile.studentProfile?.parentRelationship || 'Father',
        parentPhone: profile.studentProfile?.parentPhone || '+232 76 998877',
        parentAltPhone: profile.studentProfile?.parentAltPhone || '',
        parentAddress: profile.studentProfile?.parentAddress || '14 Hangha Road, Kenema',
        parentEmail: profile.studentProfile?.parentEmail || 'parent@example.com',
        parentOccupation: profile.studentProfile?.parentOccupation || 'Trader',

        emergencyFullName: profile.studentProfile?.emergencyFullName || 'Mary Sesay',
        emergencyRelationship: profile.studentProfile?.emergencyRelationship || 'Aunt',
        emergencyPhone: profile.studentProfile?.emergencyPhone || '+232 77 445566',
        emergencyAddress: profile.studentProfile?.emergencyAddress || 'Kenema City',
      });
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => api.patch('/users/me', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setSuccessMessage('Profile saved successfully.');
      setIsEditing(false);
      setErrorMessage(null);
      setTimeout(() => setSuccessMessage(null), 4000);
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Failed to update profile.');
      setSuccessMessage(null);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
    };
    updateProfileMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center items-center">
        <div className="w-8 h-8 border-3 border-navy-700 border-t-gold-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Top Candidate Summary Card Matching Reference Image */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Avatar Icon */}
          <div className="w-14 h-14 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xl flex-shrink-0 border border-slate-300">
            <User className="w-7 h-7 text-slate-500" />
          </div>

          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-800 leading-tight">
              {formData.firstName || user?.firstName || 'John'} {formData.surname || user?.surname || 'Doe'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Student ID: KICTAMC-2025-00123
            </p>
            <div className="mt-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Check className="w-3 h-3 stroke-[2.5]" />
                Profile 85% Complete
              </span>
            </div>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-3 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Clean Tabs Underline Navigation Matching Reference Image */}
      <div className="border-b border-slate-200 flex gap-6 px-1">
        <button
          type="button"
          onClick={() => setActiveTab('personal')}
          className={`pb-3 text-xs font-semibold transition-all relative ${
            activeTab === 'personal'
              ? 'text-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Personal Information
          {activeTab === 'personal' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contact')}
          className={`pb-3 text-xs font-semibold transition-all relative ${
            activeTab === 'contact'
              ? 'text-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Contact Information
          {activeTab === 'contact' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('guardian')}
          className={`pb-3 text-xs font-semibold transition-all relative ${
            activeTab === 'guardian'
              ? 'text-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Guardian Information
          {activeTab === 'guardian' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>
      </div>

      {/* Content Form / View Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
        {activeTab === 'personal' && (
          <div>
            {!isEditing ? (
              /* View Mode Matching Reference 2-Column Mockup */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <span className="text-slate-400 font-medium block">Full Name</span>
                    <span className="text-slate-800 font-bold mt-0.5 block">
                      {formData.firstName} {formData.middleName} {formData.surname}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium block">Date of Birth</span>
                    <span className="text-slate-800 font-bold mt-0.5 block">
                      {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '15 Jan 2005'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium block">Gender</span>
                    <span className="text-slate-800 font-bold mt-0.5 block">
                      {formData.gender}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium block">Nationality</span>
                    <span className="text-slate-800 font-bold mt-0.5 block">
                      {formData.nationality}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium block">Place of Birth</span>
                    <span className="text-slate-800 font-bold mt-0.5 block">
                      {formData.placeOfBirth}
                    </span>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <span className="text-slate-400 font-medium block">Address</span>
                    <span className="text-slate-800 font-bold mt-0.5 block leading-relaxed">
                      {formData.residentialAddress || '123 Main Street, Kenema'}<br />
                      {formData.district || 'Kenema District'}, {formData.regionProvince || 'Eastern Province'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium block">Phone Number</span>
                    <span className="text-slate-800 font-bold mt-0.5 block font-mono">
                      {profile?.phone || '+232 76 123 456'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium block">Email</span>
                    <span className="text-slate-800 font-bold mt-0.5 block">
                      {profile?.email || 'john.doe@example.com'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Edit Form Mode */
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Surname *</label>
                    <input
                      type="text"
                      name="surname"
                      value={formData.surname}
                      onChange={handleChange}
                      required
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Middle Name</label>
                    <input
                      type="text"
                      name="middleName"
                      value={formData.middleName}
                      onChange={handleChange}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Gender *</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth *</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Place of Birth *</label>
                    <input
                      type="text"
                      name="placeOfBirth"
                      value={formData.placeOfBirth}
                      onChange={handleChange}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-100 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md text-xs font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="px-4 py-2 bg-[#10223B] text-white rounded-md text-xs font-semibold hover:bg-[#162D4E]"
                  >
                    {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <span className="text-slate-400 font-medium block">Residential Address</span>
                <span className="text-slate-800 font-bold mt-0.5 block">
                  {formData.residentialAddress}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Town / City</span>
                <span className="text-slate-800 font-bold mt-0.5 block">
                  {formData.townCity}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">District & Province</span>
                <span className="text-slate-800 font-bold mt-0.5 block">
                  {formData.district}, {formData.regionProvince}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Chiefdom</span>
                <span className="text-slate-800 font-bold mt-0.5 block">
                  {formData.chiefdom}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'guardian' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <span className="text-slate-400 font-medium block">Parent / Guardian Name</span>
                <span className="text-slate-800 font-bold mt-0.5 block">
                  {formData.parentFullName} ({formData.parentRelationship})
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Parent Phone</span>
                <span className="text-slate-800 font-bold mt-0.5 block font-mono">
                  {formData.parentPhone}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Emergency Contact Person</span>
                <span className="text-slate-800 font-bold mt-0.5 block">
                  {formData.emergencyFullName} ({formData.emergencyRelationship})
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Emergency Phone</span>
                <span className="text-slate-800 font-bold mt-0.5 block font-mono">
                  {formData.emergencyPhone}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
