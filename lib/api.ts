const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = typeof window !== 'undefined' ? localStorage.getItem('healthai_token') : null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('healthai_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('healthai_token');
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
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async logout() {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });
    
    this.clearToken();
    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async updateProfile(profileData: any) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async updateOnlineStatus(isOnline: boolean) {
    return this.request('/auth/online-status', {
      method: 'PUT',
      body: JSON.stringify({ isOnline }),
    });
  }

  async updateLocation(currentHospital: string, currentCity: string) {
    return this.request('/auth/location', {
      method: 'PUT',
      body: JSON.stringify({ currentHospital, currentCity }),
    });
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
  } = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    return this.request(`/doctors?${params.toString()}`);
  }

  async getDoctor(doctorId: string) {
    return this.request(`/doctors/${doctorId}`);
  }

  async searchDoctors(searchData: {
    symptoms?: string[];
    preferredLocation?: string;
    urgency?: string;
    maxDistance?: number;
    preferredHospital?: string;
  }) {
    return this.request('/doctors/search', {
      method: 'POST',
      body: JSON.stringify(searchData),
    });
  }

  async getDoctorAvailability(doctorId: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    return this.request(`/doctors/${doctorId}/availability?${params.toString()}`);
  }

  async getDoctorDashboardStats() {
    return this.request('/doctors/dashboard/stats');
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
  }) {
    return this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  async getAppointments(filters: {
    status?: string;
    date?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    return this.request(`/appointments?${params.toString()}`);
  }

  async getAppointment(appointmentId: string) {
    return this.request(`/appointments/${appointmentId}`);
  }

  async updateAppointment(appointmentId: string, updateData: any) {
    return this.request(`/appointments/${appointmentId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async cancelAppointment(appointmentId: string, reason?: string) {
    return this.request(`/appointments/${appointmentId}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  async rescheduleAppointment(
    appointmentId: string,
    newDate: string,
    newTime: { start: string; end: string }
  ) {
    return this.request(`/appointments/${appointmentId}/reschedule`, {
      method: 'PUT',
      body: JSON.stringify({ newDate, newTime }),
    });
  }

  async rateAppointment(appointmentId: string, rating: number, feedback?: string) {
    return this.request(`/appointments/${appointmentId}/rate`, {
      method: 'PUT',
      body: JSON.stringify({ rating, feedback }),
    });
  }

  async getAvailableSlots(doctorId: string, date: string) {
    return this.request(`/appointments/slots/${doctorId}?date=${date}`);
  }

  // Patient endpoints
  async getPatientProfile() {
    return this.request('/patients/profile');
  }

  async updatePatientProfile(profileData: any) {
    return this.request('/patients/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getPatientMedicalHistory() {
    return this.request('/patients/medical-history');
  }

  async updatePatientMedicalHistory(historyData: {
    medicalHistory?: any[];
    allergies?: string[];
    medications?: any[];
  }) {
    return this.request('/patients/medical-history', {
      method: 'PUT',
      body: JSON.stringify(historyData),
    });
  }

  async getPatientAppointments(filters: {
    status?: string;
    upcoming?: boolean;
    page?: number;
    limit?: number;
  } = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    return this.request(`/patients/appointments?${params.toString()}`);
  }

  async getPatientDashboardStats() {
    return this.request('/patients/dashboard/stats');
  }

  async getFavoriteDoctors() {
    return this.request('/patients/favorites');
  }

  // Chat endpoints
  async startChat(chatData: {
    symptoms?: string[];
    urgency?: string;
    preferredLocation?: string;
  }) {
    return this.request('/chat/start', {
      method: 'POST',
      body: JSON.stringify(chatData),
    });
  }

  async sendChatMessage(chatId: string, content: string, messageType: string = 'text') {
    return this.request(`/chat/${chatId}/message`, {
      method: 'POST',
      body: JSON.stringify({ content, messageType }),
    });
  }

  async getChatMessages(chatId: string, page: number = 1, limit: number = 50) {
    return this.request(`/chat/${chatId}/messages?page=${page}&limit=${limit}`);
  }

  async updateChatContext(chatId: string, contextData: any) {
    return this.request(`/chat/${chatId}/context`, {
      method: 'PUT',
      body: JSON.stringify(contextData),
    });
  }

  async closeChat(chatId: string) {
    return this.request(`/chat/${chatId}/close`, {
      method: 'PUT',
    });
  }

  // Video consultation endpoints
  async createVideoRoom(appointmentId: string) {
    return this.request('/video/room', {
      method: 'POST',
      body: JSON.stringify({ appointmentId }),
    });
  }

  async joinVideoRoom(roomId: string) {
    return this.request(`/video/room/${roomId}`);
  }

  async endVideoCall(roomId: string, duration?: number, recordingUrl?: string) {
    return this.request(`/video/room/${roomId}/end`, {
      method: 'PUT',
      body: JSON.stringify({ duration, recordingUrl }),
    });
  }

  async getVideoHistory(page: number = 1, limit: number = 10) {
    return this.request(`/video/history?page=${page}&limit=${limit}`);
  }

  // Admin endpoints
  async getUsers(filters: {
    role?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
    search?: string;
  } = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    return this.request(`/users?${params.toString()}`);
  }

  async getUserStats() {
    return this.request('/users/stats/overview');
  }

  async updateUser(userId: string, userData: any) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deactivateUser(userId: string) {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
