// Utility functions for formatting Thai dates, currency, and numbers

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('THB', '฿');
}

export function formatNumber(val: number): string {
  return new Intl.NumberFormat('th-TH').format(val);
}

export function formatThaiDate(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
      return `${day} ${months[month]} ${year + 543}`;
    }
    const d = new Date(dateStr);
    return d.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatThaiDateLong(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const months = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
      ];
      return `${day} ${months[month]} พ.ศ. ${year + 543}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export function getDaysUntil(dateStr: string): number {
  if (!dateStr) return 0;
  const target = new Date(dateStr);
  const today = new Date('2026-10-16'); // Consistent current mock date
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function generateJobCode(existingJobsCount: number): string {
  const num = (existingJobsCount + 1).toString().padStart(3, '0');
  return `JOB-2610-${num}`;
}

export function generateQuotationNo(num: number): string {
  return `QT-2026-${(1000 + num).toString()}`;
}
