import React, { useState } from 'react';
import { Job, Customer, Technician, ACUnit } from '../types';
import { formatThaiDate } from '../utils/formatters';
import { ChevronLeft, ChevronRight, Plus, Clock, User, Filter } from 'lucide-react';

interface CalendarViewProps {
  jobs: Job[];
  customers: Customer[];
  technicians: Technician[];
  acUnits: ACUnit[];
  onSelectJob: (job: Job) => void;
  onOpenNewJob: (defaultDate?: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  jobs,
  customers,
  technicians,
  acUnits,
  onSelectJob,
  onOpenNewJob,
}) => {
  const [techFilter, setTechFilter] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<string>('2026-10-16');

  // Days in October 2026 (Starts on Thursday Oct 1, 31 days)
  // Let's generate days for 2026-10:
  const daysInMonth = Array.from({ length: 31 }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `2026-10-${dayNum.toString().padStart(2, '0')}`;
    return {
      dayNum,
      dateStr,
      dayOfWeek: (dayNum + 3) % 7, // 0 = Sun, 1 = Mon ... (Oct 1 is Thursday = 4)
    };
  });

  // Filter jobs
  const filteredJobs = jobs.filter((j) => {
    if (techFilter !== 'all' && j.technicianId !== techFilter) return false;
    return true;
  });

  const selectedDayJobs = filteredJobs.filter((j) => j.scheduledDate === selectedDay);

  const thaiDayNames = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

  return (
    <div className="space-y-6">
      {/* Calendar Header with Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 px-2">
                ตุลาคม 2569 (October 2026)
              </h2>
              <button
                type="button"
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
              {filteredJobs.length} นัดหมายในเดือนนี้
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Technician filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={techFilter}
                onChange={(e) => setTechFilter(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="all">ช่างทุกคน (All Technicians)</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nickname} ({t.name})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => onOpenNewJob(selectedDay)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ จองคิวนัดหมาย</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Month Calendar + Selected Day Slot Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Month Calendar Matrix */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center py-2.5 text-xs font-bold text-slate-600">
            {thaiDayNames.map((name, i) => (
              <div key={i} className={i === 0 ? 'text-rose-500' : ''}>
                {name}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 min-h-[420px]">
            {/* Padding for month start (Oct 1 is Thursday = 4 empty cells) */}
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-slate-50/40 p-2 min-h-[85px]"></div>
            ))}

            {daysInMonth.map(({ dayNum, dateStr }) => {
              const dayJobs = filteredJobs.filter((j) => j.scheduledDate === dateStr);
              const isSelected = selectedDay === dateStr;
              const isToday = dateStr === '2026-10-16';

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDay(dateStr)}
                  className={`p-1.5 sm:p-2 min-h-[85px] transition-all cursor-pointer flex flex-col justify-between hover:bg-sky-50/50 ${
                    isSelected ? 'bg-sky-50 ring-2 ring-inset ring-sky-500' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-sky-600 text-white'
                          : isSelected
                          ? 'text-sky-700'
                          : 'text-slate-700'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayJobs.length > 0 && (
                      <span className="text-[10px] font-mono px-1 rounded-full bg-slate-100 text-slate-600 font-bold">
                        {dayJobs.length}
                      </span>
                    )}
                  </div>

                  {/* Tiny Job pills */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayJobs.slice(0, 2).map((j) => {
                      const tech = technicians.find((t) => t.id === j.technicianId);
                      return (
                        <div
                          key={j.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectJob(j);
                          }}
                          className="truncate text-[10px] px-1.5 py-0.5 rounded text-white font-medium shadow-2xs hover:opacity-90"
                          style={{ backgroundColor: tech?.color || '#0284c7' }}
                          title={`${j.timeSlot} ${j.title} (${tech?.nickname})`}
                        >
                          {j.timeSlot.split('-')[0].trim()} {tech?.nickname}
                        </div>
                      );
                    })}
                    {dayJobs.length > 2 && (
                      <div className="text-[9px] text-slate-400 font-medium pl-1">
                        +{dayJobs.length - 2} งานเพิ่มเติม
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-semibold text-slate-500 block">ตารางนัดหมายประจำวัน</span>
                <h3 className="text-base font-bold text-slate-900">{formatThaiDate(selectedDay)}</h3>
              </div>
              <button
                type="button"
                onClick={() => onOpenNewJob(selectedDay)}
                className="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-medium"
                title="เพิ่มนัดหมายวันนี้"
              >
                + เพิ่มคิว
              </button>
            </div>

            {/* List of jobs for selected day */}
            <div className="mt-4 space-y-3">
              {selectedDayJobs.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Clock className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs">ไม่มีคิวนัดหมายในวันนี้</p>
                  <button
                    type="button"
                    onClick={() => onOpenNewJob(selectedDay)}
                    className="mt-2 text-xs text-sky-600 font-semibold underline"
                  >
                    จองคิวแรกของวันนี้
                  </button>
                </div>
              ) : (
                selectedDayJobs.map((job) => {
                  const cust = customers.find((c) => c.id === job.customerId);
                  const tech = technicians.find((t) => t.id === job.technicianId);
                  const ac = acUnits.find((u) => u.id === job.acUnitId);

                  return (
                    <div
                      key={job.id}
                      onClick={() => onSelectJob(job)}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/40 cursor-pointer transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-sky-700 font-mono flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {job.timeSlot}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                          style={{ backgroundColor: tech?.color || '#0284c7' }}
                        >
                          {tech?.nickname}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {job.title}
                      </h4>

                      <div className="text-[11px] text-slate-600 space-y-0.5">
                        <p className="flex items-center gap-1.5">
                          <User className="w-3 h-3 text-slate-400" />
                          <strong className="text-slate-800">{cust?.name}</strong> ({cust?.phone})
                        </p>
                        <p className="text-slate-500 truncate pl-4.5">
                          {ac?.brand} • {cust?.district}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Technician legend */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 text-xs space-y-2 shadow-xs">
            <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
              แถบสีช่างประจำงาน (Technician Color Key)
            </span>
            <div className="grid grid-cols-2 gap-2">
              {technicians.map((t) => (
                <div key={t.id} className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: t.color }}
                  ></span>
                  <span className="text-slate-700 truncate">{t.nickname}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
