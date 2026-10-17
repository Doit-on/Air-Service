import React from 'react';
import { Job, Customer, ACUnit, Technician } from '../types';
import { formatCurrency, formatThaiDate, getDaysUntil } from '../utils/formatters';
import { NuanamLogo } from './NuanamLogo';
import {
  Shield,
  Clock,
  Phone,
  Calendar,
  CheckCircle2,
  Bell,
  Wrench,
  Download,
  AlertTriangle,
} from 'lucide-react';

interface CustomerPortalViewProps {
  customer?: Customer;
  jobs: Job[];
  acUnits: ACUnit[];
  technicians: Technician[];
  onOpenReportModal: (job: Job) => void;
  onRequestBooking: () => void;
}

export const CustomerPortalView: React.FC<CustomerPortalViewProps> = ({
  customer,
  jobs,
  acUnits,
  technicians,
  onOpenReportModal,
  onRequestBooking,
}) => {
  const cust = customer || {
    id: 'cust-1',
    name: 'ลูกค้า เหนือน้ำแอร์ ปทุมธานี',
    phone: '081-999-9999',
    district: 'เมืองปทุมธานี',
    subdistrict: 'บางปรอก',
    province: 'ปทุมธานี',
    address: 'ต.บางปรอก อ.เมืองปทุมธานี จ.ปทุมธานี',
    latitude: 14.0205,
    longitude: 100.525,
    acUnitIds: ['ac-1'],
  };

  // Customer's jobs and units
  const myJobs = jobs.filter((j) => j.customerId === cust.id);
  const myUnits = acUnits.filter((u) => u.customerId === cust.id);

  // Active job
  const activeJob = myJobs.find(
    (j) => j.status === 'in_progress' || j.status === 'en_route' || j.status === 'scheduled'
  );
  const activeTech = activeJob ? technicians.find((t) => t.id === activeJob.technicianId) : null;
  const activeUnit = activeJob ? acUnits.find((u) => u.id === activeJob.acUnitId) : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Customer Welcome Header */}
      <div className="bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-800 rounded-3xl p-6 text-white shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-2xl bg-white p-1 shadow-md shrink-0">
              <NuanamLogo size={44} variant="badge" />
            </div>
            <div>
              <span className="text-xs text-sky-200">ยินดีต้อนรับสู่บริการ เหนือน้ำแอร์ ปทุมธานี</span>
              <h2 className="text-lg font-bold text-white">{cust.name}</h2>
              <p className="text-xs text-sky-100">{cust.address}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onRequestBooking}
            className="px-4 py-2 rounded-xl bg-white text-sky-700 font-bold text-xs shadow-md hover:bg-sky-50 transition-colors"
          >
            + จองคิวล้างแอร์
          </button>
        </div>
      </div>

      {/* Real-time Tracking Card for Active Job */}
      {activeJob && (
        <div className="bg-white rounded-3xl border border-sky-200 p-6 shadow-md space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                สถานะงานบริการแบบเรียลไทม์ (Live Service Tracking)
              </h3>
            </div>
            <span className="text-xs font-mono font-bold bg-sky-50 text-sky-700 px-2.5 py-1 rounded-lg border border-sky-100">
              {activeJob.jobCode}
            </span>
          </div>

          {/* Stepper */}
          <div className="py-2">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 -z-0"></div>
              {[
                { key: 'scheduled', label: 'ยืนยันคิว' },
                { key: 'en_route', label: 'ช่างกำลังเดินทาง' },
                { key: 'in_progress', label: 'กำลังล้าง/ซ่อม' },
                { key: 'completed', label: 'ส่งมอบงาน' },
              ].map((step, idx) => {
                const isCurrent = activeJob.status === step.key;
                const isPassed =
                  activeJob.status === 'completed' ||
                  (activeJob.status === 'in_progress' && idx <= 2) ||
                  (activeJob.status === 'en_route' && idx <= 1) ||
                  (activeJob.status === 'scheduled' && idx === 0);

                return (
                  <div key={step.key} className="flex flex-col items-center z-10">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-sky-600 text-white ring-4 ring-sky-100 scale-110'
                          : isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white border-2 border-slate-300 text-slate-400'
                      }`}
                    >
                      {isPassed && !isCurrent ? '✓' : idx + 1}
                    </div>
                    <span
                      className={`text-[11px] font-medium mt-1.5 ${
                        isCurrent ? 'text-sky-700 font-bold' : 'text-slate-500'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Technician Details */}
          {activeTech && (
            <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={activeTech.avatar}
                  alt={activeTech.name}
                  className="w-11 h-11 rounded-2xl object-cover border border-sky-200"
                />
                <div>
                  <span className="font-bold text-slate-900 text-sm">{activeTech.nickname}</span>
                  <span className="text-[11px] text-slate-500 block">{activeTech.vehicle}</span>
                  <span className="text-[10px] text-amber-700 font-bold">⭐ {activeTech.rating} (ผู้เชี่ยวชาญ)</span>
                </div>
              </div>

              <a
                href={`tel:${activeTech.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>โทรติดต่อช่าง</span>
              </a>
            </div>
          )}
        </div>
      )}

      {/* Customer's AC Units & Automated Maintenance due */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-sky-600" />
            <span>เครื่องปรับอากาศที่ลงทะเบียนไว้ ({myUnits.length} เครื่อง)</span>
          </h3>
          <span className="text-xs text-slate-500">บันทึกประวัติด้วยระบบ QR Tag</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {myUnits.map((u) => {
            const daysUntil = getDaysUntil(u.nextDueDate);
            const isDue = daysUntil <= 14;

            return (
              <div
                key={u.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-sky-700 font-bold">
                      {u.qrCodeId}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{u.brand}</h4>
                    <p className="text-xs text-slate-500">
                      {u.btu?.toLocaleString()} BTU • {u.installedLocation}
                    </p>
                  </div>
                </div>

                {/* Due status badge */}
                {isDue ? (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
                    <span className="font-semibold flex items-center gap-1">
                      <Bell className="w-3.5 h-3.5 text-amber-600" />
                      <span>ถึงรอบล้าง 6 เดือนแล้ว</span>
                    </span>
                    <button
                      type="button"
                      onClick={onRequestBooking}
                      className="px-2 py-0.5 rounded bg-amber-600 text-white font-bold text-[10px]"
                    >
                      จองคิว
                    </button>
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>รอบถัดไป: {formatThaiDate(u.nextDueDate)}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Past Service History & Digital Reports */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900">
          ประวัติการรับบริการ & ใบรายงานจบงานดิจิทัล
        </h3>

        <div className="space-y-3">
          {myJobs.map((j) => (
            <div
              key={j.id}
              className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-500">{j.jobCode}</span>
                  <span className="font-bold text-slate-900">{j.title}</span>
                </div>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  วันที่: {formatThaiDate(j.scheduledDate)} • ยอดชำระ: {formatCurrency(j.price)}
                </p>
              </div>

              {j.status === 'completed' && (
                <button
                  type="button"
                  onClick={() => onOpenReportModal(j)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold border border-sky-200 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดูใบส่งมอบงาน PDF</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
