import request from './api';

const ADMIN_SOURCES_STORAGE_KEY = 'admin_feedback_sources';

const DEFAULT_SOURCES = [
  {
    source_type: 'COURSE_EVALUATION',
    display_name: 'COURSE EVALUATION',
    description: 'Structured student evaluation for academic courses and instructors.',
    target_entity: 'course',
    is_enabled: true
  },
  {
    source_type: 'SURVEY',
    display_name: 'SURVEY',
    description: 'Institutional surveys and campus-wide questionnaires.',
    target_entity: 'survey',
    is_enabled: true
  },
  {
    source_type: 'SERVICE_REVIEW',
    display_name: 'SERVICE REVIEW',
    description: 'Campus service reviews for library, cafeteria, IT support, etc.',
    target_entity: 'service',
    is_enabled: true
  }
];

export const adminService = {
  async getDashboardSummary() {
    try {
      const summary = await request('/sources/summary');
      return summary;
    } catch (err) {
      console.warn('Fallback to mock dashboard summary:', err);
      return {
        total_courses: 12,
        total_services: 5,
        active_surveys: 2,
        total_surveys: 3,
        total_departments: 4,
        source_types: DEFAULT_SOURCES,
      };
    }
  },

  async getFeedbackSources() {
    try {
      const serverTypes = await request('/sources/types');
      const customRaw = localStorage.getItem(ADMIN_SOURCES_STORAGE_KEY);
      const customSources = customRaw ? JSON.parse(customRaw) : [];
      
      const mappedServer = serverTypes.map(t => ({
        source_type: t.source_type,
        display_name: t.display_name.toUpperCase(),
        description: t.description,
        is_enabled: t.is_enabled,
      }));

      // Combine server types with any newly added custom sources
      const existingTypes = new Set(mappedServer.map(s => s.display_name));
      const additions = customSources.filter(c => !existingTypes.has(c.display_name));
      return [...mappedServer, ...additions];
    } catch (err) {
      console.warn('Falling back to local feedback sources:', err);
      const customRaw = localStorage.getItem(ADMIN_SOURCES_STORAGE_KEY);
      return customRaw ? JSON.parse(customRaw) : DEFAULT_SOURCES;
    }
  },

  async addFeedbackSource(newSource) {
    const current = await this.getFeedbackSources();
    const sourceObj = {
      source_type: newSource.name.toUpperCase().replace(/\s+/g, '_'),
      display_name: newSource.name.toUpperCase(),
      description: newSource.description || 'Configured feedback source',
      is_enabled: true,
    };
    const updated = [...current, sourceObj];
    localStorage.setItem(ADMIN_SOURCES_STORAGE_KEY, JSON.stringify(updated));
    return sourceObj;
  },

  async getCoursesAndServices() {
    let courses = [];
    let services = [];

    try {
      const courseData = await request('/courses?page=1&page_size=50');
      courses = (courseData?.items || []).map(c => ({
        id: `course-${c.course_id}`,
        name: c.title.toUpperCase(),
        feedbackType: 'COURSE EVALUATION',
        status: 'ACTIVE',
      }));
    } catch (err) {
      console.warn('Failed to load courses for admin view:', err);
      courses = [
        { id: 'course-1', name: 'WEB PROGRAMMING', feedbackType: 'COURSE EVALUATION', status: 'ACTIVE' },
        { id: 'course-2', name: 'PROJECT MANAGEMENT', feedbackType: 'COURSE EVALUATION', status: 'ACTIVE' },
      ];
    }

    try {
      const serviceData = await request('/services?page=1&page_size=50');
      services = (serviceData?.items || []).map(s => ({
        id: `service-${s.service_id}`,
        name: s.name.toUpperCase(),
        feedbackType: 'SERVICE REVIEW',
        status: 'ACTIVE',
      }));
    } catch (err) {
      console.warn('Failed to load services for admin view:', err);
      services = [
        { id: 'service-1', name: 'UNIVERSITY LIBRARY', feedbackType: 'SERVICE REVIEW', status: 'ACTIVE' },
      ];
    }

    // Default seed items from Figma if empty
    if (courses.length === 0 && services.length === 0) {
      return [
        { id: '1', name: 'WEB PROGRAMMING', feedbackType: 'COURSE EVALUATION', status: 'ACTIVE' },
        { id: '2', name: 'PROJECT MANAGEMENT', feedbackType: 'COURSE EVALUATION', status: 'ACTIVE' },
        { id: '3', name: 'UNIVERSITY LIBRARY', feedbackType: 'SERVICE REVIEW', status: 'ACTIVE' },
      ];
    }

    return [...courses, ...services];
  }
};

export default adminService;
