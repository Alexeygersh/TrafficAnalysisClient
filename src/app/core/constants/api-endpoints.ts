import { environment } from '../../../environments/environment';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${environment.apiUrl}/auth/login`,
    LOGOUT: `${environment.apiUrl}/auth/logout`,
    REFRESH: `${environment.apiUrl}/auth/refresh`,
  },
  PACKETS: {
    BASE: `${environment.apiUrl}/packets`,
    BY_ID: (id: number) => `${environment.apiUrl}/packets/${id}`,
    FILTER: `${environment.apiUrl}/packets/filter`,
  },
  ANALYSIS: {
    BASE: `${environment.apiUrl}/analysis`,
    BY_ID: (id: number) => `${environment.apiUrl}/analysis/${id}`,
    RUN: `${environment.apiUrl}/analysis/run`,
  },
  SESSIONS: {
    BASE: `${environment.apiUrl}/sessions`,
    BY_ID: (id: number) => `${environment.apiUrl}/sessions/${id}`,
    STATISTICS: (id: number) => `${environment.apiUrl}/sessions/${id}/statistics`,
  },
  REPORTS: {
    DASHBOARD: `${environment.apiUrl}/reports/dashboard`,
    THREATS: `${environment.apiUrl}/reports/threats`,
    STATISTICS: `${environment.apiUrl}/reports/statistics`,
    TOP_IPS: `${environment.apiUrl}/reports/top-ips`,
  },
  USERS: {
    BASE: `${environment.apiUrl}/users`,
    BY_ID: (id: number) => `${environment.apiUrl}/users/${id}`,
  }
};
