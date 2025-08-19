import axios, { AxiosInstance, AxiosResponse } from 'axios';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
  pagination?: {
    current: number;
    pages: number;
    total: number;
  };
}

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load token from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('healthai_token');
      if (this.token) {
        this.setAuthHeader(this.token);
      }
    }

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response.data,
      (error) => {
        if (error.response?.status === 401) {
          this.clearToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        }
        return Promise.reject(error.response?.data || error);
      }
    );
  }

  private setAuthHeader(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  setToken(token: string) {
    this.token = token;
    this.setAuthHeader(token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('healthai_token', token);
    }
  }

  clearToken() {
    this.token = null;
    delete this.client.defaults.headers.common['Authorization'];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('healthai_token');
      localStorage.removeItem('healthai_user');
    }
  }

  // Authentication endpoints
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    phone?: string;
    dateOfBirth?: string;
    specialization?: string;
    licenseNumber?: string;
    experience?: number;
  }): Promise<ApiResponse> {
    const response = await this.client.post('/auth/register', userData);
    if (response.success && response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async login(email: string, password: string): Promise<ApiResponse> {
    const response = await this.client.post('/auth/login', { email, password });
    if (response.success && response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.client.post('/auth/logout');
    this.clearToken();
    return response;
  }

  async getCurrentUser(): Promise<ApiResponse> {
    return this.client.get('/auth/me');
  }

  async updateProfile(profileData: any): Promise<ApiResponse> {
    return this.client.put('/auth/profile', profileData);
  }

  async updateOnlineStatus(isOnline: boolean): Promise<ApiResponse> {
    return this.client.put('/auth/online-status', { isOnline });
  }

  async updateLocation(currentHospital: string, currentCity: string): Promise<ApiResponse> {
    return this.client.put('/auth/location', { currentHospital, currentCity });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    return this.client.put('/auth/change-password', { currentPassword, newPassword });
  }

  // Doctor endpoints
  async getDoctors(filters: {
    city?: string;
    specialization?: string;
    hospital?: string;
    isOnline?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
  } = {}): Promise<ApiResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    return this.client.get(`/doctors?${params.toString()}`);
  }

  async getDoctor(doctorId: string): Promise<ApiResponse> {
    return this.client.get(`/doctors/${doctorId}`);
  }

  async searchDoctors(searchData: {
    symptoms?: string[];
    preferredLocation?: string;
    urgency?: string;
    maxDistance?: number;
    preferredHospital?: string;
  }): Promise<ApiResponse> {
    return this.client.post('/doctors/search', searchData);
  }

  async getDoctorAvailability(doctorId: string, startDate?: string, endDate?: string): Promise<ApiResponse> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return this.client.get(`/doctors/${doctorId}/availability?${params.toString()}`);
  }

  async getDoctorDashboardStats(): Promise<ApiResponse> {
    return this.client.get('/doctors/dashboard/stats');
  }

  // Appointment endpoints
  async createAppointment(appointmentData: {
    doctor: string;
    appointmentDate: string;
    appointmentTime: { start: string; end: string };
    type: string;
    mode?: string;
    priority?: string;
    symptoms?: string[];
    chiefComplaint: string;
    additionalNotes?: string;
    preferredLocation?: any;
  }): Promise<ApiResponse> {
    return this.client.post('/appointments', appointmentData);
  }

  async getAppointments(filters: {
    status?: string;
    date?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    return this.client.get(`/appointments?${params.toString()}`);
  }

  async getAppointment(appointmentId: string): Promise<ApiResponse> {
    return this.client.get(`/appointments/${appointmentId}`);
  }

  async updateAppointment(appointmentId: string, updateData: any): Promise<ApiResponse> {
    return this.client.put(`/appointments/${appointmentId}`, updateData);
  }

  async cancelAppointment(appointmentId: string, reason?: string): Promise<ApiResponse> {
    return this.client.put(`/appointments/${appointmentId}/cancel`, { reason });
  }

  async rescheduleAppointment(
    appointmentId: string,
    newDate: string,
    newTime: { start: string; end: string }
  ): Promise<ApiResponse> {
    return this.client.put(`/appointments/${appointmentId}/reschedule`, { newDate, newTime });
  }

  async rateAppointment(appointmentId: string, rating: number, feedback?: string): Promise<ApiResponse> {
    return this.client.put(`/appointments/${appointmentId}/rate`, { rating, feedback });
  }

  async getAvailableSlots(doctorId: string, date: string): Promise<ApiResponse> {
    return this.client.get(`/appointments/slots/${doctorId}?date=${date}`);
  }

  // Patient endpoints
  async getPatientProfile(): Promise<ApiResponse> {
    return this.client.get('/patients/profile');
  }

  async updatePatientProfile(profileData: any): Promise<ApiResponse> {
    return this.client.put('/patients/profile', profileData);
  }

  async getPatientMedicalHistory(): Promise<ApiResponse> {
    return this.client.get('/patients/medical-history');
  }

  async updatePatientMedicalHistory(historyData: {
    medicalHistory?: any[];
    allergies?: string[];
    medications?: any[];
  }): Promise<ApiResponse> {
    return this.client.put('/patients/medical-history', historyData);
  }

  async getPatientAppointments(filters: {
    status?: string;
    upcoming?: boolean;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    return this.client.get(`/patients/appointments?${params.toString()}`);
  }

  async getPatientDashboardStats(): Promise<ApiResponse> {
    return this.client.get('/patients/dashboard/stats');
  }

  async getFavoriteDoctors(): Promise<ApiResponse> {
    return this.client.get('/patients/favorites');
  }

  async searchDoctorsForPatient(searchData: {
    symptoms?: string[];
    preferredLocation?: string;
    urgency?: string;
    maxDistance?: number;
    preferredHospital?: string;
  }): Promise<ApiResponse> {
    return this.client.post('/patients/search-doctors', searchData);
  }

  // Chat endpoints
  async startChat(chatData: {
    symptoms?: string[];
    urgency?: string;
    preferredLocation?: string;
  }): Promise<ApiResponse> {
    return this.client.post('/chat/start', chatData);
  }

  async sendChatMessage(chatId: string, content: string, messageType: string = 'text'): Promise<ApiResponse> {
    return this.client.post(`/chat/${chatId}/message`, { content, messageType });
  }

  async getChatMessages(chatId: string, page: number = 1, limit: number = 50): Promise<ApiResponse> {
    return this.client.get(`/chat/${chatId}/messages?page=${page}&limit=${limit}`);
  }

  async updateChatContext(chatId: string, contextData: any): Promise<ApiResponse> {
    return this.client.put(`/chat/${chatId}/context`, contextData);
  }

  async closeChat(chatId: string): Promise<ApiResponse> {
    return this.client.put(`/chat/${chatId}/close`);
  }

  // Video consultation endpoints
  async createVideoRoom(appointmentId: string): Promise<ApiResponse> {
    return this.client.post('/video/room', { appointmentId });
  }

  async joinVideoRoom(roomId: string): Promise<ApiResponse> {
    return this.client.get(`/video/room/${roomId}`);
  }

  async startVideoCall(roomId: string): Promise<ApiResponse> {
    return this.client.put(`/video/room/${roomId}/start`);
  }

  async endVideoCall(roomId: string, duration?: number, recordingUrl?: string): Promise<ApiResponse> {
    return this.client.put(`/video/room/${roomId}/end`, { duration, recordingUrl });
  }

  async getVideoHistory(page: number = 1, limit: number = 10): Promise<ApiResponse> {
    return this.client.get(`/video/history?page=${page}&limit=${limit}`);
  }

  // Notification endpoints
  async getNotifications(filters: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    return this.client.get(`/notifications?${params.toString()}`);
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse> {
    return this.client.put(`/notifications/${notificationId}/read`);
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse> {
    return this.client.put('/notifications/read-all');
  }

  // Medical Records endpoints
  async createMedicalRecord(recordData: {
    patient: string;
    recordType: string;
    title: string;
    description?: string;
    appointment?: string;
    vitalSigns?: any;
    diagnosis?: any;
    prescriptions?: any[];
    labResults?: any[];
  }): Promise<ApiResponse> {
    return this.client.post('/medical-records', recordData);
  }

  async getMedicalRecords(filters: {
    patient?: string;
    recordType?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    return this.client.get(`/medical-records?${params.toString()}`);
  }

  async getMedicalRecord(recordId: string): Promise<ApiResponse> {
    return this.client.get(`/medical-records/${recordId}`);
  }

  async updateMedicalRecord(recordId: string, updateData: any): Promise<ApiResponse> {
    return this.client.put(`/medical-records/${recordId}`, updateData);
  }

  async getPatientMedicalSummary(patientId: string): Promise<ApiResponse> {
    return this.client.get(`/medical-records/patient/${patientId}/summary`);
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.client.get('/health');
  }
}

export const apiClient = new ApiClient();
export default apiClient;