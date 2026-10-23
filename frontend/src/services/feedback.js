const STORAGE_KEY = 'student_feedbacks';

export const INITIAL_FEEDBACKS = [
  {
    id: 1,
    sourceType: 'COURSE_EVALUATION',
    sourceDisplayName: 'COURSE EVALUATION',
    targetId: 1,
    targetTitle: 'INF451 - Advanced Software Architecture',
    department: 'Computer Science & Engineering',
    lecturerName: 'Dr. Alan Smith',
    studentName: 'Alice Johnson',
    studentEmail: 'alice.student@university.edu',
    rating: 5,
    criteria: {
      'Course Content': 5,
      'Instructor Clarity': 5,
      'Workload Balance': 4,
    },
    customAnswers: {
      'strengths': 'Exceptional architecture paradigms and design patterns explained clearly.',
      'improvements': 'More continuous integration automated test assignments.'
    },
    semester: 'Fall 2026',
    feedback: 'Excellent course on distributed architectures and microservices. The practical laboratory assignments were challenging and very helpful for understanding system design.',
    isAnonymous: false,
    feedbackDate: '01.09.2026',
    status: 'DONE',
    responseNote: 'Thank you for your valuable feedback! The curriculum for next semester will include even more real-world cloud deployment case studies.'
  },
  {
    id: 2,
    sourceType: 'SERVICE_REVIEW',
    sourceDisplayName: 'CAMPUS SERVICE REVIEW',
    targetId: 3,
    targetTitle: 'IT Helpdesk & Systems Support',
    department: 'Campus Facilities & Services',
    lecturerName: '',
    studentName: 'Anonymous Student',
    studentEmail: '',
    category: 'IT Support',
    rating: 4,
    criteria: {
      'Service Speed': 4,
      'Staff Assistance': 5,
      'Facility & Equipment Quality': 4,
    },
    customAnswers: {
      'service_location': 'Building C, Room 104'
    },
    feedback: 'Fast response when resetting portal credentials in the computer lab. Wi-Fi signal in Building C could still use higher bandwidth during peak lecture hours.',
    isAnonymous: true,
    feedbackDate: '13.09.2026',
    status: 'DONE',
    responseNote: 'Campus network operations has scheduled a wireless access point upgrade in Building C for next month.'
  },
  {
    id: 3,
    sourceType: 'SURVEY',
    sourceDisplayName: 'AD-HOC SURVEY',
    targetId: 2,
    targetTitle: 'Spring 2026 End-of-Term General Satisfaction Survey',
    department: 'Information Systems',
    lecturerName: '',
    studentName: 'Alice Johnson',
    studentEmail: 'alice.student@university.edu',
    rating: 5,
    criteria: {
      'Agreement Score': 5,
      'Initiative Relevance': 5,
      'Priority Level': 4,
    },
    customAnswers: {
      'initiative_feedback': 'Having course evaluations, survey tracking, and UI scaling directly inside the student portal is top notch.'
    },
    feedback: 'The new SIS interface is extremely clean and easy to navigate. Having course evaluation and survey tracking built directly into the student portal makes submission effortless.',
    isAnonymous: false,
    feedbackDate: '28.09.2026',
    status: 'SENT',
    responseNote: ''
  },
  {
    id: 4,
    sourceType: 'SURVEY',
    sourceDisplayName: 'AD-HOC SURVEY',
    targetId: 1,
    targetTitle: 'Fall 2026 Mid-Semester Campus Experience Survey',
    department: 'Campus Facilities & Services',
    lecturerName: '',
    studentName: 'Bob Miller',
    studentEmail: 'bob.student@university.edu',
    rating: 4,
    criteria: {
      'Agreement Score': 4,
      'Initiative Relevance': 5,
      'Priority Level': 5,
    },
    customAnswers: {
      'initiative_feedback': 'More quiet study zones in the library during finals week would greatly help.'
    },
    feedback: 'Extracurricular clubs are very active this semester. Expanding evening study spaces would make campus life even better.',
    isAnonymous: false,
    feedbackDate: '02.10.2026',
    status: 'IN_REVIEW',
    responseNote: 'Survey response noted. University administration is currently reviewing extended library room allocations.'
  },
  {
    id: 5,
    sourceType: 'SERVICE_REVIEW',
    sourceDisplayName: 'CAMPUS SERVICE REVIEW',
    targetId: 2,
    targetTitle: 'Main Campus Cafeteria',
    department: 'Campus Facilities & Services',
    lecturerName: '',
    studentName: 'Anonymous Student',
    studentEmail: '',
    category: 'Cafeteria',
    rating: 3,
    criteria: {
      'Service Speed': 3,
      'Staff Assistance': 4,
      'Facility & Equipment Quality': 3,
    },
    customAnswers: {
      'service_location': 'Student Center Ground Floor'
    },
    feedback: 'Lunch line moves slowly between 12:30 and 13:15. Additional vegetarian and gluten-free meal options would be appreciated.',
    isAnonymous: true,
    feedbackDate: '03.10.2026',
    status: 'SENT',
    responseNote: ''
  },
  {
    id: 6,
    sourceType: 'COURSE_EVALUATION',
    sourceDisplayName: 'COURSE EVALUATION',
    targetId: 2,
    targetTitle: 'CS302 - Operating Systems & Distributed Architecture',
    department: 'Computer Science & Engineering',
    lecturerName: 'Dr. Alan Smith',
    studentName: 'Bob Miller',
    studentEmail: 'bob.student@university.edu',
    rating: 5,
    criteria: {
      'Course Content': 5,
      'Instructor Clarity': 5,
      'Workload Balance': 4,
    },
    customAnswers: {
      'strengths': 'Kernel threads and memory paging labs gave deep insights into OS internals.'
    },
    semester: 'Fall 2026',
    feedback: 'Dr. Alan Smith provides clear breakdowns of complex concurrency primitives and synchronization locks. Highly recommended course.',
    isAnonymous: false,
    feedbackDate: '10.10.2026',
    status: 'DONE',
    responseNote: 'Great performance in the laboratory sessions! Keep exploring distributed systems architectures.'
  },
  {
    id: 7,
    sourceType: 'COURSE_EVALUATION',
    sourceDisplayName: 'COURSE EVALUATION',
    targetId: 3,
    targetTitle: 'AI401 - Deep Learning & Natural Language Understanding',
    department: 'Data Science & Artificial Intelligence',
    lecturerName: 'Dr. Sarah Connor',
    studentName: 'Alice Johnson',
    studentEmail: 'alice.student@university.edu',
    rating: 4,
    criteria: {
      'Course Content': 5,
      'Instructor Clarity': 4,
      'Workload Balance': 3,
    },
    customAnswers: {
      'strengths': 'Hands-on transformer architecture assignments and PyTorch code walkthroughs.'
    },
    semester: 'Fall 2026',
    feedback: 'The lectures on attention mechanisms and large language models are cutting-edge. The second homework had a steep GPU training curve, but tutor sessions were helpful.',
    isAnonymous: false,
    feedbackDate: '18.10.2026',
    status: 'IN_REVIEW',
    responseNote: 'GPU cluster quotas for students have been increased to ensure smoother training runs.'
  },
  {
    id: 8,
    sourceType: 'COURSE_EVALUATION',
    sourceDisplayName: 'COURSE EVALUATION',
    targetId: 1,
    targetTitle: 'INF451 - Advanced Software Architecture',
    department: 'Computer Science & Engineering',
    lecturerName: 'Dr. Alan Smith',
    studentName: 'Anonymous Student',
    studentEmail: '',
    rating: 4,
    criteria: {
      'Course Content': 4,
      'Instructor Clarity': 5,
      'Workload Balance': 4,
    },
    customAnswers: {
      'strengths': 'Clean code architecture and domain-driven design principles.'
    },
    semester: 'Fall 2026',
    feedback: 'Lecturer explains architectural trade-offs very effectively. Would love to have more recorded lecture recaps before midterms.',
    isAnonymous: true,
    feedbackDate: '21.10.2026',
    status: 'SENT',
    responseNote: ''
  }
];

function formatDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

export function parseFeedbackDate(dateStr) {
  if (!dateStr) return null;
  const dotParts = dateStr.split('.');
  if (dotParts.length === 3) {
    const day = parseInt(dotParts[0], 10);
    const month = parseInt(dotParts[1], 10) - 1;
    const year = parseInt(dotParts[2], 10);
    return new Date(year, month, day);
  }
  const dashParts = dateStr.split('-');
  if (dashParts.length === 3) {
    const year = parseInt(dashParts[0], 10);
    const month = parseInt(dashParts[1], 10) - 1;
    const day = parseInt(dashParts[2], 10);
    return new Date(year, month, day);
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

export function enrichFeedback(item) {
  let dept = item.department;
  let lecturer = item.lecturerName;

  if (!dept) {
    const title = (item.targetTitle || '').toLowerCase();
    if (title.includes('inf451') || title.includes('cs302') || title.includes('computer science') || title.includes('software')) {
      dept = 'Computer Science & Engineering';
    } else if (title.includes('ai401') || title.includes('deep learning') || title.includes('data science') || title.includes('artificial intelligence')) {
      dept = 'Data Science & Artificial Intelligence';
    } else if (title.includes('information') || title.includes('systems') || title.includes('lms')) {
      dept = 'Information Systems';
    } else if (title.includes('math') || title.includes('statistics')) {
      dept = 'Mathematics & Statistics';
    } else if (item.sourceType === 'SERVICE_REVIEW' || title.includes('library') || title.includes('cafeteria') || title.includes('helpdesk') || title.includes('sports') || title.includes('facility')) {
      dept = 'Campus Facilities & Services';
    } else {
      dept = 'General University';
    }
  }

  if (!lecturer) {
    const title = (item.targetTitle || '').toLowerCase();
    if (title.includes('inf451') || title.includes('cs302')) {
      lecturer = 'Dr. Alan Smith';
    } else if (title.includes('ai401')) {
      lecturer = 'Dr. Sarah Connor';
    }
  }

  return {
    ...item,
    department: dept,
    lecturerName: lecturer || '',
  };
}

export const feedbackService = {
  async getFeedbacks(sourceTypeFilter = null, statusFilter = null) {
    const raw = localStorage.getItem(STORAGE_KEY);
    let list = [];
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FEEDBACKS));
      list = INITIAL_FEEDBACKS;
    } else {
      try {
        const parsed = JSON.parse(raw);
        // If parsed has fewer items than default, merge or ensure initial ones exist
        if (Array.isArray(parsed) && parsed.length < INITIAL_FEEDBACKS.length) {
          const existingIds = new Set(parsed.map(p => p.id));
          const missing = INITIAL_FEEDBACKS.filter(init => !existingIds.has(init.id));
          list = [...parsed, ...missing];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        } else {
          list = Array.isArray(parsed) ? parsed : INITIAL_FEEDBACKS;
        }
      } catch {
        list = INITIAL_FEEDBACKS;
      }
    }

    let result = list.map(enrichFeedback);

    if (sourceTypeFilter && sourceTypeFilter !== 'ALL') {
      result = result.filter(item => item.sourceType === sourceTypeFilter);
    }
    if (statusFilter && statusFilter !== 'ALL') {
      result = result.filter(item => item.status === statusFilter);
    }
    return result;
  },

  async getFeedbackById(id) {
    const feedbacks = await this.getFeedbacks();
    return feedbacks.find(f => f.id === Number(id)) || null;
  },

  async submitFeedback({
    sourceType = 'COURSE_EVALUATION',
    sourceDisplayName = '',
    targetId = null,
    targetTitle = '',
    department = '',
    lecturerName = '',
    studentName = 'Alice Johnson',
    studentEmail = 'alice.student@university.edu',
    category = '',
    rating = 5,
    criteria = {},
    customAnswers = {},
    semester = 'Fall 2026',
    text = '',
    isAnonymous = false,
  }) {
    const feedbacks = await this.getFeedbacks();
    const nextId = feedbacks.length > 0 ? Math.max(...feedbacks.map(f => f.id || 0)) + 1 : 1;

    const newFeedback = enrichFeedback({
      id: nextId,
      sourceType,
      sourceDisplayName: sourceDisplayName || sourceType.replace(/_/g, ' '),
      targetId: targetId ? Number(targetId) : null,
      targetTitle: targetTitle || 'General Feedback',
      department: department || 'Computer Science & Engineering',
      lecturerName: lecturerName || '',
      studentName: isAnonymous ? 'Anonymous Student' : (studentName || 'Student'),
      studentEmail: isAnonymous ? '' : (studentEmail || ''),
      category: category || undefined,
      rating: Number(rating) || 5,
      criteria: criteria || {},
      customAnswers: customAnswers || {},
      semester: semester || 'Fall 2026',
      feedback: text.trim(),
      isAnonymous: Boolean(isAnonymous),
      feedbackDate: formatDate(new Date()),
      status: 'SENT',
      responseNote: '',
    });

    const updated = [newFeedback, ...feedbacks];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newFeedback;
  },

  async updateFeedbackStatus(id, newStatus, responseNote = null) {
    const feedbacks = await this.getFeedbacks();
    const updated = feedbacks.map(f => {
      if (f.id === Number(id)) {
        return {
          ...f,
          status: newStatus || f.status,
          responseNote: responseNote !== null ? responseNote : f.responseNote,
        };
      }
      return f;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  },

  async deleteFeedback(id) {
    const feedbacks = await this.getFeedbacks();
    const updated = feedbacks.filter(f => f.id !== Number(id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  },

  async getSurveyAnalytics() {
    const feedbacks = await this.getFeedbacks('SURVEY');
    const surveyMap = {};

    feedbacks.forEach(f => {
      const sId = f.targetId || 1;
      if (!surveyMap[sId]) {
        surveyMap[sId] = {
          surveyId: sId,
          surveyTitle: f.targetTitle,
          responsesCount: 0,
          totalRating: 0,
          ratingsBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          criteriaAverages: {},
          responses: []
        };
      }

      surveyMap[sId].responsesCount += 1;
      const r = f.rating || 5;
      surveyMap[sId].totalRating += r;
      surveyMap[sId].ratingsBreakdown[r] = (surveyMap[sId].ratingsBreakdown[r] || 0) + 1;
      surveyMap[sId].responses.push(f);

      if (f.criteria) {
        Object.entries(f.criteria).forEach(([critName, score]) => {
          if (!surveyMap[sId].criteriaAverages[critName]) {
            surveyMap[sId].criteriaAverages[critName] = { sum: 0, count: 0 };
          }
          surveyMap[sId].criteriaAverages[critName].sum += Number(score);
          surveyMap[sId].criteriaAverages[critName].count += 1;
        });
      }
    });

    return Object.values(surveyMap).map(s => {
      const avg = (s.totalRating / (s.responsesCount || 1)).toFixed(1);
      const criteriaFinal = {};
      Object.entries(s.criteriaAverages).forEach(([cName, data]) => {
        criteriaFinal[cName] = (data.sum / (data.count || 1)).toFixed(1);
      });

      return {
        ...s,
        averageRating: Number(avg),
        criteriaScores: criteriaFinal
      };
    });
  }
};

export default feedbackService;
