/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserRole, Job, Customer, ACUnit, Technician, LineNotification } from './types';
import {
  loadStoredData,
  saveJobs,
  saveCustomers,
  saveACUnits,
  saveTechnicians,
  saveNotifications,
  resetToDefaultData,
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { NuanamLogo } from './components/NuanamLogo';
import { Dashboard } from './components/Dashboard';
import { JobList } from './components/JobList';
import { CalendarView } from './components/CalendarView';
import { RoutePlanning } from './components/RoutePlanning';
import { ACDatabase } from './components/ACDatabase';
import { DataManagementView } from './components/DataManagementView';
import { TechnicianMobileView } from './components/TechnicianMobileView';
import { CustomerPortalView } from './components/CustomerPortalView';
import { JobDetailModal } from './components/JobDetailModal';
import { QuotationModal } from './components/QuotationModal';
import { JobReportModal } from './components/JobReportModal';
import { MonthlyReportModal } from './components/MonthlyReportModal';
import { LineNotificationModal } from './components/LineNotificationModal';
import { NewJobModal } from './components/NewJobModal';
import { PasswordPromptModal } from './components/PasswordPromptModal';

export default function App() {
  // Load persistent state
  const [data, setData] = useState(() => loadStoredData());
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeTechId, setActiveTechId] = useState('tech-1');

  // Password 0000 protection state
  const [isEditUnlocked, setIsEditUnlocked] = useState(false);
  const [passwordPrompt, setPasswordPrompt] = useState<{
    isOpen: boolean;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    description: '',
    onConfirm: () => {},
  });

  // Modal states
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedJobEditMode, setSelectedJobEditMode] = useState(false);
  const [quotationJob, setQuotationJob] = useState<Job | null>(null);
  const [reportJob, setReportJob] = useState<Job | null>(null);
  const [isLineModalOpen, setIsLineModalOpen] = useState(false);
  const [lineModalJob, setLineModalJob] = useState<Job | undefined>(undefined);
  const [lineModalCustomer, setLineModalCustomer] = useState<Customer | undefined>(undefined);
  const [lineModalAC, setLineModalAC] = useState<ACUnit | undefined>(undefined);
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [newJobInitialDate, setNewJobInitialDate] = useState('2026-10-16');
  const [isMonthlyReportOpen, setIsMonthlyReportOpen] = useState(false);

  // Helper to require 0000 password before executing edit/delete actions
  const handleRequestProtectedAction = (description: string, callback: () => void) => {
    if (isEditUnlocked) {
      callback();
    } else {
      setPasswordPrompt({
        isOpen: true,
        description,
        onConfirm: () => {
          setIsEditUnlocked(true);
          callback();
        },
      });
    }
  };

  const handleToggleEditLock = () => {
    if (isEditUnlocked) {
      setIsEditUnlocked(false);
    } else {
      setPasswordPrompt({
        isOpen: true,
        description: 'ปลดล็อกโหมดแก้ไขและลบข้อมูลในระบบ',
        onConfirm: () => {
          setIsEditUnlocked(true);
        },
      });
    }
  };

  // Sync jobs to localStorage
  const handleUpdateJob = (updatedJob: Job) => {
    const updatedJobs = data.jobs.map((j) => (j.id === updatedJob.id ? updatedJob : j));
    const nextData = { ...data, jobs: updatedJobs };
    setData(nextData);
    saveJobs(updatedJobs);
    if (selectedJob && selectedJob.id === updatedJob.id) {
      setSelectedJob(updatedJob);
    }
  };

  const handleDeleteJobById = (jobId: string) => {
    const updatedJobs = data.jobs.filter((j) => j.id !== jobId);
    const nextData = { ...data, jobs: updatedJobs };
    setData(nextData);
    saveJobs(updatedJobs);
    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob(null);
    }
  };

  const handleProtectedEditJob = (job: Job) => {
    handleRequestProtectedAction(`แก้ไขข้อมูลใบงาน ${job.jobCode} (${job.title})`, () => {
      setSelectedJobEditMode(true);
      setSelectedJob(job);
    });
  };

  const handleProtectedDeleteJob = (job: Job) => {
    handleRequestProtectedAction(`ลบใบงาน ${job.jobCode} (${job.title})`, () => {
      handleDeleteJobById(job.id);
    });
  };

  const handleUpdateJobStatus = (jobId: string, newStatus: Job['status']) => {
    const targetJob = data.jobs.find((j) => j.id === jobId);
    if (!targetJob) return;

    const updatedJob: Job = {
      ...targetJob,
      status: newStatus,
      enRouteAt: newStatus === 'en_route' ? '12:30' : targetJob.enRouteAt,
      startedAt: newStatus === 'in_progress' ? '13:00' : targetJob.startedAt,
      completedAt: newStatus === 'completed' ? '15:00' : targetJob.completedAt,
    };
    handleUpdateJob(updatedJob);
  };

  const handleSaveNewJob = (newJob: Job, newCustomer?: Customer, newACUnit?: ACUnit) => {
    let nextCustomers = data.customers;
    let nextACUnits = data.acUnits;
    if (newCustomer) {
      nextCustomers = [newCustomer, ...data.customers];
      saveCustomers(nextCustomers);
    }
    if (newACUnit) {
      nextACUnits = [newACUnit, ...data.acUnits];
      saveACUnits(nextACUnits);
    }
    const updatedJobs = [newJob, ...data.jobs];
    const nextData = {
      ...data,
      jobs: updatedJobs,
      customers: nextCustomers,
      acUnits: nextACUnits,
    };
    setData(nextData);
    saveJobs(updatedJobs);
  };

  // Customer CRUD
  const handleSaveCustomer = (cust: Customer, isNew: boolean) => {
    const updatedCustomers = isNew
      ? [cust, ...data.customers]
      : data.customers.map((c) => (c.id === cust.id ? cust : c));
    const nextData = { ...data, customers: updatedCustomers };
    setData(nextData);
    saveCustomers(updatedCustomers);
  };

  const handleDeleteCustomer = (customerId: string) => {
    const updatedCustomers = data.customers.filter((c) => c.id !== customerId);
    const nextData = { ...data, customers: updatedCustomers };
    setData(nextData);
    saveCustomers(updatedCustomers);
  };

  // AC Unit CRUD
  const handleAddACUnit = (newUnit: ACUnit) => {
    const updatedACs = [...data.acUnits, newUnit];
    const nextData = { ...data, acUnits: updatedACs };
    setData(nextData);
    saveACUnits(updatedACs);
  };

  const handleSaveACUnit = (unit: ACUnit, isNew: boolean) => {
    const updatedACs = isNew
      ? [unit, ...data.acUnits]
      : data.acUnits.map((u) => (u.id === unit.id ? unit : u));
    const nextData = { ...data, acUnits: updatedACs };
    setData(nextData);
    saveACUnits(updatedACs);
  };

  const handleDeleteACUnit = (acUnitId: string) => {
    const updatedACs = data.acUnits.filter((u) => u.id !== acUnitId);
    const nextData = { ...data, acUnits: updatedACs };
    setData(nextData);
    saveACUnits(updatedACs);
  };

  // Technician CRUD
  const handleSaveTechnician = (tech: Technician, isNew: boolean) => {
    const updatedTechs = isNew
      ? [...data.technicians, tech]
      : data.technicians.map((t) => (t.id === tech.id ? tech : t));
    const nextData = { ...data, technicians: updatedTechs };
    setData(nextData);
    saveTechnicians(updatedTechs);
  };

  const handleDeleteTechnician = (techId: string) => {
    const updatedTechs = data.technicians.filter((t) => t.id !== techId);
    const nextData = { ...data, technicians: updatedTechs };
    setData(nextData);
    saveTechnicians(updatedTechs);
  };

  // Bulk clear sample data
  const handleClearSelectedData = (options: {
    clearJobs: boolean;
    clearCustomers: boolean;
    clearACUnits: boolean;
    clearNotifications: boolean;
    clearTechnicians: boolean;
  }) => {
    const nextJobs = options.clearJobs ? [] : data.jobs;
    const nextCustomers = options.clearCustomers ? [] : data.customers;
    const nextACUnits = options.clearACUnits ? [] : data.acUnits;
    const nextNotifications = options.clearNotifications ? [] : data.notifications;
    const nextTechnicians = options.clearTechnicians ? [] : data.technicians;

    const nextData = {
      jobs: nextJobs,
      customers: nextCustomers,
      acUnits: nextACUnits,
      notifications: nextNotifications,
      technicians: nextTechnicians,
    };

    setData(nextData);
    if (options.clearJobs) saveJobs([]);
    if (options.clearCustomers) saveCustomers([]);
    if (options.clearACUnits) saveACUnits([]);
    if (options.clearNotifications) saveNotifications([]);
    if (options.clearTechnicians) saveTechnicians([]);
  };

  const handleSendNotification = (
    notif: Omit<LineNotification, 'id' | 'sentAt' | 'status'>
  ) => {
    const newNotif: LineNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      sentAt: '2026-10-16 11:00',
      status: 'delivered',
    };
    const updatedNotifs = [newNotif, ...data.notifications];
    const nextData = { ...data, notifications: updatedNotifs };
    setData(nextData);
    saveNotifications(updatedNotifs);
  };

  const handleOpenLineModalForJob = (job?: Job) => {
    if (job) {
      setLineModalJob(job);
      const cust = data.customers.find((c) => c.id === job.customerId);
      const ac = data.acUnits.find((u) => u.id === job.acUnitId);
      setLineModalCustomer(cust);
      setLineModalAC(ac);
    } else {
      setLineModalJob(data.jobs[0]);
      setLineModalCustomer(data.customers[0]);
      setLineModalAC(data.acUnits[0]);
    }
    setIsLineModalOpen(true);
  };

  const handleOpenLineReminderForAC = (ac: ACUnit, cust: Customer) => {
    setLineModalJob(undefined);
    setLineModalCustomer(cust);
    setLineModalAC(ac);
    setIsLineModalOpen(true);
  };

  const handleApproveQuotation = (jobId: string) => {
    const targetJob = data.jobs.find((j) => j.id === jobId);
    if (!targetJob || !targetJob.quotation) return;

    const updatedJob: Job = {
      ...targetJob,
      quotation: {
        ...targetJob.quotation,
        status: 'approved',
      },
    };
    handleUpdateJob(updatedJob);
    if (quotationJob && quotationJob.id === jobId) {
      setQuotationJob(updatedJob);
    }
  };

  const activeTech: Technician = data.technicians.find((t) => t.id === activeTechId) ||
    data.technicians[0] || {
      id: 'tech-default',
      name: 'ทีมช่างเทคนิค เหนือน้ำแอร์',
      nickname: 'ช่างเทคนิค',
      phone: '08x-xxx-xxxx',
      avatar: '/29068.jpg',
      vehicle: 'รถบริการ เหนือน้ำแอร์ ปทุมธานี',
      rating: 5.0,
      completedJobsCount: 0,
      color: '#0284c7',
    };

  const activeCustomer = data.customers[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Global Top Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={(role) => setCurrentRole(role)}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        technicians={data.technicians}
        activeTechId={activeTechId}
        onSelectTechId={(id) => setActiveTechId(id)}
        notifications={data.notifications}
        onOpenLineModal={() => handleOpenLineModalForJob(selectedJob || data.jobs[0])}
        onOpenNewJob={() => setIsNewJobModalOpen(true)}
        onResetData={resetToDefaultData}
        isEditUnlocked={isEditUnlocked}
        onToggleEditLock={handleToggleEditLock}
      />

      {/* Main Content Area based on User Role */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentRole === 'admin' && (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                jobs={data.jobs}
                customers={data.customers}
                technicians={data.technicians}
                acUnits={data.acUnits}
                onSelectJob={(j) => {
                  setSelectedJobEditMode(false);
                  setSelectedJob(j);
                }}
                onEditJob={handleProtectedEditJob}
                onDeleteJob={handleProtectedDeleteJob}
                onOpenNewJob={() => setIsNewJobModalOpen(true)}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenMonthlyReport={() => setIsMonthlyReportOpen(true)}
                onOpenLineModal={(j) => handleOpenLineModalForJob(j)}
              />
            )}

            {activeTab === 'jobs' && (
              <JobList
                jobs={data.jobs}
                customers={data.customers}
                technicians={data.technicians}
                acUnits={data.acUnits}
                onSelectJob={(j) => {
                  setSelectedJobEditMode(false);
                  setSelectedJob(j);
                }}
                onEditJob={handleProtectedEditJob}
                onDeleteJob={handleProtectedDeleteJob}
                onOpenNewJob={() => setIsNewJobModalOpen(true)}
                onOpenLineModal={(j) => handleOpenLineModalForJob(j)}
                onOpenReportModal={(j) => setReportJob(j)}
              />
            )}

            {activeTab === 'calendar' && (
              <CalendarView
                jobs={data.jobs}
                customers={data.customers}
                technicians={data.technicians}
                acUnits={data.acUnits}
                onSelectJob={(j) => {
                  setSelectedJobEditMode(false);
                  setSelectedJob(j);
                }}
                onOpenNewJob={(date) => {
                  if (date) setNewJobInitialDate(date);
                  setIsNewJobModalOpen(true);
                }}
              />
            )}

            {activeTab === 'route_planning' && (
              <RoutePlanning
                jobs={data.jobs}
                customers={data.customers}
                technicians={data.technicians}
                acUnits={data.acUnits}
                activeTechId={activeTechId}
                onSelectJob={(j) => {
                  setSelectedJobEditMode(false);
                  setSelectedJob(j);
                }}
                onUpdateJobStatus={handleUpdateJobStatus}
                onOpenLineModal={(j) => handleOpenLineModalForJob(j)}
              />
            )}

            {activeTab === 'ac_database' && (
              <ACDatabase
                acUnits={data.acUnits}
                customers={data.customers}
                jobs={data.jobs}
                onOpenLineReminder={handleOpenLineReminderForAC}
                onSelectJob={(j) => {
                  setSelectedJobEditMode(false);
                  setSelectedJob(j);
                }}
                onAddACUnit={handleAddACUnit}
                onUpdateACUnit={(unit) => handleSaveACUnit(unit, false)}
                onDeleteACUnit={handleDeleteACUnit}
                onRequestProtectedAction={handleRequestProtectedAction}
              />
            )}

            {activeTab === 'data_management' && (
              <DataManagementView
                isEditUnlocked={isEditUnlocked}
                onUnlockWithPassword={() => setIsEditUnlocked(true)}
                onLockEditMode={() => setIsEditUnlocked(false)}
                jobs={data.jobs}
                customers={data.customers}
                acUnits={data.acUnits}
                technicians={data.technicians}
                notifications={data.notifications}
                onUpdateJob={handleUpdateJob}
                onDeleteJob={handleDeleteJobById}
                onSaveCustomer={handleSaveCustomer}
                onDeleteCustomer={handleDeleteCustomer}
                onSaveACUnit={handleSaveACUnit}
                onDeleteACUnit={handleDeleteACUnit}
                onSaveTechnician={handleSaveTechnician}
                onDeleteTechnician={handleDeleteTechnician}
                onClearSelectedData={handleClearSelectedData}
                onResetDefaultData={resetToDefaultData}
              />
            )}
          </>
        )}

        {currentRole === 'technician' && (
          <TechnicianMobileView
            currentTech={activeTech}
            jobs={data.jobs}
            customers={data.customers}
            acUnits={data.acUnits}
            onSelectJob={(j) => {
              setSelectedJobEditMode(false);
              setSelectedJob(j);
            }}
            onUpdateJobStatus={handleUpdateJobStatus}
            onOpenLineModal={(j) => handleOpenLineModalForJob(j)}
            onOpenReportModal={(j) => setReportJob(j)}
          />
        )}

        {currentRole === 'customer' && (
          <CustomerPortalView
            customer={activeCustomer}
            jobs={data.jobs}
            acUnits={data.acUnits}
            technicians={data.technicians}
            onOpenReportModal={(j) => setReportJob(j)}
            onRequestBooking={() => setIsNewJobModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <NuanamLogo size={32} variant="badge" />
            <span className="font-bold text-slate-800">เหนือน้ำแอร์ ปทุมธานี</span>
            <span>• ระบบบริหารงานบริการ ซ่อมบำรุง และติดตั้งเครื่องปรับอากาศ</span>
          </div>
          <p>© 2026 บริษัท เหนือน้ำแอร์ ปทุมธานี จำกัด (NUANAMAIR PATHUM THANI CO., LTD.)</p>
        </div>
      </footer>

      {/* Password 0000 Prompt Modal */}
      <PasswordPromptModal
        isOpen={passwordPrompt.isOpen}
        onClose={() => setPasswordPrompt({ ...passwordPrompt, isOpen: false })}
        onSuccess={passwordPrompt.onConfirm}
        actionDescription={passwordPrompt.description}
      />

      {/* Master Job Detail Modal */}
      {selectedJob && (
        <JobDetailModal
          isOpen={true}
          onClose={() => {
            setSelectedJob(null);
            setSelectedJobEditMode(false);
          }}
          job={selectedJob}
          customer={data.customers.find((c) => c.id === selectedJob.customerId)}
          acUnit={data.acUnits.find((u) => u.id === selectedJob.acUnitId)}
          technician={data.technicians.find((t) => t.id === selectedJob.technicianId)}
          technicians={data.technicians}
          initialEditMode={selectedJobEditMode}
          onUpdateJob={handleUpdateJob}
          onUpdateCustomer={(cust) => handleSaveCustomer(cust, false)}
          onDeleteJob={handleDeleteJobById}
          onRequestProtectedAction={handleRequestProtectedAction}
          onOpenLineModal={() => handleOpenLineModalForJob(selectedJob)}
          onOpenQuotationModal={() => setQuotationJob(selectedJob)}
          onOpenReportModal={() => setReportJob(selectedJob)}
        />
      )}

      {/* Quotation Print/PDF Modal */}
      {quotationJob && (
        <QuotationModal
          isOpen={true}
          onClose={() => setQuotationJob(null)}
          job={quotationJob}
          customer={data.customers.find((c) => c.id === quotationJob.customerId)}
          acUnit={data.acUnits.find((u) => u.id === quotationJob.acUnitId)}
          onApproveQuotation={handleApproveQuotation}
          onOpenLineShare={() => handleOpenLineModalForJob(quotationJob)}
        />
      )}

      {/* Job Completion Report & Warranty Print/PDF Modal */}
      {reportJob && (
        <JobReportModal
          isOpen={true}
          onClose={() => setReportJob(null)}
          job={reportJob}
          customer={data.customers.find((c) => c.id === reportJob.customerId)}
          acUnit={data.acUnits.find((u) => u.id === reportJob.acUnitId)}
          technician={data.technicians.find((t) => t.id === reportJob.technicianId)}
          onOpenLineShare={() => handleOpenLineModalForJob(reportJob)}
        />
      )}

      {/* Monthly Report PDF Modal */}
      <MonthlyReportModal
        isOpen={isMonthlyReportOpen}
        onClose={() => setIsMonthlyReportOpen(false)}
        jobs={data.jobs}
        technicians={data.technicians}
        customers={data.customers}
      />

      {/* LINE Flex Message Simulator Modal */}
      <LineNotificationModal
        isOpen={isLineModalOpen}
        onClose={() => setIsLineModalOpen(false)}
        job={lineModalJob}
        customer={lineModalCustomer}
        acUnit={lineModalAC}
        technician={
          lineModalJob
            ? data.technicians.find((t) => t.id === lineModalJob.technicianId)
            : data.technicians[0]
        }
        onSendNotification={handleSendNotification}
      />

      {/* New Job Order Modal */}
      {isNewJobModalOpen && (
        <NewJobModal
          isOpen={isNewJobModalOpen}
          onClose={() => setIsNewJobModalOpen(false)}
          customers={data.customers}
          acUnits={data.acUnits}
          technicians={data.technicians}
          existingJobsCount={data.jobs.length}
          initialDate={newJobInitialDate}
          onSaveJob={handleSaveNewJob}
        />
      )}
    </div>
  );
}
