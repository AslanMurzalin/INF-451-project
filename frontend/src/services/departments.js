import request from './api';

export const DEFAULT_DEPARTMENTS = [
  { department_id: 1, name: 'Computer Science & Engineering' },
  { department_id: 2, name: 'Information Systems' },
  { department_id: 3, name: 'Data Science & Artificial Intelligence' },
  { department_id: 4, name: 'Mathematics & Statistics' },
  { department_id: 5, name: 'Campus Facilities & Services' },
];

export const departmentsService = {
  async getDepartments() {
    try {
      const data = await request('/departments');
      if (Array.isArray(data) && data.length > 0) {
        const hasServices = data.some(
          d => d.name.toLowerCase().includes('facilities') || d.name.toLowerCase().includes('service')
        );
        if (!hasServices) {
          return [...data, { department_id: 99, name: 'Campus Facilities & Services' }];
        }
        return data;
      }
      return DEFAULT_DEPARTMENTS;
    } catch (err) {
      console.warn('Fallback to local departments:', err);
      return DEFAULT_DEPARTMENTS;
    }
  }
};

export default departmentsService;
