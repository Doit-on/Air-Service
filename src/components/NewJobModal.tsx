import React, { useState, useEffect } from 'react';
import { Customer, ACUnit, Technician, Job, ServiceType } from '../types';
import { SERVICE_TYPE_LABELS } from '../data/mockData';
import { generateJobCode } from '../utils/formatters';
import {
  X,
  Calendar,
  Clock,
  DollarSign,
  Wrench,
  User,
  PlusCircle,
  MapPin,
  Phone,
  Tag,
  CheckCircle2,
} from 'lucide-react';

interface NewJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  acUnits: ACUnit[];
  technicians: Technician[];
  existingJobsCount: number;
  initialDate?: string;
  onSaveJob: (newJob: Job, newCustomer?: Customer, newACUnit?: ACUnit) => void;
}

const PATHUM_THANI_DISTRICTS = [
  'เมืองปทุมธานี',
  'คลองหลวง',
  'ธัญบุรี',
  'ลำลูกกา',
  'สามโคก',
  'ลาดหลุมแก้ว',
  'หนองเสือ',
];

export const NewJobModal: React.FC<NewJobModalProps> = ({
  isOpen,
  onClose,
  customers,
  acUnits,
  technicians,
  existingJobsCount,
  initialDate = '2026-10-16',
  onSaveJob,
}) => {
  // Mode: existing customer vs new customer
  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('existing');

  // Customer selection
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    customers[0]?.id || ''
  );

  // New customer form state
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustDistrict, setNewCustDistrict] = useState('เมืองปทุมธานี');
  const [newCustAddress, setNewCustAddress] = useState('');

  // AC Unit selection or new AC
  const [selectedACId, setSelectedACId] = useState<string>('');
  const [newACBrand, setNewACBrand] = useState('Daikin');
  const [newACBTU, setNewACBTU] = useState<number>(12000);
  const [newACLocation, setNewACLocation] = useState('ห้องนอนใหญ่ ชั้น 2');
  const [newACType, setNewACType] = useState<'wall' | 'cassette' | 'ceiling'>('wall');

  // Job details
  const [selectedService, setSelectedService] = useState<ServiceType>('cleaning_standard');
  const [selectedTechId, setSelectedTechId] = useState<string>(technicians[0]?.id || '');
  const [date, setDate] = useState<string>(initialDate);
  const [timeSlot, setTimeSlot] = useState<string>('09:00 - 11:30');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [customPrice, setCustomPrice] = useState<number>(
    SERVICE_TYPE_LABELS['cleaning_standard']?.defaultPrice || 600
  );
  const [description, setDescription] = useState<string>('');

  // Synchronize when modal opens or initialDate changes
  useEffect(() => {
    if (isOpen) {
      if (initialDate) {
        setDate(initialDate);
      }
      if (customers.length > 0 && !selectedCustomerId) {
        setSelectedCustomerId(customers[0].id);
      }
      if (technicians.length > 0 && !selectedTechId) {
        setSelectedTechId(technicians[0].id);
      }
    }
  }, [isOpen, initialDate, customers, technicians]);

  // Synchronize AC units for selected customer
  const customerUnits = acUnits.filter((u) => u.customerId === selectedCustomerId);

  useEffect(() => {
    if (customerMode === 'existing') {
      if (customerUnits.length > 0) {
        const found = customerUnits.some((u) => u.id === selectedACId);
        if (!found) {
          setSelectedACId(customerUnits[0].id);
        }
      } else if (acUnits.length > 0) {
        setSelectedACId(acUnits[0].id);
      } else {
        setSelectedACId('');
      }
    }
  }, [selectedCustomerId, acUnits, customerUnits.length, customerMode]);

  // Early return is SAFE here because all useState and useEffect hooks have been declared unconditionally above
  if (!isOpen) {
    return null;
  }

  const handleCustomerSelect = (custId: string) => {
    setSelectedCustomerId(custId);
    const units = acUnits.filter((u) => u.customerId === custId);
    if (units.length > 0) {
      setSelectedACId(units[0].id);
    }
  };

  const handleServiceChange = (st: ServiceType) => {
    setSelectedService(st);
    const defaultPrice = SERVICE_TYPE_LABELS[st]?.defaultPrice || 600;
    setCustomPrice(defaultPrice);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalCustomerId = selectedCustomerId;
    let finalACId = selectedACId;
    let createdCustomer: Customer | undefined;
    let createdACUnit: ACUnit | undefined;

    // Handle new customer creation
    if (customerMode === 'new') {
      if (!newCustName.trim()) {
        alert('กรุณากรอกชื่อลูกค้า');
        return;
      }
      const newCustId = `cust-${Date.now()}`;
      finalCustomerId = newCustId;

      const newUnitId = `ac-${Date.now()}`;
      finalACId = newUnitId;

      createdCustomer = {
        id: newCustId,
        name: newCustName.trim(),
        phone: newCustPhone.trim() || '08x-xxx-xxxx',
        district: newCustDistrict,
        subdistrict: 'บางปรอก',
        province: 'ปทุมธานี',
        address: newCustAddress.trim() || `อ.${newCustDistrict} จ.ปทุมธานี`,
        latitude: 14.0205,
        longitude: 100.525,
        acUnitIds: [newUnitId],
      };

      createdACUnit = {
        id: newUnitId,
        customerId: newCustId,
        brand: newACBrand,
        modelNumber: `${newACBrand} Standard Inverter`,
        type: newACType,
        btu: newACBTU,
        installedLocation: newACLocation,
        installDate: '2024-01-15',
        lastCleanedDate: '-',
        nextDueDate: date,
        qrCodeId: `NA-${Date.now().toString().slice(-6)}`,
        notes: 'ลงทะเบียนอัตโนมัติจากระบบจองคิวงาน',
      };
    } else {
      // Existing customer: ensure we have a fallback AC unit ID
      if (!finalACId) {
        finalACId = customerUnits[0]?.id || acUnits[0]?.id || 'ac-default';
      }
    }

    const jobCode = generateJobCode(existingJobsCount);
    const serviceLabel = SERVICE_TYPE_LABELS[selectedService]?.label || 'บริการเครื่องปรับอากาศ';

    const newJob: Job = {
      id: `job-${Date.now()}`,
      jobCode,
      customerId: finalCustomerId,
      acUnitId: finalACId,
      serviceType: selectedService,
      title: serviceLabel,
      description:
        description.trim() ||
        `บริการ ${serviceLabel} โดยทีมช่างผู้เชี่ยวชาญ เหนือน้ำแอร์ ปทุมธานี`,
      status: 'scheduled',
      priority,
      scheduledDate: date,
      timeSlot,
      technicianId: selectedTechId || technicians[0]?.id || 'tech-1',
      estimatedHours: 2,
      price: Number(customPrice) || 600,
      depositPaid: 0,
      expenses: [],
      quotation: {
        quotationNo: `QT-2026-${(1000 + existingJobsCount + 1).toString()}`,
        date,
        validUntil: date,
        items: [
          {
            id: '1',
            description: serviceLabel,
            quantity: 1,
            unit: 'เครื่อง',
            unitPrice: Number(customPrice) || 600,
            total: Number(customPrice) || 600,
          },
        ],
        discount: 0,
        taxPercent: 7,
        notes: 'รับประกันคุณภาพงานบริการตามมาตรฐาน เหนือน้ำแอร์ ปทุมธานี',
        status: 'draft',
      },
      checklist: {
        coilCleaned: false,
        condenserCleaned: false,
        drainCleared: false,
        filterCleaned: false,
        electricalChecked: false,
        gasLeakChecked: false,
      },
      photos: [],
      warrantyDays: selectedService.includes('cleaning') ? 30 : 90,
      createdAt: '2026-10-16 11:00',
    };

    onSaveJob(newJob, createdCustomer, createdACUnit);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full p-5 sm:p-6 space-y-4 my-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shadow-inner">
              <Calendar className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                <span>เปิดใบสั่งงาน / จองคิวนัดหมายใหม่</span>
                <span className="text-[10px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-semibold">
                  เหนือน้ำแอร์ ปทุมธานี
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                บันทึกคิวนัดหมายงานบริการ พร้อมจัดสรรช่างและคำนวณราคาอัตโนมัติ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customer Type Selector Tabs */}
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setCustomerMode('existing')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              customerMode === 'existing'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>เลือกลูกค้าเดิมในระบบ ({customers.length} ราย)</span>
          </button>
          <button
            type="button"
            onClick={() => setCustomerMode('new')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              customerMode === 'new'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ ลงทะเบียนลูกค้าใหม่</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Customer & Unit Selection (Existing) */}
          {customerMode === 'existing' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>เลือกลูกค้า</span>
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => handleCustomerSelect(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white font-medium"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.district}) - {c.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5 text-slate-500" />
                  <span>เครื่องปรับอากาศที่รับบริการ</span>
                </label>
                <select
                  value={selectedACId}
                  onChange={(e) => setSelectedACId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white font-medium"
                >
                  {customerUnits.length > 0 ? (
                    customerUnits.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.brand} {u.btu ? `${u.btu.toLocaleString()} BTU` : ''} ({u.installedLocation})
                      </option>
                    ))
                  ) : (
                    <option value="">(ใช้ข้อมูลเครื่องปรับอากาศทั่วไปของลูกค้า)</option>
                  )}
                </select>
              </div>
            </div>
          ) : (
            /* New Customer & Unit Fields */
            <div className="space-y-3 p-3.5 bg-sky-50/50 rounded-2xl border border-sky-200">
              <div className="text-[11px] font-bold text-sky-800 uppercase flex items-center gap-1">
                <PlusCircle className="w-3.5 h-3.5" />
                <span>ข้อมูลลูกค้าและสถานที่ จ.ปทุมธานี</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ชื่อลูกค้า / องค์กร *
                  </label>
                  <input
                    type="text"
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    placeholder="เช่น คุณกานดา หรือ บจก.สยาม..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                    required={customerMode === 'new'}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>เบอร์โทรศัพท์</span>
                  </label>
                  <input
                    type="tel"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    placeholder="081-xxx-xxxx"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>อำเภอ (จ.ปทุมธานี)</span>
                  </label>
                  <select
                    value={newCustDistrict}
                    onChange={(e) => setNewCustDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    {PATHUM_THANI_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        อ.{d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ที่อยู่ / ซอย / จุดสังเกต
                </label>
                <input
                  type="text"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  placeholder="เช่น 88/12 หมู่บ้านศุภาลัยการ์เด้น ซอยคลองหลวง 5"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                />
              </div>

              {/* Quick AC Info */}
              <div className="pt-2 border-t border-sky-100 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ยี่ห้อแอร์
                  </label>
                  <select
                    value={newACBrand}
                    onChange={(e) => setNewACBrand(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white font-medium"
                  >
                    <option value="Daikin">Daikin (ไดกิ้น)</option>
                    <option value="Mitsubishi Electric">Mitsubishi (มิตซูบิชิ)</option>
                    <option value="Carrier">Carrier (แคเรียร์)</option>
                    <option value="Panasonic">Panasonic (พานาโซนิค)</option>
                    <option value="Central Air">Central Air (เซ็นทรัลแอร์)</option>
                    <option value="Haier">Haier (ไฮเออร์)</option>
                    <option value="Samsung">Samsung (ซัมซุง)</option>
                    <option value="อื่นๆ">ยี่ห้ออื่นๆ</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ขนาด BTU
                  </label>
                  <select
                    value={newACBTU}
                    onChange={(e) => setNewACBTU(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white font-mono"
                  >
                    <option value={9000}>9,000 BTU</option>
                    <option value={12000}>12,000 BTU</option>
                    <option value={15000}>15,000 BTU</option>
                    <option value={18000}>18,000 BTU</option>
                    <option value={24000}>24,000 BTU</option>
                    <option value={30000}>30,000 BTU ขึ้นไป</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ตำแหน่งติดตั้ง
                  </label>
                  <input
                    type="text"
                    value={newACLocation}
                    onChange={(e) => setNewACLocation(e.target.value)}
                    placeholder="เช่น ห้องนอน, ห้องนั่งเล่น"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Service Type Selection */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-slate-500" />
              <span>ประเภทบริการหลัก (Service Type)</span>
            </label>
            <select
              value={selectedService}
              onChange={(e) => handleServiceChange(e.target.value as ServiceType)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white font-medium text-slate-800"
            >
              {Object.entries(SERVICE_TYPE_LABELS).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label} (ราคาเริ่มต้น ฿{item.defaultPrice.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {/* Technician & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                มอบหมายช่างผู้รับผิดชอบ
              </label>
              <select
                value={selectedTechId}
                onChange={(e) => setSelectedTechId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white font-medium"
              >
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nickname} ({t.name}) - {t.vehicle}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ระดับความเร่งด่วน (Priority)
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              >
                <option value="normal">ปกติ (Normal)</option>
                <option value="high">ด่วน (High Priority)</option>
                <option value="urgent">ด่วนที่สุด / น้ำรั่ว / แอร์ไม่เย็น (Urgent)</option>
                <option value="low">ไม่เร่งด่วน (Low)</option>
              </select>
            </div>
          </div>

          {/* Date, Time & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>วันที่นัดหมาย</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white font-medium"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>ช่วงเวลาบริการ</span>
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              >
                <option value="09:00 - 11:30">09:00 - 11:30 (เช้า)</option>
                <option value="13:00 - 15:30">13:00 - 15:30 (บ่าย)</option>
                <option value="16:00 - 18:30">16:00 - 18:30 (เย็น)</option>
                <option value="19:00 - 21:00">19:00 - 21:00 (ค่ำ/ด่วน)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>ราคาค่าบริการ (บาท)</span>
              </label>
              <input
                type="number"
                value={customPrice}
                onChange={(e) => setCustomPrice(Number(e.target.value))}
                min={0}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white font-mono font-bold text-slate-900"
                required
              />
            </div>
          </div>

          {/* Details / Symptoms */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              อาการเบื้องต้น / ความต้องการลูกค้า
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="เช่น ลูกค้าแจ้งแอร์เปิดไม่เย็น มีกลิ่นอับ และต้องการตรวจเช็คน้ำยาแอร์..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>บันทึกและเปิดงานทันที</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
