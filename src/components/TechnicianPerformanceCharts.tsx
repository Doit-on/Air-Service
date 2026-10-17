import React, { useState } from 'react';
import { Job, Technician } from '../types';
import { formatCurrency } from '../utils/formatters';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import {
  Award,
  TrendingUp,
  Users,
  CheckCircle2,
  Calendar,
  BarChart3,
  Star,
  Zap,
} from 'lucide-react';

interface TechnicianPerformanceChartsProps {
  jobs: Job[];
  technicians: Technician[];
}

// Monthly historical performance dataset for เหนือน้ำแอร์ ปทุมธานี (May 2026 - Oct 2026)
const MONTHLY_PERFORMANCE_DATA = [
  {
    month: 'พ.ค. 69',
    monthKey: '2026-05',
    'ช่างเอิร์ธ': 38,
    'ช่างตั้ม': 34,
    'ช่างบอย': 26,
    'ช่างกานต์': 42,
    totalJobs: 140,
    totalRevenue: 168000,
  },
  {
    month: 'มิ.ย. 69',
    monthKey: '2026-06',
    'ช่างเอิร์ธ': 44,
    'ช่างตั้ม': 39,
    'ช่างบอย': 30,
    'ช่างกานต์': 48,
    totalJobs: 161,
    totalRevenue: 193200,
  },
  {
    month: 'ก.ค. 69',
    monthKey: '2026-07',
    'ช่างเอิร์ธ': 52,
    'ช่างตั้ม': 45,
    'ช่างบอย': 33,
    'ช่างกานต์': 56,
    totalJobs: 186,
    totalRevenue: 228500,
  },
  {
    month: 'ส.ค. 69',
    monthKey: '2026-08',
    'ช่างเอิร์ธ': 58,
    'ช่างตั้ม': 51,
    'ช่างบอย': 37,
    'ช่างกานต์': 62,
    totalJobs: 208,
    totalRevenue: 254800,
  },
  {
    month: 'ก.ย. 69',
    monthKey: '2026-09',
    'ช่างเอิร์ธ': 64,
    'ช่างตั้ม': 56,
    'ช่างบอย': 41,
    'ช่างกานต์': 68,
    totalJobs: 229,
    totalRevenue: 281600,
  },
  {
    month: 'ต.ค. 69',
    monthKey: '2026-10',
    'ช่างเอิร์ธ': 72,
    'ช่างตั้ม': 63,
    'ช่างบอย': 46,
    'ช่างกานต์': 76,
    totalJobs: 257,
    totalRevenue: 318400,
  },
];

// Detail metrics per technician
const TECH_METRICS_DETAIL = [
  {
    name: 'ช่างกานต์',
    fullName: 'นายกานต์ วงศ์สุริยา',
    nickname: 'ช่างกานต์',
    completedThisMonth: 76,
    avgCompletionMins: 85,
    onTimeRate: 98.6,
    satisfaction: 4.85,
    revenueThisMonth: 98500,
    color: '#7c3aed', // Purple
    specialty: 'งานติดตั้งแอร์ใหม่ & ระบบ VRV',
  },
  {
    name: 'ช่างเอิร์ธ',
    fullName: 'นายธนาธิป สุวรรณโชติ',
    nickname: 'ช่างเอิร์ธ',
    completedThisMonth: 72,
    avgCompletionMins: 75,
    onTimeRate: 99.2,
    satisfaction: 4.92,
    revenueThisMonth: 94200,
    color: '#0284c7', // Sky blue
    specialty: 'หัวหน้าช่าง & ล้างแอร์พรีเมียม',
  },
  {
    name: 'ช่างตั้ม',
    fullName: 'นายสุรชัย มั่นคง',
    nickname: 'ช่างตั้ม',
    completedThisMonth: 63,
    avgCompletionMins: 80,
    onTimeRate: 97.4,
    satisfaction: 4.88,
    revenueThisMonth: 76400,
    color: '#059669', // Emerald
    specialty: 'งานซ่อมบอร์ด & คอมเพรสเซอร์',
  },
  {
    name: 'ช่างบอย',
    fullName: 'นายอภิสิทธิ์ ใจดี',
    nickname: 'ช่างบอย',
    completedThisMonth: 46,
    avgCompletionMins: 60,
    onTimeRate: 99.5,
    satisfaction: 4.95,
    revenueThisMonth: 49300,
    color: '#d97706', // Amber
    specialty: 'บริการล้างด่วน & ลาดตระเวนมอเตอร์ไซค์',
  },
];

export const TechnicianPerformanceCharts: React.FC<TechnicianPerformanceChartsProps> = ({
  jobs,
  technicians,
}) => {
  const [metricMode, setMetricMode] = useState<'jobs' | 'revenue' | 'trend'>('jobs');
  const [selectedTech, setSelectedTech] = useState<string>('all');

  // Colors mapping for technicians
  const techColors: Record<string, string> = {
    'ช่างเอิร์ธ': '#0284c7',
    'ช่างตั้ม': '#059669',
    'ช่างบอย': '#d97706',
    'ช่างกานต์': '#7c3aed',
  };

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-[200px]">
          <p className="font-bold text-sky-300 pb-1 border-b border-slate-700/80">
            รอบเดือน: {label}
          </p>
          {payload.map((entry: any, index: number) => {
            const isRevenue = entry.dataKey === 'totalRevenue';
            const valueFormatted = isRevenue
              ? formatCurrency(entry.value)
              : `${entry.value} งาน`;
            return (
              <div key={`item-${index}`} className="flex justify-between items-center gap-3">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: entry.color }}
                  ></span>
                  <span>{entry.name}:</span>
                </span>
                <span className="font-mono font-bold text-white">{valueFormatted}</span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  // Calculate high-level metrics
  const totalCompletedOct = MONTHLY_PERFORMANCE_DATA[MONTHLY_PERFORMANCE_DATA.length - 1].totalJobs;
  const totalRevenueOct = MONTHLY_PERFORMANCE_DATA[MONTHLY_PERFORMANCE_DATA.length - 1].totalRevenue;
  const topPerformer = TECH_METRICS_DETAIL[0]; // ช่างกานต์ (76 jobs)

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 tracking-tight flex items-center gap-2">
                <span>สถิติและประสิทธิภาพการทำงานของช่างเทคนิค</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                  Recharts Analytics
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                สถิติจำนวนงานที่สำเร็จต่อเดือน (Jobs Completed per Month) และรายได้แยกตามช่าง เหนือน้ำแอร์ ปทุมธานี
              </p>
            </div>
          </div>
        </div>

        {/* Chart View Mode Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setMetricMode('jobs')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                metricMode === 'jobs'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              จำนวนงานต่อเดือน (Jobs)
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('trend')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                metricMode === 'trend'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              แนวโน้มรวม (Total Trend)
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('revenue')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                metricMode === 'revenue'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายได้ต่อเดือน (Revenue)
            </button>
          </div>

          {/* Filter by technician */}
          {metricMode === 'jobs' && (
            <select
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">ช่างทุกคน (เปรียบเทียบ)</option>
              <option value="ช่างเอิร์ธ">ช่างเอิร์ธ</option>
              <option value="ช่างตั้ม">ช่างตั้ม</option>
              <option value="ช่างบอย">ช่างบอย</option>
              <option value="ช่างกานต์">ช่างกานต์</option>
            </select>
          )}
        </div>
      </div>

      {/* 4 Mini KPI Performance Badges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-sky-700 block">งานสำเร็จเดือนนี้ (ต.ค. 69)</span>
            <strong className="text-lg font-bold font-mono text-sky-950">
              {totalCompletedOct} งาน
            </strong>
            <span className="text-[10px] text-sky-600 block mt-0.5">+12.2% เทียบ ก.ย.</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-purple-700 block">ช่างยอดเยี่ยมประจำเดือน</span>
            <strong className="text-base font-bold text-purple-950 block">
              {topPerformer.nickname} ({topPerformer.completedThisMonth} งาน)
            </strong>
            <span className="text-[10px] text-purple-600 block mt-0.5">⭐ {topPerformer.satisfaction} ความพึงพอใจ</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-emerald-700 block">รายได้จากงานช่างเดือนนี้</span>
            <strong className="text-lg font-bold font-mono text-emerald-950">
              {formatCurrency(totalRevenueOct)}
            </strong>
            <span className="text-[10px] text-emerald-600 block mt-0.5">เฉลี่ย ฿1,238 / งาน</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-amber-700 block">อัตราตรงต่อเวลา & ส่งมอบ</span>
            <strong className="text-lg font-bold font-mono text-amber-950">
              98.8%
            </strong>
            <span className="text-[10px] text-amber-600 block mt-0.5">จบงานได้ในครั้งแรก 97.4%</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Recharts Visualization Chart Area */}
      <div className="h-[320px] w-full pt-2">
        {metricMode === 'jobs' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={MONTHLY_PERFORMANCE_DATA}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                iconType="circle"
              />

              {/* Show selected tech or all */}
              {(selectedTech === 'all' || selectedTech === 'ช่างกานต์') && (
                <Bar
                  dataKey="ช่างกานต์"
                  fill="#7c3aed"
                  radius={[4, 4, 0, 0]}
                  name="ช่างกานต์ (ติดตั้ง/VRV)"
                />
              )}
              {(selectedTech === 'all' || selectedTech === 'ช่างเอิร์ธ') && (
                <Bar
                  dataKey="ช่างเอิร์ธ"
                  fill="#0284c7"
                  radius={[4, 4, 0, 0]}
                  name="ช่างเอิร์ธ (หัวหน้าช่าง/พรีเมียม)"
                />
              )}
              {(selectedTech === 'all' || selectedTech === 'ช่างตั้ม') && (
                <Bar
                  dataKey="ช่างตั้ม"
                  fill="#059669"
                  radius={[4, 4, 0, 0]}
                  name="ช่างตั้ม (ซ่อมบอร์ด/คอมฯ)"
                />
              )}
              {(selectedTech === 'all' || selectedTech === 'ช่างบอย') && (
                <Bar
                  dataKey="ช่างบอย"
                  fill="#d97706"
                  radius={[4, 4, 0, 0]}
                  name="ช่างบอย (ล้างด่วน/มอเตอร์ไซค์)"
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        )}

        {metricMode === 'trend' && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={MONTHLY_PERFORMANCE_DATA}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id="totalJobsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                iconType="circle"
              />
              <Area
                type="monotone"
                dataKey="totalJobs"
                name="รวมงานสำเร็จทุกช่าง (Total Completed Jobs)"
                stroke="#0284c7"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#totalJobsGradient)"
              />
              <Line
                type="monotone"
                dataKey="totalJobs"
                stroke="#0284c7"
                strokeWidth={3}
                dot={{ r: 5, fill: '#0284c7', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 7 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {metricMode === 'revenue' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={MONTHLY_PERFORMANCE_DATA}
              margin={{ top: 10, right: 10, left: -5, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `฿${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                iconType="circle"
              />
              <Area
                type="monotone"
                dataKey="totalRevenue"
                name="รายได้รวมประจำเดือน (Monthly Revenue ฿)"
                stroke="#059669"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Individual Technician Cards with Performance Progress */}
      <div className="pt-2 border-t border-slate-100">
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-slate-500" />
          <span>รายละเอียดสมรรถนะช่างเทคนิครายบุคคล (Individual Technician Breakdown)</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {TECH_METRICS_DETAIL.map((tech) => {
            const pctOfTop = Math.round((tech.completedThisMonth / topPerformer.completedThisMonth) * 100);
            return (
              <div
                key={tech.name}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:shadow-xs transition-all space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: tech.color }}
                    ></span>
                    <strong className="text-slate-900 font-bold text-sm">{tech.nickname}</strong>
                  </div>
                  <span className="flex items-center gap-0.5 text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[11px]">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>{tech.satisfaction}</span>
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 truncate">{tech.specialty}</p>

                {/* Progress bar of completed jobs */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-600">
                    <span>งานสำเร็จเดือนนี้:</span>
                    <strong className="text-slate-900 font-mono font-bold">
                      {tech.completedThisMonth} งาน
                    </strong>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pctOfTop}%`, backgroundColor: tech.color }}
                    ></div>
                  </div>
                </div>

                {/* Mini details */}
                <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                  <span>ตรงต่อเวลา {tech.onTimeRate}%</span>
                  <span className="font-mono font-bold text-slate-700">
                    {formatCurrency(tech.revenueThisMonth)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
