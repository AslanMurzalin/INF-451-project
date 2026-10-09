import request from './api';

const DEFAULT_SERVICES = [
  {
    service_id: 1,
    name: 'Central University Library',
    category: 'Library',
    description: 'Main campus library with study halls, book loans, electronic resources, and research support.',
    location: 'Building A, Floors 1-3',
    contact_email: 'library@university.edu'
  },
  {
    service_id: 2,
    name: 'Campus Cafeteria & Food Court',
    category: 'Cafeteria',
    description: 'Student dining facilities, hot meal service, dietary options, and grab-and-go snacks.',
    location: 'Student Center, Ground Floor',
    contact_email: 'dining@university.edu'
  },
  {
    service_id: 3,
    name: 'IT Helpdesk & Tech Support',
    category: 'IT Support',
    description: 'Campus Wi-Fi assistance, student portal access, LMS troubleshooting, and lab computer support.',
    location: 'Building C, Room 104',
    contact_email: 'it-support@university.edu'
  },
  {
    service_id: 4,
    name: 'Student Registrar & Academic Services',
    category: 'Administration',
    description: 'Transcript requests, enrollment verification, student records, and schedule adjustments.',
    location: 'Admin Building, Floor 1',
    contact_email: 'registrar@university.edu'
  },
  {
    service_id: 5,
    name: 'Campus Sports & Recreation Complex',
    category: 'Sports',
    description: 'Gymnasium, swimming pool, indoor courts, and intramural sports registration.',
    location: 'Sports Center',
    contact_email: 'sports@university.edu'
  },
  {
    service_id: 6,
    name: 'Student Housing & Dormitory Office',
    category: 'Dormitory',
    description: 'On-campus residence management, maintenance requests, and room allocation.',
    location: 'Dormitory Block 2, Office 12',
    contact_email: 'housing@university.edu'
  }
];

export const servicesService = {
  async getServices(page = 1, pageSize = 50, category = null) {
    try {
      let url = `/services?page=${page}&page_size=${pageSize}`;
      if (category && category !== 'ALL') {
        url += `&category=${encodeURIComponent(category)}`;
      }
      const data = await request(url);
      return data;
    } catch (err) {
      console.warn('Fallback to local services catalog:', err);
      let filtered = DEFAULT_SERVICES;
      if (category && category !== 'ALL') {
        filtered = DEFAULT_SERVICES.filter(
          s => s.category.toLowerCase() === category.toLowerCase()
        );
      }
      return {
        items: filtered,
        total: filtered.length,
        page,
        page_size: pageSize,
        total_pages: 1
      };
    }
  },

  async getCategories() {
    try {
      const data = await request('/services/categories');
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return ['Library', 'Cafeteria', 'IT Support', 'Administration', 'Sports', 'Dormitory'];
    } catch (err) {
      console.warn('Fallback to local service categories:', err);
      return ['Library', 'Cafeteria', 'IT Support', 'Administration', 'Sports', 'Dormitory'];
    }
  },

  async getServiceById(serviceId) {
    try {
      return await request(`/services/${serviceId}`);
    } catch (err) {
      console.warn('Fallback to local service item:', err);
      return DEFAULT_SERVICES.find(s => s.service_id === Number(serviceId)) || DEFAULT_SERVICES[0];
    }
  }
};

export default servicesService;
