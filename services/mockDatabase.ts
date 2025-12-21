import { User, UserRole, Faculty, Queue, Ticket, TicketStatus, AuthResponse } from '../types';

// Initial Data Seeding
const SEED_FACULTIES: Faculty[] = [
  { id: 'f1', name: 'Computer Science', code: 'CS' },
  { id: 'f2', name: 'Business Administration', code: 'BA' },
  { id: 'f3', name: 'Engineering', code: 'ENG' }
];

const SEED_USERS: User[] = [
  { id: 'u1', username: 'admin', role: UserRole.ADMIN, fullName: 'System Administrator' },
  { id: 'u2', username: 'student', role: UserRole.STUDENT, fullName: 'John Doe' },
  { id: 'u3', username: 'alice', role: UserRole.STUDENT, fullName: 'Alice Smith' },
];

const SEED_QUEUES: Queue[] = [
  { id: 'q1', facultyId: 'f1', name: 'General Inquiries', isActive: true, currentTicketNumber: 0 },
  { id: 'q2', facultyId: 'f1', name: 'Course Registration', isActive: true, currentTicketNumber: 0 },
];

// Helper to simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MockDatabase {
  private get <T>(key: string, defaultVal: T): T {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultVal;
  }

  private set(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  constructor() {
    if (!localStorage.getItem('users')) this.set('users', SEED_USERS);
    if (!localStorage.getItem('faculties')) this.set('faculties', SEED_FACULTIES);
    if (!localStorage.getItem('queues')) this.set('queues', SEED_QUEUES);
    if (!localStorage.getItem('tickets')) this.set('tickets', []);
  }

  // AUTH
  async login(username: string): Promise<AuthResponse> {
    await delay(500);
    const users = this.get<User[]>('users', []);
    const user = users.find(u => u.username === username);
    if (!user) throw new Error('Invalid credentials');
    
    return {
      token: `fake-jwt-token-${Date.now()}`,
      user
    };
  }

  // FACULTIES
  async getFaculties(): Promise<Faculty[]> {
    await delay(300);
    return this.get<Faculty[]>('faculties', []);
  }

  async createFaculty(faculty: Omit<Faculty, 'id'>): Promise<Faculty> {
    await delay(300);
    const list = this.get<Faculty[]>('faculties', []);
    const newFaculty = { ...faculty, id: `f${Date.now()}` };
    this.set('faculties', [...list, newFaculty]);
    return newFaculty;
  }

  async deleteFaculty(id: string): Promise<void> {
    await delay(300);
    const list = this.get<Faculty[]>('faculties', []);
    this.set('faculties', list.filter(f => f.id !== id));
  }

  // STUDENTS (USERS)
  async getStudents(): Promise<User[]> {
    await delay(300);
    const users = this.get<User[]>('users', []);
    return users.filter(u => u.role === UserRole.STUDENT);
  }

  async createStudent(student: Omit<User, 'id' | 'role'>): Promise<User> {
    await delay(300);
    const list = this.get<User[]>('users', []);
    const newStudent = { ...student, id: `u${Date.now()}`, role: UserRole.STUDENT };
    this.set('users', [...list, newStudent]);
    return newStudent;
  }

  // QUEUES
  async getQueues(): Promise<Queue[]> {
    await delay(300);
    return this.get<Queue[]>('queues', []);
  }

  async createQueue(queue: Omit<Queue, 'id' | 'currentTicketNumber'>): Promise<Queue> {
    await delay(300);
    const list = this.get<Queue[]>('queues', []);
    const newQueue = { ...queue, id: `q${Date.now()}`, currentTicketNumber: 0 };
    this.set('queues', [...list, newQueue]);
    return newQueue;
  }

  async deleteQueue(id: string): Promise<void> {
    await delay(300);
    const list = this.get<Queue[]>('queues', []);
    this.set('queues', list.filter(q => q.id !== id));
  }

  // TICKETS
  async getTickets(studentId?: string): Promise<Ticket[]> {
    await delay(300);
    const list = this.get<Ticket[]>('tickets', []);
    if (studentId) return list.filter(t => t.studentId === studentId);
    return list;
  }

  async createTicket(queueId: string, studentId: string): Promise<Ticket> {
    await delay(300);
    const queues = this.get<Queue[]>('queues', []);
    const queueIndex = queues.findIndex(q => q.id === queueId);
    if (queueIndex === -1) throw new Error('Queue not found');

    const updatedQueue = { ...queues[queueIndex], currentTicketNumber: queues[queueIndex].currentTicketNumber + 1 };
    queues[queueIndex] = updatedQueue;
    this.set('queues', queues);

    const tickets = this.get<Ticket[]>('tickets', []);
    const newTicket: Ticket = {
      id: `t${Date.now()}`,
      queueId,
      studentId,
      number: updatedQueue.currentTicketNumber,
      status: TicketStatus.WAITING,
      createdAt: new Date().toISOString()
    };
    this.set('tickets', [...tickets, newTicket]);
    return newTicket;
  }

  async updateTicketStatus(ticketId: string, status: TicketStatus): Promise<Ticket> {
    await delay(200);
    const tickets = this.get<Ticket[]>('tickets', []);
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    if (ticketIndex === -1) throw new Error('Ticket not found');

    const updatedTicket = { ...tickets[ticketIndex], status };
    tickets[ticketIndex] = updatedTicket;
    this.set('tickets', tickets);
    return updatedTicket;
  }

  // For Admin to see full queue state
  async getQueueState(): Promise<{ queue: Queue, tickets: Ticket[] }[]> {
    const queues = this.get<Queue[]>('queues', []);
    const tickets = this.get<Ticket[]>('tickets', []);
    
    return queues.map(q => ({
      queue: q,
      tickets: tickets.filter(t => t.queueId === q.id && (t.status === TicketStatus.WAITING || t.status === TicketStatus.CALLED))
    }));
  }
}

export const db = new MockDatabase();