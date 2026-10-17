import React, { useState } from 'react';
import { Job, Customer, ACUnit, Technician, LineNotification } from '../types';
import { formatCurrency, formatThaiDate } from '../utils/formatters';
import { NuanamLogo } from './NuanamLogo';
import { X, Send, Copy, Check, MessageSquare, Bell, Calendar, User, Wrench, ShieldCheck, ExternalLink } from 'lucide-react';

interface LineNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  job?: Job;
  customer?: Customer;
  acUnit?: ACUnit;
  technician?: Technician;
  onSendNotification: (notification: Omit<LineNotification, 'id' | 'sentAt' | 'status'>) => void;
}

export const LineNotificationModal: React.FC<LineNotificationModalProps> = ({
  isOpen,
  onClose,
  job,
  customer,
  acUnit,
  technician,
  onSendNotification,
}) => {
  const [templateType, setTemplateType] = useState<
    'appointment_confirmed' | 'technician_en_route' | 'job_completed' | 'maintenance_due' | 'quotation_ready'
  >('appointment_confirmed');
  const [copied, setCopied] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen) return null;

  const recipientName = customer?.name || 'ลูกค้าคนสำคัญ';
  const recipientPhone = customer?.phone || '-';
  const techName = technician?.nickname || 'ช่างเทคนิคผู้เชี่ยวชาญ';
  const vehicle = technician?.vehicle || 'รถบริการ CoolCare';
  const acInfo = acUnit ? `${acUnit.brand} (${acUnit.installedLocation})` : 'เครื่องปรับอากาศ';
  const jobTitle = job?.title || 'บริการเครื่องปรับอากาศ';
  const jobCode = job?.jobCode || 'JOB-2026-X';
  const priceFormatted = job ? formatCurrency(job.price) : '฿0';
  const scheduleDateFormatted = job ? formatThaiDate(job.scheduledDate) : 'วันนี้';
  const timeSlot = job?.timeSlot || '09:00 - 11:00 น.';

  // Build message templates
  let headline = '';
  let subheader = '';
  let badgeColor = 'bg-sky-500';
  let badgeText = 'แจ้งเตือนนัดหมาย';
  let messageContent = '';
  let actionButtonText = 'ดูรายละเอียดงาน';
  let actionUrl = `https://nuanamair.com/track/${jobCode}`;

  switch (templateType) {
    case 'appointment_confirmed':
      headline = 'ยืนยันนัดหมาย เหนือน้ำแอร์ ปทุมธานี';
      subheader = 'ระบบบันทึกคิวนัดหมายของท่านเรียบร้อยแล้ว';
      badgeColor = 'bg-blue-600';
      badgeText = 'นัดหมายยืนยัน';
      messageContent = `เรียน ${recipientName}\nเหนือน้ำแอร์ ปทุมธานี ยืนยันคิวนัดหมาย ${jobTitle} สำหรับ ${acInfo}\n📅 วันที่: ${scheduleDateFormatted}\n⏰ เวลา: ${timeSlot}\n👨‍🔧 ช่างประจำงาน: ${techName} (${technician?.phone || ''})\n📍 สถานที่: ${customer?.address || ''}\nขอบคุณที่ไว้วางใจให้เหนือน้ำแอร์ดูแลความเย็นในบ้านคุณ`;
      actionButtonText = 'ตรวจสอบสถานะและเลื่อนคิว';
      break;

    case 'technician_en_route':
      headline = 'ช่างเหนือน้ำแอร์ กำลังเดินทางไปหาคุณ';
      subheader = 'เตรียมตัวรับบริการความเย็นฉ่ำ';
      badgeColor = 'bg-amber-500';
      badgeText = 'กำลังเดินทาง';
      messageContent = `เรียน ${recipientName}\nขณะนี้ ${techName} ทีมช่างเหนือน้ำแอร์ กำลังเดินทางไปยังที่อยู่ของคุณ\n🚗 ยานพาหนะ: ${vehicle}\n⏱ คาดว่าจะถึงภายใน: 20-30 นาที\n📞 ติดต่อช่างโดยตรง: ${technician?.phone || ''}\nกรุณาเตรียมความพร้อมบริเวณเครื่องปรับอากาศ`;
      actionButtonText = 'ติดตามตำแหน่งช่างสด (Live GPS)';
      break;

    case 'job_completed':
      headline = 'รายงานสรุปงานและส่งมอบบริการ';
      subheader = 'เหนือน้ำแอร์ ปทุมธานี บริการเสร็จสมบูรณ์';
      badgeColor = 'bg-emerald-600';
      badgeText = 'เสร็จสมบูรณ์';
      messageContent = `เรียน ${recipientName}\nเหนือน้ำแอร์ ปทุมธานี ให้บริการ ${jobTitle} (${acInfo}) เสร็จเรียบร้อยแล้ว\n✨ แอร์สะอาด เย็นฉ่ำ ทำงานเต็มประสิทธิภาพ\n🛡️ รับประกันงานบริการ: ${job?.warrantyDays || 30} วัน\n💰 ยอดชำระ: ${priceFormatted}\nท่านสามารถตรวจดูรายงานตรวจเช็คแบบดิจิทัลและใบรับประกันได้ที่ลิงก์ด้านล่าง`;
      actionButtonText = 'เปิดดูรายงานสรุปจบงาน & ใบรับประกัน';
      break;

    case 'maintenance_due':
      headline = 'แจ้งเตือนรอบการล้างแอร์ (ครบ 6 เดือน)';
      subheader = 'เพื่อสุขอนามัยและประหยัดค่าไฟ';
      badgeColor = 'bg-cyan-600';
      badgeText = 'รอบบำรุงรักษา';
      messageContent = `เรียน ${recipientName}\nแอร์ ${acInfo} ของท่านถึงรอบการล้างทำความสะอาดตามกำหนด 6 เดือนแล้ว\n💡 เหนือน้ำแอร์ ปทุมธานี ขอแนะนำการล้างแอร์สม่ำเสมอช่วยลดฝุ่น PM2.5 แบคทีเรียสะสม และประหยัดค่าไฟสูงสุดถึง 15%\nจองคิวด่วนพร้อมโปรโมชั่นพิเศษล้างแอร์ติดผนังเริ่มต้นเพียง 600 บาท`;
      actionButtonText = 'จองคิวล้างแอร์ออนไลน์ทันที';
      break;

    case 'quotation_ready':
      headline = 'ใบเสนอราคา เหนือน้ำแอร์ ปทุมธานี';
      subheader = 'ตรวจสอบรายการและกดอนุมัติออนไลน์';
      badgeColor = 'bg-purple-600';
      badgeText = 'ใบเสนอราคา';
      messageContent = `เรียน ${recipientName}\nบริษัท เหนือน้ำแอร์ ปทุมธานี จำกัด ได้จัดส่งใบเสนอราคาเลขที่ ${job?.quotation?.quotationNo || 'QT-2026-1001'} สำหรับงาน ${jobTitle}\n💰 ยอดรวมทั้งสิ้น: ${priceFormatted}\nท่านสามารถเปิดดูรายการอะไหล่ รายละเอียดการรับประกัน และกดอนุมัติได้ทันที`;
      actionButtonText = 'เปิดดูใบเสนอราคาและกดอนุมัติ';
      break;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(messageContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendSimulate = () => {
    onSendNotification({
      jobId: job?.id || 'job-general',
      recipientPhone: recipientPhone,
      recipientName: recipientName,
      type: templateType,
      title: headline,
      messageText: messageContent,
    });
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      onClose();
    }, 1200);
  };

  const lineShareUrl = `https://line.me/R/msg/text/?${encodeURIComponent(messageContent + '\n\n' + actionUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs font-bold text-lg">
              💬
            </div>
            <div>
              <h3 className="font-bold text-base">ระบบแจ้งเตือนลูกค้าผ่าน LINE</h3>
              <p className="text-xs text-emerald-100">
                LINE Official & Flex Message Simulator สำหรับงานบริการแอร์
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Template Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              เลือกรูปแบบข้อความแจ้งเตือน (Notification Templates)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTemplateType('appointment_confirmed')}
                className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all flex items-center gap-2 ${
                  templateType === 'appointment_confirmed'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>1. ยืนยันนัดหมาย</span>
              </button>

              <button
                type="button"
                onClick={() => setTemplateType('technician_en_route')}
                className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all flex items-center gap-2 ${
                  templateType === 'technician_en_route'
                    ? 'border-amber-600 bg-amber-50 text-amber-700 ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Wrench className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>2. ช่างกำลังเดินทาง</span>
              </button>

              <button
                type="button"
                onClick={() => setTemplateType('job_completed')}
                className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all flex items-center gap-2 ${
                  templateType === 'job_completed'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>3. สรุปจบงาน & ประกัน</span>
              </button>

              <button
                type="button"
                onClick={() => setTemplateType('maintenance_due')}
                className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all flex items-center gap-2 ${
                  templateType === 'maintenance_due'
                    ? 'border-cyan-600 bg-cyan-50 text-cyan-700 ring-2 ring-cyan-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Bell className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                <span>4. เตือนรอบล้าง 6 เดือน</span>
              </button>

              <button
                type="button"
                onClick={() => setTemplateType('quotation_ready')}
                className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all flex items-center gap-2 ${
                  templateType === 'quotation_ready'
                    ? 'border-purple-600 bg-purple-50 text-purple-700 ring-2 ring-purple-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>5. ส่งใบเสนอราคา</span>
              </button>
            </div>
          </div>

          {/* Recipient summary bar */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <span>ผู้รับ: <strong className="text-slate-800">{recipientName}</strong> ({recipientPhone})</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>LINE Ready</span>
            </div>
          </div>

          {/* Realistic LINE Message Simulator Frame */}
          <div className="bg-[#758ca3] rounded-2xl p-4 shadow-inner max-h-[340px] overflow-y-auto">
            <div className="flex items-start gap-2.5 max-w-md">
              {/* Official Bot Avatar */}
              <div className="w-10 h-10 rounded-2xl overflow-hidden shrink-0 shadow-md border-2 border-white bg-white">
                <NuanamLogo size={36} variant="badge" />
              </div>
              <div className="space-y-1 w-full">
                <span className="text-[11px] text-white/90 font-medium">เหนือน้ำแอร์ ปทุมธานี Official Service</span>

                {/* LINE Flex Bubble */}
                <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-100">
                  {/* Bubble Header */}
                  <div className="p-3.5 bg-slate-900 text-white">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${badgeColor}`}>
                        {badgeText}
                      </span>
                      <span className="text-[10px] text-slate-400">รหัส {jobCode}</span>
                    </div>
                    <h4 className="font-bold text-sm text-white">{headline}</h4>
                    <p className="text-xs text-slate-300 mt-0.5">{subheader}</p>
                  </div>

                  {/* Bubble Body */}
                  <div className="p-3.5 text-xs text-slate-700 whitespace-pre-line leading-relaxed border-b border-slate-100 font-sans">
                    {messageContent}
                  </div>

                  {/* Interactive LINE Flex Button */}
                  <div className="p-2.5 bg-slate-50 flex items-center justify-center">
                    <div className="w-full py-2 px-3 rounded-lg bg-emerald-600 text-white font-medium text-xs text-center shadow-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-emerald-700">
                      <span>{actionButtonText}</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                </div>

                <span className="text-[10px] text-white/70 block text-right pr-1">10:45 น. • ส่งแล้ว</span>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? 'คัดลอกแล้ว!' : 'คัดลอกข้อความ'}</span>
              </button>

              <a
                href={lineShareUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#06C755] bg-[#06C755]/10 border border-[#06C755]/30 rounded-xl hover:bg-[#06C755]/20 transition-colors"
              >
                <span>เปิดแอป LINE</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <button
              type="button"
              onClick={handleSendSimulate}
              disabled={sentSuccess}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all disabled:bg-emerald-400"
            >
              {sentSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>ส่งการแจ้งเตือนสำเร็จ!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>ส่งแจ้งเตือนเข้า LINE ลูกค้าทันที</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
