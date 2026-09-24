import request from './api';

export const authService = {
  async login(email, password) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });

    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user_info', JSON.stringify({
        userId: data.user_id,
        fullName: data.full_name,
        email: data.email,
        role: data.role,
      }));
    }

    return data;
  },

  async logout() {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Backend logout call failed or was already unauthorized', e);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_info');
    }
  },

  async getProfile() {
    const data = await request('/auth/me');
    if (data) {
      localStorage.setItem('user_info', JSON.stringify({
        userId: data.user_id,
        fullName: data.full_name,
        email: data.email,
        role: data.role,
        departmentId: data.department_id,
      }));
    }
    return data;
  },

  getUserInfo() {
    const raw = localStorage.getItem('user_info');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  }
};

export default authService;
