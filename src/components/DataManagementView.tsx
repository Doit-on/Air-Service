import React, { useState } from 'react';
import { Job, Customer, ACUnit, Technician, LineNotification, JobStatus, ServiceType } from '../types';
import { JOB_STATUS_LABELS, SERVICE_TYPE_LABELS } from '../data/mockData';
import { formatCurrency, formatThaiDate } from '../utils/formatters';
import {
  Lock,
  Unlock,
  Trash2,
  Edit3,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Layers,
  Users,
  Shield,
  Wrench,
  X,
  Save,
  KeyRound,
} from 'lucide-react';

interface DataManagementViewProps {
  isEditUnlocked: boolean;
  onUnlockWithPassword: () => void;
  onLockEditMode: () => void;
  jobs: Job[];
  customers: Customer[];
  acUnits: ACUnit[];
  technicians: Technician[];
  notifications: LineNotification[];
  onUpdateJob: (job: Job) => void;
  onDeleteJob: (jobId: string) => void;
  onSaveCustomer: (customer: Customer, isNew: boolean) => void;
  onDeleteCustomer: (customerId: string) => void;
  onSaveACUnit: (acUnit: ACUnit, isNew: boolean) => void;
  onDeleteACUnit: (acUnitId: string) => void;
  onSaveTechnician: (tech: Technician, isNew: boolean) => void;
  onDeleteTechnician: (techId: string) => void;
  onClearSelectedData: (options: {
    clearJobs: boolean;
    clearCustomers: boolean;
    clearACUnits: boolean;
    clearNotifications: boolean;
    clearTechnicians: boolean;
  }) => void;
  onResetDefaultData: () => void;
}

export const DataManagementView: React.FC<DataManagementViewProps> = ({
  isEditUnlocked,
  onUnlockWithPassword,
  onLockEditMode,
  jobs,
  customers,
  acUnits,
  technicians,
  notifications,
  onUpdateJob,
  onDeleteJob,
  onSaveCustomer,
  onDeleteCustomer,
  onSaveACUnit,
  onDeleteACUnit,
  onSaveTechnician,
  onDeleteTechnician,
  onClearSelectedData,
  onResetDefaultData,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [subTab, setSubTab] = useState<'jobs' | 'customers' | 'ac_units' | 'technicians'>('jobs');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Bulk clear checkboxes
  const [clearJobs, setClearJobs] = useState(true);
  const [clearCustomers, setClearCustomers] = useState(true);
  const [clearACUnits, setClearACUnits] = useState(true);
  const [clearNotifications, setClearNotifications] = useState(true);
  const [clearTechnicians, setClearTechnicians] = useState(false);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  // Editing modals state
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<{ data: Customer; isNew: boolean } | null>(null);
  const [editingAC, setEditingAC] = useState<{ data: ACUnit; isNew: boolean } | null>(null);
  const [editingTech, setEditingTech] = useState<{ data: Technician; isNew: boolean } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === '0000') {
      setPinError('');
      setPinInput('');
      onUnlockWithPassword();
      showToast('ปลดล็อกระบบแก้ไขและลบข้อมูลสำเร็จ (รหัส 0000)');
    } else {
      setPinError('รหัสผ่านไม่ถูกต้อง! กรุณาใช้รหัสผ่าน 0000 เพื่อเข้าถึงการแก้ไข/ลบข้อมูล');
      setPinInput('');
    }
  };

  // Locked screen if password 0000 not entered yet
  if (!isEditUnlocked) {
    return (
      <div className="max-w-lg mx-auto my-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-lg text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
            <KeyRound className="w-3.5 h-3.5" />
            <span>ระบบป้องกันการแก้ไขและลบข้อมูล</span>
          </span>
          <h2 className="text-xl font-bold text-slate-900">
            ศูนย์จัดการฐานข้อมูล แก้ไข และลบข้อมูลตัวอย่าง
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            กรุณากรอกรหัสผ่านผู้ดูแลระบบ <strong className="text-slate-800 font-mono">0000</strong> เพื่ออนุญาตให้แก้ไขข้อมูล หรือลบข้อมูลตัวอย่างที่ค้างอยู่ก่อนนำไปใช้งานจริง
          </p>
        </div>

        <form onSubmit={handlePinSubmit} className="space-y-4">
          <input
            type="password"
            inputMode="numeric"
            maxLength={8}
            value={pinInput}
            onChange={(e) => {
              setPinInput(e.target.value);
              if (pinError) setPinError('');
            }}
            placeholder="กรอกรหัสผ่าน 0000"
            className="w-full px-4 py-3.5 text-center text-xl font-mono font-bold tracking-[0.4em] rounded-2xl border-2 border-slate-300 focus:border-sky-600 focus:outline-none focus:ring-4 focus:ring-sky-500/15 bg-slate-50 focus:bg-white text-slate-900"
            autoFocus
            required
          />

          {pinError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{pinError}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 transition-all"
          >
            <Unlock className="w-4 h-4" />
            <span>ปลดล็อกระบบแก้ไขและลบข้อมูล (0000)</span>
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Status & Sample Data Cleaner Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
              <Unlock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  ศูนย์จัดการ แก้ไข และลบข้อมูลระบบ (ปลดล็อกด้วยรหัส 0000 แล้ว)
                </h2>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Edit Mode Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                คุณสามารถแก้ไขหรือลบข้อมูลรายรายการ หรือล้างข้อมูลตัวอย่างทั้งหมดเพื่อเริ่มใช้งานจริงได้ทันที
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onResetDefaultData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>กู้คืนข้อมูลตัวอย่าง</span>
            </button>

            <button
              type="button"
              onClick={onLockEditMode}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>ล็อกโหมดแก้ไข</span>
            </button>
          </div>
        </div>

        {/* Bulk Sample Data Wipe Panel */}
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm text-rose-950">
                  ล้างข้อมูลตัวอย่างที่ค้างอยู่ (สำหรับเริ่มใช้งานจริง)
                </h3>
                <p className="text-xs text-rose-700 mt-0.5">
                  เลือกหมวดหมู่ข้อมูลที่ต้องการลบออกทั้งหมด เพื่อเคลียร์ระบบให้พร้อมรับข้อมูลลูกค้าจริงของบริษัท
                </p>
              </div>
            </div>

            {!showBulkConfirm ? (
              <button
                type="button"
                onClick={() => setShowBulkConfirm(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors shrink-0 self-start sm:self-auto"
              >
                <Trash2 className="w-4 h-4" />
                <span>ลบข้อมูลตามหมวดหมู่ที่เลือก</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setShowBulkConfirm(false)}
                  className="px-3 py-2 rounded-xl border border-rose-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClearSelectedData({
                      clearJobs,
                      clearCustomers,
                      clearACUnits,
                      clearNotifications,
                      clearTechnicians,
                    });
                    setShowBulkConfirm(false);
                    showToast('ลบข้อมูลตัวอย่างตามหมวดหมู่ที่เลือกเรียบร้อยแล้ว!');
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow-sm"
                >
                  ยืนยันลบข้อมูลทันที!
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 text-xs pt-1">
            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-rose-200 cursor-pointer hover:border-rose-400">
              <input
                type="checkbox"
                checked={clearJobs}
                onChange={(e) => setClearJobs(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded"
              />
              <span className="font-semibold text-slate-800">
                คิวงานทั้งหมด ({jobs.length})
              </span>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-rose-200 cursor-pointer hover:border-rose-400">
              <input
                type="checkbox"
                checked={clearCustomers}
                onChange={(e) => setClearCustomers(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded"
              />
              <span className="font-semibold text-slate-800">
                ข้อมูลลูกค้า ({customers.length})
              </span>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-rose-200 cursor-pointer hover:border-rose-400">
              <input
                type="checkbox"
                checked={clearACUnits}
                onChange={(e) => setClearACUnits(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded"
              />
              <span className="font-semibold text-slate-800">
                ทะเบียนแอร์ ({acUnits.length})
              </span>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-rose-200 cursor-pointer hover:border-rose-400">
              <input
                type="checkbox"
                checked={clearNotifications}
                onChange={(e) => setClearNotifications(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded"
              />
              <span className="font-semibold text-slate-800">
                ประวัติแจ้งเตือน ({notifications.length})
              </span>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-rose-200 cursor-pointer hover:border-rose-400">
              <input
                type="checkbox"
                checked={clearTechnicians}
                onChange={(e) => setClearTechnicians(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded"
              />
              <span className="font-semibold text-slate-800">
                รายชื่อช่าง ({technicians.length})
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Sub-navigation Tabs for Individual Record Editing & Deleting */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSubTab('jobs')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                subTab === 'jobs'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>1. คิวงาน/ใบสั่งงาน ({jobs.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab('customers')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                subTab === 'customers'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>2. ข้อมูลลูกค้า ({customers.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab('ac_units')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                subTab === 'ac_units'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>3. ทะเบียนแอร์ ({acUnits.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab('technicians')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                subTab === 'technicians'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>4. ทีมช่างเทคนิค ({technicians.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหารายการเพื่อแก้ไขหรือลบ..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {subTab === 'customers' && (
              <button
                type="button"
                onClick={() =>
                  setEditingCustomer({
                    isNew: true,
                    data: {
                      id: `cust-${Date.now()}`,
                      name: '',
                      phone: '',
                      lineId: '',
                      address: '',
                      subdistrict: 'บางปรอก',
                      district: 'เมืองปทุมธานี',
                      province: 'ปทุมธานี',
                      latitude: 14.0205,
                      longitude: 100.525,
                      acUnitIds: [],
                    },
                  })
                }
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ เพิ่มลูกค้า</span>
              </button>
            )}

            {subTab === 'ac_units' && (
              <button
                type="button"
                onClick={() =>
                  setEditingAC({
                    isNew: true,
                    data: {
                      id: `ac-${Date.now()}`,
                      customerId: customers[0]?.id || '',
                      brand: 'Daikin',
                      modelNumber: 'Inverter R32',
                      btu: 12000,
                      type: 'wall',
                      installedLocation: 'ห้องนอนใหญ่',
                      installDate: '2026-10-16',
                      lastCleanedDate: '2026-10-16',
                      nextDueDate: '2027-04-16',
                      qrCodeId: `AC-QR-${Math.floor(10000 + Math.random() * 90000)}`,
                      notes: '',
                    },
                  })
                }
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ เพิ่มแอร์</span>
              </button>
            )}

            {subTab === 'technicians' && (
              <button
                type="button"
                onClick={() =>
                  setEditingTech({
                    isNew: true,
                    data: {
                      id: `tech-${Date.now()}`,
                      name: '',
                      nickname: '',
                      phone: '',
                      avatar: '/29068.jpg',
                      vehicle: 'รถกระบะบริการ ปทุมธานี',
                      rating: 5.0,
                      completedJobsCount: 0,
                      color: '#0284c7',
                    },
                  })
                }
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ เพิ่มช่างใหม่</span>
              </button>
            )}
          </div>
        </div>

        {/* SUB-TAB 1: JOBS TABLE */}
        {subTab === 'jobs' && (
          <div className="overflow-x-auto">
            {jobs.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                ไม่มีข้อมูลคิวงานในระบบ (ข้อมูลถูกลบหมดแล้ว พร้อมเริ่มเปิดใบงานจริง)
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">รหัสงาน</th>
                    <th className="py-3 px-4">หัวข้องาน & รายละเอียด</th>
                    <th className="py-3 px-4">ลูกค้า</th>
                    <th className="py-3 px-4">วัน & เวลานัด</th>
                    <th className="py-3 px-4">สถานะ</th>
                    <th className="py-3 px-4 text-right">ราคา</th>
                    <th className="py-3 px-4 text-center">แก้ไข / ลบ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {jobs
                    .filter(
                      (j) =>
                        j.jobCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        j.description.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((job) => {
                      const cust = customers.find((c) => c.id === job.customerId);
                      const stInfo = JOB_STATUS_LABELS[job.status] || JOB_STATUS_LABELS.pending;
                      return (
                        <tr key={job.id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4 font-mono font-bold text-slate-800">
                            {job.jobCode}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-bold text-slate-900">{job.title}</p>
                            <p className="text-[11px] text-slate-500 truncate max-w-xs">
                              {job.description}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium text-slate-800">{cust?.name || '-'}</p>
                            <span className="text-[11px] text-slate-400">{cust?.phone || ''}</span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">
                            <p>{formatThaiDate(job.scheduledDate)}</p>
                            <span className="text-[10px] text-slate-400">{job.timeSlot}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${stInfo.bg} ${stInfo.color}`}
                            >
                              {stInfo.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                            {formatCurrency(job.price)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingJob({ ...job })}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 font-semibold"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>แก้ไข</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteJob(job.id);
                                  showToast(`ลบใบงาน ${job.jobCode} เรียบร้อยแล้ว`);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-semibold"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>ลบ</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* SUB-TAB 2: CUSTOMERS TABLE */}
        {subTab === 'customers' && (
          <div className="overflow-x-auto">
            {customers.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                ไม่มีข้อมูลลูกค้าในระบบ (กดปุ่ม "+ เพิ่มลูกค้า" ด้านบนเพื่อเพิ่มข้อมูลใหม่)
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">ชื่อลูกค้า</th>
                    <th className="py-3 px-4">เบอร์โทรศัพท์</th>
                    <th className="py-3 px-4">ที่อยู่</th>
                    <th className="py-3 px-4">อำเภอ/จังหวัด</th>
                    <th className="py-3 px-4 text-center">แก้ไข / ลบ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers
                    .filter(
                      (c) =>
                        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        c.phone.includes(searchQuery) ||
                        c.address.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((cust) => (
                      <tr key={cust.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-bold text-slate-900">{cust.name}</td>
                        <td className="py-3 px-4 font-mono text-slate-700">{cust.phone}</td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{cust.address}</td>
                        <td className="py-3 px-4 text-slate-600">
                          ต.{cust.subdistrict} อ.{cust.district} จ.{cust.province}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingCustomer({ data: { ...cust }, isNew: false })}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 font-semibold"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>แก้ไข</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteCustomer(cust.id);
                                showToast(`ลบข้อมูลลูกค้า ${cust.name} เรียบร้อยแล้ว`);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-semibold"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>ลบ</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* SUB-TAB 3: AC UNITS TABLE */}
        {subTab === 'ac_units' && (
          <div className="overflow-x-auto">
            {acUnits.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                ไม่มีข้อมูลทะเบียนแอร์ในระบบ (กดปุ่ม "+ เพิ่มแอร์" ด้านบนเพื่อลงทะเบียนเครื่องใหม่)
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">QR ID</th>
                    <th className="py-3 px-4">ยี่ห้อ & ขนาด BTU</th>
                    <th className="py-3 px-4">ตำแหน่งติดตั้ง</th>
                    <th className="py-3 px-4">เจ้าของเครื่อง</th>
                    <th className="py-3 px-4">กำหนดล้างรอบถัดไป</th>
                    <th className="py-3 px-4 text-center">แก้ไข / ลบ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {acUnits
                    .filter(
                      (u) =>
                        u.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        u.qrCodeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        u.installedLocation.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((unit) => {
                      const cust = customers.find((c) => c.id === unit.customerId);
                      return (
                        <tr key={unit.id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4 font-mono font-bold text-sky-700">
                            {unit.qrCodeId}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-bold text-slate-900">
                              {unit.brand} ({unit.btu.toLocaleString()} BTU)
                            </p>
                            <span className="text-[11px] text-slate-400">{unit.modelNumber}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-700">{unit.installedLocation}</td>
                          <td className="py-3 px-4 text-slate-700">{cust?.name || '-'}</td>
                          <td className="py-3 px-4 font-mono text-slate-600">
                            {formatThaiDate(unit.nextDueDate)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingAC({ data: { ...unit }, isNew: false })}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 font-semibold"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>แก้ไข</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteACUnit(unit.id);
                                  showToast(`ลบทะเบียนแอร์ ${unit.qrCodeId} เรียบร้อยแล้ว`);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-semibold"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>ลบ</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* SUB-TAB 4: TECHNICIANS TABLE */}
        {subTab === 'technicians' && (
          <div className="overflow-x-auto">
            {technicians.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                ไม่มีรายชื่อช่างในระบบ (กดปุ่ม "+ เพิ่มช่างใหม่" ด้านบนเพื่อเพิ่มรายชื่อช่าง)
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">ชื่อเรียก (Nickname)</th>
                    <th className="py-3 px-4">ชื่อ-นามสกุลจริง</th>
                    <th className="py-3 px-4">เบอร์โทร</th>
                    <th className="py-3 px-4">รถบริการ / ความเชี่ยวชาญ</th>
                    <th className="py-3 px-4 text-center">แก้ไข / ลบ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {technicians
                    .filter(
                      (t) =>
                        t.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        t.phone.includes(searchQuery)
                    )
                    .map((tech) => (
                      <tr key={tech.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4">
                          <span
                            className="inline-block px-2.5 py-1 rounded-full text-white font-bold text-xs"
                            style={{ backgroundColor: tech.color || '#0284c7' }}
                          >
                            {tech.nickname}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">{tech.name}</td>
                        <td className="py-3 px-4 font-mono text-slate-700">{tech.phone}</td>
                        <td className="py-3 px-4 text-slate-600">{tech.vehicle}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingTech({ data: { ...tech }, isNew: false })}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 font-semibold"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>แก้ไข</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteTechnician(tech.id);
                                showToast(`ลบข้อมูล ${tech.nickname} เรียบร้อยแล้ว`);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-semibold"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>ลบ</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: EDIT JOB */}
      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-4 my-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                แก้ไขข้อมูลใบสั่งงาน ({editingJob.jobCode})
              </h3>
              <button
                type="button"
                onClick={() => setEditingJob(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onUpdateJob(editingJob);
                setEditingJob(null);
                showToast(`บันทึกการแก้ไขใบงาน ${editingJob.jobCode} เรียบร้อยแล้ว`);
              }}
              className="space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">รหัสใบงาน</label>
                  <input
                    type="text"
                    value={editingJob.jobCode}
                    onChange={(e) => setEditingJob({ ...editingJob, jobCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">สถานะงาน</label>
                  <select
                    value={editingJob.status}
                    onChange={(e) =>
                      setEditingJob({ ...editingJob, status: e.target.value as JobStatus })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold"
                  >
                    {Object.entries(JOB_STATUS_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">หัวข้องานบริการ</label>
                <input
                  type="text"
                  value={editingJob.title}
                  onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ลูกค้า</label>
                  <select
                    value={editingJob.customerId}
                    onChange={(e) => setEditingJob({ ...editingJob, customerId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ช่างผู้รับผิดชอบ</label>
                  <select
                    value={editingJob.technicianId}
                    onChange={(e) =>
                      setEditingJob({ ...editingJob, technicianId: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    {technicians.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nickname} ({t.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">วันที่นัดหมาย</label>
                  <input
                    type="date"
                    value={editingJob.scheduledDate}
                    onChange={(e) =>
                      setEditingJob({ ...editingJob, scheduledDate: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ช่วงเวลา</label>
                  <input
                    type="text"
                    value={editingJob.timeSlot}
                    onChange={(e) => setEditingJob({ ...editingJob, timeSlot: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ราคา (บาท)</label>
                  <input
                    type="number"
                    value={editingJob.price}
                    onChange={(e) =>
                      setEditingJob({ ...editingJob, price: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">รายละเอียดงาน</label>
                <textarea
                  rows={2}
                  value={editingJob.description}
                  onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold"
                >
                  <Save className="w-4 h-4" />
                  <span>บันทึกการแก้ไข</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT / ADD CUSTOMER */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 my-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                {editingCustomer.isNew ? 'เพิ่มข้อมูลลูกค้าใหม่' : 'แก้ไขข้อมูลลูกค้า'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingCustomer(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSaveCustomer(editingCustomer.data, editingCustomer.isNew);
                setEditingCustomer(null);
                showToast('บันทึกข้อมูลลูกค้าเรียบร้อยแล้ว');
              }}
              className="space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ชื่อลูกค้า / บริษัท *</label>
                  <input
                    type="text"
                    value={editingCustomer.data.name}
                    onChange={(e) =>
                      setEditingCustomer({
                        ...editingCustomer,
                        data: { ...editingCustomer.data, name: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์ *</label>
                  <input
                    type="text"
                    value={editingCustomer.data.phone}
                    onChange={(e) =>
                      setEditingCustomer({
                        ...editingCustomer,
                        data: { ...editingCustomer.data, phone: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ที่อยู่บ้านเลขที่ / หมู่บ้าน / ซอย</label>
                <input
                  type="text"
                  value={editingCustomer.data.address}
                  onChange={(e) =>
                    setEditingCustomer({
                      ...editingCustomer,
                      data: { ...editingCustomer.data, address: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ตำบล</label>
                  <input
                    type="text"
                    value={editingCustomer.data.subdistrict}
                    onChange={(e) =>
                      setEditingCustomer({
                        ...editingCustomer,
                        data: { ...editingCustomer.data, subdistrict: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">อำเภอ</label>
                  <input
                    type="text"
                    value={editingCustomer.data.district}
                    onChange={(e) =>
                      setEditingCustomer({
                        ...editingCustomer,
                        data: { ...editingCustomer.data, district: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">จังหวัด</label>
                  <input
                    type="text"
                    value={editingCustomer.data.province}
                    onChange={(e) =>
                      setEditingCustomer({
                        ...editingCustomer,
                        data: { ...editingCustomer.data, province: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold"
                >
                  <Save className="w-4 h-4" />
                  <span>บันทึกข้อมูลลูกค้า</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT / ADD AC UNIT */}
      {editingAC && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 my-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                {editingAC.isNew ? 'เพิ่มทะเบียนแอร์ใหม่' : `แก้ไขทะเบียนแอร์ (${editingAC.data.qrCodeId})`}
              </h3>
              <button
                type="button"
                onClick={() => setEditingAC(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSaveACUnit(editingAC.data, editingAC.isNew);
                setEditingAC(null);
                showToast('บันทึกข้อมูลทะเบียนแอร์เรียบร้อยแล้ว');
              }}
              className="space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">รหัส QR Code</label>
                  <input
                    type="text"
                    value={editingAC.data.qrCodeId}
                    onChange={(e) =>
                      setEditingAC({
                        ...editingAC,
                        data: { ...editingAC.data, qrCodeId: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ลูกค้าเจ้าของเครื่อง</label>
                  <select
                    value={editingAC.data.customerId}
                    onChange={(e) =>
                      setEditingAC({
                        ...editingAC,
                        data: { ...editingAC.data, customerId: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ยี่ห้อแอร์ (Brand)</label>
                  <input
                    type="text"
                    value={editingAC.data.brand}
                    onChange={(e) =>
                      setEditingAC({
                        ...editingAC,
                        data: { ...editingAC.data, brand: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ขนาด BTU</label>
                  <input
                    type="number"
                    value={editingAC.data.btu}
                    onChange={(e) =>
                      setEditingAC({
                        ...editingAC,
                        data: { ...editingAC.data, btu: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ตำแหน่งติดตั้ง</label>
                  <input
                    type="text"
                    value={editingAC.data.installedLocation}
                    onChange={(e) =>
                      setEditingAC({
                        ...editingAC,
                        data: { ...editingAC.data, installedLocation: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">วันครบกำหนดล้างถัดไป</label>
                  <input
                    type="date"
                    value={editingAC.data.nextDueDate}
                    onChange={(e) =>
                      setEditingAC({
                        ...editingAC,
                        data: { ...editingAC.data, nextDueDate: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">รุ่น / บันทึกเพิ่มเติม</label>
                <input
                  type="text"
                  value={editingAC.data.notes || ''}
                  onChange={(e) =>
                    setEditingAC({
                      ...editingAC,
                      data: { ...editingAC.data, notes: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingAC(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold"
                >
                  <Save className="w-4 h-4" />
                  <span>บันทึกข้อมูลแอร์</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT / ADD TECHNICIAN */}
      {editingTech && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 my-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                {editingTech.isNew ? 'เพิ่มช่างเทคนิคใหม่' : `แก้ไขข้อมูลช่าง (${editingTech.data.nickname})`}
              </h3>
              <button
                type="button"
                onClick={() => setEditingTech(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSaveTechnician(editingTech.data, editingTech.isNew);
                setEditingTech(null);
                showToast('บันทึกข้อมูลช่างเทคนิคเรียบร้อยแล้ว');
              }}
              className="space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ชื่อเรียกช่าง (เช่น ช่างเอก) *</label>
                  <input
                    type="text"
                    value={editingTech.data.nickname}
                    onChange={(e) =>
                      setEditingTech({
                        ...editingTech,
                        data: { ...editingTech.data, nickname: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ชื่อ-นามสกุลจริง *</label>
                  <input
                    type="text"
                    value={editingTech.data.name}
                    onChange={(e) =>
                      setEditingTech({
                        ...editingTech,
                        data: { ...editingTech.data, name: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                  <input
                    type="text"
                    value={editingTech.data.phone}
                    onChange={(e) =>
                      setEditingTech({
                        ...editingTech,
                        data: { ...editingTech.data, phone: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">สีป้ายประจำตัวช่าง</label>
                  <input
                    type="color"
                    value={editingTech.data.color}
                    onChange={(e) =>
                      setEditingTech({
                        ...editingTech,
                        data: { ...editingTech.data, color: e.target.value },
                      })
                    }
                    className="w-full h-9 p-1 rounded-xl border border-slate-300 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">รถบริการ / ความเชี่ยวชาญ</label>
                <input
                  type="text"
                  value={editingTech.data.vehicle}
                  onChange={(e) =>
                    setEditingTech({
                      ...editingTech,
                      data: { ...editingTech.data, vehicle: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTech(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold"
                >
                  <Save className="w-4 h-4" />
                  <span>บันทึกข้อมูลช่าง</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
