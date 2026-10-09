import request from './api';

const DEFAULT_SURVEYS = [
  {
    survey_id: 1,
    title: 'Fall 2026 Campus Life & Well-Being Survey',
    description: 'Annual assessment of student life, campus facilities, extracurricular opportunities, and psychological support services.',
    start_date: '2026-09-01T00:00:00Z',
    end_date: '2026-12-31T23:59:59Z',
    is_active: true,
    topic: 'Campus Life & Student Well-Being',
    target_audience: 'All Students'
  },
  {
    survey_id: 2,
    title: 'Digital Learning & LMS Platform Satisfaction',
    description: 'Evaluating the performance, usability, mobile access, and grading transparency of the new University SIS & LMS system.',
    start_date: '2026-09-15T00:00:00Z',
    end_date: '2026-11-30T23:59:59Z',
    is_active: true,
    topic: 'IT & Digital Infrastructure',
    target_audience: 'Undergraduate & Graduate'
  },
  {
    survey_id: 3,
    title: 'Campus Dining Services & Nutrition Initiative',
    description: 'Gathering student preferences for cafeteria operating hours, healthy meal alternatives, pricing, and allergen labeling.',
    start_date: '2026-10-01T00:00:00Z',
    end_date: '2026-11-15T23:59:59Z',
    is_active: true,
    topic: 'Campus Dining & Nutrition',
    target_audience: 'On-Campus Students'
  },
  {
    survey_id: 4,
    title: 'Library 24/7 Study Space & Research Resources',
    description: 'Student initiative feedback regarding extended library hours during exam sessions and access to international research databases.',
    start_date: '2026-08-15T00:00:00Z',
    end_date: '2026-10-30T23:59:59Z',
    is_active: true,
    topic: 'Academic Resources & Study Halls',
    target_audience: 'All Academic Departments'
  }
];

export const surveysService = {
  async getSurveys(page = 1, pageSize = 50, status = null) {
    try {
      let url = `/surveys?page=${page}&page_size=${pageSize}`;
      if (status) {
        url += `&status=${status}`;
      }
      const data = await request(url);
      return data;
    } catch (err) {
      console.warn('Fallback to local surveys catalog:', err);
      let list = DEFAULT_SURVEYS;
      if (status === 'active') {
        list = DEFAULT_SURVEYS.filter(s => s.is_active);
      }
      return {
        items: list,
        total: list.length,
        page,
        page_size: pageSize,
        total_pages: 1
      };
    }
  },

  async getActiveSurveys() {
    return this.getSurveys(1, 50, 'active');
  },

  async getSurveyById(surveyId) {
    try {
      return await request(`/surveys/${surveyId}`);
    } catch (err) {
      console.warn('Fallback to local survey item:', err);
      return DEFAULT_SURVEYS.find(s => s.survey_id === Number(surveyId)) || DEFAULT_SURVEYS[0];
    }
  }
};

export default surveysService;
