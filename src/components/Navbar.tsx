import React, { useState } from 'react';
import { UserRole, Technician, LineNotification } from '../types';
import { NuanamLogo } from './NuanamLogo';
import {
  Layers,
  Calendar,
  Navigation,
  Shield,
  BarChart3,
  MessageSquare,
  Plus,
  RotateCcw,
  Menu,
  X,
  Lock,
  Unlock,
  Database,
} from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  technicians: Technician[];
  activeTechId: string;
  onSelectTechId: (techId: string) => void;
  notifications: LineNotification[];
  onOpenLineModal: () => void;
  onOpenNewJob: () => void;
  onResetData: () => void;
  isEditUnlocked: boolean;
  onToggleEditLock: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  activeTab,
  onTabChange,
  technicians,
  activeTechId,
  onSelectTechId,
  notifications,
  onOpenLineModal,
  onOpenNewJob,
  onResetData,
  isEditUnlocked,
  onToggleEditLock,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'แดชบอร์ดภาพรวม', icon: BarChart3 },
    { id: 'jobs', label: 'งาน & สถานะสด', icon: Layers },
    { id: 'calendar', label: 'ตารางนัดหมาย', icon: Calendar },
    { id: 'route_planning', label: 'วางแผนเส้นทาง', icon: Navigation },
    { id: 'ac_database', label: 'ฐานข้อมูลแอร์ & QR', icon: Shield },
    { id: 'data_management', label: 'แก้ไข/ลบข้อมูล (0000)', icon: Database },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top tier: Brand, Role Switcher, and Fast Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div
            onClick={() => onTabChange('dashboard')}
            className="flex items-center gap-3 cursor-pointer shrink-0 group"
          >
            <NuanamLogo size={46} variant="badge" className="group-hover:scale-105 transition-transform shadow-xs" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900 font-sans">
                  เหนือน้ำแอร์
                </span>
                <span className="font-bold text-sky-600 text-sm">
                  ปทุมธานี
                </span>
                <span className="hidden lg:inline-block text-[10px] uppercase font-bold bg-sky-50 text-sky-700 px-1.5 py-0.2 rounded border border-sky-200">
                  Service Pro
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden sm:block">
                บริษัท เหนือน้ำแอร์ ปทุมธานี จำกัด (NUANAMAIR PATHUM THANI CO., LTD.)
              </p>
            </div>
          </div>

          {/* Role Switcher Pill (Central feature of RBAC) */}
          <div className="relative">
            <div className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => onRoleChange('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  currentRole === 'admin'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>👑 แอดมินบริษัท</span>
              </button>

              <button
                type="button"
                onClick={() => onRoleChange('technician')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  currentRole === 'technician'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🔧 ช่างเทคนิค</span>
              </button>

              <button
                type="button"
                onClick={() => onRoleChange('customer')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-semibold transition-all hidden sm:flex ${
                  currentRole === 'customer'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>👤 ลูกค้า</span>
              </button>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            {/* If role is technician, show technician select switcher */}
            {currentRole === 'technician' && technicians.length > 0 && (
              <select
                value={activeTechId}
                onChange={(e) => onSelectTechId(e.target.value)}
                className="hidden md:block text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-sky-300 bg-sky-50 text-sky-900 focus:outline-none"
              >
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    ช่าง: {t.nickname}
                  </option>
                ))}
              </select>
            )}

            {/* Edit/Delete Password Lock Toggle Button */}
            {currentRole === 'admin' && (
              <button
                type="button"
                onClick={onToggleEditLock}
                className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  isEditUnlocked
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                }`}
                title={
                  isEditUnlocked
                    ? 'ปลดล็อกโหมดแก้ไข/ลบข้อมูลแล้ว (คลิกเพื่อล็อก)'
                    : 'คลิกเพื่อกรอกรหัสผ่าน 0000 สำหรับแก้ไขหรือลบข้อมูล'
                }
              >
                {isEditUnlocked ? (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden lg:inline">ปลดล็อกแก้ไขแล้ว</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span className="hidden lg:inline">โหมดแก้ไข/ลบ (0000)</span>
                  </>
                )}
              </button>
            )}

            {/* LINE Notification Bell Simulator */}
            <button
              type="button"
              onClick={onOpenLineModal}
              className="relative p-2 rounded-xl text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 border border-slate-200 transition-colors"
              title="ระบบแจ้งเตือน LINE"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center">
                {notifications.length}
              </span>
            </button>

            {/* New Job Button */}
            {currentRole === 'admin' && (
              <button
                type="button"
                onClick={onOpenNewJob}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ จองคิวงานใหม่</span>
              </button>
            )}

            {/* Reset data demo */}
            <button
              type="button"
              onClick={onResetData}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="รีเซ็ตข้อมูลตัวอย่างเริ่มต้น"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Lower tier: Navigation Tabs (for Admin role) */}
        {currentRole === 'admin' && (
          <nav className="hidden md:flex items-center space-x-1 border-t border-slate-100 py-2 text-xs font-semibold">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isDataTab = item.id === 'data_management';
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : isDataTab
                      ? 'text-rose-700 bg-rose-50/70 hover:bg-rose-100 border border-rose-200/70'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive
                        ? 'text-sky-400'
                        : isDataTab
                        ? 'text-rose-600'
                        : 'text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                    isActive ? 'bg-sky-50 text-sky-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 text-sky-600" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <button
              type="button"
              onClick={() => {
                onToggleEditLock();
                setMobileMenuOpen(false);
              }}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border ${
                isEditUnlocked
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {isEditUnlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              <span>
                {isEditUnlocked ? 'ปลดล็อกแก้ไขแล้ว (คลิกเพื่อล็อก)' : 'ปลดล็อกโหมดแก้ไข/ลบข้อมูล (0000)'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                onOpenNewJob();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 rounded-xl bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ จองคิวงานใหม่</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
