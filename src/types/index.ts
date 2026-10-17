export type UserRole = 'admin' | 'technician' | 'customer';

export type JobStatus =
  | 'pending'           // รอนัดหมาย/รอดำเนินการ
  | 'scheduled'         // นัดหมายแล้ว
  | 'en_route'          // ช่างกำลังเดินทาง
  | 'in_progress'       // กำลังปฏิบัติงาน
  | 'pending_payment'   // รอชำระเงิน/ตรวจรับ
  | 'completed'         // เสร็จสมบูรณ์
  | 'cancelled';        // ยกเลิก

export type ServiceType =
  | 'cleaning_standard'  // ล้างแอร์ติดผนังทั่วไป
  | 'cleaning_deep'      // ล้างแอร์แบบถอดล้างใหญ่
  | 'cleaning_cassette'  // ล้างแอร์ฝังฝ้า / แขวน
  | 'gas_refill'         // เติมน้ำยาแอร์ R32/R410A
  | 'leak_repair'        // ซ่อมแอร์น้ำรั่ว/น้ำหยด
  | 'cool_repair'        // ซ่อมแอร์ไม่เย็น / เช็คคอมเพรสเซอร์
  | 'board_repair'       // ซ่อมแผงวงจร / มอเตอร์
  | 'installation'       // ติดตั้งแอร์เครื่องใหม่
  | 'maintenance_annual';// สัญญาบริการบำรุงรักษาประจำปี

export interface Technician {
  id: string;
  name: string;
  nickname: string;
  phone: string;
  avatar: string;
  vehicle: string;
  rating: number;
  completedJobsCount: number;
  color: string;
}

export interface ACUnit {
  id: string;
  customerId: string;
  brand: string;         // e.g. Daikin, Mitsubishi, Carrier
  modelNumber: string;
  btu: number;           // e.g. 9000, 12000, 18000, 24000
  type: 'wall' | 'cassette' | 'ceiling' | 'floor';
  installedLocation: string; // e.g. ห้องนอนใหญ่ (ชั้น 2)
  installDate?: string;
  lastCleanedDate?: string;
  nextDueDate: string;   // Auto-calculated e.g. 6 months
  qrCodeId: string;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  lineId?: string;
  address: string;
  subdistrict: string;
  district: string;
  province: string;
  latitude: number;
  longitude: number;
  acUnitIds: string[];
}

export interface JobExpense {
  id: string;
  description: string;
  category: 'spare_part' | 'gas' | 'travel' | 'labor' | 'misc';
  cost: number;
  priceCharged: number;
  quantity: number;
}

export interface TechnicalChecklist {
  suctionPressurePsi?: number;   // ความดันน้ำยา psi (ปกติ 120-150 psi สำหรับ R32)
  currentAmp?: number;           // กระแสไฟฟ้า Amp
  returnTempC?: number;          // อุณหภูมิลมกลับ °C
  supplyTempC?: number;          // อุณหภูมิลมจ่าย °C
  coilCleaned: boolean;          // ล้างคอยล์เย็น
  condenserCleaned: boolean;     // ล้างคอยล์ร้อน
  drainCleared: boolean;         // เป่าล้างท่อน้ำทิ้ง
  filterCleaned: boolean;        // ล้างแผ่นกรอง
  electricalChecked: boolean;    // ตรวจจุดเชื่อมต่อไฟฟ้า
  gasLeakChecked: boolean;       // ตรวจจุดรั่วซึมน้ำยา
  notes?: string;
}

export interface JobPhoto {
  id: string;
  url: string;
  type: 'before' | 'during' | 'after' | 'pressure' | 'part' | 'other';
  label: string;
  timestamp: string;
}

export interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface Quotation {
  quotationNo: string;
  date: string;
  validUntil: string;
  items: QuotationItem[];
  discount: number;
  taxPercent: number; // usually 7%
  notes: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
}

export interface Job {
  id: string;
  jobCode: string;             // e.g. JOB-2026-001
  customerId: string;
  acUnitId: string;
  serviceType: ServiceType;
  title: string;
  description: string;
  status: JobStatus;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduledDate: string;        // YYYY-MM-DD
  timeSlot: string;             // e.g. "09:00 - 11:30"
  technicianId: string;
  estimatedHours: number;
  
  // Financials
  price: number;
  depositPaid: number;
  expenses: JobExpense[];
  quotation?: Quotation;

  // Onsite Service Records
  checklist: TechnicalChecklist;
  photos: JobPhoto[];
  customerSignature?: string;    // Base64 PNG
  customerSignerName?: string;
  signedAt?: string;
  warrantyDays: number;         // e.g. 30 days for cleaning, 90 days for repair
  
  // Status history & timestamps
  createdAt: string;
  enRouteAt?: string;
  startedAt?: string;
  completedAt?: string;
  completionSummary?: string;
  
  // Customer feedback
  rating?: number;
  feedback?: string;
}

export interface LineNotification {
  id: string;
  jobId: string;
  recipientPhone: string;
  recipientName: string;
  type: 'appointment_confirmed' | 'technician_en_route' | 'job_completed' | 'maintenance_due' | 'quotation_ready';
  title: string;
  messageText: string;
  sentAt: string;
  status: 'delivered' | 'failed' | 'simulated';
}
