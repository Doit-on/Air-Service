import React, { useState } from 'react';
import { ACUnit, Customer, Job } from '../types';
import { formatThaiDate, getDaysUntil } from '../utils/formatters';
import {
  Search,
  QrCode,
  Bell,
  Shield,
  CheckCircle,
  Plus,
  X,
  ArrowUpRight,
  Edit3,
  Trash2,
  Save,
} from 'lucide-react';

interface ACDatabaseProps {
  acUnits: ACUnit[];
  customers: Customer[];
  jobs: Job[];
  onOpenLineReminder: (acUnit: ACUnit, customer: Customer) => void;
  onSelectJob: (job: Job) => void;
  onAddACUnit: (newUnit: ACUnit) => void;
  onUpdateACUnit: (updatedUnit: ACUnit) => void;
  onDeleteACUnit: (acUnitId: string) => void;
  onRequestProtectedAction: (description: string, callback: () => void) => void;
}

export const ACDatabase: React.FC<ACDatabaseProps> = ({
  acUnits,
  customers,
  jobs,
  onOpenLineReminder,
  onSelectJob,
  onAddACUnit,
  onUpdateACUnit,
  onDeleteACUnit,
  onRequestProtectedAction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'due' | 'overdue' | 'good'>('all');
  const [selectedQRUnit, setSelectedQRUnit] = useState<ACUnit | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<ACUnit | null>(null);

  // Form state for adding new AC
  const [newBrand, setNewBrand] = useState('Daikin');
  const [newBtu, setNewBtu] = useState(12000);
  const [newLocation, setNewLocation] = useState('ห้องนอนใหญ่');
  const [newModel, setNewModel] = useState('');
  const [newCustomerId, setNewCustomerId] = useState(customers[0]?.id || '');
  const [newNotes, setNewNotes] = useState('');

  // Filter AC units
  const filteredUnits = acUnits.filter((unit) => {
    const cust = customers.find((c) => c.id === unit.customerId);
    const searchMatch =
      unit.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.installedLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.qrCodeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cust && cust.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cust && cust.phone.includes(searchTerm));

    if (!searchMatch) return false;

    const daysUntil = getDaysUntil(unit.nextDueDate);
    if (statusFilter === 'due') return daysUntil >= 0 && daysUntil <= 14;
    if (statusFilter === 'overdue') return daysUntil < 0;
    if (statusFilter === 'good') return daysUntil > 14;
    return true;
  });

  const dueCount = acUnits.filter((u) => {
    const d = getDaysUntil(u.nextDueDate);
    return d >= 0 && d <= 14;
  }).length;

  const overdueCount = acUnits.filter((u) => getDaysUntil(u.nextDueDate) < 0).length;

  const handleCreateAC = (e: React.FormEvent) => {
    e.preventDefault();
    const newUnit: ACUnit = {
      id: `ac-${Date.now()}`,
      customerId: newCustomerId || customers[0]?.id || 'cust-default',
      brand: newBrand,
      modelNumber: newModel || `${newBrand}-INVERTER`,
      btu: Number(newBtu),
      type: 'wall',
      installedLocation: newLocation,
      installDate: '2026-10-16',
      lastCleanedDate: '2026-10-16',
      nextDueDate: '2027-04-16',
      qrCodeId: `AC-QR-${Math.floor(10000 + Math.random() * 90000)}`,
      notes: newNotes,
    };
    onAddACUnit(newUnit);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Alert Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-sky-600" />
              <span>ฐานข้อมูลทะเบียนเครื่องปรับอากาศ และระบบแจ้งเตือนรอบล้างอัตโนมัติ</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ติดตามประวัติการซ่อมบำรุงของแต่ละเครื่อง พร้อมแก้ไขหรือลบรายการด้วยรหัสผ่าน 0000
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition-colors self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ ลงทะเบียนแอร์เครื่องใหม่</span>
          </button>
        </div>

        {/* Maintenance Cycle Alert Banner */}
        {(overdueCount > 0 || dueCount > 0) && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-amber-800">
              <Bell className="w-4 h-4 text-amber-600 shrink-0 animate-bounce" />
              <span>
                ตรวจพบแอร์ <strong className="font-bold text-amber-900">{overdueCount} เครื่องเกินกำหนดล้าง</strong> และ{' '}
                <strong className="font-bold text-amber-900">{dueCount} เครื่องใกล้ถึงรอบ 6 เดือน</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setStatusFilter('overdue')}
              className="text-xs font-semibold text-amber-900 underline hover:text-amber-700"
            >
              คลิกดูรายการที่ต้องแจ้งเตือนลูกค้า
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาชื่อลูกค้า, เบอร์โทร, ยี่ห้อแอร์, QR ID..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            ทั้งหมด ({acUnits.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('overdue')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap ${
              statusFilter === 'overdue'
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
            }`}
          >
            เกินกำหนด ({overdueCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('due')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap ${
              statusFilter === 'due'
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
            }`}
          >
            ใกล้ถึงรอบ ({dueCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('good')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap ${
              statusFilter === 'good'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            ปกติ
          </button>
        </div>
      </div>

      {/* AC Units Grid */}
      {filteredUnits.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
          ไม่พบข้อมูลเครื่องปรับอากาศในระบบ
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUnits.map((unit) => {
            const cust = customers.find((c) => c.id === unit.customerId);
            const daysUntil = getDaysUntil(unit.nextDueDate);
            const isOverdue = daysUntil < 0;
            const isDueSoon = daysUntil >= 0 && daysUntil <= 14;

            // Find service history for this AC
            const unitJobs = jobs.filter((j) => j.acUnitId === unit.id);

            return (
              <div
                key={unit.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-sky-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Header: Brand & QR tag */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-sky-700 uppercase tracking-wider bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                        {unit.qrCodeId}
                      </span>
                      <h3 className="font-bold text-base text-slate-900 mt-1">{unit.brand}</h3>
                      <p className="text-xs text-slate-500 font-mono">
                        {unit.btu ? `${unit.btu.toLocaleString()} BTU` : ''} •{' '}
                        {unit.type === 'wall' ? 'ติดผนัง' : 'ฝังฝ้า/แขวน'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          onRequestProtectedAction(
                            `แก้ไขข้อมูลแอร์ ${unit.brand} (${unit.qrCodeId})`,
                            () => setEditingUnit({ ...unit })
                          )
                        }
                        className="p-2 rounded-xl bg-slate-50 hover:bg-sky-50 text-slate-600 hover:text-sky-600 border border-slate-200 transition-colors"
                        title="แก้ไขข้อมูลแอร์ (รหัส 0000)"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onRequestProtectedAction(
                            `ลบข้อมูลแอร์ ${unit.brand} (${unit.qrCodeId})`,
                            () => onDeleteACUnit(unit.id)
                          )
                        }
                        className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 transition-colors"
                        title="ลบข้อมูลแอร์ (รหัส 0000)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedQRUnit(unit)}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-sky-50 text-slate-600 hover:text-sky-600 border border-slate-200 transition-colors"
                        title="ดู QR Code ประจำเครื่อง"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Location & Customer Info */}
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <p className="text-slate-800 font-medium">
                      📍 ตำแหน่ง: <strong>{unit.installedLocation}</strong>
                    </p>
                    <p className="text-slate-600">
                      👤 ลูกค้า: <strong>{cust?.name || '-'}</strong> ({cust?.phone || ''})
                    </p>
                    <p className="text-slate-500 text-[11px] truncate">{cust?.address || ''}</p>
                  </div>

                  {/* Maintenance Due Alert Badge */}
                  <div className="mt-3">
                    {isOverdue ? (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-800">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                          <span>เกินกำหนดล้าง {Math.abs(daysUntil)} วันแล้ว!</span>
                        </div>
                        <span className="text-[11px] font-mono text-rose-600">
                          {formatThaiDate(unit.nextDueDate)}
                        </span>
                      </div>
                    ) : isDueSoon ? (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-800">
                        <div className="flex items-center gap-1.5 font-bold">
                          <Bell className="w-3.5 h-3.5 text-amber-600" />
                          <span>ครบกำหนดล้างในอีก {daysUntil} วัน</span>
                        </div>
                        <span className="text-[11px] font-mono text-amber-700">
                          {formatThaiDate(unit.nextDueDate)}
                        </span>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
                        <div className="flex items-center gap-1.5 font-medium">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>สถานะปกติ (อีก {daysUntil} วัน)</span>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-700">
                          {formatThaiDate(unit.nextDueDate)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Service History Count & Last Service */}
                  <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
                    <span>
                      ประวัติบริการ: <strong>{unitJobs.length} ครั้ง</strong>
                    </span>
                    <span>ล้างล่าสุด: {formatThaiDate(unit.lastCleanedDate || '')}</span>
                  </div>

                  {/* Recent job snippet */}
                  {unitJobs.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {unitJobs.slice(0, 1).map((j) => (
                        <div
                          key={j.id}
                          onClick={() => onSelectJob(j)}
                          className="cursor-pointer p-2 rounded-lg bg-slate-50 border border-slate-100 hover:bg-sky-50 text-[11px] flex items-center justify-between transition-colors"
                        >
                          <div className="truncate mr-2">
                            <span className="font-semibold text-slate-700">{j.jobCode}:</span>{' '}
                            <span className="text-slate-600">{j.title}</span>
                          </div>
                          <ArrowUpRight className="w-3 h-3 text-sky-600 shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Quick Action */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  {cust && (
                    <button
                      type="button"
                      onClick={() => onOpenLineReminder(unit, cust)}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>แจ้งเตือนรอบล้างผ่าน LINE</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Existing AC Unit Modal */}
      {editingUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 my-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                แก้ไขข้อมูลเครื่องปรับอากาศ ({editingUnit.qrCodeId})
              </h3>
              <button
                onClick={() => setEditingUnit(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onUpdateACUnit(editingUnit);
                setEditingUnit(null);
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">รหัส QR Code</label>
                  <input
                    type="text"
                    value={editingUnit.qrCodeId}
                    onChange={(e) => setEditingUnit({ ...editingUnit, qrCodeId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">ลูกค้าเจ้าของเครื่อง</label>
                  <select
                    value={editingUnit.customerId}
                    onChange={(e) =>
                      setEditingUnit({ ...editingUnit, customerId: e.target.value })
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
                  <label className="block font-medium text-slate-700 mb-1">ยี่ห้อ (Brand)</label>
                  <input
                    type="text"
                    value={editingUnit.brand}
                    onChange={(e) => setEditingUnit({ ...editingUnit, brand: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">ขนาดบีทียู (BTU)</label>
                  <input
                    type="number"
                    value={editingUnit.btu}
                    onChange={(e) =>
                      setEditingUnit({ ...editingUnit, btu: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">ตำแหน่งติดตั้ง</label>
                  <input
                    type="text"
                    value={editingUnit.installedLocation}
                    onChange={(e) =>
                      setEditingUnit({ ...editingUnit, installedLocation: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">วันครบกำหนดล้างถัดไป</label>
                  <input
                    type="date"
                    value={editingUnit.nextDueDate}
                    onChange={(e) =>
                      setEditingUnit({ ...editingUnit, nextDueDate: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">บันทึกเพิ่มเติม</label>
                <textarea
                  value={editingUnit.notes || ''}
                  onChange={(e) => setEditingUnit({ ...editingUnit, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUnit(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold"
                >
                  <Save className="w-4 h-4" />
                  <span>บันทึกการแก้ไข</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal for Selected AC */}
      {selectedQRUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-center space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded border border-sky-200">
                เหนือน้ำแอร์ ปทุมธานี • Asset QR Tag
              </span>
              <button
                onClick={() => setSelectedQRUnit(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {selectedQRUnit.brand} {selectedQRUnit.btu?.toLocaleString()} BTU
              </h3>
              <p className="text-xs text-slate-500">{selectedQRUnit.installedLocation}</p>
            </div>

            {/* Generated SVG QR Code representation */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block">
              <svg className="w-48 h-48 mx-auto" viewBox="0 0 120 120">
                <rect width="120" height="120" fill="#ffffff" />
                <rect x="10" y="10" width="30" height="30" fill="#0f172a" />
                <rect x="15" y="15" width="20" height="20" fill="#ffffff" />
                <rect x="20" y="20" width="10" height="10" fill="#0f172a" />

                <rect x="80" y="10" width="30" height="30" fill="#0f172a" />
                <rect x="85" y="15" width="20" height="20" fill="#ffffff" />
                <rect x="90" y="20" width="10" height="10" fill="#0f172a" />

                <rect x="10" y="80" width="30" height="30" fill="#0f172a" />
                <rect x="15" y="85" width="20" height="20" fill="#ffffff" />
                <rect x="20" y="90" width="10" height="10" fill="#0f172a" />

                <rect x="50" y="15" width="5" height="5" fill="#0f172a" />
                <rect x="60" y="20" width="10" height="5" fill="#0f172a" />
                <rect x="50" y="30" width="5" height="10" fill="#0f172a" />
                <rect x="20" y="50" width="10" height="5" fill="#0f172a" />
                <rect x="40" y="50" width="15" height="5" fill="#0f172a" />
                <rect x="65" y="45" width="5" height="15" fill="#0f172a" />
                <rect x="80" y="55" width="10" height="5" fill="#0f172a" />
                <rect x="50" y="70" width="15" height="10" fill="#0f172a" />
                <rect x="75" y="75" width="5" height="15" fill="#0f172a" />
                <rect x="90" y="80" width="15" height="5" fill="#0f172a" />
                <rect x="50" y="95" width="20" height="5" fill="#0f172a" />
                <rect x="85" y="95" width="10" height="10" fill="#0f172a" />

                <circle cx="60" cy="60" r="14" fill="#ffffff" stroke="#38bdf8" strokeWidth="2" />
              </svg>
            </div>

            <p className="text-xs text-slate-600 font-mono font-bold">
              ID: {selectedQRUnit.qrCodeId}
            </p>
            <p className="text-[11px] text-slate-400">
              ติดสติกเกอร์ QR นี้ไว้ที่ตัวเครื่อง ลูกค้าและช่างสามารถสแกนเพื่อเปิดดูประวัติการซ่อมบำรุงได้ทันที
            </p>

            <button
              type="button"
              onClick={() => window.print()}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs"
            >
              พิมพ์สติกเกอร์ QR Code
            </button>
          </div>
        </div>
      )}

      {/* Add New AC Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 my-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-base">ลงทะเบียนเครื่องปรับอากาศใหม่</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAC} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  เลือกลูกค้าเจ้าของเครื่อง
                </label>
                <select
                  value={newCustomerId}
                  onChange={(e) => setNewCustomerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone}) - {c.district}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">ยี่ห้อ (Brand)</label>
                  <select
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="Daikin">Daikin (ไดกิ้น)</option>
                    <option value="Mitsubishi Electric">Mitsubishi Electric Mr.Slim</option>
                    <option value="Carrier">Carrier (แคเรียร์)</option>
                    <option value="Panasonic">Panasonic (พานาโซนิค)</option>
                    <option value="Haier">Haier (ไฮเออร์)</option>
                    <option value="LG">LG Dual Inverter</option>
                    <option value="Samsung">Samsung WindFree</option>
                    <option value="Toshiba">Toshiba</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">ขนาดบีทียู (BTU)</label>
                  <select
                    value={newBtu}
                    onChange={(e) => setNewBtu(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value={9000}>9,000 BTU</option>
                    <option value={12000}>12,000 BTU</option>
                    <option value={15000}>15,000 BTU</option>
                    <option value={18000}>18,000 BTU</option>
                    <option value={24000}>24,000 BTU</option>
                    <option value={30000}>30,000 BTU</option>
                    <option value={36000}>36,000 BTU</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">ตำแหน่งติดตั้ง</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="เช่น ห้องนอนใหญ่ ชั้น 2"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    รุ่น / Serial (ถ้ามี)
                  </label>
                  <input
                    type="text"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    placeholder="เช่น FTKM12WV2S"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  บันทึกเพิ่มเติม / น้ำยาแอร์
                </label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="เช่น ใช้น้ำยา R32 คอยล์ร้อนอยู่ดาดฟ้า..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold"
                >
                  บันทึกข้อมูลเครื่อง
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
