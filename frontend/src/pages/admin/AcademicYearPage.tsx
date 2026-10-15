import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AcademicYear, AdmissionIntake } from '../../types/academic';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import {
  Calendar,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const AcademicYearPage: React.FC = () => {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Year Modal
  const [isYearModalOpen, setIsYearModalOpen] = useState(false);
  const [newYear, setNewYear] = useState({
    name: '2027/2028 Academic Year',
    startDate: '2027-09-01T00:00:00.000Z',
    endDate: '2028-08-31T00:00:00.000Z',
    isActive: true,
  });

  // New Intake Modal
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [selectedYearId, setSelectedYearId] = useState<string>('');
  const [newIntake, setNewIntake] = useState({
    name: '',
    startDate: '2026-09-01T00:00:00.000Z',
    endDate: '2026-12-20T00:00:00.000Z',
    applicationDeadline: '2026-11-30T23:59:59.000Z',
    isActive: true,
  });

  const fetchAcademicYears = async () => {
    try {
      setIsLoading(true);
      const data = await api.get<AcademicYear[]>('/academic-years');
      setYears(data);
      if (data.length > 0 && !selectedYearId) {
        setSelectedYearId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load academic years', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const handleToggleYear = async (year: AcademicYear) => {
    try {
      await api.patch(`/academic-years/${year.id}`, { isActive: !year.isActive });
      setYears((prev) =>
        prev.map((y) => (y.id === year.id ? { ...y, isActive: !y.isActive } : y))
      );
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleToggleIntake = async (intake: AdmissionIntake) => {
    try {
      await api.patch(`/intakes/${intake.id}`, { isActive: !intake.isActive });
      await fetchAcademicYears();
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleCreateYear = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/academic-years', newYear);
      setIsYearModalOpen(false);
      await fetchAcademicYears();
    } catch (err: any) {
      alert(err.message || 'Failed to create academic year');
    }
  };

  const handleCreateIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/intakes', {
        ...newIntake,
        academicYearId: selectedYearId,
      });
      setIsIntakeModalOpen(false);
      await fetchAcademicYears();
    } catch (err: any) {
      alert(err.message || 'Failed to create intake');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-navy-900">Academic Years & Admission Intakes</h1>
            <Badge variant="navy">Session Configuration</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage academic sessions, intake windows, application closing dates, and intake status.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIsYearModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Academic Year
          </Button>
          <Button onClick={() => setIsIntakeModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Intake Period
          </Button>
        </div>
      </div>

      {/* Academic Sessions List */}
      {isLoading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-navy-800 border-t-gold-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-5">
          {years.map((year) => (
            <Card key={year.id} className="overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-navy-900 text-gold-400">
                    <Calendar className="h-5 w-5 text-gold-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-navy-950">{year.name}</h3>
                    <p className="text-xs text-slate-500">
                      Duration: {new Date(year.startDate).toLocaleDateString()} —{' '}
                      {new Date(year.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={year.isActive ? 'success' : 'neutral'}>
                    {year.isActive ? 'Active Session' : 'Closed Session'}
                  </Badge>
                  <Button
                    variant="ghost"
                    onClick={() => handleToggleYear(year)}
                    className="text-xs py-1"
                  >
                    {year.isActive ? 'Deactivate Year' : 'Activate Year'}
                  </Button>
                </div>
              </div>

              {/* Intakes belonging to this academic year */}
              <div className="p-5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                  Configured Intakes for this session:
                </h4>

                {!year.intakes || year.intakes.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No admission intakes configured yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {year.intakes.map((intake) => {
                      const isPastDeadline = new Date(intake.applicationDeadline) < new Date();
                      return (
                        <div
                          key={intake.id}
                          className="p-4 rounded-lg border border-slate-200 bg-white shadow-sm flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between mb-2">
                              <span className="font-semibold text-sm text-navy-900">
                                {intake.name}
                              </span>
                              <Badge variant={intake.isActive && !isPastDeadline ? 'success' : 'warning'}>
                                {intake.isActive
                                  ? isPastDeadline
                                    ? 'Deadline Passed'
                                    : 'Accepting Applications'
                                  : 'Closed'}
                              </Badge>
                            </div>

                            <div className="space-y-1 text-xs text-slate-600 mt-2">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Application Deadline:</span>
                                <span className="font-semibold text-slate-800">
                                  {new Date(intake.applicationDeadline).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Term Dates:</span>
                                <span>
                                  {new Date(intake.startDate).toLocaleDateString()} –{' '}
                                  {new Date(intake.endDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="text-slate-400">Intake Status</span>
                            <button
                              onClick={() => handleToggleIntake(intake)}
                              className="font-medium text-navy-800 hover:underline"
                            >
                              {intake.isActive ? 'Close Intake' : 'Open Intake'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* New Year Modal */}
      {isYearModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-navy-900 mb-1">Add Academic Year</h2>
            <p className="text-xs text-slate-500 mb-4">Create a new academic calendar year</p>

            <form onSubmit={handleCreateYear} className="space-y-3">
              <Input
                label="Session Name (e.g. 2027/2028)"
                value={newYear.name}
                onChange={(e) => setNewYear({ ...newYear, name: e.target.value })}
                required
              />

              <div className="flex justify-end gap-2 pt-3">
                <Button variant="secondary" type="button" onClick={() => setIsYearModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Session</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Intake Modal */}
      {isIntakeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-navy-900 mb-1">Add Admission Intake</h2>
            <p className="text-xs text-slate-500 mb-4">Set application intake period and deadline</p>

            <form onSubmit={handleCreateIntake} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Academic Year</label>
                <select
                  className="block w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-600"
                  value={selectedYearId}
                  onChange={(e) => setSelectedYearId(e.target.value)}
                >
                  {years.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Intake Name"
                placeholder="e.g. January 2027 Modular Intake"
                value={newIntake.name}
                onChange={(e) => setNewIntake({ ...newIntake, name: e.target.value })}
                required
              />

              <div className="flex justify-end gap-2 pt-3">
                <Button variant="secondary" type="button" onClick={() => setIsIntakeModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Intake</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
