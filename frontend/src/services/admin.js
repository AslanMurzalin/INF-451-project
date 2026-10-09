import request from './api';
import feedbackService from './feedback';

const ADMIN_SOURCES_STORAGE_KEY = 'admin_feedback_sources';

export const DEFAULT_DETAILED_SOURCES = [
  {
    source_type: 'COURSE_EVALUATION',
    display_name: 'COURSE EVALUATION',
    description: 'Structured student evaluation for academic courses, curriculum quality, and instructors.',
    target_entity: 'course',
    is_enabled: true,
    criteria: ['Course Content', 'Instructor Clarity', 'Workload Balance'],
    custom_fields: [
      { id: 'semester', label: 'Semester', type: 'select', options: ['Fall 2026', 'Spring 2026', 'Summer 2026'], required: true },
      { id: 'strengths', label: 'Course Highlights & Strengths', type: 'text', placeholder: 'What was most valuable in this course?' },
      { id: 'improvements', label: 'Recommended Improvements', type: 'text', placeholder: 'What could be improved?' }
    ]
  },
  {
    source_type: 'SURVEY',
    display_name: 'AD-HOC SURVEY',
    description: 'Institutional surveys and campus-wide initiative campaigns.',
    target_entity: 'survey',
    is_enabled: true,
    criteria: ['Agreement Score', 'Initiative Relevance', 'Priority Level'],
    custom_fields: [
      { id: 'initiative_feedback', label: 'Specific Initiative Recommendations', type: 'textarea', placeholder: 'Suggestions for the university leadership regarding this initiative...' }
    ]
  },
  {
    source_type: 'SERVICE_REVIEW',
    display_name: 'CAMPUS SERVICE REVIEW',
    description: 'Continuous feedback on university facilities: Library, Cafeteria, IT Support, Sports, Dormitory.',
    target_entity: 'service',
    is_enabled: true,
    criteria: ['Service Speed', 'Staff Assistance', 'Facility & Equipment Quality'],
    custom_fields: [
      { id: 'service_location', label: 'Specific Campus Location', type: 'text', placeholder: 'e.g. Building C Room 104, Floor 2 Dining Hall' }
    ]
  },
  {
    source_type: 'LAB_EQUIPMENT_REVIEW',
    display_name: 'LAB & WORKSHOP EVALUATION',
    description: 'Specialized evaluation of computing labs, engineering equipment, and laboratory safety.',
    target_entity: 'service',
    is_enabled: true,
    criteria: ['Hardware Condition', 'Software Availability', 'Lab Safety & Hygiene'],
    custom_fields: [
      { id: 'lab_room', label: 'Laboratory Number / Name', type: 'text', placeholder: 'e.g. CS Lab 302, Robotics Lab' },
      { id: 'reported_faults', label: 'Faulty Equipment (if any)', type: 'text', placeholder: 'Specify computer or device number' }
    ]
  }
];

export const adminService = {
  async getDashboardSummary() {
    try {
      const summary = await request('/sources/summary');
      const allFeedbacks = await feedbackService.getFeedbacks();
      const sources = await this.getFeedbackSources();

      const pendingCount = allFeedbacks.filter(f => f.status === 'SENT').length;
      const doneCount = allFeedbacks.filter(f => f.status === 'DONE' || f.status === 'RESOLVED').length;

      return {
        ...summary,
        total_feedbacks: allFeedbacks.length,
        pending_feedbacks: pendingCount,
        resolved_feedbacks: doneCount,
        total_sources: sources.length,
        source_types: sources,
      };
    } catch (err) {
      console.warn('Fallback to local dashboard summary:', err);
      const allFeedbacks = await feedbackService.getFeedbacks();
      const sources = await this.getFeedbackSources();

      const pendingCount = allFeedbacks.filter(f => f.status === 'SENT').length;
      const doneCount = allFeedbacks.filter(f => f.status === 'DONE' || f.status === 'RESOLVED').length;

      return {
        total_courses: 12,
        total_services: 6,
        active_surveys: 4,
        total_surveys: 4,
        total_departments: 4,
        total_feedbacks: allFeedbacks.length,
        pending_feedbacks: pendingCount,
        resolved_feedbacks: doneCount,
        total_sources: sources.length,
        source_types: sources,
      };
    }
  },

  async getFeedbackSources() {
    const customRaw = localStorage.getItem(ADMIN_SOURCES_STORAGE_KEY);
    if (!customRaw) {
      localStorage.setItem(ADMIN_SOURCES_STORAGE_KEY, JSON.stringify(DEFAULT_DETAILED_SOURCES));
      return DEFAULT_DETAILED_SOURCES;
    }
    try {
      return JSON.parse(customRaw);
    } catch {
      return DEFAULT_DETAILED_SOURCES;
    }
  },

  async getActiveFeedbackSources() {
    const all = await this.getFeedbackSources();
    return all.filter(s => s.is_enabled !== false);
  },

  async addFeedbackSource(newSource) {
    const current = await this.getFeedbackSources();
    const sourceKey = (newSource.source_type || newSource.display_name || newSource.name)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_');

    const sourceObj = {
      source_type: sourceKey,
      display_name: (newSource.display_name || newSource.name || '').toUpperCase().trim(),
      description: newSource.description || 'Configured university feedback source',
      target_entity: newSource.target_entity || 'general',
      is_enabled: newSource.is_enabled !== undefined ? newSource.is_enabled : true,
      criteria: Array.isArray(newSource.criteria) && newSource.criteria.length > 0
        ? newSource.criteria
        : ['Overall Quality', 'Service / Course Clarity', 'Timeliness'],
      custom_fields: Array.isArray(newSource.custom_fields)
        ? newSource.custom_fields
        : []
    };

    // Filter out if duplicate key exists
    const updated = [...current.filter(s => s.source_type !== sourceKey), sourceObj];
    localStorage.setItem(ADMIN_SOURCES_STORAGE_KEY, JSON.stringify(updated));
    return sourceObj;
  },

  async updateFeedbackSource(sourceType, updatedData) {
    const current = await this.getFeedbackSources();
    const updated = current.map(s => {
      if (s.source_type === sourceType) {
        return {
          ...s,
          ...updatedData,
          display_name: (updatedData.display_name || s.display_name).toUpperCase().trim(),
        };
      }
      return s;
    });
    localStorage.setItem(ADMIN_SOURCES_STORAGE_KEY, JSON.stringify(updated));
    return true;
  },

  async toggleFeedbackSource(sourceType) {
    const current = await this.getFeedbackSources();
    const updated = current.map(s => {
      if (s.source_type === sourceType) {
        return { ...s, is_enabled: !s.is_enabled };
      }
      return s;
    });
    localStorage.setItem(ADMIN_SOURCES_STORAGE_KEY, JSON.stringify(updated));
    return true;
  },

  async deleteFeedbackSource(sourceType) {
    const current = await this.getFeedbackSources();
    const updated = current.filter(s => s.source_type !== sourceType);
    localStorage.setItem(ADMIN_SOURCES_STORAGE_KEY, JSON.stringify(updated));
    return true;
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
        target_entity: 'course',
        status: 'ACTIVE',
        lecturer: c.lecturer_name || 'Assigned Instructor',
        department: c.department_name || 'Computer Science'
      }));
    } catch (err) {
      console.warn('Failed to load courses for admin view:', err);
      courses = [
        { id: 'course-1', name: 'INF451 - ADVANCED SOFTWARE ARCHITECTURE', feedbackType: 'COURSE EVALUATION', target_entity: 'course', status: 'ACTIVE', lecturer: 'Dr. Alan Turing', department: 'Software Engineering' },
        { id: 'course-2', name: 'CS302 - OPERATING SYSTEMS & DISTRIBUTED SYSTEMS', feedbackType: 'COURSE EVALUATION', target_entity: 'course', status: 'ACTIVE', lecturer: 'Prof. Linus Torvalds', department: 'Computer Science' },
      ];
    }

    try {
      const serviceData = await request('/services?page=1&page_size=50');
      services = (serviceData?.items || []).map(s => ({
        id: `service-${s.service_id}`,
        name: s.name.toUpperCase(),
        feedbackType: 'SERVICE REVIEW',
        target_entity: 'service',
        status: 'ACTIVE',
        category: s.category || 'General Service',
        location: s.location || 'Campus Center'
      }));
    } catch (err) {
      console.warn('Failed to load services for admin view:', err);
      services = [
        { id: 'service-1', name: 'CENTRAL UNIVERSITY LIBRARY', feedbackType: 'SERVICE REVIEW', target_entity: 'service', status: 'ACTIVE', category: 'Library', location: 'Building A' },
        { id: 'service-2', name: 'CAMPUS CAFETERIA & DINING', feedbackType: 'SERVICE REVIEW', target_entity: 'service', status: 'ACTIVE', category: 'Cafeteria', location: 'Student Center' },
        { id: 'service-3', name: 'IT HELPDESK & TECH SUPPORT', feedbackType: 'SERVICE REVIEW', target_entity: 'service', status: 'ACTIVE', category: 'IT Support', location: 'Building C Room 104' },
      ];
    }

    return [...courses, ...services];
  }
};

export default adminService;
