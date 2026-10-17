import React from 'react';
import { Job, Customer, Technician, ACUnit } from '../types';
import { formatCurrency, formatThaiDate, getDaysUntil } from '../utils/formatters';
import { TechnicianPerformanceCharts } from './TechnicianPerformanceCharts';
import { NuanamLogo } from './NuanamLogo';
import {
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Bell,
  Calendar,
  Users,
  Award,
  ArrowUpRight,
  ShieldAlert,
  ArrowRight,
  Plus,
  FileSpreadsheet,
  Edit3,
  Trash2,
  Database,
} from 'lucide-react';

interface DashboardProps {
  jobs: Job[];
  customers: Customer[];
  technicians: Technician[];
  acUnits: ACUnit[];
  onSelectJob: (job: Job) => void;
  onEditJob: (job: Job) => void;
  onDeleteJob: (job: Job) => void;
  onOpenNewJob: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenMonthlyReport: () => void;
  onOpenLineModal: (job: Job) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  jobs,
  customers,
  technicians,
  acUnits,
  onSelectJob,
  onEditJob,
  onDeleteJob,
  onOpenNewJob,
  onNavigateTab,
  onOpenMonthlyReport,
  onOpenLineModal,
}) => {
  // Today's jobs (Oct 16, 2026)
  const todayDateStr = '2026-10-16';
  const todayJobs = jobs.filter((j) => j.scheduledDate === todayDateStr);
  const completedTodayJobs = todayJobs.filter((j) => j.status === 'completed');

  // Month calculations
  const totalRevenue = jobs.reduce((sum, j) => sum + j.price, 0);
  const totalCost = jobs.reduce((sum, j) => {
    const jobCost = j.expenses.reduce((cSum, exp) => cSum + exp.cost * exp.quantity, 0);
    return sum + jobCost;
  }, 0);
  const grossProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0';

  // Maintenance Due ACs (due in 14 days or overdue)
  const dueACUnits = acUnits.filter((u) => getDaysUntil(u.nextDueDate) <= 14);

  // Active in progress or en-route jobs
  const liveJobs = jobs.filter((j) => j.status === 'in_progress' || j.status === 'en_route');

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Action Header */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Decorative blur circles */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 right-32 w-56 h-56 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5 max-w-2xl">
            <div className="shrink-0 rounded-full p-1 bg-white/10 ring-2 ring-sky-400/40 shadow-lg">
              <NuanamLogo size={72} variant="badge" />
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold border border-sky-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>ระบบทำงานแบบเรียลไทม์ 100% (All Systems Active)</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>ศูนย์ควบคุมและบริหารจัดการ เหนือน้ำแอร์ ปทุมธานี</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                บริษัท เหนือน้ำแอร์ ปทุมธานี จำกัด (NUANAMAIR PATHUM THANI CO., LTD.) ติดตามงานช่างเทคนิค ออกใบเสนอราคา/รายงานจบงานดิจิทัล พร้อมระบบแจ้งเตือนลูกค้าผ่าน LINE อัตโนมัติ
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => onNavigateTab('data_management')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-semibold border border-rose-400/30 transition-all backdrop-blur-xs"
            >
              <Database className="w-4 h-4 text-rose-300" />
              <span>แก้ไข/ลบข้อมูลตัวอย่าง (รหัส: 0000)</span>
            </button>

            <button
              type="button"
              onClick={onOpenMonthlyReport}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 transition-all backdrop-blur-xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>สรุปผลรายเดือน PDF</span>
            </button>

            <button
              type="button"
              onClick={onOpenNewJob}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-lg shadow-sky-500/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ เปิดใบสั่งงานใหม่</span>
            </button>
          </div>
        </div>

        {/* Live Active Field Status Ticker */}
        {liveJobs.length > 0 && (
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <span className="text-amber-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              กำลังปฏิบัติงานหน้างานสด ({liveJobs.length} จุด):
            </span>
            {liveJobs.map((lj) => {
              const tech = technicians.find((t) => t.id === lj.technicianId);
              return (
                <div
                  key={lj.id}
                  onClick={() => onSelectJob(lj)}
                  className="cursor-pointer px-3 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white flex items-center gap-2 transition-colors"
                >
                  <span className="font-bold text-sky-400">{tech?.nickname}:</span>
                  <span className="truncate max-w-[200px]">{lj.title}</span>
                  <span className="text-[10px] text-amber-300 font-mono">
                    [{lj.status === 'en_route' ? 'กำลังเดินทาง' : 'กำลังทำ'}]
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div
          onClick={() => onNavigateTab('jobs')}
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-sky-300 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">งานนัดหมายวันนี้</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900">{todayJobs.length} งาน</p>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>เสร็จสิ้นแล้ว {completedTodayJobs.length} งาน</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div
          onClick={onOpenMonthlyReport}
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">รายได้รวมเดือนนี้</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900">
            {formatCurrency(totalRevenue)}
          </p>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.5% จากเดือนที่แล้ว</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div
          onClick={onOpenMonthlyReport}
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">กำไรสุทธิ (Gross Profit)</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900">
            {formatCurrency(grossProfit)}
          </p>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-indigo-600 font-medium">
            <span>อัตรากำไร (Margin) {profitMargin}%</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div
          onClick={() => onNavigateTab('ac_database')}
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-amber-300 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">เตือนรอบล้างแอร์ (6 ด.)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-amber-900">{dueACUnits.length} เครื่อง</p>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-amber-700 font-medium">
            <span>ส่งแจ้งเตือน LINE ลูกค้าทันที</span>
          </div>
        </div>
      </div>

      {/* Urgent Maintenance Alert Banner */}
      {dueACUnits.length > 0 && (
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-amber-900">
                ระบบอัตโนมัติพบเครื่องปรับอากาศ {dueACUnits.length} เครื่อง ที่ครบกำหนดล้างทำความสะอาดประจำรอบ
              </p>
              <p className="text-amber-700 text-[11px]">
                การล้างแอร์ตามรอบ 6 เดือนช่วยลูกค้าประหยัดไฟ และสร้างรายได้ต่อเนื่องให้แก่บริษัท
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('ac_database')}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors self-start sm:self-auto shrink-0 shadow-xs"
          >
            <span>เปิดดูฐานข้อมูลแอร์ & ส่งเตือน LINE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Recharts Data Visualization: Technician Performance & Monthly Jobs */}
      <TechnicianPerformanceCharts jobs={jobs} technicians={technicians} />

      {/* Two Column Layout: Today's Schedule Timeline + Technician Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Today's Jobs Timeline (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">คิวงานและสถานะประจำวันนี้</h3>
              <p className="text-xs text-slate-500">
                {formatThaiDate(todayDateStr)} • รวมทั้งหมด {todayJobs.length} งาน
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('route_planning')}
              className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1"
            >
              <span>ดูเส้นทางนำทาง GPS</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {todayJobs.map((job) => {
              const cust = customers.find((c) => c.id === job.customerId);
              const tech = technicians.find((t) => t.id === job.technicianId);
              const ac = acUnits.find((u) => u.id === job.acUnitId);

              return (
                <div
                  key={job.id}
                  onClick={() => onSelectJob(job)}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/30 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-500 text-xs">
                        {job.jobCode}
                      </span>
                      <span className="text-xs font-semibold text-slate-900 group-hover:text-sky-700">
                        {job.title}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                      <span className="text-slate-700 font-medium">{cust?.name}</span>
                      <span>•</span>
                      <span>{ac?.brand} ({ac?.installedLocation})</span>
                      <span>•</span>
                      <span className="font-mono text-slate-600">{job.timeSlot}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <div className="text-right">
                      <span
                        className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full inline-block"
                        style={{ backgroundColor: tech?.color || '#0284c7' }}
                      >
                        {tech?.nickname}
                      </span>
                      <p className="text-xs font-mono font-bold text-slate-900 mt-0.5">
                        {formatCurrency(job.price)}
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        job.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : job.status === 'in_progress'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : job.status === 'en_route'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {job.status === 'completed'
                        ? '✓ เสร็จสิ้น'
                        : job.status === 'in_progress'
                        ? '⚡ กำลังทำ'
                        : job.status === 'en_route'
                        ? '🚗 เดินทาง'
                        : '⏳ นัดหมาย'}
                    </span>
                    <div
                      className="flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => onEditJob(job)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                        title="แก้ไขงาน (รหัส 0000)"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteJob(job)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="ลบงาน (รหัส 0000)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Technician Leaderboard (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-700" />
              <h3 className="font-bold text-sm text-slate-900">ทีมช่างเทคนิค (Field Team)</h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">{technicians.length} คน</span>
          </div>

          <div className="space-y-3">
            {technicians.map((t) => {
              const techJobs = jobs.filter((j) => j.technicianId === t.id);
              const completedCount = techJobs.filter((j) => j.status === 'completed').length;

              return (
                <div
                  key={t.id}
                  className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <strong className="text-slate-900 text-sm">{t.nickname}</strong>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 font-bold border border-amber-200">
                          ⭐ {t.rating}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate max-w-[160px]">{t.vehicle}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-slate-800 text-xs block">
                      {completedCount} / {techJobs.length} งาน
                    </span>
                    <span className="text-[10px] text-slate-500">โทร {t.phone}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Quality Guarantee Note */}
          <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 text-xs text-sky-800 flex items-start gap-2.5">
            <Award className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">มาตรฐานงานช่าง เหนือน้ำแอร์ ปทุมธานี</p>
              <p className="text-[11px] text-sky-700">
                รับประกันงานซ่อม 90 วัน งานล้าง 30 วัน ลูกค้าเซ็นรับมอบงานผ่านมือถือ 100%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
