const STORAGE_KEY = 'student_feedbacks';

const INITIAL_FEEDBACKS = [
  {
    id: 1,
    courseId: 1,
    courseTitle: "INF451 - Advanced Software Architecture",
    feedback: "MHBJHBJB",
    feedbackDate: "01.09.2022",
    status: "SENT",
  },
  {
    id: 2,
    courseId: 2,
    courseTitle: "CS302 - Operating Systems & Distributed Architecture",
    feedback: "JKNK",
    feedbackDate: "13.04.2022",
    status: "DONE",
  }
];

function formatDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

export const feedbackService = {
  async getFeedbacks() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FEEDBACKS));
      return INITIAL_FEEDBACKS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_FEEDBACKS;
    }
  },

  async submitFeedback({ courseId, courseTitle, text }) {
    const feedbacks = await this.getFeedbacks();
    const newFeedback = {
      id: feedbacks.length > 0 ? Math.max(...feedbacks.map(f => f.id)) + 1 : 1,
      courseId: courseId || null,
      courseTitle: courseTitle || "General Course",
      feedback: text,
      feedbackDate: formatDate(new Date()),
      status: "SENT",
    };

    const updated = [newFeedback, ...feedbacks];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newFeedback;
  }
};

export default feedbackService;
