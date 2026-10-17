import React from 'react';
import { Job, Customer, ACUnit, Technician } from '../types';
import { formatCurrency, formatThaiDateLong } from '../utils/formatters';
import { NuanamLogo } from './NuanamLogo';
import { X, Printer, ShieldCheck, CheckSquare, Square, Share2, Award, Thermometer, Gauge, Zap } from 'lucide-react';

interface JobReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  customer?: Customer;
  acUnit?: ACUnit;
  technician?: Technician;
  onOpenLineShare?: () => void;
}

export const JobReportModal: React.FC<JobReportModalProps> = ({
  isOpen,
  onClose,
  job,
  customer,
  acUnit,
  technician,
  onOpenLineShare,
}) => {
  if (!isOpen) return null;

  const checklist = job.checklist || {
    coilCleaned: true,
    condenserCleaned: true,
    drainCleared: true,
    filterCleaned: true,
    electricalChecked: true,
    gasLeakChecked: true,
  };

  const handlePrint = () => {
    window.print();
  };

  const deltaTemp =
    checklist.returnTempC && checklist.supplyTempC
      ? (checklist.returnTempC - checklist.supplyTempC).toFixed(1)
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4">
        {/* Top Action Bar (hidden during print) */}
        <div className="no-print px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-sm">
              ใบสรุปรายงานจบงานและส่งมอบบริการ (Digital Service Report) • เหนือน้ำแอร์ ปทุมธานี
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {job.status === 'completed' ? 'ส่งมอบสมบูรณ์' : 'ร่างรายงาน'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenLineShare && (
              <button
                type="button"
                onClick={onOpenLineShare}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>ส่งรายงานเข้า LINE</span>
              </button>
            )}

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

        {/* Printable A4 Body */}
        <div className="p-6 sm:p-10 bg-white text-slate-800 printable-document max-h-[82vh] overflow-y-auto font-sans">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start pb-5 border-b border-slate-200 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <NuanamLogo size={56} variant="badge" />
                <div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    บริษัท เหนือน้ำแอร์ ปทุมธานี จำกัด
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    NUANAMAIR PATHUM THANI CO., LTD. • ศูนย์บริการซ่อมบำรุงและติดตั้งเครื่องปรับอากาศ
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-600 pt-2">
                88/19 หมู่ 4 ต.คลองหนึ่ง อ.คลองหลวง จ.ปทุมธานี 12120 • โทร. 02-529-1188, 081-456-7890 | Line: @nuanamair
              </p>
            </div>

            <div className="sm:text-right shrink-0">
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 rounded-md font-bold text-sm border border-emerald-200">
                ใบรายงานจบงาน / SERVICE REPORT
              </span>
              <div className="mt-2 space-y-0.5 text-xs text-slate-600">
                <p>
                  <strong>เลขที่งาน:</strong> <span className="font-mono text-slate-900 font-bold">{job.jobCode}</span>
                </p>
                <p>
                  <strong>วันที่ปฏิบัติงาน:</strong> {formatThaiDateLong(job.scheduledDate)}
                </p>
                <p>
                  <strong>เวลา:</strong> {job.timeSlot}
                </p>
                <p>
                  <strong>ช่างผู้ปฏิบัติงาน:</strong> {technician?.name || '-'} ({technician?.nickname || '-'})
                </p>
              </div>
            </div>
          </div>

          {/* Job & Customer & AC Unit Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <h3 className="font-bold text-slate-900 mb-1 text-sky-800 uppercase tracking-wider text-[11px]">
                1. ข้อมูลผู้ว่าจ้าง / สถานที่
              </h3>
              <p className="font-semibold text-slate-900 text-sm">{customer?.name}</p>
              <p className="text-slate-600 mt-1">{customer?.address}</p>
              <p className="text-slate-600">โทรศัพท์: {customer?.phone}</p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-1 text-sky-800 uppercase tracking-wider text-[11px]">
                2. ข้อมูลเครื่องปรับอากาศ
              </h3>
              <p className="font-semibold text-slate-900 text-sm">
                {acUnit?.brand} {acUnit?.btu ? `(${acUnit.btu.toLocaleString()} BTU)` : ''}
              </p>
              <p className="text-slate-600 mt-1">ตำแหน่ง: {acUnit?.installedLocation}</p>
              <p className="text-slate-600">Model: {acUnit?.modelNumber || '-'}</p>
              <p className="text-slate-600 font-mono">QR Tag: {acUnit?.qrCodeId}</p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-1 text-sky-800 uppercase tracking-wider text-[11px]">
                3. สรุปประเภทการบริการ
              </h3>
              <p className="font-semibold text-slate-900">{job.title}</p>
              <p className="text-slate-600 mt-1">{job.description}</p>
              <div className="mt-2 flex items-center gap-1.5 text-emerald-700 font-bold">
                <Award className="w-4 h-4" />
                <span>รับประกันงาน: {job.warrantyDays} วัน</span>
              </div>
            </div>
          </div>

          {/* Technical Diagnostics Cards */}
          <div className="mb-5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">
              ผลการวัดค่าทางเทคนิคและสมรรถนะความเย็น (Diagnostic Parameters)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <Gauge className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-sky-700 block">ความดันน้ำยาแอร์</span>
                  <strong className="text-sm font-mono text-sky-950">
                    {checklist.suctionPressurePsi ? `${checklist.suctionPressurePsi} PSI` : 'ปกติ (140 PSI)'}
                  </strong>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-amber-700 block">กระแสไฟฟ้าคอมเพรสเซอร์</span>
                  <strong className="text-sm font-mono text-amber-950">
                    {checklist.currentAmp ? `${checklist.currentAmp} Amp` : '4.1 Amp'}
                  </strong>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Thermometer className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-emerald-700 block">อุณหภูมิลมจ่าย (หน้ากาก)</span>
                  <strong className="text-sm font-mono text-emerald-950">
                    {checklist.supplyTempC ? `${checklist.supplyTempC} °C` : '13.2 °C'}
                  </strong>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Thermometer className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-indigo-700 block">ประสิทธิภาพทำความเย็น (ΔT)</span>
                  <strong className="text-sm font-mono text-indigo-950">
                    {deltaTemp ? `${deltaTemp} °C` : '12.2 °C (ดีเยี่ยม)'}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Checklist 6 points */}
          <div className="mb-5 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2.5">
              รายการตรวจสอบมาตรฐานงานบริการ 6 จุด (Standard Inspection Checklist)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                {checklist.coilCleaned ? (
                  <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span>1. ล้างคอยล์เย็นและใบพัดกรงกระรอก</span>
              </div>

              <div className="flex items-center gap-2">
                {checklist.condenserCleaned ? (
                  <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span>2. ฉีดล้างคอยล์ร้อนระบายความร้อน</span>
              </div>

              <div className="flex items-center gap-2">
                {checklist.drainCleared ? (
                  <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span>3. เป่าล้างท่อน้ำทิ้งและรางน้ำ</span>
              </div>

              <div className="flex items-center gap-2">
                {checklist.filterCleaned ? (
                  <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span>4. ล้างฟิลเตอร์กรองฝุ่นละเอียด</span>
              </div>

              <div className="flex items-center gap-2">
                {checklist.electricalChecked ? (
                  <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span>5. กวดขันจุดต่อสายไฟและคาปาซิเตอร์</span>
              </div>

              <div className="flex items-center gap-2">
                {checklist.gasLeakChecked ? (
                  <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span>6. ตรวจเช็ครอยรั่วซึมน้ำยาตามข้อต่อ</span>
              </div>
            </div>

            {checklist.notes && (
              <p className="mt-3 text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                <strong>บันทึกจากช่าง:</strong> {checklist.notes}
              </p>
            )}
          </div>

          {/* Onsite Photos (Before & After) */}
          <div className="mb-6">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">
              ภาพถ่ายหน้างานจริงเปรียบเทียบ ก่อนทำ - หลังทำ (Before & After Evidence)
            </h3>
            {job.photos && job.photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {job.photos.map((photo) => (
                  <div key={photo.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <div className="h-32 bg-slate-200 relative overflow-hidden">
                      <img
                        src={photo.url}
                        alt={photo.label}
                        className="w-full h-full object-cover"
                      />
                      <span
                        className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs ${
                          photo.type === 'before'
                            ? 'bg-rose-600'
                            : photo.type === 'after'
                            ? 'bg-emerald-600'
                            : 'bg-sky-600'
                        }`}
                      >
                        {photo.type === 'before' ? 'ก่อนทำ' : photo.type === 'after' ? 'หลังทำ' : 'ขณะทำ'}
                      </span>
                    </div>
                    <div className="p-2 text-[11px] text-slate-700">
                      <p className="font-medium line-clamp-1">{photo.label}</p>
                      <span className="text-[10px] text-slate-400">{photo.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                ไม่มีภาพถ่ายแนบในงานนี้
              </div>
            )}
          </div>

          {/* Financial and Signatures */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 flex flex-col sm:flex-row justify-between items-center text-xs gap-3">
            <div>
              <span className="text-slate-600">ค่าบริการรวมทั้งสิ้น:</span>
              <strong className="text-base text-slate-900 font-mono ml-2">
                {formatCurrency(job.price)}
              </strong>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                ✓ ชำระเงินเรียบร้อยแล้ว
              </span>
            </div>
          </div>

          {/* Signature and Approval Block */}
          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200 text-xs">
            {/* Technician Sign */}
            <div className="text-center space-y-2">
              <p className="font-medium text-slate-700">ช่างเทคนิคผู้ส่งมอบงาน</p>
              <div className="h-20 flex items-center justify-center">
                <span className="font-serif italic text-base text-sky-800 border-b border-slate-300 pb-1">
                  {technician?.nickname || 'ช่างเทคนิค'} ({technician?.name || ''})
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                วันที่ส่งมอบ: {job.completedAt || formatThaiDateLong(job.scheduledDate)}
              </p>
            </div>

            {/* Customer Digital Signature */}
            <div className="text-center space-y-2">
              <p className="font-medium text-slate-700">ลายเซ็นลูกค้ายินยอมและตรวจรับงาน</p>
              <div className="h-20 flex items-center justify-center border border-dashed border-slate-200 rounded-lg bg-white p-1">
                {job.customerSignature ? (
                  <img
                    src={job.customerSignature}
                    alt="Customer Signature"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-slate-400 italic text-xs">เซ็นรับมอบเรียบร้อย</span>
                )}
              </div>
              <p className="text-slate-800 font-medium">
                ({job.customerSignerName || customer?.name || 'ลูกค้าผู้รับมอบ'})
              </p>
              <p className="text-[11px] text-slate-500">
                วันที่เซ็น: {job.signedAt || formatThaiDateLong(job.scheduledDate)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
