import { Job, Customer, ACUnit, Technician, LineNotification } from '../types';
import {
  INITIAL_JOBS,
  INITIAL_CUSTOMERS,
  INITIAL_AC_UNITS,
  INITIAL_TECHNICIANS,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData';

const STORAGE_KEYS = {
  JOBS: 'nuanamair_jobs_v2',
  CUSTOMERS: 'nuanamair_customers_v2',
  AC_UNITS: 'nuanamair_ac_units_v2',
  TECHNICIANS: 'nuanamair_technicians_v2',
  NOTIFICATIONS: 'nuanamair_notifications_v2',
  CURRENT_USER_ROLE: 'nuanamair_user_role_v2',
  ACTIVE_TECH_ID: 'nuanamair_active_tech_id_v2',
};

export function loadStoredData() {
  let jobs = INITIAL_JOBS;
  let customers = INITIAL_CUSTOMERS;
  let acUnits = INITIAL_AC_UNITS;
  let technicians = INITIAL_TECHNICIANS;
  let notifications = INITIAL_NOTIFICATIONS;

  try {
    const storedJobs = localStorage.getItem(STORAGE_KEYS.JOBS);
    if (storedJobs !== null) jobs = JSON.parse(storedJobs);

    const storedCust = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    if (storedCust !== null) customers = JSON.parse(storedCust);

    const storedAC = localStorage.getItem(STORAGE_KEYS.AC_UNITS);
    if (storedAC !== null) acUnits = JSON.parse(storedAC);

    const storedTech = localStorage.getItem(STORAGE_KEYS.TECHNICIANS);
    if (storedTech !== null) technicians = JSON.parse(storedTech);

    const storedNotif = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (storedNotif !== null) notifications = JSON.parse(storedNotif);
  } catch (err) {
    console.error('Failed to parse localStorage data, falling back to initial data', err);
  }

  return { jobs, customers, acUnits, technicians, notifications };
}

export function saveJobs(jobs: Job[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
  } catch (e) {
    console.error(e);
  }
}

export function saveCustomers(customers: Customer[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  } catch (e) {
    console.error(e);
  }
}

export function saveACUnits(acUnits: ACUnit[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.AC_UNITS, JSON.stringify(acUnits));
  } catch (e) {
    console.error(e);
  }
}

export function saveTechnicians(technicians: Technician[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.TECHNICIANS, JSON.stringify(technicians));
  } catch (e) {
    console.error(e);
  }
}

export function saveNotifications(notifications: LineNotification[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  } catch (e) {
    console.error(e);
  }
}

export function resetToDefaultData() {
  localStorage.removeItem(STORAGE_KEYS.JOBS);
  localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
  localStorage.removeItem(STORAGE_KEYS.AC_UNITS);
  localStorage.removeItem(STORAGE_KEYS.TECHNICIANS);
  localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
  window.location.reload();
}
