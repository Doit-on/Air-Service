import React from 'react';
import { Job, Customer, Technician, ACUnit } from '../types';
import { formatCurrency } from '../utils/formatters';
import {
  MapPin,
  Phone,
  Navigation,
  Clock,
  CheckCircle2,
  Camera,
  PenTool,
  Shield,
  MessageSquare,
  Wrench,
  ChevronRight,
} from 'lucide-react';

interface TechnicianMobileViewProps {
  currentTech: Technician;
  jobs: Job[];
  customers: Customer[];
  acUnits: ACUnit[];
  onSelectJob: (job: Job) => void;
  onUpdateJobStatus: (jobId: string, newStatus: Job['status']) => void;
  onOpenLineModal: (job: Job) => void;
  onOpenReportModal: (job: Job) => void;
}

export const TechnicianMobileView: React.FC<TechnicianMobileViewProps> = ({
  currentTech,
  jobs,
  customers,
  acUnits,
  onSelectJob,
  onUpdateJobStatus,
  onOpenLineModal,
  onOpenReportModal,
}) => {
  // Filter jobs for this technician today (2026-10-16)
  const todayDateStr = '2026-10-16';
  const myTodayJobs = jobs
    .filter((j) => j.technicianId === currentTech.id && j.scheduledDate === todayDateStr)
    .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

  const completedCount = myTodayJobs.filter((j) => j.status === 'completed').length;
  const progressPercent = myTodayJobs.length > 0 ? (completedCount / myTodayJobs.length) * 100 : 0;

  return (
    <div className="max-w-xl mx-auto space-y-5 pb-12">
      {/* Technician Profile Header */}
      <div className="bg-slate-900 rounded-3xl p-5 text-white shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={currentTech.avatar}
                alt={currentTech.name}
                className="w-13 h-13 rounded-2xl object-cover border-2 border-sky-400 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900"></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-bold text-white">{currentTech.nickname}</h2>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-medium border border-sky-500/30">
                  ช่างประจำรถ
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{currentTech.name}</p>
              <p className="text-[11px] text-slate-300 font-mono mt-0.5">{currentTech.vehicle}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block px-2 py-0.5 rounded-lg bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
              ⭐ {currentTech.rating}
            </span>
            <p className="text-[10px] text-slate-400 mt-1">ช่างเทคนิคยอดเยี่ยม</p>
          </div>
        </div>

        {/* Today's Progress Bar */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-300">ความคืบหน้างวันนี้</span>
            <span className="font-bold text-sky-400 font-mono">
              เสร็จ {completedCount} / {myTodayJobs.length} งาน ({Math.round(progressPercent)}%)
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-sky-500 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="flex items-center justify-between px-1">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Wrench className="w-4 h-4 text-sky-600" />
          <span>งานของฉันวันนี้ ({myTodayJobs.length} งาน)</span>
        </h3>
        <span className="text-xs text-slate-500 font-medium">วันศุกร์ที่ 16 ต.ค. 2569</span>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {myTodayJobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">ไม่มีคิวงานค้างในวันนี้!</p>
            <p className="text-xs text-slate-400 mt-1">พักผ่อนหรือติดต่อแอดมินเพื่อรับงานเพิ่มเติม</p>
          </div>
        ) : (
          myTodayJobs.map((job, idx) => {
            const cust = customers.find((c) => c.id === job.customerId);
            const ac = acUnits.find((u) => u.id === job.acUnitId);
            const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
              cust?.address || ''
            )}`;

            return (
              <div
                key={job.id}
                className={`bg-white rounded-2xl border shadow-xs p-4 sm:p-5 space-y-3 transition-all ${
                  job.status === 'in_progress'
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                    : job.status === 'en_route'
                    ? 'border-amber-400 ring-2 ring-amber-500/20'
                    : job.status === 'completed'
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-slate-200'
                }`}
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold text-slate-500">
                          {job.jobCode}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{cust?.name}</span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {job.timeSlot}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      job.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : job.status === 'in_progress'
                        ? 'bg-indigo-100 text-indigo-800'
                        : job.status === 'en_route'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {job.status === 'completed'
                      ? '✓ เสร็จสิ้น'
                      : job.status === 'in_progress'
                      ? '⚡ กำลังทำ'
                      : job.status === 'en_route'
                      ? '🚗 กำลังไป'
                      : '⏳ นัดหมาย'}
                  </span>
                </div>

                {/* Job service & AC detail */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <p className="font-bold text-slate-900">{job.title}</p>
                  <p className="text-slate-600">
                    เครื่อง: <strong>{ac?.brand}</strong> {ac?.btu?.toLocaleString()} BTU • {ac?.installedLocation}
                  </p>
                  <p className="text-slate-500 text-[11px]">{job.description}</p>
                </div>

                {/* Customer Address & Call/Map Buttons */}
                <div className="flex items-start justify-between gap-2 text-xs text-slate-600">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-800">{cust?.address}</p>
                    </div>
                  </div>
                </div>

                {/* Big Action Buttons for Mobile Road Use */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {cust?.phone && (
                    <a
                      href={`tel:${cust.phone}`}
                      className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>โทรหาลูกค้า</span>
                    </a>
                  )}

                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-xs transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>นำทาง GPS</span>
                  </a>
                </div>

                {/* Workflow Status Actions */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  {job.status === 'scheduled' && (
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateJobStatus(job.id, 'en_route');
                        onOpenLineModal(job);
                      }}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2"
                    >
                      <span>🚗 เริ่มออกเดินทาง (แจ้งเตือนลูกค้าใน LINE)</span>
                    </button>
                  )}

                  {job.status === 'en_route' && (
                    <button
                      type="button"
                      onClick={() => onUpdateJobStatus(job.id, 'in_progress')}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2"
                    >
                      <span>⚡ ถึงหน้างานแล้ว / เริ่มปฏิบัติงาน</span>
                    </button>
                  )}

                  {job.status === 'in_progress' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectJob(job)}
                        className="py-2.5 px-2 rounded-xl bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 font-semibold text-xs flex items-center justify-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5 text-sky-600" />
                        <span>ถ่ายรูป & บันทึกค่า</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectJob(job)}
                        className="py-2.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        <span>ให้ลูกค้าเซ็นรับงาน</span>
                      </button>
                    </div>
                  )}

                  {job.status === 'pending_payment' && (
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateJobStatus(job.id, 'completed');
                        onOpenReportModal(job);
                      }}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>รับชำระเงิน & จบงานส่งมอบรายงาน</span>
                    </button>
                  )}

                  {job.status === 'completed' && (
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>งานเสร็จสมบูรณ์แล้ว</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => onOpenReportModal(job)}
                        className="text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>ดูรายงาน & ใบรับประกัน</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
