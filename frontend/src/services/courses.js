import request from './api';

export const coursesService = {
  async getCourses(page = 1, pageSize = 50) {
    const data = await request(`/courses?page=${page}&page_size=${pageSize}`);
    return data;
  },

  async getCourseById(courseId) {
    return await request(`/courses/${courseId}`);
  }
};

export default coursesService;
