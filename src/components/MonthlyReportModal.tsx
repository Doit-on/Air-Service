import React, { useState } from 'react';
import { Job, Technician, Customer } from '../types';
import { formatCurrency } from '../utils/formatters';
import { NuanamLogo } from './NuanamLogo';
import { X, Printer, TrendingUp, DollarSign, CheckCircle2, Award, Users, BarChart3 } from 'lucide-react';

interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: Job[];
  technicians: Technician[];
  customers: Customer[];
}

export const MonthlyReportModal: React.FC<MonthlyReportModalProps> = ({
  isOpen,
  onClose,
  jobs,
  technicians,
}) => {
  const [selectedMonth, setSelectedMonth] = useState('2026-10');

  if (!isOpen) return null;

  // Filter jobs by selected month (e.g. 2026-10)
  const monthJobs = jobs.filter((j) => j.scheduledDate.startsWith(selectedMonth));
  const completedJobs = monthJobs.filter((j) => j.status === 'completed');

  const totalRevenue = monthJobs.reduce((sum, j) => sum + j.price, 0);
  const totalCost = monthJobs.reduce((sum, j) => {
    const jobCost = j.expenses.reduce((cSum, exp) => cSum + exp.cost * exp.quantity, 0);
    return sum + jobCost;
  }, 0);
  const grossProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0';

  // Technician stats
  const techStats = technicians.map((tech) => {
    const techJobs = monthJobs.filter((j) => j.technicianId === tech.id);
    const techCompleted = techJobs.filter((j) => j.status === 'completed');
    const revenue = techJobs.reduce((sum, j) => sum + j.price, 0);
    const avgRating = tech.rating;
    return {
      tech,
      totalJobs: techJobs.length,
      completedCount: techCompleted.length,
      revenue,
      avgRating,
    };
  });

  const handlePrint = () => {
    window.print();
  };

  const monthNamesThai: Record<string, string> = {
    '2026-08': 'สิงหาคม 2569',
    '2026-09': 'กันยายน 2569',
    '2026-10': 'ตุลาคม 2569',
    '2026-11': 'พฤศจิกายน 2569',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="no-print px-6 py-3.5 bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-400" />
            <span className="font-semibold text-sm">
              รายงานสรุปผลการดำเนินงานประจำเดือน (Monthly Executive PDF Report) • เหนือน้ำแอร์ ปทุมธานี
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Month select */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="2026-10">เดือนตุลาคม 2569 (ปัจจุบัน)</option>
              <option value="2026-09">เดือนกันยายน 2569</option>
              <option value="2026-08">เดือนสิงหาคม 2569</option>
            </select>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-medium transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์ / บันทึกรายงานเป็น PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document A4 Body */}
        <div className="p-6 sm:p-10 bg-white text-slate-800 printable-document max-h-[82vh] overflow-y-auto font-sans">
          {/* Header */}
          <div className="flex justify-between items-start pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-3">
                <NuanamLogo size={56} variant="badge" />
                <div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    บริษัท เหนือน้ำแอร์ ปทุมธานี จำกัด
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    NUANAMAIR PATHUM THANI CO., LTD. • รายงานผลประกอบการและสมรรถนะการบริการเครื่องปรับอากาศประจำเดือน
                  </p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-100 text-slate-800 rounded-md font-bold text-sm border border-slate-300">
                รอบประจำเดือน: {monthNamesThai[selectedMonth] || selectedMonth}
              </span>
              <p className="text-[11px] text-slate-500 mt-1">วันที่พิมพ์เอกสาร: 16 ต.ค. 2569</p>
            </div>
          </div>

          {/* 4 Key Executive KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
            <div className="p-4 rounded-xl bg-sky-50 border border-sky-100">
              <div className="flex items-center justify-between text-sky-700 mb-1">
                <span className="text-xs font-semibold">รายได้รวม (Revenue)</span>
                <DollarSign className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold font-mono text-sky-950">
                {formatCurrency(totalRevenue)}
              </p>
              <span className="text-[10px] text-sky-600">+14% เทียบเดือนก่อน</span>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="flex items-center justify-between text-emerald-700 mb-1">
                <span className="text-xs font-semibold">กำไรขั้นต้น (Gross Profit)</span>
                <TrendingUp className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold font-mono text-emerald-950">
                {formatCurrency(grossProfit)}
              </p>
              <span className="text-[10px] text-emerald-600">Margin {profitMargin}%</span>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
              <div className="flex items-center justify-between text-indigo-700 mb-1">
                <span className="text-xs font-semibold">จำนวนงานทั้งหมด</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold font-mono text-indigo-950">
                {monthJobs.length} งาน
              </p>
              <span className="text-[10px] text-indigo-600">สำเร็จ {completedJobs.length} งาน</span>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
              <div className="flex items-center justify-between text-amber-700 mb-1">
                <span className="text-xs font-semibold">คะแนนความพึงพอใจ</span>
                <Award className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold font-mono text-amber-950">
                4.92 / 5.0
              </p>
              <span className="text-[10px] text-amber-600">จากรีวิวลูกค้า 98%</span>
            </div>
          </div>

          {/* Technician Leaderboard & Performance Table */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-slate-700" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                สรุปประสิทธิภาพการปฏิบัติงานของช่างเทคนิค (Technician Performance)
              </h3>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">ช่างเทคนิค</th>
                    <th className="py-2.5 px-3">ยานพาหนะประจำ</th>
                    <th className="py-2.5 px-3 text-center">งานที่ได้รับมอบ</th>
                    <th className="py-2.5 px-3 text-center">สำเร็จแล้ว</th>
                    <th className="py-2.5 px-3 text-center">คะแนนรีวิว</th>
                    <th className="py-2.5 px-3 text-right">ยอดสร้างรายได้</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {techStats.map(({ tech, totalJobs, completedCount, revenue, avgRating }) => (
                    <tr key={tech.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={tech.avatar}
                            alt={tech.name}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <p className="font-semibold text-slate-900">{tech.nickname}</p>
                            <span className="text-[10px] text-slate-500">{tech.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{tech.vehicle}</td>
                      <td className="py-3 px-3 text-center font-mono font-medium">{totalJobs}</td>
                      <td className="py-3 px-3 text-center font-mono font-medium text-emerald-700">
                        {completedCount}
                      </td>
                      <td className="py-3 px-3 text-center font-mono">
                        <span className="inline-block px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[10px]">
                          ⭐ {avgRating}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold font-mono text-slate-900">
                        {formatCurrency(revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Service Breakdown & Expense Analysis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-slate-800 mb-3 uppercase tracking-wider text-[11px]">
                สัดส่วนงานบริการแยกตามประเภท (Service Share)
              </h4>
              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between text-slate-700 mb-1">
                    <span>ล้างแอร์ติดผนัง & พรีเมียม</span>
                    <span className="font-mono font-bold">52% (฿7,200)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-sky-500 h-full rounded-full" style={{ width: '52%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-700 mb-1">
                    <span>ล้างแอร์ฝังฝ้า 4 ทิศทาง (Cassette)</span>
                    <span className="font-mono font-bold">25% (฿3,600)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-700 mb-1">
                    <span>ซ่อมแอร์ไม่เย็น / เติมน้ำยา / บอร์ด</span>
                    <span className="font-mono font-bold">18% (฿2,450)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: '18%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-700 mb-1">
                    <span>ซ่อมท่อน้ำทิ้งตัน / น้ำรั่ว</span>
                    <span className="font-mono font-bold">5% (฿800)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '5%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-slate-800 mb-3 uppercase tracking-wider text-[11px]">
                สรุปต้นทุนดำเนินงาน (Operation & Cost Breakdown)
              </h4>
              <div className="space-y-2 text-slate-600">
                <div className="flex justify-between pb-1.5 border-b border-slate-200">
                  <span>ต้นทุนอะไหล่ & คาปาซิเตอร์ & น้ำยา:</span>
                  <span className="font-mono font-medium text-slate-800">฿1,890</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-slate-200">
                  <span>ค่าน้ำมันเชื้อเพลิง & ค่าทางด่วนช่าง:</span>
                  <span className="font-mono font-medium text-slate-800">฿870</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-slate-200">
                  <span>ค่าแรงและคอมมิชชั่นช่างเทคนิค:</span>
                  <span className="font-mono font-medium text-slate-800">฿3,150</span>
                </div>
                <div className="flex justify-between pt-1 text-slate-900 font-bold">
                  <span>รวมต้นทุนทั้งสิ้น (Total Cost):</span>
                  <span className="font-mono text-rose-700">{formatCurrency(totalCost || 5910)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Signoff */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-center text-xs">
            <div className="space-y-12">
              <p className="font-medium text-slate-700">ผู้จัดทำรายงาน / ผู้จัดการฝ่ายปฏิบัติการ</p>
              <div className="border-b border-dashed border-slate-400 w-44 mx-auto pb-1 text-slate-500">
                (นายธนาธิป สุวรรณโชติ)
              </div>
              <p className="text-[11px] text-slate-400">ผู้จัดการงานเทคนิคและบริการ</p>
            </div>

            <div className="space-y-12">
              <p className="font-medium text-slate-700">ผู้บริหาร / เจ้าของกิจการอนุมัติ</p>
              <div className="border-b border-dashed border-slate-400 w-44 mx-auto pb-1 text-slate-500">
                (ผู้บริหาร บจก. เหนือน้ำแอร์ ปทุมธานี)
              </div>
              <p className="text-[11px] text-slate-400">กรรมการผู้จัดการ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
