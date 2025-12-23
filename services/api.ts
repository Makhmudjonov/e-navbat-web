
import axios from 'axios';
import { User, UserRole, Faculty, AuthResponse, ApiResponse, Building, PaginatedResult, CatchupSchedule, QueueRegistration, TwoMBRecord, TimeSlotStatistic } from '../types';

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
    // 400 va 403 xatoliklari biznes logikaga tegishli bo'lishi mumkin, 
    // shuning uchun ularni logout qilmasdan UI ga qaytaramiz.
    if (error.response && (error.response.status === 400 || error.response.status === 403 || error.response.status === 409)) {
      return Promise.reject(error);
    }

    // Faqatgina 401 (Unauthorized) xatoligida sessiyani tozalaymiz
    if (error.response && error.response.status === 401) {
      const currentHash = window.location.hash;
      if (currentHash !== '#/login') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.hash = '/login';
          setTimeout(() => window.location.reload(), 100);
      }
    }
    return Promise.reject(error);
  }
);

class HybridService {
  async loginAdmin(username: string, password: string): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<any>>('/auth/admin-login', { username, password });
    if (!response.data.status) throw new Error(response.data.error || 'Kirishda xatolik');
    const userData = response.data.data;
    return { 
      token: userData.token, 
      user: { id: userData.id, username: userData.username, fullName: userData.fullName, role: UserRole.ADMIN }
    };
  }

  async loginStudent(hemisId: string, password: string): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<any>>('/auth/student-login', { hemisId, password });
    if (!response.data.status) throw new Error(response.data.error || 'Kirishda xatolik');
    const userData = response.data.data;
    return { 
      token: userData.token, 
      user: { id: userData.id, hemisId: userData.hemisId, fullName: userData.fullname, phoneNumber: userData.phoneNumber, facultetId: userData.facultetId, course: userData.course, role: UserRole.STUDENT }
    };
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

  async getFaculties(): Promise<Faculty[]> {
    const response = await api.get<ApiResponse<Faculty[]>>('/facultet');
    return response.data.status ? response.data.data : [];
  }

  async getFacultiesByBuilding(buildingId: number): Promise<Faculty[]> {
    const response = await api.get<ApiResponse<Faculty[]>>(`/facultet/by-building/${buildingId}`);
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

  async syncFaculties(): Promise<any> {
    const response = await api.post<ApiResponse<any>>('/facultet/sync', {});
    return response.data;
  }

  async getStudents(page = 1, pageSize = 15): Promise<PaginatedResult<User>> {
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

  async createStudent(data: any): Promise<User> {
    const response = await api.post<ApiResponse<any>>('/student', data);
    if (!response.data.status) throw new Error(response.data.error || 'Xatolik');
    return response.data.data;
  }

  async getCatchupSchedules(): Promise<CatchupSchedule[]> {
    const response = await api.get<ApiResponse<CatchupSchedule[]>>('/catchup-schedule');
    return response.data.status ? response.data.data : [];
  }

  async createCatchupSchedule(data: { name: string; date: string; courses: number[]; buildingId: number; facultetIds: number[]; startTime: string; endTime: string }): Promise<CatchupSchedule> {
    const response = await api.post<ApiResponse<CatchupSchedule>>('/catchup-schedule', data);
    if (!response.data.status) throw new Error('Jadval yaratishda xatolik');
    return response.data.data;
  }

  async updateCatchupSchedule(id: number | string, data: { name: string; date: string; courses: number[]; buildingId: number; facultetIds: number[]; startTime: string; endTime: string }): Promise<CatchupSchedule> {
    const response = await api.patch<ApiResponse<CatchupSchedule>>(`/catchup-schedule/${id}`, data);
    if (!response.data.status) throw new Error('Jadvalni yangilashda xatolik');
    return response.data.data;
  }

  async deleteCatchupSchedule(id: number | string): Promise<void> {
    await api.delete<ApiResponse<any>>(`/catchup-schedule/${id}`);
  }

  async getScheduleById(id: number | string): Promise<CatchupSchedule | null> {
    const response = await api.get<ApiResponse<CatchupSchedule>>(`/catchup-schedule/${id}`);
    return response.data.status ? response.data.data : null;
  }

  async getQueueStudentsBySlot(catchupScheduleId: number | string, selectedTimeSlot?: string, status?: string): Promise<QueueRegistration[]> {
    let url = `/catchup-schedule/by-catchup-schedule?catchupScheduleId=${catchupScheduleId}`;
    if (selectedTimeSlot && selectedTimeSlot !== 'all') {
      url += `&selectedTimeSlot=${encodeURIComponent(selectedTimeSlot)}`;
    }
    if (status && status !== 'all') {
      url += `&status=${status}`;
    }
    const response = await api.get<ApiResponse<QueueRegistration[]>>(url);
    return response.data.status ? response.data.data : [];
  }

  async getQueueDetails(id: number | string): Promise<CatchupSchedule | null> {
    const response = await api.get<ApiResponse<CatchupSchedule[]>>(`/catchup-schedule/pending-students-admin/${id}`);
    return (response.data.status && response.data.data.length > 0) ? response.data.data[0] : null;
  }

  async registerStudentQueue(catchupScheduleId: number, selectedTimeSlot: string): Promise<QueueRegistration> {
    try {
      const response = await api.post<ApiResponse<QueueRegistration>>('/catchup-schedule/register-queue', { catchupScheduleId, selectedTimeSlot });
      if (response.data.status === false) {
        const errorMsg = response.data.error?.message || response.data.error || 'Navbatga yozilishda xatolik';
        throw new Error(errorMsg);
      }
      return response.data.data;
    } catch (error: any) {
      // 1. Backend formatiga ko'ra: error.response.data.error.message
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      // 2. Standart xatolik: error.response.data.message
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      // 3. Fallback
      throw new Error(error.message || "Xatolik yuz berdi");
    }
  }

  async getStudentQueues(): Promise<QueueRegistration[]> {
    const response = await api.get<ApiResponse<QueueRegistration[]>>('/catchup-schedule/queue-student');
    return response.data.status ? response.data.data : [];
  }

  async scanQr(qrData: string): Promise<any> {
    const response = await api.post<ApiResponse<any>>('/catchup-schedule/scan-qr', { qrData });
    if (!response.data.status) throw new Error(response.data.error?.message || response.data.error || 'QR kod yaroqsiz');
    return response.data.data;
  }

  async markStudentArrived(hemisId: string, catchupScheduleId: number): Promise<any> {
    const response = await api.post<ApiResponse<any>>('/catchup-schedule/mark-arrived', { hemisId, catchupScheduleId });
    if (!response.data.status) throw new Error(response.data.error?.message || response.data.error || 'Tasdiqlashda xatolik');
    return response.data.data;
  }

  async getTwoMBRecords(): Promise<TwoMBRecord[]> {
    const response = await api.get<ApiResponse<TwoMBRecord[]>>('/two-mb/my-records');
    return response.data.status ? response.data.data : [];
  }

  async getStudentArrears(hemisId: string): Promise<TwoMBRecord[]> {
    const response = await api.get<ApiResponse<any>>(`/external/get-2mb-student/${hemisId}`);
    if (response.data.status && response.data.data?.data) {
      return response.data.data.data.map((item: any) => ({
        id: item.journal_id,
        journalSubjectName: item.subject,
        topicName: item.topic_name,
        journalType: item.journal_type,
        mark: item.mark ? String(item.mark) : '',
        date: item.date,
        semester: item.journal_subject?.semester || ''
      }));
    }
    return [];
  }

  async getTimeSlotStatistics(id: number | string): Promise<TimeSlotStatistic[]> {
    const response = await api.get<ApiResponse<TimeSlotStatistic[]>>(`/catchup-schedule/time-slot-statistics/${id}`);
    return response.data.status ? response.data.data : [];
  }

  async getStudentAvailableSchedules(): Promise<CatchupSchedule[]> {
    const response = await api.get<ApiResponse<CatchupSchedule[]>>('/catchup-schedule/by-student');
    return response.data.status ? response.data.data : [];
  }
}

export const apiService = new HybridService();
