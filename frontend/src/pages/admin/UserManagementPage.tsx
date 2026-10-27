import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Shield,
  Phone,
  Mail,
  Calendar,
  Eye,
  FileText,
  UserPlus,
  Download,
  Key,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  X
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { ActionMenu } from '../../components/ui/ActionMenu';
import { AddStudentModal } from '../../components/admin/AddStudentModal';
import { Pagination } from '../../components/ui/Pagination';
import { usePagination, type PaginatedResponse } from '../../hooks/usePagination';

export const UserManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'SYSTEM_ADMIN';
  const canAddStudent = isSuperAdmin || currentUser?.role === 'ADMIN' || currentUser?.role === 'ADMISSIONS_OFFICER';
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Add student modal state
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);

  // Add staff modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    firstName: '',
    surname: '',
    email: '',
    phone: '',
    role: 'ADMISSIONS_OFFICER',
    password: '',
  });
  const [formError, setFormError] = useState('');

  // Role edit modal state
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [selectedRole, setSelectedRole] = useState('');

  const { page, limit, setPage, reset: resetPagination } = usePagination(15);
  useEffect(() => {
    resetPagination();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, roleFilter]);

  const { data: paginated, isLoading } = useQuery({
    queryKey: ['admin-users', searchTerm, roleFilter, page, limit],
    queryFn: () => {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (roleFilter !== 'ALL') params.append('role', roleFilter);
      params.append('page', String(page));
      params.append('limit', String(limit));
      return api.get<PaginatedResponse<any>>(`/admin/users?${params.toString()}`);
    },
  });

  const users = paginated?.items ?? [];
  const pagination = paginated?.pagination;

  // Create Staff Mutation
  const createStaffMutation = useMutation({
    mutationFn: (data: typeof newStaff) => api.post('/admin/users', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsAddModalOpen(false);
      setNewStaff({
        firstName: '',
        surname: '',
        email: '',
        phone: '',
        role: 'ADMISSIONS_OFFICER',
        password: '',
      });
      setFormError('');
    },
    onError: (err: any) => {
      setFormError(err.message || 'Failed to create staff member.');
    },
  });

  // Update User Mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { role?: string; isActive?: boolean } }) =>
      api.patch(`/admin/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setEditingUser(null);
    },
    onError: (err: any) => {
      alert(`Update failed: ${err.message}`);
    },
  });

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.firstName || !newStaff.surname || !newStaff.email || !newStaff.phone || !newStaff.password) {
      setFormError('All fields are required.');
      return;
    }
    createStaffMutation.mutate(newStaff);
  };

  const handleExportCSV = () => {
    if (users.length === 0) return;

    const headers = [
      'ID',
      'First Name',
      'Surname',
      'Email',
      'Phone',
      'Role',
      'Status',
      'Email Verified',
      'Applications Count',
      'Registered Date',
    ];

    const rows = filteredUsers.map((u: any) => [
      `"${u.id}"`,
      `"${u.firstName || ''}"`,
      `"${u.surname || ''}"`,
      `"${u.email || ''}"`,
      `"${u.phone || ''}"`,
      `"${u.role || ''}"`,
      `"${u.isActive ? 'ACTIVE' : 'INACTIVE'}"`,
      `"${u.isEmailVerified ? 'YES' : 'NO'}"`,
      `"${u._count?.applications || 0}"`,
      `"${new Date(u.createdAt).toISOString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `KICTAMC_User_Directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Server-side filtering now applied via query params
  const filteredUsers = users;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <span className="px-2.5 py-1 text-xs rounded-full font-bold bg-rose-100 text-rose-800 border border-rose-200">Super Admin</span>;
      case 'SYSTEM_ADMIN':
        return <span className="px-2.5 py-1 text-xs rounded-full font-bold bg-purple-100 text-purple-800 border border-purple-200">System Admin</span>;
      case 'ADMIN':
        return <span className="px-2.5 py-1 text-xs rounded-full font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">College Admin</span>;
      case 'COMPLIANCE':
        return <span className="px-2.5 py-1 text-xs rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-200">Compliance</span>;
      case 'LECTURER':
        return <span className="px-2.5 py-1 text-xs rounded-full font-bold bg-teal-100 text-teal-800 border border-teal-200">Lecturer</span>;
      case 'ADMISSIONS_OFFICER':
        return <span className="px-2.5 py-1 text-xs rounded-full font-bold bg-blue-100 text-blue-800 border border-blue-200">Admissions</span>;
      case 'FINANCE_OFFICER':
        return <span className="px-2.5 py-1 text-xs rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Finance</span>;
      case 'STUDENT':
        return <span className="px-2.5 py-1 text-xs rounded-full font-bold bg-green-100 text-green-800 border border-green-200">Enrolled Student</span>;
      default:
        return <span className="px-2.5 py-1 text-xs rounded-full font-bold bg-slate-100 text-slate-700 border border-slate-200">Applicant</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-navy-950">User Management</h1>
          <p className="text-sm text-slate-500">
            Directory of registered student applicants, enrolled collegiate members, and institutional staff.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            disabled={users.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs disabled:opacity-50 transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" /> Export CSV
          </button>

          {canAddStudent && (
            <button
              onClick={() => setIsAddStudentModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition shadow-xs"
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-200" /> Direct Enrol Student
            </button>
          )}

          {isSuperAdmin ? (
            <button
              onClick={() => {
                setIsAddModalOpen(true);
                setFormError('');
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-navy-900 text-white text-xs font-semibold hover:bg-navy-800 transition shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5 text-gold-400" /> Add Staff Member
            </button>
          ) : (
            <span className="text-[11px] text-slate-400 font-medium italic">
              User modification requires Super Admin
            </span>
          )}
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-800"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-navy-800"
        >
          <option value="ALL">All Roles</option>
          <option value="SUPER_ADMIN">Super Admins</option>
          <option value="ADMIN">College Admins</option>
          <option value="COMPLIANCE">Compliance Officers</option>
          <option value="LECTURER">Lecturers</option>
          <option value="ADMISSIONS_OFFICER">Admissions Officers</option>
          <option value="FINANCE_OFFICER">Finance Officers</option>
          <option value="STUDENT">Enrolled Students</option>
          <option value="APPLICANT">Applicants</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Verification</th>
                <th className="py-3.5 px-4 text-center">Applications</th>
                <th className="py-3.5 px-4">Registered Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-navy-800 border-t-gold-500 rounded-full animate-spin mx-auto mb-2" />
                    Loading user directory...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No users match the search criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">
                        {u.firstName} {u.middleName || ''} {u.surname}
                      </div>
                      <div className="text-xs text-slate-400">{u.id.slice(0, 8)}...</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-xs text-slate-700 font-medium flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-400" /> {u.email}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" /> {u.phone}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">{getRoleBadge(u.role)}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                          <XCircle className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                      <span className="flex items-center gap-1 text-slate-600">
                        {u.isEmailVerified ? (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-slate-300" />
                        )}
                        Email
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-center font-bold text-navy-900">
                      {u._count?.applications || 0}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <ActionMenu
                        label={`Actions for ${u.firstName} ${u.surname}`}
                        items={[
                          {
                            label: 'View Applications',
                            icon: <FileText className="w-4 h-4 text-navy-800" />,
                            to: `/admin/applications?search=${encodeURIComponent(u.phone || u.email)}`
                          },
                          ...(isSuperAdmin ? [
                            {
                              label: 'Change Role',
                              icon: <ShieldCheck className="w-4 h-4 text-purple-600" />,
                              onClick: () => {
                                setEditingUser(u);
                                setSelectedRole(u.role);
                              }
                            },
                            {
                              label: u.isActive ? 'Deactivate Account' : 'Activate Account',
                              icon: u.isActive ? <XCircle className="w-4 h-4 text-rose-600" /> : <CheckCircle className="w-4 h-4 text-emerald-600" />,
                              onClick: () => {
                                updateUserMutation.mutate({
                                  id: u.id,
                                  data: { isActive: !u.isActive },
                                });
                              }
                            },
                          ] : []),
                          {
                            label: 'Send Email',
                            icon: <Mail className="w-4 h-4 text-blue-600" />,
                            onClick: () => window.location.href = `mailto:${u.email}`
                          }
                        ]}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pagination && pagination.total > 0 && (
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* ADD STAFF MEMBER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-navy-50 text-navy-800 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-950">Add Institutional Staff</h3>
                  <p className="text-xs text-slate-500">Create an Administrative, Admissions, Finance, or Compliance staff account</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={newStaff.firstName}
                    onChange={(e) => setNewStaff({ ...newStaff, firstName: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-800"
                    placeholder="e.g. Mariama"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Surname *</label>
                  <input
                    type="text"
                    required
                    value={newStaff.surname}
                    onChange={(e) => setNewStaff({ ...newStaff, surname: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-800"
                    placeholder="e.g. Kamara"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Staff Email *</label>
                <input
                  type="email"
                  required
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-800"
                  placeholder="e.g. m.kamara@kictamc.edu.sl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-800"
                  placeholder="e.g. +23276123456"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Staff Role *</label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy-800 font-medium"
                >
                  <option value="ADMIN">College Administrator (Academic & operational management)</option>
                  <option value="ADMISSIONS_OFFICER">Admissions Officer (Review applications & issue decisions)</option>
                  <option value="FINANCE_OFFICER">Finance Officer (Verify fees & ledger reconciliations)</option>
                  <option value="COMPLIANCE">Compliance Officer (Audit logs & view-only)</option>
                  <option value="LECTURER">Lecturer (Course curriculum & rosters)</option>
                  <option value="SUPER_ADMIN">Super Administrator (Full institutional system authority)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Temporary Password *</label>
                <input
                  type="password"
                  required
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-800 font-mono"
                  placeholder="Min. 8 characters"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createStaffMutation.isPending}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-navy-900 text-white hover:bg-navy-800 transition disabled:opacity-50"
                >
                  {createStaffMutation.isPending ? 'Creating Account...' : 'Create Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE ROLE MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-sm font-bold text-navy-950">Change User Role</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Update role for <strong>{editingUser.firstName} {editingUser.surname}</strong> ({editingUser.email}):
            </p>

            <div className="space-y-1.5 mb-4 max-h-72 overflow-y-auto pr-1">
              {[
                { val: 'APPLICANT', label: 'Prospective Applicant' },
                { val: 'STUDENT', label: 'Enrolled Student' },
                { val: 'LECTURER', label: 'Lecturer / Academic Staff' },
                { val: 'COMPLIANCE', label: 'Compliance Officer (View & Logs Only)' },
                { val: 'ADMISSIONS_OFFICER', label: 'Admissions Officer' },
                { val: 'FINANCE_OFFICER', label: 'Finance Officer' },
                { val: 'ADMIN', label: 'College Administrator' },
                { val: 'SUPER_ADMIN', label: 'Super Administrator' },
              ].map((r) => (
                <label
                  key={r.val}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition ${
                    selectedRole === r.val ? 'border-navy-800 bg-navy-50 font-bold text-navy-950' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="roleChoice"
                    value={r.val}
                    checked={selectedRole === r.val}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="text-navy-900"
                  />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setEditingUser(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  updateUserMutation.mutate({
                    id: editingUser.id,
                    data: { role: selectedRole },
                  })
                }
                disabled={updateUserMutation.isPending}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-navy-900 text-white hover:bg-navy-800 transition disabled:opacity-50"
              >
                {updateUserMutation.isPending ? 'Updating...' : 'Save Role'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Direct Add Student Modal */}
      <AddStudentModal
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
      />
    </div>
  );
};
