import React, { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, X, ShieldAlert, CheckCircle2, KeyRound } from 'lucide-react';

interface PasswordPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  actionDescription?: string;
}

export const PasswordPromptModal: React.FC<PasswordPromptModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  actionDescription = 'แก้ไขและลบข้อมูลในระบบ',
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === '0000') {
      setError('');
      setPassword('');
      onSuccess();
      onClose();
    } else {
      setError('รหัสผ่านไม่ถูกต้อง! กรุณากรอกรหัสผ่าน 0000 เพื่อยืนยันสิทธิ์');
      setPassword('');
      inputRef.current?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                ยืนยันรหัสผ่านเพื่อแก้ไข / ลบข้อมูล
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ป้องกันการแก้ไขหรือลบข้อมูลโดยไม่ตั้งใจ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Target Box */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
            <KeyRound className="w-3.5 h-3.5 text-sky-600" />
            <span>รายการที่ต้องการดำเนินการ:</span>
          </div>
          <p className="text-slate-900 font-bold pl-5">{actionDescription}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              กรอกรหัสผ่านผู้ดูแลระบบ (Password)
            </label>
            <input
              ref={inputRef}
              type="password"
              inputMode="numeric"
              maxLength={8}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              placeholder="กรอกรหัสผ่าน (0000)"
              className="w-full px-4 py-3 text-center text-lg font-mono font-bold tracking-[0.4em] rounded-2xl border-2 border-slate-300 focus:border-sky-600 focus:outline-none focus:ring-4 focus:ring-sky-500/15 bg-white text-slate-900"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1.5 text-center">
              * ใช้รหัสผ่านมาตรฐาน <strong className="text-slate-600 font-mono">0000</strong> เพื่ออนุญาตแก้ไขและลบข้อมูล
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm transition-colors"
            >
              <Unlock className="w-4 h-4" />
              <span>ยืนยันรหัสผ่าน</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
