import React, { useState } from 'react';
import { Job, Customer, Technician, ACUnit, JobStatus } from '../types';
import { JOB_STATUS_LABELS } from '../data/mockData';
import { formatCurrency, formatThaiDate } from '../utils/formatters';
import {
  Search,
  Plus,
  Clock,
  MessageSquare,
  ChevronRight,
  Shield,
  Layers,
  List,
  Edit3,
  Trash2,
} from 'lucide-react';

interface JobListProps {
  jobs: Job[];
  customers: Customer[];
  technicians: Technician[];
  acUnits: ACUnit[];
  onSelectJob: (job: Job) => void;
  onEditJob: (job: Job) => void;
  onDeleteJob: (job: Job) => void;
  onOpenNewJob: () => void;
  onOpenLineModal: (job: Job) => void;
  onOpenReportModal: (job: Job) => void;
}

export const JobList: React.FC<JobListProps> = ({
  jobs,
  customers,
  technicians,
  acUnits,
  onSelectJob,
  onEditJob,
  onDeleteJob,
  onOpenNewJob,
  onOpenLineModal,
  onOpenReportModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [techFilter, setTechFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  const filteredJobs = jobs.filter((job) => {
    const cust = customers.find((c) => c.id === job.customerId);
    const ac = acUnits.find((u) => u.id === job.acUnitId);

    const matchesSearch =
      job.jobCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cust && cust.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cust && cust.phone.includes(searchTerm)) ||
      (ac && ac.brand.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter !== 'all' && job.status !== statusFilter) return false;
    if (techFilter !== 'all' && job.technicianId !== techFilter) return false;

    return true;
  });

  const columns: { status: JobStatus; title: string; color: string }[] = [
    { status: 'scheduled', title: 'นัดหมายแล้ว', color: 'border-blue-400 bg-blue-50/30' },
    { status: 'en_route', title: 'กำลังเดินทาง', color: 'border-amber-400 bg-amber-50/30' },
    { status: 'in_progress', title: 'กำลังปฏิบัติงาน', color: 'border-indigo-400 bg-indigo-50/30' },
    { status: 'pending_payment', title: 'รอตรวจรับ/ชำระ', color: 'border-purple-400 bg-purple-50/30' },
    { status: 'completed', title: 'เสร็จสมบูรณ์', color: 'border-emerald-400 bg-emerald-50/30' },
  ];

  return (
    <div className="space-y-6">
      {/* Search and Filter Top Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหารหัสงาน, ลูกค้า, เบอร์โทร, แอร์..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Tech filter */}
            <select
              value={techFilter}
              onChange={(e) => setTechFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">ช่างทุกคน (All Technicians)</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nickname} ({t.name})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between w-full md:w-auto gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('board')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  viewMode === 'board'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pipeline บอร์ด</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ตารางรายการ</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onOpenNewJob}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ เปิดงานใหม่</span>
            </button>
          </div>
        </div>

        {/* Status Pills */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-full font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ทั้งหมด ({jobs.length})
          </button>
          {Object.entries(JOB_STATUS_LABELS).map(([key, item]) => {
            const count = jobs.filter((j) => j.status === key).length;
            if (count === 0 && key === 'cancelled') return null;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setStatusFilter(key)}
                className={`px-3 py-1 rounded-full font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  statusFilter === key
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${item.dot}`}></span>
                <span>{item.label} ({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW 1: KANBAN PIPELINE BOARD */}
      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
          {columns.map((col) => {
            const colJobs = filteredJobs.filter((j) => j.status === col.status);

            return (
              <div
                key={col.status}
                className={`rounded-2xl border p-3 flex flex-col bg-slate-50/50 min-h-[480px] ${col.color}`}
              >
                {/* Column header */}
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200/80">
                  <h3 className="font-bold text-xs text-slate-800">{col.title}</h3>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white text-slate-700 font-bold shadow-2xs">
                    {colJobs.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-3 flex-1">
                  {colJobs.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-xs italic">
                      ไม่มีงานในขั้นตอนนี้
                    </div>
                  ) : (
                    colJobs.map((job) => {
                      const cust = customers.find((c) => c.id === job.customerId);
                      const tech = technicians.find((t) => t.id === job.technicianId);
                      const ac = acUnits.find((u) => u.id === job.acUnitId);

                      return (
                        <div
                          key={job.id}
                          onClick={() => onSelectJob(job)}
                          className="bg-white rounded-xl p-3.5 border border-slate-200 hover:border-sky-400 hover:shadow-md transition-all cursor-pointer space-y-2.5 group"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono font-bold text-slate-500 text-[11px]">
                              {job.jobCode}
                            </span>
                            <span
                              className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: tech?.color || '#0284c7' }}
                            >
                              {tech?.nickname || 'ช่างเทคนิค'}
                            </span>
                          </div>

                          <div>
                            <h4 className="font-bold text-xs text-slate-900 group-hover:text-sky-700 leading-snug">
                              {job.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                              {ac?.brand || 'แอร์'} • {ac?.installedLocation || '-'}
                            </p>
                          </div>

                          <div className="text-[11px] text-slate-600 space-y-0.5 pt-1 border-t border-slate-100">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-slate-800">{cust?.name || 'ลูกค้าทั่วไป'}</span>
                              <span className="text-slate-500 text-[10px]">{cust?.district || ''}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-500 text-[10px]">
                              <span className="flex items-center gap-1 font-mono">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {job.timeSlot.split('-')[0].trim()}
                              </span>
                              <strong className="text-slate-800 font-mono">
                                {formatCurrency(job.price)}
                              </strong>
                            </div>
                          </div>

                          {/* Fast Action Mini-bar with Edit & Delete */}
                          <div className="pt-1.5 flex items-center justify-between text-[10px] border-t border-slate-100">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenLineModal(job);
                                }}
                                className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-semibold"
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span>LINE</span>
                              </button>

                              {job.status === 'completed' && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenReportModal(job);
                                  }}
                                  className="text-sky-600 hover:text-sky-700 flex items-center gap-1 font-semibold"
                                >
                                  <Shield className="w-3 h-3" />
                                  <span>PDF</span>
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditJob(job);
                                }}
                                className="p-1 rounded text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                                title="แก้ไขข้อมูลงาน (รหัส 0000)"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteJob(job);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="ลบข้อมูลงาน (รหัส 0000)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-slate-400 group-hover:text-sky-600">
                                <ChevronRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VIEW 2: TABLE LIST VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">รหัสงาน</th>
                <th className="py-3 px-4">ลูกค้า & ที่อยู่</th>
                <th className="py-3 px-4">ประเภทงาน & แอร์</th>
                <th className="py-3 px-4">ช่างผู้รับผิดชอบ</th>
                <th className="py-3 px-4">วัน & เวลา</th>
                <th className="py-3 px-4 text-center">สถานะ</th>
                <th className="py-3 px-4 text-right">ค่าบริการ</th>
                <th className="py-3 px-4 text-center">การกระทำ / แก้ไข / ลบ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredJobs.map((job) => {
                const cust = customers.find((c) => c.id === job.customerId);
                const tech = technicians.find((t) => t.id === job.technicianId);
                const ac = acUnits.find((u) => u.id === job.acUnitId);
                const stInfo = JOB_STATUS_LABELS[job.status] || JOB_STATUS_LABELS.pending;

                return (
                  <tr
                    key={job.id}
                    onClick={() => onSelectJob(job)}
                    className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{job.jobCode}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{cust?.name || '-'}</p>
                      <span className="text-[11px] text-slate-500">
                        {cust?.phone} • {cust?.district}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{job.title}</p>
                      <span className="text-[11px] text-slate-500">
                        {ac?.brand} ({ac?.installedLocation})
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {tech?.avatar && (
                          <img
                            src={tech.avatar}
                            alt={tech.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        )}
                        <span className="font-medium text-slate-800">
                          {tech?.nickname || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <p>{formatThaiDate(job.scheduledDate)}</p>
                      <span className="text-[11px] text-slate-400 font-mono">{job.timeSlot}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${stInfo.bg} ${stInfo.color}`}
                      >
                        {stInfo.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(job.price)}
                    </td>
                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEditJob(job)}
                          className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-50 border border-slate-200"
                          title="แก้ไขข้อมูลงาน (รหัส 0000)"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteJob(job)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-slate-200"
                          title="ลบข้อมูลงาน (รหัส 0000)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenLineModal(job)}
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 border border-slate-200"
                          title="ส่งแจ้งเตือน LINE"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenReportModal(job)}
                          className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-50 border border-slate-200"
                          title="ดูรายงานจบงาน"
                        >
                          <Shield className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
