import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth expiration or invalid tokens globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to appropriate login if token is invalid
      const currentRole = localStorage.getItem('user_role');
      localStorage.removeItem('token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_info');
      
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register') && currentPath !== '/') {
        if (currentRole === 'faculty') {
          window.location.href = '/faculty/login';
        } else {
          window.location.href = '/student/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  studentLogin: (credentials) => api.post('/auth/student/login', credentials),
  facultyLogin: (credentials) => api.post('/auth/faculty/login', credentials),
  registerStudent: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me')
};

// Timetable Service
export const timetableService = {
  getMyTimetable: () => api.get('/timetable/my-class'),
  getClassTimetable: (className) => api.get(`/timetable/class/${className}`),
  getAllTimetables: () => api.get('/timetable/all'),
  uploadTimetable: (formData) => api.post('/timetable/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

// Lost & Found Items Service
export const itemsService = {
  getItems: (params) => api.get('/items', { params }),
  getMyClaims: () => api.get('/items/claims/my'),
  getAllClaims: () => api.get('/items/claims/all'),
  createItem: (formData) => api.post('/items', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateItem: (id, formData) => api.put(`/items/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteItem: (id) => api.delete(`/items/${id}`),
  claimItem: (id, claimReason) => api.post(`/items/${id}/claim`, { claim_reason: claimReason }),
  updateClaimStatus: (claimId, status) => api.put(`/items/claims/${claimId}/status`, { status })
};

// Complaints Service
export const complaintsService = {
  getMyComplaints: () => api.get('/complaints/my'),
  getAllComplaints: (params) => api.get('/complaints', { params }),
  createComplaint: (formData) => api.post('/complaints', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateComplaintStatus: (id, data) => api.put(`/complaints/${id}/status`, data)
};

// Attendance Service
export const attendanceService = {
  getMySummary: () => api.get('/attendance/my-summary'),
  getClassSheet: (className, date) => api.get('/attendance/class-sheet', {
    params: { class_name: className, date }
  }),
  markAttendance: (payload) => api.post('/attendance/mark', payload)
};

// Events Service
export const eventsService = {
  getEvents: () => api.get('/events'),
  createEvent: (data) => api.post('/events', data),
  updateEvent: (id, data) => api.put(`/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/events/${id}`)
};

// Notifications Service
export const notificationsService = {
  getNotifications: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/mark-all-read')
};

// Stats Service
export const statsService = {
  getFacultyOverview: () => api.get('/stats/faculty-overview'),
  getStudentOverview: () => api.get('/stats/student-overview')
};

export default api;
