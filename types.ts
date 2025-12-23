
export enum UserRole {
  ADMIN = 'admin',
  STUDENT = 'student'
}

export enum TicketStatus {
  WAITING = 'waiting',
  CALLED = 'called',
  COMPLETED = 'completed',
  CANCELED = 'canceled'
}

export interface Faculty {
  id: number | string;
  name: string;
  buildingId?: number;
  code?: string;
}

export interface User {
  id: number | string;
  username?: string;
  hemisId?: string;
  fullName: string;
  role: UserRole;
  phoneNumber?: string;
  facultetId?: number;
  course?: number;
  facultet?: Faculty;
  isActive?: boolean;
  createdAt?: string;
}

export interface Building {
  id: number;
  name: string;
  computerCount: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Queue {
  id: string;
  facultyId: string;
  name: string;
  isActive: boolean;
  currentTicketNumber: number;
}

export interface Ticket {
  id: string;
  queueId: string;
  studentId: string;
  number: number;
  status: TicketStatus;
  createdAt: string;
}

export interface TimeSlotStatistic {
  timeSlot: string;
  registeredCount: number;
  totalSeats: number;
  availableSeats: number;
  isFullyBooked: boolean;
}

export interface CatchupSchedule {
  id: number;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  timeSlots?: string[];
  timeSlotStatistics?: TimeSlotStatistic[];
  courses: number[];
  buildingId: number;
  registrationCount: number;
  attendeesCount: number;
  isActive: boolean;
  building?: Building;
  students?: QueueRegistration[];
}

export interface QueueRegistration {
  id: number;
  catchupScheduleId: number;
  studentId: number;
  status: 'pending' | 'completed' | 'canceled' | string;
  selectedTimeSlot?: string;
  queueNumber?: number;
  qrCode?: string;
  isActive: boolean;
  createdAt: string;
  catchupSchedule?: CatchupSchedule;
  student?: User;
}

export interface TwoMBRecord {
  id: number;
  journalSubjectName: string;
  topicName: string;
  journalType: string;
  mark: string;
  date: string;
  semester: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  status: boolean;
  statusCode: number;
  error: any;
  data: T;
}

export interface PaginatedResult<T> {
  data: T[];
  totalElements: number;
  totalPages: number;
  pageSize: number;
  currentPage: number;
}
