import React, { useState, useEffect } from 'react';
import {
  Job,
  Customer,
  ACUnit,
  Technician,
  JobStatus,
  JobExpense,
  TechnicalChecklist,
  JobPhoto,
} from '../types';
import { JOB_STATUS_LABELS, SERVICE_TYPE_LABELS } from '../data/mockData';
import { formatCurrency, formatThaiDate } from '../utils/formatters';
import { SignaturePad } from './SignaturePad';
import confetti from 'canvas-confetti';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  FileText,
  DollarSign,
  Plus,
  Trash2,
  Upload,
  MessageSquare,
  Shield,
  Gauge,
  Thermometer,
  Zap,
  Edit3,
  Save,
} from 'lucide-react';

interface JobDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  customer?: Customer;
  acUnit?: ACUnit;
  technician?: Technician;
  technicians?: Technician[];
  initialEditMode?: boolean;
  onUpdateJob: (updatedJob: Job) => void;
  onUpdateCustomer?: (updatedCustomer: Customer) => void;
  onDeleteJob: (jobId: string) => void;
  onRequestProtectedAction: (description: string, callback: () => void) => void;
  onOpenLineModal: () => void;
  onOpenQuotationModal: () => void;
  onOpenReportModal: () => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  isOpen,
  onClose,
  job,
  customer,
  acUnit,
  technician,
  technicians = [],
  initialEditMode = false,
  onUpdateJob,
  onUpdateCustomer,
  onDeleteJob,
  onRequestProtectedAction,
  onOpenLineModal,
  onOpenQuotationModal,
  onOpenReportModal,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'signature' | 'expenses'>(
    'overview'
  );
  const [isEditingJobInfo, setIsEditingJobInfo] = useState(initialEditMode);

  // Editable job fields
  const [editJobCode, setEditJobCode] = useState(job.jobCode);
  const [editTitle, setEditTitle] = useState(job.title);
  const [editDescription, setEditDescription] = useState(job.description);
  const [editScheduledDate, setEditScheduledDate] = useState(job.scheduledDate);
  const [editTimeSlot, setEditTimeSlot] = useState(job.timeSlot);
  const [editPrice, setEditPrice] = useState(job.price);
  const [editTechId, setEditTechId] = useState(job.technicianId);
  const [editCompletionSummary, setEditCompletionSummary] = useState(job.completionSummary || '');

  // Editable customer fields
  const [editCustName, setEditCustName] = useState(customer?.name || '');
  const [editCustPhone, setEditCustPhone] = useState(customer?.phone || '');
  const [editCustAddress, setEditCustAddress] = useState(customer?.address || '');

  useEffect(() => {
    setIsEditingJobInfo(initialEditMode);
    setEditJobCode(job.jobCode);
    setEditTitle(job.title);
    setEditDescription(job.description);
    setEditScheduledDate(job.scheduledDate);
    setEditTimeSlot(job.timeSlot);
    setEditPrice(job.price);
    setEditTechId(job.technicianId);
    setEditCompletionSummary(job.completionSummary || '');
    setEditCustName(customer?.name || '');
    setEditCustPhone(customer?.phone || '');
    setEditCustAddress(customer?.address || '');
  }, [job, customer, initialEditMode]);

  // Local state for technical checklist
  const [checklist, setChecklist] = useState<TechnicalChecklist>(
    job.checklist || {
      suctionPressurePsi: 140,
      currentAmp: 4.1,
      returnTempC: 25.5,
      supplyTempC: 13.5,
      coilCleaned: false,
      condenserCleaned: false,
      drainCleared: false,
      filterCleaned: false,
      electricalChecked: false,
      gasLeakChecked: false,
      notes: '',
    }
  );

  // Local state for expenses
  const [expenses, setExpenses] = useState<JobExpense[]>(job.expenses || []);
  const [newExpDesc, setNewExpDesc] = useState('');
  const [newExpCategory, setNewExpCategory] = useState<JobExpense['category']>('spare_part');
  const [newExpCost, setNewExpCost] = useState<number>(0);
  const [newExpQty, setNewExpQty] = useState<number>(1);

  // Photo upload simulation
  const [photos, setPhotos] = useState<JobPhoto[]>(job.photos || []);

  if (!isOpen) return null;

  // Calculate financials
  const totalExpenseCost = expenses.reduce((acc, curr) => acc + curr.cost * curr.quantity, 0);
  const profit = job.price - totalExpenseCost;
  const profitMarginPercent = job.price > 0 ? ((profit / job.price) * 100).toFixed(1) : '0';

  const handleSaveJobEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Job = {
      ...job,
      jobCode: editJobCode.trim() || job.jobCode,
      title: editTitle.trim() || job.title,
      description: editDescription,
      scheduledDate: editScheduledDate,
      timeSlot: editTimeSlot,
      price: Number(editPrice) || 0,
      technicianId: editTechId,
      completionSummary: editCompletionSummary,
    };
    onUpdateJob(updated);

    if (customer && onUpdateCustomer) {
      onUpdateCustomer({
        ...customer,
        name: editCustName.trim() || customer.name,
        phone: editCustPhone.trim() || customer.phone,
        address: editCustAddress.trim() || customer.address,
      });
    }

    setIsEditingJobInfo(false);
  };

  // Quick status transitions
  const handleStatusChange = (newStatus: JobStatus) => {
    const updated: Job = {
      ...job,
      status: newStatus,
      enRouteAt: newStatus === 'en_route' ? '12:30' : job.enRouteAt,
      startedAt: newStatus === 'in_progress' ? '13:00' : job.startedAt,
      completedAt: newStatus === 'completed' ? '15:00' : job.completedAt,
    };

    if (newStatus === 'completed') {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }

    onUpdateJob(updated);
  };

  const handleSaveChecklist = () => {
    const updated: Job = {
      ...job,
      checklist,
    };
    onUpdateJob(updated);
  };

  const handleSaveSignature = (sigDataUrl: string, name: string) => {
    const updated: Job = {
      ...job,
      customerSignature: sigDataUrl,
      customerSignerName: name || customer?.name,
      signedAt: '2026-10-16 14:30',
      status: job.status === 'in_progress' ? 'pending_payment' : job.status,
    };
    onUpdateJob(updated);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpDesc) return;
    const newExp: JobExpense = {
      id: `exp-${Date.now()}`,
      description: newExpDesc,
      category: newExpCategory,
      cost: Number(newExpCost),
      priceCharged: 0,
      quantity: Number(newExpQty),
    };
    const updatedExpenses = [...expenses, newExp];
    setExpenses(updatedExpenses);
    onUpdateJob({ ...job, expenses: updatedExpenses });
    setNewExpDesc('');
    setNewExpCost(0);
    setNewExpQty(1);
  };

  const handleDeleteExpense = (expId: string) => {
    onRequestProtectedAction('ลบรายการค่าใช้จ่ายในใบงาน', () => {
      const updatedExpenses = expenses.filter((e) => e.id !== expId);
      setExpenses(updatedExpenses);
      onUpdateJob({ ...job, expenses: updatedExpenses });
    });
  };

  const handleDeletePhoto = (photoId: string) => {
    onRequestProtectedAction('ลบรูปถ่ายหน้างาน', () => {
      const updatedPhotos = photos.filter((p) => p.id !== photoId);
      setPhotos(updatedPhotos);
      onUpdateJob({ ...job, photos: updatedPhotos });
    });
  };

  const handleSimulatePhotoUpload = (type: JobPhoto['type']) => {
    const sampleUrls = {
      before: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
      during: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
      after: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80',
      pressure: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
      part: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&auto=format&fit=crop&q=80',
      other: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80',
    };

    const newPhoto: JobPhoto = {
      id: `p-${Date.now()}`,
      url: sampleUrls[type],
      type,
      label:
        type === 'before'
          ? 'ภาพก่อนทำ: ฝุ่นเกาะหนาแน่น'
          : type === 'after'
          ? 'ภาพหลังทำ: คอยล์สะอาดใส ลมเย็นจัด'
          : 'ภาพการตรวจเช็คหน้างาน',
      timestamp: '2026-10-16 13:40',
    };

    const updatedPhotos = [...photos, newPhoto];
    setPhotos(updatedPhotos);
    onUpdateJob({ ...job, photos: updatedPhotos });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xs font-mono font-bold bg-white/10 px-2.5 py-1 rounded-lg shrink-0">
              {job.jobCode}
            </span>
            <div className="truncate">
              <h2 className="font-bold text-sm sm:text-base text-white truncate">{job.title}</h2>
              <p className="text-xs text-slate-400 truncate">
                {customer?.name} • {acUnit?.brand} ({acUnit?.installedLocation})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() =>
                onRequestProtectedAction(`แก้ไขข้อมูลใบงาน ${job.jobCode}`, () => {
                  setActiveTab('overview');
                  setIsEditingJobInfo(true);
                })
              }
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-400/30 text-xs font-semibold transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">แก้ไขข้อมูล</span>
            </button>

            <button
              type="button"
              onClick={() =>
                onRequestProtectedAction(`ลบใบงาน ${job.jobCode} (${job.title})`, () => {
                  onDeleteJob(job.id);
                  onClose();
                })
              }
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-400/30 text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ลบใบงาน</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Stepper Tracker */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 shrink-0 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[560px] gap-2">
            {[
              { key: 'scheduled', label: '1. นัดหมาย' },
              { key: 'en_route', label: '2. กำลังเดินทาง' },
              { key: 'in_progress', label: '3. ปฏิบัติงาน' },
              { key: 'pending_payment', label: '4. รอชำระ/ตรวจรับ' },
              { key: 'completed', label: '5. เสร็จสิ้น' },
            ].map((step, idx) => {
              const isCurrent = job.status === step.key;
              const isPassed =
                (job.status === 'completed' && true) ||
                (job.status === 'pending_payment' && idx <= 3) ||
                (job.status === 'in_progress' && idx <= 2) ||
                (job.status === 'en_route' && idx <= 1) ||
                (job.status === 'scheduled' && idx === 0);

              return (
                <div key={step.key} className="flex-1 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(step.key as JobStatus)}
                    className={`w-full py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      isCurrent
                        ? 'bg-sky-600 text-white shadow-xs'
                        : isPassed
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{step.label}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 bg-white flex items-center justify-between gap-4 shrink-0 overflow-x-auto">
          <div className="flex gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-sky-600 text-sky-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              ภาพรวม & ข้อมูลงาน
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('checklist')}
              className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'checklist'
                  ? 'border-sky-600 text-sky-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              ตรวจเช็คหน้างาน & รูปถ่าย ({photos.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('signature')}
              className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'signature'
                  ? 'border-sky-600 text-sky-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>ลายเซ็นลูกค้า</span>
              {job.customerSignature && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('expenses')}
              className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'expenses'
                  ? 'border-sky-600 text-sky-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              ต้นทุน & กำไร (฿{profit.toLocaleString()})
            </button>
          </div>

          {/* Quick Doc Actions */}
          <div className="flex items-center gap-2 py-2">
            <button
              type="button"
              onClick={onOpenQuotationModal}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium"
            >
              <FileText className="w-3.5 h-3.5 text-sky-600" />
              <span>ใบเสนอราคา</span>
            </button>

            <button
              type="button"
              onClick={onOpenReportModal}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 text-xs font-medium"
            >
              <Shield className="w-3.5 h-3.5 text-sky-600" />
              <span>รายงานจบงาน PDF</span>
            </button>

            <button
              type="button"
              onClick={onOpenLineModal}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>แจ้งเตือน LINE</span>
            </button>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: OVERVIEW (OR INLINE EDIT FORM) */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {isEditingJobInfo ? (
                <form
                  onSubmit={handleSaveJobEdit}
                  className="p-5 rounded-2xl bg-sky-50/60 border-2 border-sky-200 space-y-4 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-sky-200 pb-3">
                    <div className="flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-sky-600" />
                      <h3 className="font-bold text-sm text-slate-900">
                        โหมดแก้ไขข้อมูลใบสั่งงานและลูกค้า (ยืนยันรหัส 0000 แล้ว)
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditingJobInfo(false)}
                      className="text-slate-500 hover:text-slate-800 font-semibold"
                    >
                      ยกเลิกการแก้ไข
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">รหัสใบงาน</label>
                      <input
                        type="text"
                        value={editJobCode}
                        onChange={(e) => setEditJobCode(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono font-bold"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">หัวข้องานบริการ</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">วันที่นัดหมาย</label>
                      <input
                        type="date"
                        value={editScheduledDate}
                        onChange={(e) => setEditScheduledDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">ช่วงเวลา</label>
                      <input
                        type="text"
                        value={editTimeSlot}
                        onChange={(e) => setEditTimeSlot(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">ค่าบริการ (บาท)</label>
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">ช่างผู้รับผิดชอบ</label>
                      <select
                        value={editTechId}
                        onChange={(e) => setEditTechId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                      >
                        {technicians.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.nickname}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {customer && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-sky-200/70">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">ชื่อลูกค้า</label>
                        <input
                          type="text"
                          value={editCustName}
                          onChange={(e) => setEditCustName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">เบอร์โทรลูกค้า</label>
                        <input
                          type="text"
                          value={editCustPhone}
                          onChange={(e) => setEditCustPhone(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">ที่อยู่ลูกค้า</label>
                        <input
                          type="text"
                          value={editCustAddress}
                          onChange={(e) => setEditCustAddress(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      รายละเอียดงาน / อาการที่แจ้ง
                    </label>
                    <textarea
                      rows={2}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      บันทึกสรุปเมื่อจบงาน
                    </label>
                    <input
                      type="text"
                      value={editCompletionSummary}
                      onChange={(e) => setEditCompletionSummary(e.target.value)}
                      placeholder="เช่น ล้างแอร์สะอาดเรียบร้อย วัดแรงดันน้ำยาปกติ..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingJobInfo(false)}
                      className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-600 font-semibold"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-xs"
                    >
                      <Save className="w-4 h-4" />
                      <span>บันทึกการแก้ไขทั้งหมด</span>
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  {/* Customer & Address Card */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">{customer?.name}</span>
                        <a
                          href={`tel:${customer?.phone}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-xs hover:bg-emerald-100"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{customer?.phone}</span>
                        </a>
                      </div>

                      <div className="flex items-start gap-2 text-slate-600">
                        <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <p>{customer?.address}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {customer?.subdistrict} {customer?.district} {customer?.province}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex justify-end">
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                            customer?.address || ''
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-sky-600 hover:text-sky-700 font-semibold"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>เปิด Google Maps นำทางไปยังบ้านลูกค้า</span>
                        </a>
                      </div>
                    </div>

                    {/* Technician & Appointment Info */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {technician?.avatar && (
                            <img
                              src={technician.avatar}
                              alt={technician.name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200"
                            />
                          )}
                          <div>
                            <span className="font-bold text-slate-900 text-sm">
                              {technician?.nickname || 'ช่างเทคนิค'}
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              ⭐ {technician?.rating || 5.0} • {technician?.vehicle || ''}
                            </span>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-semibold text-slate-600">
                          {technician?.phone}
                        </span>
                      </div>

                      <div className="space-y-1.5 pt-1 text-slate-700">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            วันที่นัดหมาย: <strong>{formatThaiDate(job.scheduledDate)}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            ช่วงเวลา: <strong>{job.timeSlot}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            ค่าบริการ:{' '}
                            <strong className="text-slate-900">{formatCurrency(job.price)}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AC Unit Card */}
                  <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sky-900 text-sm">
                        เครื่องปรับอากาศ: {acUnit?.brand} {acUnit?.btu?.toLocaleString()} BTU
                      </span>
                      <span className="font-mono text-xs font-bold text-sky-700 bg-white px-2 py-0.5 rounded border border-sky-200">
                        QR: {acUnit?.qrCodeId}
                      </span>
                    </div>
                    <p className="text-slate-600">
                      ตำแหน่งติดตั้ง: <strong>{acUnit?.installedLocation}</strong>
                    </p>
                    <p className="text-slate-500">
                      รุ่น / รายละเอียด: {acUnit?.modelNumber} ({acUnit?.notes})
                    </p>
                  </div>

                  {/* Description & Symptoms */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                        รายละเอียดงาน / อาการที่แจ้ง
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onRequestProtectedAction(`แก้ไขข้อมูลใบงาน ${job.jobCode}`, () => {
                            setIsEditingJobInfo(true);
                          })
                        }
                        className="text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>แก้ไขรายละเอียด</span>
                      </button>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{job.description}</p>
                    {job.completionSummary && (
                      <div className="mt-2 p-2.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100">
                        <strong>บันทึกเมื่อจบงาน:</strong> {job.completionSummary}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: CHECKLIST & PHOTOS */}
          {activeTab === 'checklist' && (
            <div className="space-y-6">
              {/* Technical Measurement Gauges */}
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-3">
                  บันทึกค่าการวัดจริงหน้างาน (Measurements)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <label className="block text-slate-500 mb-1 flex items-center gap-1">
                      <Gauge className="w-3.5 h-3.5 text-sky-600" />
                      <span>ความดันน้ำยา (PSI)</span>
                    </label>
                    <input
                      type="number"
                      value={checklist.suctionPressurePsi || ''}
                      onChange={(e) =>
                        setChecklist({ ...checklist, suctionPressurePsi: Number(e.target.value) })
                      }
                      placeholder="เช่น 140"
                      className="w-full text-sm font-bold font-mono px-2 py-1 rounded border border-slate-300 bg-white"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <label className="block text-slate-500 mb-1 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-600" />
                      <span>กระแสไฟ (Amp)</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={checklist.currentAmp || ''}
                      onChange={(e) =>
                        setChecklist({ ...checklist, currentAmp: Number(e.target.value) })
                      }
                      placeholder="เช่น 4.2"
                      className="w-full text-sm font-bold font-mono px-2 py-1 rounded border border-slate-300 bg-white"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <label className="block text-slate-500 mb-1 flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                      <span>อุณหภูมิลมกลับ (°C)</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={checklist.returnTempC || ''}
                      onChange={(e) =>
                        setChecklist({ ...checklist, returnTempC: Number(e.target.value) })
                      }
                      placeholder="เช่น 26.0"
                      className="w-full text-sm font-bold font-mono px-2 py-1 rounded border border-slate-300 bg-white"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <label className="block text-slate-500 mb-1 flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5 text-emerald-500" />
                      <span>อุณหภูมิลมจ่าย (°C)</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={checklist.supplyTempC || ''}
                      onChange={(e) =>
                        setChecklist({ ...checklist, supplyTempC: Number(e.target.value) })
                      }
                      placeholder="เช่น 13.5"
                      className="w-full text-sm font-bold font-mono px-2 py-1 rounded border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* 6 Checkpoints */}
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-3">
                  มาตรฐานการตรวจเช็ค 6 จุด (6-Point Standard Inspection)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {[
                    { key: 'coilCleaned', label: '1. ล้างคอยล์เย็น & ใบพัดกรงกระรอก' },
                    { key: 'condenserCleaned', label: '2. ฉีดล้างคอยล์ร้อนระบายความร้อน' },
                    { key: 'drainCleared', label: '3. เป่าล้างท่อน้ำทิ้งและถาดน้ำทิ้ง' },
                    { key: 'filterCleaned', label: '4. ล้างแผ่นฟิลเตอร์กรองฝุ่น' },
                    { key: 'electricalChecked', label: '5. กวดขันจุดเชื่อมต่อไฟฟ้า/แคป' },
                    { key: 'gasLeakChecked', label: '6. ตรวจสอบรอยรั่วซึมน้ำยา' },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <span className="font-medium text-slate-800">{item.label}</span>
                      <input
                        type="checkbox"
                        checked={(checklist as any)[item.key]}
                        onChange={(e) =>
                          setChecklist({ ...checklist, [item.key]: e.target.checked })
                        }
                        className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                      />
                    </label>
                  ))}
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    บันทึกผลการตรวจสอบเพิ่มเติม:
                  </label>
                  <textarea
                    value={checklist.notes || ''}
                    onChange={(e) => setChecklist({ ...checklist, notes: e.target.value })}
                    placeholder="เช่น ลมแรงสม่ำเสมอ แอร์เย็นฉ่ำ ไม่มีกลิ่นอับ..."
                    rows={2}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveChecklist}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-xs"
                  >
                    บันทึกผลการตรวจเช็ค
                  </button>
                </div>
              </div>

              {/* Photos Section */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                    ภาพถ่ายหน้างานจริง ({photos.length} รูป)
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSimulatePhotoUpload('before')}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-medium"
                    >
                      <Upload className="w-3 h-3" />
                      <span>+ รูปก่อนทำ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSimulatePhotoUpload('after')}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-medium"
                    >
                      <Upload className="w-3 h-3" />
                      <span>+ รูปหลังทำ</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {photos.map((p) => (
                    <div key={p.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 group relative">
                      <div className="h-32 bg-slate-200 relative">
                        <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                        <span
                          className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs ${
                            p.type === 'before'
                              ? 'bg-rose-600'
                              : p.type === 'after'
                              ? 'bg-emerald-600'
                              : 'bg-sky-600'
                          }`}
                        >
                          {p.type === 'before' ? 'ก่อนทำ' : p.type === 'after' ? 'หลังทำ' : 'หน้างาน'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeletePhoto(p.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600/90 text-white hover:bg-rose-700 shadow-xs"
                          title="ลบรูปภาพนี้ (รหัส 0000)"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="p-2 text-[11px] text-slate-700">
                        <p className="font-medium line-clamp-1">{p.label}</p>
                        <span className="text-[10px] text-slate-400">{p.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SIGNATURE */}
          {activeTab === 'signature' && (
            <div className="space-y-4">
              <SignaturePad
                initialSignature={job.customerSignature}
                initialSignerName={job.customerSignerName || customer?.name || ''}
                onSave={handleSaveSignature}
              />
            </div>
          )}

          {/* TAB 4: EXPENSES & PROFIT */}
          {activeTab === 'expenses' && (
            <div className="space-y-6">
              {/* Financial KPI Banner */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100">
                  <span className="text-xs text-sky-700 font-semibold block">ยอดเรียกเก็บลูกค้า</span>
                  <span className="text-base sm:text-lg font-bold font-mono text-sky-950">
                    {formatCurrency(job.price)}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-100">
                  <span className="text-xs text-rose-700 font-semibold block">ต้นทุนอะไหล่ & เดินทาง</span>
                  <span className="text-base sm:text-lg font-bold font-mono text-rose-950">
                    {formatCurrency(totalExpenseCost)}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <span className="text-xs text-emerald-700 font-semibold block">
                    กำไรสุทธิ ({profitMarginPercent}%)
                  </span>
                  <span className="text-base sm:text-lg font-bold font-mono text-emerald-950">
                    {formatCurrency(profit)}
                  </span>
                </div>
              </div>

              {/* Expense Table */}
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">
                  รายการค่าใช้จ่ายและอะไหล่ในงานนี้
                </h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold uppercase text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">รายการ</th>
                        <th className="py-2.5 px-3">ประเภท</th>
                        <th className="py-2.5 px-3 text-center">จำนวน</th>
                        <th className="py-2.5 px-3 text-right">ต้นทุนต่อหน่วย</th>
                        <th className="py-2.5 px-3 text-right">รวมต้นทุน</th>
                        <th className="py-2.5 px-2 text-center w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {expenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-medium text-slate-900">{exp.description}</td>
                          <td className="py-2.5 px-3 text-slate-500">
                            {exp.category === 'spare_part'
                              ? 'อะไหล่'
                              : exp.category === 'gas'
                              ? 'น้ำยาแอร์'
                              : exp.category === 'travel'
                              ? 'ค่าเดินทาง'
                              : 'ค่าแรง'}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono">{exp.quantity}</td>
                          <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(exp.cost)}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700">
                            {formatCurrency(exp.cost * exp.quantity)}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="text-slate-400 hover:text-rose-600"
                              title="ลบรายการต้นทุน (รหัส 0000)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add Expense Form */}
              <form
                onSubmit={handleAddExpense}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3"
              >
                <h4 className="font-bold text-slate-800">+ เพิ่มรายการต้นทุน / อะไหล่ที่ใช้</h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={newExpDesc}
                      onChange={(e) => setNewExpDesc(e.target.value)}
                      placeholder="เช่น คาปาซิเตอร์ 35uF หรือ น้ำยา R32 1kg"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <select
                      value={newExpCategory}
                      onChange={(e) => setNewExpCategory(e.target.value as any)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="spare_part">อะไหล่</option>
                      <option value="gas">น้ำยาแอร์</option>
                      <option value="travel">ค่าเดินทาง/น้ำมัน</option>
                      <option value="labor">ค่าแรงช่าง</option>
                    </select>
                  </div>

                  <div>
                    <input
                      type="number"
                      value={newExpCost || ''}
                      onChange={(e) => setNewExpCost(Number(e.target.value))}
                      placeholder="ต้นทุน (บาท)"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>เพิ่มค่าใช้จ่าย</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
