import React from 'react';
import { Job, Customer, ACUnit } from '../types';
import { formatCurrency, formatThaiDateLong } from '../utils/formatters';
import { NuanamLogo } from './NuanamLogo';
import { X, Printer, CheckCircle, FileText, Share2 } from 'lucide-react';

interface QuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  customer?: Customer;
  acUnit?: ACUnit;
  onApproveQuotation?: (jobId: string) => void;
  onOpenLineShare?: () => void;
}

export const QuotationModal: React.FC<QuotationModalProps> = ({
  isOpen,
  onClose,
  job,
  customer,
  acUnit,
  onApproveQuotation,
  onOpenLineShare,
}) => {
  if (!isOpen) return null;

  const quotation = job.quotation || {
    quotationNo: `QT-2026-${job.jobCode.split('-')[2] || '1001'}`,
    date: job.scheduledDate || '2026-10-16',
    validUntil: '2026-10-23',
    items: [
      {
        id: '1',
        description: job.title,
        quantity: 1,
        unit: 'รายการ',
        unitPrice: job.price,
        total: job.price,
      },
    ],
    discount: 0,
    taxPercent: 7,
    notes: 'ราคานี้รวมค่าแรงและอุปกรณ์มาตรฐานแล้ว รับประกันผลงาน 30-90 วันตามประเภทงาน',
    status: 'draft' as const,
  };

  const subtotal = quotation.items.reduce((sum, item) => sum + item.total, 0);
  const afterDiscount = subtotal - quotation.discount;
  const vatAmount = (afterDiscount * quotation.taxPercent) / 100;
  const grandTotal = afterDiscount + vatAmount;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4">
        {/* Top toolbar (hidden during print) */}
        <div className="no-print px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-400" />
            <span className="font-semibold text-sm">
              ใบเสนอราคาดิจิทัล (Digital Quotation) • {quotation.quotationNo}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                quotation.status === 'approved'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {quotation.status === 'approved' ? 'อนุมัติแล้ว' : 'รอการอนุมัติ'}
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
                <span>แชร์เข้า LINE</span>
              </button>
            )}

            {onApproveQuotation && quotation.status !== 'approved' && (
              <button
                type="button"
                onClick={() => onApproveQuotation(job.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-medium transition-colors"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>อนุมัติใบเสนอราคา</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium border border-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์ / บันทึกเป็น PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Quotation Paper (A4 Formatted) */}
        <div className="p-6 sm:p-10 bg-white text-slate-800 printable-document max-h-[82vh] overflow-y-auto font-sans">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start pb-6 border-b border-slate-200 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <NuanamLogo size={56} variant="badge" />
                <div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    บริษัท เหนือน้ำแอร์ ปทุมธานี จำกัด
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">NUANAMAIR PATHUM THANI CO., LTD.</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 pt-2">
                เลขประจำตัวผู้เสียภาษี: 0135563004821 (สำนักงานใหญ่)
              </p>
              <p className="text-xs text-slate-600">
                88/19 หมู่ 4 ต.คลองหนึ่ง อ.คลองหลวง จ.ปทุมธานี 12120
              </p>
              <p className="text-xs text-slate-600">
                โทร: 02-529-1188, 081-456-7890 | อีเมล: service@nuanamair.com | Line: @nuanamair
              </p>
            </div>

            <div className="sm:text-right shrink-0">
              <span className="inline-block px-3 py-1 bg-sky-50 text-sky-800 rounded-md font-bold text-base border border-sky-200">
                ใบเสนอราคา / QUOTATION
              </span>
              <div className="mt-3 space-y-1 text-xs text-slate-600">
                <p>
                  <strong>เลขที่เอกสาร:</strong>{' '}
                  <span className="text-slate-900 font-mono font-bold">{quotation.quotationNo}</span>
                </p>
                <p>
                  <strong>วันที่:</strong> {formatThaiDateLong(quotation.date)}
                </p>
                <p>
                  <strong>ใช้ได้ถึงวันที่:</strong> {formatThaiDateLong(quotation.validUntil)}
                </p>
                <p>
                  <strong>รหัสอ้างอิงงาน:</strong> {job.jobCode}
                </p>
              </div>
            </div>
          </div>

          {/* Customer & Unit Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <h3 className="font-bold text-slate-900 mb-1.5 uppercase tracking-wider text-[11px] text-sky-700">
                ข้อมูลลูกค้า (Customer Details)
              </h3>
              <p className="font-semibold text-slate-900 text-sm">{customer?.name || 'ลูกค้าทั่วไป'}</p>
              <p className="text-slate-600 mt-1">{customer?.address || '-'}</p>
              <p className="text-slate-600 mt-0.5">โทรศัพท์: {customer?.phone || '-'}</p>
              {customer?.lineId && <p className="text-slate-600">LINE ID: {customer.lineId}</p>}
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-1.5 uppercase tracking-wider text-[11px] text-sky-700">
                ข้อมูลเครื่องปรับอากาศ (AC Specifications)
              </h3>
              <p className="font-semibold text-slate-900 text-sm">
                {acUnit?.brand} {acUnit?.btu ? `(${acUnit.btu.toLocaleString()} BTU)` : ''}
              </p>
              <p className="text-slate-600 mt-1">ตำแหน่งติดตั้ง: {acUnit?.installedLocation || '-'}</p>
              <p className="text-slate-600 mt-0.5">รุ่น / Serial: {acUnit?.modelNumber || '-'}</p>
              <p className="text-slate-600">Asset QR ID: {acUnit?.qrCodeId || '-'}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 w-12 text-center">ลำดับ</th>
                  <th className="py-2.5 px-3">รายการบริการ / อะไหล่ (Description)</th>
                  <th className="py-2.5 px-3 w-20 text-center">จำนวน</th>
                  <th className="py-2.5 px-3 w-20 text-center">หน่วย</th>
                  <th className="py-2.5 px-3 w-28 text-right">ราคาต่อหน่วย</th>
                  <th className="py-2.5 px-3 w-28 text-right">รวมเงิน (บาท)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotation.items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                    <td className="py-3 px-3">
                      <p className="font-medium text-slate-900">{item.description}</p>
                    </td>
                    <td className="py-3 px-3 text-center font-mono">{item.quantity}</td>
                    <td className="py-3 px-3 text-center text-slate-600">{item.unit}</td>
                    <td className="py-3 px-3 text-right font-mono">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-3 px-3 text-right font-bold font-mono text-slate-900">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary calculations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start mb-8">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <h4 className="font-bold text-slate-900">เงื่อนไขและการรับประกัน (Terms & Warranty)</h4>
              <ul className="list-disc pl-4 space-y-1 text-slate-600 leading-relaxed">
                <li>รับประกันงานล้างทำความสะอาด 30 วัน (รับประกันน้ำไม่หยด)</li>
                <li>รับประกันงานเปลี่ยนอะไหล่และน้ำยาแอร์ 90 วัน</li>
                <li>ราคารวมค่าเดินทางและอุปกรณ์มาตรฐานในขอบเขตงานแล้ว</li>
                <li>การชำระเงิน: โอนผ่าน QR Code หรือเงินสดเมื่อส่งมอบงานเรียบร้อย</li>
              </ul>
              {quotation.notes && (
                <p className="pt-2 text-slate-700 italic border-t border-slate-200">
                  <strong>หมายเหตุเพิ่มเติม:</strong> {quotation.notes}
                </p>
              )}
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>รวมเป็นเงิน (Subtotal):</span>
                <span className="font-mono font-medium">{formatCurrency(subtotal)}</span>
              </div>
              {quotation.discount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>ส่วนลดพิเศษ (Discount):</span>
                  <span className="font-mono font-medium">-{formatCurrency(quotation.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>ภาษีมูลค่าเพิ่ม 7% (VAT):</span>
                <span className="font-mono font-medium">{formatCurrency(vatAmount)}</span>
              </div>
              <div className="pt-2 border-t border-slate-300 flex justify-between items-center text-slate-900">
                <div>
                  <span className="font-bold text-sm block">จำนวนเงินรวมทั้งสิ้น (Grand Total):</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    (รวมภาษีมูลค่าเพิ่มเรียบร้อยแล้ว)
                  </span>
                </div>
                <span className="font-bold text-lg text-sky-700 font-mono">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Signatures block */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-center text-xs">
            <div className="space-y-12">
              <p className="font-medium text-slate-700">ในนาม บริษัท เหนือน้ำแอร์ ปทุมธานี จำกัด</p>
              <div className="border-b border-dashed border-slate-400 w-44 mx-auto pb-1 text-slate-500 font-medium">
                (นายธนาธิป สุวรรณโชติ)
              </div>
              <p className="text-[11px] text-slate-500">ผู้มีอำนาจลงนาม / หัวหน้างานบริการ</p>
            </div>

            <div className="space-y-12">
              <p className="font-medium text-slate-700">อนุมัติสั่งจ้าง / ผู้ว่าจ้าง</p>
              <div className="border-b border-dashed border-slate-400 w-44 mx-auto pb-1 text-slate-500 font-medium">
                ({customer?.name || 'ลูกค้าผู้สั่งจ้าง'})
              </div>
              <p className="text-[11px] text-slate-500">วันที่อนุมัติ: ..... / ..... / ..........</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
