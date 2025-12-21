
import axios from 'axios';
import { User, UserRole, Faculty, Queue, Ticket, TicketStatus, AuthResponse, ApiResponse, Building, PaginatedResult, CatchupSchedule, QueueRegistration } from '../types';

const API_URL = 'https://api-navbat.tashmeduni.uz/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.hash.startsWith('#/queue/') && window.location.hash !== '#/login' && window.location.pathname !== '/login') {
          window.location.href = '#/login';
          window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

class HybridService {
  async loginAdmin(username: string, password: string): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiResponse<any>>('/auth/admin-login', { username, password });
      if (!response.data.status) throw new Error(response.data.error || 'Login failed');
      const userData = response.data.data;
      return { 
        token: userData.token, 
        user: { id: userData.id, username: userData.username, fullName: userData.fullName, role: UserRole.ADMIN }
      };
    } catch (error: any) {
        throw new Error(error.response?.data?.message || error.response?.data?.error || 'Invalid credentials');
    }
  }

  async loginStudent(hemisId: string, password: string): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiResponse<any>>('/auth/student-login', { hemisId, password });
      if (!response.data.status) throw new Error(response.data.error || 'Login failed');
      const userData = response.data.data;
      return { 
        token: userData.token, 
        user: { id: userData.id, hemisId: userData.hemisId, fullName: userData.fullname, phoneNumber: userData.phoneNumber, facultetId: userData.facultetId, course: userData.course, role: UserRole.STUDENT }
      };
    } catch (error: any) {
        let msg = 'Login failed';
        if (error.response?.data) {
             const data = error.response.data;
             msg = Array.isArray(data.message) ? data.message.join(', ') : (data.message || data.error || msg);
        }
        throw new Error(msg);
    }
  }

  async getStudentSelf(): Promise<User> {
    const response = await api.get<ApiResponse<any>>('/student/self');
    if (!response.data.status) throw new Error('Failed to fetch profile');
    const data = response.data.data;
    return { id: data.id, hemisId: data.hemisId, fullName: data.fullname, phoneNumber: data.phoneNumber, facultetId: data.facultetId, course: data.course, role: UserRole.STUDENT, facultet: data.facultet };
  }

  async getBuildings(): Promise<Building[]> {
    const response = await api.get<ApiResponse<Building[]>>('/building');
    return response.data.status ? response.data.data : [];
  }

  async createBuilding(data: { name: string; computerCount: number }): Promise<Building> {
    const response = await api.post<ApiResponse<Building>>('/building', data);
    return response.data.data;
  }

  async updateBuilding(id: number | string, data: { name: string; computerCount: number }): Promise<Building> {
    const response = await api.patch<ApiResponse<Building>>(`/building/${id}`, data);
    return response.data.data;
  }

  async deleteBuilding(id: number | string): Promise<void> {
    await api.delete<ApiResponse<any>>(`/building/${id}`);
  }

  async getFaculties(): Promise<Faculty[]> {
    const response = await api.get<ApiResponse<Faculty[]>>('/facultet');
    return response.data.status ? response.data.data : [];
  }

  async createFaculty(data: { name: string; buildingId: number }): Promise<Faculty> {
    const response = await api.post<ApiResponse<Faculty>>('/facultet', data);
    return response.data.data;
  }

  async updateFaculty(id: number | string, data: { name: string; buildingId: number }): Promise<Faculty> {
    const response = await api.patch<ApiResponse<Faculty>>(`/facultet/${id}`, data);
    return response.data.data;
  }

  async deleteFaculty(id: number | string): Promise<void> {
    await api.delete<ApiResponse<any>>(`/facultet/${id}`);
  }

  async getStudents(page = 1, pageSize = 10): Promise<PaginatedResult<User>> {
    const response = await api.get<ApiResponse<PaginatedResult<any>>>(`/student?page=${page}&page_size=${pageSize}`);
    if (response.data.status && response.data.data) {
        const result = response.data.data;
        return {
            ...result,
            data: result.data.map((s: any) => ({
                id: s.id, fullName: s.fullname, hemisId: s.hemisId, phoneNumber: s.phoneNumber, course: s.course, role: UserRole.STUDENT, facultetId: s.facultetId, facultet: s.facultet, isActive: s.isActive, createdAt: s.createdAt
            }))
        };
    }
    return { data: [], totalElements: 0, totalPages: 0, pageSize, currentPage: page };
  }
  
  async createStudent(student: any): Promise<User> {
    const response = await api.post<ApiResponse<any>>('/student', { ...student, course: Number(student.course), facultetId: Number(student.facultetId) });
    return { ...response.data.data, role: UserRole.STUDENT };
  }

  async getCatchupSchedules(): Promise<CatchupSchedule[]> {
    const response = await api.get<ApiResponse<CatchupSchedule[]>>('/catchup-schedule');
    return response.data.status ? response.data.data : [];
  }

  async createCatchupSchedule(data: { name: string; date: string; course: number; buildingId: number; startTime: string; endTime: string }): Promise<CatchupSchedule> {
    const response = await api.post<ApiResponse<CatchupSchedule>>('/catchup-schedule', data);
    if (!response.data.status) throw new Error('Jadval yaratishda xatolik');
    return response.data.data;
  }

  async deleteCatchupSchedule(id: number | string): Promise<void> {
    await api.delete<ApiResponse<any>>(`/catchup-schedule/${id}`);
  }

  async getScheduleById(id: number | string): Promise<CatchupSchedule | null> {
    try {
      const response = await api.get<ApiResponse<CatchupSchedule>>(`/catchup-schedule/${id}`);
      return response.data.status ? response.data.data : null;
    } catch (error) {
      return null;
    }
  }

  async getQueueDetails(id: number | string): Promise<CatchupSchedule | null> {
    try {
      const response = await api.get<ApiResponse<CatchupSchedule[]>>(`/catchup-schedule/pending-students/${id}`);
      return (response.data.status && response.data.data.length > 0) ? response.data.data[0] : null;
    } catch (error) {
      return null;
    }
  }

  async getStudentAvailableSchedules(): Promise<CatchupSchedule[]> {
    try {
        const response = await api.get<ApiResponse<CatchupSchedule[]>>('/catchup-schedule/by-student');
        return response.data.status ? response.data.data : [];
    } catch (error) {
        return [];
    }
  }

  async registerStudentQueue(catchupScheduleId: number, selectedTimeSlot: string): Promise<QueueRegistration> {
    const response = await api.post<ApiResponse<QueueRegistration>>('/catchup-schedule/register-queue', { 
        catchupScheduleId,
        selectedTimeSlot 
    });
    if (!response.data.status) throw new Error('Navbatga yozilishda xatolik');
    return response.data.data;
  }

  async getStudentQueues(): Promise<QueueRegistration[]> {
    try {
        const response = await api.get<ApiResponse<QueueRegistration[]>>('/catchup-schedule/queue-student');
        return response.data.status ? response.data.data : [];
    } catch(e) {
        return [];
    }
  }

  async scanQr(qrData: string): Promise<any> {
    const response = await api.post<ApiResponse<any>>('/catchup-schedule/scan-qr', { qrData });
    if (!response.data.status) {
      // API xatolik qaytarsa (masalan, 400 yoki 404), status: false bo'ladi
      throw new Error(response.data.error?.message || response.data.error || 'QR kod noto\'g\'ri yoki muddati o\'tgan');
    }
    return response.data.data;
  }
}

export const apiService = new HybridService();
