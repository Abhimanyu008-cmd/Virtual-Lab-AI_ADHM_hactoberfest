/**
 * VirtuLab AI - Attendance Tracker
 * Calculates real attendance percentages from stored laboratory records.
 * Supports course-wise breakdown and instructor record creation.
 */

import React, { useState } from 'react';
import { StorageService } from '../services/storageService';
import { AttendanceRecord, LabCourse } from '../types/app';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  BookOpen,
  Filter,
  UserCheck,
  UserX
} from 'lucide-react';

export const AttendanceTracker: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>(StorageService.getAttendance());
  const [courses] = useState<LabCourse[]>(StorageService.getCourses());
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form state for adding demo attendance record
  const [formCourseId, setFormCourseId] = useState<string>(courses[0]?.id || 'c1');
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formTopic, setFormTopic] = useState<string>('');
  const [formStatus, setFormStatus] = useState<'PRESENT' | 'ABSENT' | 'EXCUSED'>('PRESENT');
  const [formDuration, setFormDuration] = useState<number>(2);

  const currentUser = StorageService.getUserProfile();
  const isInstructor = currentUser.role === 'instructor';

  // Filtered records
  const filteredRecords = selectedCourseFilter === 'ALL'
    ? records
    : records.filter(r => r.courseId === selectedCourseFilter);

  // Compute dynamic metrics
  const totalRecorded = records.length;
  const totalPresent = records.filter(r => r.status === 'PRESENT').length;
  const totalAbsent = records.filter(r => r.status === 'ABSENT').length;
  const totalExcused = records.filter(r => r.status === 'EXCUSED').length;
  const overallPercentage = totalRecorded > 0 ? Math.round((totalPresent / totalRecorded) * 100) : 0;

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const course = courses.find(c => c.id === formCourseId);
    if (!course || !formTopic.trim()) return;

    const newRecord = StorageService.addAttendance({
      courseId: course.id,
      courseCode: course.code,
      courseTitle: course.title,
      date: formDate,
      topic: formTopic.trim(),
      status: formStatus,
      durationHours: formDuration
    });

    setRecords(StorageService.getAttendance());
    setShowAddModal(false);
    setFormTopic('');
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Header Banner */}
      <div className="bg-[#0d162d] border border-[#1e2e4f] rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Academic Performance Record</span>
            <span aria-hidden="true">·</span>
            <span className="text-cyan-400 font-mono">Real Dynamic Calculations</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-cyan-400" />
            <span>Laboratory Attendance Tracker</span>
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Attendance percentages are calculated dynamically from stored database entries. (Demonstration Dataset — not affiliated with external college ERP systems).
          </p>
        </div>

        {isInstructor ? (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-cyan-950/40 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Mark Practical Attendance</span>
          </button>
        ) : (
          <div className="text-xs text-slate-400 bg-[#070b14] border border-[#1e2e4f] px-3 py-2 rounded-xl">
            Logged in as <span className="text-white font-medium">Student</span> (Read-Only)
          </div>
        )}
      </div>

      {/* 2. Dynamic Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-[#0b1222] border border-[#1e2e4f] rounded-xl p-4">
          <div className="text-xs text-slate-400">Overall Attendance</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {overallPercentage}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {overallPercentage >= 75 ? 'Meets 75% examination eligibility' : 'Warning: Below 75% threshold'}
          </div>
        </div>

        <div className="bg-[#0b1222] border border-[#1e2e4f] rounded-xl p-4">
          <div className="text-xs text-slate-400">Sessions Attended</div>
          <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">
            {totalPresent} <span className="text-xs text-slate-500 font-normal">/ {totalRecorded}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Total practical lab hours: {totalPresent * 2} hrs
          </div>
        </div>

        <div className="bg-[#0b1222] border border-[#1e2e4f] rounded-xl p-4">
          <div className="text-xs text-slate-400">Sessions Missed</div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
            {totalAbsent}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Unexcused absences
          </div>
        </div>

        <div className="bg-[#0b1222] border border-[#1e2e4f] rounded-xl p-4">
          <div className="text-xs text-slate-400">Excused Leaves</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {totalExcused}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Approved medical / institutional leave
          </div>
        </div>
      </div>

      {/* 3. Course-wise Breakdown */}
      <div className="bg-[#0b1222] border border-[#1e2e4f] rounded-xl p-4 flex flex-col gap-3">
        <h3 className="text-xs font-semibold text-slate-200">
          Attendance by Laboratory Course
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {courses.map(course => {
            const courseRecords = records.filter(r => r.courseId === course.id);
            const attended = courseRecords.filter(r => r.status === 'PRESENT').length;
            const pct = courseRecords.length > 0 ? Math.round((attended / courseRecords.length) * 100) : 0;
            return (
              <div
                key={course.id}
                className="bg-[#070b14] border border-[#1e2e4f] rounded-xl p-3.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-cyan-400 font-bold">{course.code}</span>
                    <span className="font-mono font-bold text-white">{pct}%</span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200 mt-1 leading-snug">
                    {course.title}
                  </h4>
                  <div className="text-[10px] text-slate-400 mt-0.5">Instructor: {course.instructor}</div>
                </div>

                <div className="mt-3">
                  <div className="w-full bg-[#111c34] rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${pct >= 75 ? 'bg-emerald-400' : 'bg-rose-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 font-mono">
                    <span>{attended} attended</span>
                    <span>{courseRecords.length} recorded</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Complete Attendance Log Table */}
      <div className="bg-[#0b1222] border border-[#1e2e4f] rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[#1e2e4f]">
          <h3 className="text-xs font-semibold text-slate-200">
            Attendance Log Entries ({filteredRecords.length})
          </h3>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="bg-[#070b14] border border-[#1e2e4f] rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="ALL">All Lab Courses</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.code} – {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1e2e4f] text-[11px] text-slate-400 font-mono">
                <th className="pb-2">Date</th>
                <th className="pb-2">Course</th>
                <th className="pb-2">Topic / Experiment</th>
                <th className="pb-2">Duration</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2e4f]/50">
              {filteredRecords.map(rec => (
                <tr key={rec.id} className="hover:bg-[#070b14]/60 transition-colors">
                  <td className="py-2.5 font-mono text-slate-300">{rec.date}</td>
                  <td className="py-2.5">
                    <span className="font-mono text-cyan-400 font-semibold">{rec.courseCode}</span>
                    <span className="text-slate-400 text-[11px] ml-1.5 hidden md:inline">{rec.courseTitle}</span>
                  </td>
                  <td className="py-2.5 text-slate-200 font-medium">{rec.topic}</td>
                  <td className="py-2.5 font-mono text-slate-400">{rec.durationHours} hrs</td>
                  <td className="py-2.5">
                    {rec.status === 'PRESENT' && (
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Present</span>
                      </span>
                    )}
                    {rec.status === 'ABSENT' && (
                      <span className="text-rose-400 font-medium flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Absent</span>
                      </span>
                    )}
                    {rec.status === 'EXCUSED' && (
                      <span className="text-amber-400 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Excused</span>
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 text-[11px] text-slate-400">{rec.remarks || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Instructor Add Attendance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b1222] border border-[#1e2e4f] rounded-2xl max-w-md w-full p-6 flex flex-col gap-4 shadow-2xl">
            <h3 className="text-base font-bold text-white border-b border-[#1e2e4f] pb-2">
              Mark Laboratory Attendance Entry
            </h3>

            <form onSubmit={handleAddRecord} className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-slate-400">Course:</label>
                <select
                  value={formCourseId}
                  onChange={(e) => setFormCourseId(e.target.value)}
                  className="bg-[#070b14] border border-[#1e2e4f] rounded-lg px-3 py-2 text-white"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.code} – {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400">Date:</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="bg-[#070b14] border border-[#1e2e4f] rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400">Topic / Experiment Title:</label>
                <input
                  type="text"
                  placeholder="e.g. Verification of Kirchhoff's Voltage Law"
                  value={formTopic}
                  onChange={(e) => setFormTopic(e.target.value)}
                  required
                  className="bg-[#070b14] border border-[#1e2e4f] rounded-lg px-3 py-2 text-white placeholder-slate-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400">Attendance Status:</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as 'PRESENT' | 'ABSENT' | 'EXCUSED')}
                  className="bg-[#070b14] border border-[#1e2e4f] rounded-lg px-3 py-2 text-white"
                >
                  <option value="PRESENT">PRESENT</option>
                  <option value="ABSENT">ABSENT</option>
                  <option value="EXCUSED">EXCUSED</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1e2e4f]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#111c34] text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
