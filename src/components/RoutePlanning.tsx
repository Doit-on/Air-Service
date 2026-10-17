import React, { useState } from 'react';
import { Job, Customer, Technician, ACUnit } from '../types';
import { formatThaiDate } from '../utils/formatters';
import { MapPin, Navigation, Phone, Calendar, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

interface RoutePlanningProps {
  jobs: Job[];
  customers: Customer[];
  technicians: Technician[];
  acUnits: ACUnit[];
  activeTechId?: string;
  onSelectJob: (job: Job) => void;
  onUpdateJobStatus: (jobId: string, newStatus: Job['status']) => void;
  onOpenLineModal: (job: Job) => void;
}

export const RoutePlanning: React.FC<RoutePlanningProps> = ({
  jobs,
  customers,
  technicians,
  acUnits,
  activeTechId,
  onSelectJob,
  onUpdateJobStatus,
  onOpenLineModal,
}) => {
  const [selectedTechId, setSelectedTechId] = useState<string>(activeTechId || technicians[0]?.id || 'tech-1');
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-16'); // Today

  const currentTech = technicians.find((t) => t.id === selectedTechId);

  // Filter jobs for selected tech and date
  const dayJobs = jobs
    .filter((j) => j.technicianId === selectedTechId && j.scheduledDate === selectedDate)
    .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

  const totalDistanceKm = dayJobs.length * 14.5;
  const totalDriveMinutes = dayJobs.length * 28;

  return (
    <div className="space-y-6">
      {/* Top Filter & Summary Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-sky-600" />
              <span>ระบบวางแผนเส้นทางและลำดับการเดินทางประจำวัน</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Smart Route Optimizer คำนวณลำดับคิวงานและเปิด Google Maps นำทางทันที
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Tech Select */}
            <select
              value={selectedTechId}
              onChange={(e) => setSelectedTechId(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.nickname} ({tech.name})
                </option>
              ))}
            </select>

            {/* Date Picker */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="focus:outline-none text-slate-700 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Quick Route Stats Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
            <span>ช่างประจำรถ: <strong className="text-slate-900">{currentTech?.nickname}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>ยานพาหนะ: <strong className="text-slate-900 truncate">{currentTech?.vehicle}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>จำนวนจุดบริการวันนี้: <strong className="text-slate-900">{dayJobs.length} จุด</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            <span>ระยะทางรวมโดยประมาณ: <strong className="text-slate-900 font-mono">~{totalDistanceKm} กม.</strong></span>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Route Map Visualizer + Ordered Stop List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Map Mockup */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-400" />
              <span className="font-semibold text-xs">แผนที่จำลองเส้นทางบริการ เหนือน้ำแอร์ (ปทุมธานี & โซนบริการ)</span>
            </div>
            <span className="text-[11px] text-slate-400">
              {formatThaiDate(selectedDate)}
            </span>
          </div>

          {/* Stylized Bangkok Vector Map Canvas */}
          <div className="relative flex-1 min-h-[320px] bg-slate-100 overflow-hidden p-4 flex items-center justify-center">
            {/* Background grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

            {/* SVG stylized map with rivers and routes */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 400" preserveAspectRatio="none">
              {/* Chao Phraya River stylized curve */}
              <path
                d="M 120 0 Q 150 120 180 200 T 260 400"
                fill="none"
                stroke="#93c5fd"
                strokeWidth="18"
                strokeLinecap="round"
                opacity="0.6"
              />
              <path
                d="M 120 0 Q 150 120 180 200 T 260 400"
                fill="none"
                stroke="#60a5fa"
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.7"
              />

              {/* Expressways lines */}
              <path d="M 0 160 L 500 140" fill="none" stroke="#e2e8f0" strokeWidth="6" />
              <path d="M 280 0 L 260 400" fill="none" stroke="#e2e8f0" strokeWidth="6" />
              <path d="M 50 320 L 450 80" fill="none" stroke="#fed7aa" strokeWidth="4" strokeDasharray="6 4" />

              {/* Connecting path between stops */}
              {dayJobs.length > 1 && (
                <path
                  d="M 160 120 Q 230 190 320 220 T 380 290"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="3.5"
                  strokeDasharray="8 4"
                  className="animate-pulse"
                />
              )}
            </svg>

            {/* Stops Markers on Map */}
            <div className="relative z-10 w-full h-full flex flex-col justify-between py-2">
              {dayJobs.length === 0 ? (
                <div className="text-center p-6 bg-white/90 backdrop-blur-xs rounded-xl shadow-xs border border-slate-200">
                  <p className="text-xs text-slate-500">ไม่มีคิวงานที่นัดหมายในวันนี้</p>
                </div>
              ) : (
                dayJobs.map((job, idx) => {
                  const cust = customers.find((c) => c.id === job.customerId);
                  return (
                    <div
                      key={job.id}
                      onClick={() => onSelectJob(job)}
                      className={`cursor-pointer p-2.5 rounded-xl border shadow-sm transition-all flex items-center justify-between gap-2 max-w-[280px] ${
                        idx === 0
                          ? 'self-start bg-white/95 border-sky-300 ring-2 ring-sky-500/20'
                          : idx === 1
                          ? 'self-center bg-white/95 border-amber-300'
                          : 'self-end bg-white/95 border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-800 truncate">{cust?.name}</p>
                          <span className="text-[10px] text-slate-500">{job.timeSlot}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {job.status === 'completed' ? '✓ เสร็จ' : job.status === 'in_progress' ? '⚡ กำลังทำ' : '⏳ รอ'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>⏱ เวลาเดินทางเฉลี่ย: ~{totalDriveMinutes} นาที</span>
            <span className="text-sky-600 font-medium">กดหมุดเพื่อเปิดงาน</span>
          </div>
        </div>

        {/* Right Column: Ordered Stops & Actions */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span>ลำดับการเข้าบริการตามช่วงเวลา ({dayJobs.length} งาน)</span>
          </h3>

          {dayJobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400">
              <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium">ไม่มีคิวงานที่นัดหมายสำหรับช่างนี้ในวันที่เลือก</p>
              <p className="text-xs text-slate-400 mt-1">เลือกวันที่อื่น หรือสลับช่างเทคนิค</p>
            </div>
          ) : (
            dayJobs.map((job, index) => {
              const cust = customers.find((c) => c.id === job.customerId);
              const ac = acUnits.find((u) => u.id === job.acUnitId);
              const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                cust?.address || 'กรุงเทพมหานคร'
              )}`;

              return (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-sky-300 transition-all space-y-3"
                >
                  {/* Stop header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                        #{index + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-500">
                            {job.jobCode}
                          </span>
                          <span className="text-xs font-semibold text-slate-900">
                            {cust?.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium text-slate-700">{job.timeSlot}</span>
                          <span>•</span>
                          <span>{ac?.brand} ({ac?.installedLocation})</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                          job.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : job.status === 'in_progress'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : job.status === 'en_route'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-50 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {job.status === 'completed'
                          ? '✓ เสร็จสมบูรณ์'
                          : job.status === 'in_progress'
                          ? '⚡ กำลังปฏิบัติงาน'
                          : job.status === 'en_route'
                          ? '🚗 กำลังเดินทาง'
                          : '⏳ รอดำเนินการ'}
                      </span>
                    </div>
                  </div>

                  {/* Address & Navigation */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-start gap-2 text-slate-600">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-slate-800">{cust?.address}</p>
                        <p className="text-[11px] text-slate-500">
                          {cust?.subdistrict} {cust?.district} {cust?.province}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                      {cust?.phone && (
                        <a
                          href={`tel:${cust.phone}`}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-colors font-medium text-xs"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{cust.phone}</span>
                        </a>
                      )}

                      <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs transition-colors shadow-xs"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>เปิด Google Maps</span>
                      </a>
                    </div>
                  </div>

                  {/* Fast Action Buttons */}
                  <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {job.status === 'scheduled' && (
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateJobStatus(job.id, 'en_route');
                            onOpenLineModal(job);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition-colors"
                        >
                          <span>🚗 ออกเดินทาง & แจ้งเตือน LINE</span>
                        </button>
                      )}

                      {job.status === 'en_route' && (
                        <button
                          type="button"
                          onClick={() => onUpdateJobStatus(job.id, 'in_progress')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-semibold transition-colors"
                        >
                          <span>⚡ ถึงหน้างานแล้ว / เริ่มทำ</span>
                        </button>
                      )}

                      {job.status === 'in_progress' && (
                        <button
                          type="button"
                          onClick={() => onSelectJob(job)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>กรอกผลตรวจ & ให้ลูกค้าเซ็น</span>
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectJob(job)}
                      className="inline-flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700 font-semibold"
                    >
                      <span>ดูรายละเอียดงาน</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
