import request from './api';
import coursesService from './courses';
import servicesService from './services';
import surveysService from './surveys';

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
    responseNote: 'Thank you for your valuable feedback! The curriculum for next semester will include even more real-world cloud deployment case studies.',
    sentiment: 'POSITIVE',
    sentimentScore: 0.96,
    sentimentStatus: 'DONE',
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
    responseNote: 'Campus network operations has scheduled a wireless access point upgrade in Building C for next month.',
    sentiment: 'POSITIVE',
    sentimentScore: 0.88,
    sentimentStatus: 'DONE',
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
    responseNote: '',
    sentiment: 'POSITIVE',
    sentimentScore: 0.95,
    sentimentStatus: 'DONE',
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
    responseNote: 'Survey response noted. University administration is currently reviewing extended library room allocations.',
    sentiment: 'POSITIVE',
    sentimentScore: 0.86,
    sentimentStatus: 'DONE',
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
    rating: 2,
    criteria: {
      'Service Speed': 2,
      'Staff Assistance': 3,
      'Facility & Equipment Quality': 2,
    },
    customAnswers: {
      'service_location': 'Student Center Ground Floor'
    },
    feedback: 'Lunch line moves painfully slow between 12:30 and 13:15. Food was cold, tables were dirty, and very limited vegetarian meal options.',
    isAnonymous: true,
    feedbackDate: '03.10.2026',
    status: 'SENT',
    responseNote: '',
    sentiment: 'NEGATIVE',
    sentimentScore: 0.91,
    sentimentStatus: 'DONE',
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
    responseNote: 'Great performance in the laboratory sessions! Keep exploring distributed systems architectures.',
    sentiment: 'POSITIVE',
    sentimentScore: 0.97,
    sentimentStatus: 'DONE',
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
    responseNote: 'GPU cluster quotas for students have been increased to ensure smoother training runs.',
    sentiment: 'NEUTRAL',
    sentimentScore: 0.72,
    sentimentStatus: 'DONE',
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
    rating: 2,
    criteria: {
      'Course Content': 3,
      'Instructor Clarity': 2,
      'Workload Balance': 2,
    },
    customAnswers: {
      'strengths': 'Architecture theory is interesting.'
    },
    semester: 'Fall 2026',
    feedback: 'Pacing was difficult to follow. The sprint deadlines collided with midterms, and grading rubrics for lab code reviews felt unclear and delayed.',
    isAnonymous: true,
    feedbackDate: '21.10.2026',
    status: 'SENT',
    responseNote: '',
    sentiment: 'NEGATIVE',
    sentimentScore: 0.89,
    sentimentStatus: 'DONE',
  },
  {
    id: 9,
    sourceType: 'COURSE_EVALUATION',
    sourceDisplayName: 'COURSE EVALUATION',
    targetId: 1,
    targetTitle: 'INF451 - Advanced Software Architecture',
    department: 'Computer Science & Engineering',
    lecturerName: 'Dr. Alan Smith',
    studentName: 'Bob Miller',
    studentEmail: 'bob.student@university.edu',
    rating: 3,
    criteria: {
      'Course Content': 4,
      'Instructor Clarity': 3,
      'Workload Balance': 3,
    },
    customAnswers: {
      'strengths': 'Clean code design patterns.'
    },
    semester: 'Fall 2026',
    feedback: 'Course content followed standard architectural patterns. Practical exercises were standard and covered the syllabus at an average pace.',
    isAnonymous: false,
    feedbackDate: '25.10.2026',
    status: 'DONE',
    responseNote: 'Noted. Additional real-world patterns will be introduced.',
    sentiment: 'NEUTRAL',
    sentimentScore: 0.68,
    sentimentStatus: 'DONE',
  },
  {
    id: 10,
    sourceType: 'COURSE_EVALUATION',
    sourceDisplayName: 'COURSE EVALUATION',
    targetId: 3,
    targetTitle: 'AI401 - Deep Learning & Natural Language Understanding',
    department: 'Data Science & Artificial Intelligence',
    lecturerName: 'Dr. Sarah Connor',
    studentName: 'Anonymous Student',
    studentEmail: '',
    rating: 4,
    criteria: {
      'Course Content': 4,
      'Instructor Clarity': 4,
      'Workload Balance': 4,
    },
    customAnswers: {
      'strengths': 'NLP transformer pipelines.'
    },
    semester: 'Fall 2026',
    feedback: 'Fresh feedback entry submitted just now awaiting AI sentiment scoring processing.',
    isAnonymous: true,
    feedbackDate: '05.11.2026',
    status: 'SENT',
    responseNote: '',
    sentiment: 'PENDING',
    sentimentScore: null,
    sentimentStatus: 'PENDING',
  }
];

export function analyzeSentiment(text = '', rating = null) {
  const t = (text || '').toLowerCase();
  const positiveWords = [
    'excellent', 'great', 'outstanding', 'superb', 'clear', 'helpful', 'amazing',
    'good', 'love', 'loved', 'best', 'effective', 'enjoyed', 'insightful',
    'top-notch', 'exceptional', 'fast', 'organized', 'recommended', 'appreciate',
    'clean', 'smooth', 'modern', 'effortless', 'brilliant', 'wonderful', 'inspiring'
  ];
  const negativeWords = [
    'terrible', 'horrible', 'awful', 'bad', 'poor', 'worst', 'slow', 'broken',
    'delay', 'delays', 'delayed', 'confused', 'confusing', 'unclear', 'difficult',
    'hard', 'useless', 'frustrating', 'rude', 'dirty', 'boring', 'disorganized',
    'fail', 'failed', 'steep', 'painfully', 'waste', 'disappointing'
  ];

  let posCount = 0;
  let negCount = 0;

  positiveWords.forEach(w => {
    if (t.includes(w)) posCount += 1.0;
  });
  negativeWords.forEach(w => {
    if (t.includes(w)) negCount += 1.0;
  });

  if (rating !== null) {
    if (rating >= 4) posCount += (rating - 3) * 0.8;
    else if (rating <= 2) negCount += (3 - rating) * 0.8;
  }

  const diff = posCount - negCount;
  if (diff > 0.3) {
    const score = Math.min(0.99, Math.max(0.65, 0.5 + (diff / (posCount + negCount + 1)) * 0.5));
    return { label: 'POSITIVE', score: Math.round(score * 100) / 100 };
  } else if (diff < -0.3) {
    const score = Math.min(0.99, Math.max(0.65, 0.5 + (Math.abs(diff) / (posCount + negCount + 1)) * 0.5));
    return { label: 'NEGATIVE', score: Math.round(score * 100) / 100 };
  } else {
    return { label: 'NEUTRAL', score: 0.65 };
  }
}

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

  let sentiment = item.sentiment;
  let sentimentScore = item.sentimentScore;
  let sentimentStatus = item.sentimentStatus;

  if (!sentimentStatus) {
    if (sentiment) {
      sentimentStatus = sentiment === 'PENDING' ? 'PENDING' : 'DONE';
    } else {
      const analyzed = analyzeSentiment(item.feedback, item.rating);
      sentiment = analyzed.label;
      sentimentScore = analyzed.score;
      sentimentStatus = 'DONE';
    }
  }

  return {
    ...item,
    department: dept,
    lecturerName: lecturer || '',
    sentiment: sentiment || 'NEUTRAL',
    sentimentScore: sentimentScore !== undefined ? sentimentScore : 0.70,
    sentimentStatus: sentimentStatus || 'DONE',
  };
}

export const feedbackService = {
  async getFeedbacks(sourceTypeFilter = null, statusFilter = null, sentimentFilter = null) {
    const raw = localStorage.getItem(STORAGE_KEY);
    let list = [];
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FEEDBACKS));
      list = INITIAL_FEEDBACKS;
    } else {
      try {
        const parsed = JSON.parse(raw);
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
    if (sentimentFilter && sentimentFilter !== 'ALL') {
      result = result.filter(item => {
        if (sentimentFilter === 'PENDING') {
          return item.sentimentStatus === 'PENDING' || item.sentiment === 'PENDING';
        }
        return item.sentiment === sentimentFilter && item.sentimentStatus === 'DONE';
      });
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

    // US4.1: Scoring must not block submission of feedback.
    // Entry is initially stored with "Sentiment pending"
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
      sentiment: 'PENDING',
      sentimentScore: null,
      sentimentStatus: 'PENDING',
    });

    const updated = [newFeedback, ...feedbacks];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Try sending to backend in parallel (non-blocking)
    try {
      request('/feedbacks', {
        method: 'POST',
        body: JSON.stringify({
          source_type: sourceType.toLowerCase(),
          course_id: sourceType === 'COURSE_EVALUATION' ? targetId : null,
          service_id: sourceType === 'SERVICE_REVIEW' ? targetId : null,
          survey_id: sourceType === 'SURVEY' ? targetId : null,
          raw_text: text.trim(),
          rating: Number(rating) || 5,
          is_anonymous: Boolean(isAnonymous),
        }),
      }).catch(() => {});
    } catch {}

    // Asynchronous background AI sentiment processing
    setTimeout(() => {
      try {
        const analyzed = analyzeSentiment(text.trim(), Number(rating) || 5);
        const currentStored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const processedList = currentStored.map(item => {
          if (item.id === nextId) {
            return {
              ...item,
              sentiment: analyzed.label,
              sentimentScore: analyzed.score,
              sentimentStatus: 'DONE',
            };
          }
          return item;
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(processedList));
      } catch (err) {
        console.error('Background sentiment scoring error:', err);
      }
    }, 1800);

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

  async getSentimentBreakdown(categoryType = 'courses') {
    const norm = (categoryType || 'courses').toLowerCase();
    const backendCat = norm.includes('course') ? 'course' : norm.includes('service') ? 'service' : 'survey';

    // 1. Try fetching from backend API
    try {
      const data = await request(`/analytics/sentiment-breakdown?category_type=${backendCat}`);
      if (data && Array.isArray(data.items)) {
        return data;
      }
    } catch (e) {
      // Fallback to local computation
    }

    // 2. Local aggregation fallback
    const allFeedbacks = await this.getFeedbacks();
    let targets = [];

    if (backendCat === 'course') {
      try {
        const coursesData = await coursesService.getCourses(1, 50);
        targets = (coursesData?.items || []).map(c => ({
          id: c.course_id,
          name: c.title,
          department_name: c.department?.name || 'Computer Science & Engineering',
          entity_type: 'course'
        }));
      } catch {}
      if (targets.length === 0) {
        targets = [
          { id: 1, name: 'INF451 - Advanced Software Architecture', department_name: 'Computer Science & Engineering', entity_type: 'course' },
          { id: 2, name: 'CS302 - Operating Systems & Distributed Architecture', department_name: 'Computer Science & Engineering', entity_type: 'course' },
          { id: 3, name: 'AI401 - Deep Learning & Natural Language Understanding', department_name: 'Data Science & Artificial Intelligence', entity_type: 'course' },
        ];
      }
    } else if (backendCat === 'service') {
      try {
        const srvData = await servicesService.getServices(1, 50);
        targets = (srvData?.items || []).map(s => ({
          id: s.service_id,
          name: s.name,
          department_name: s.category || 'Campus Facilities',
          entity_type: 'service'
        }));
      } catch {}
      if (targets.length === 0) {
        targets = [
          { id: 1, name: 'Central University Library', department_name: 'Library', entity_type: 'service' },
          { id: 2, name: 'Main Campus Cafeteria', department_name: 'Cafeteria', entity_type: 'service' },
          { id: 3, name: 'IT Helpdesk & Systems Support', department_name: 'IT Support', entity_type: 'service' },
          { id: 4, name: 'Student Counseling & Wellness Center', department_name: 'Health & Counseling', entity_type: 'service' },
          { id: 5, name: 'Campus Sports & Recreation Complex', department_name: 'Sports', entity_type: 'service' },
        ];
      }
    } else {
      try {
        const survData = await surveysService.getSurveys(1, 50);
        targets = (survData?.items || []).map(sv => ({
          id: sv.survey_id,
          name: sv.title,
          department_name: sv.topic || 'Campus Survey',
          entity_type: 'survey'
        }));
      } catch {}
      if (targets.length === 0) {
        targets = [
          { id: 1, name: 'Fall 2026 Mid-Semester Campus Experience Survey', department_name: 'Campus Life', entity_type: 'survey' },
          { id: 2, name: 'Spring 2026 End-of-Term General Satisfaction Survey', department_name: 'General Satisfaction', entity_type: 'survey' },
          { id: 3, name: 'Spring 2027 Campus Modernization & Technology Survey', department_name: 'Modernization', entity_type: 'survey' },
        ];
      }
    }

    const items = targets.map(target => {
      // Find matching feedbacks
      const matching = allFeedbacks.filter(f => {
        if (backendCat === 'course') {
          return f.sourceType === 'COURSE_EVALUATION' && (f.targetId === target.id || (f.targetTitle && f.targetTitle.toLowerCase().includes(target.name.toLowerCase())));
        } else if (backendCat === 'service') {
          return f.sourceType === 'SERVICE_REVIEW' && (f.targetId === target.id || (f.targetTitle && f.targetTitle.toLowerCase().includes(target.name.toLowerCase())));
        } else {
          return f.sourceType === 'SURVEY' && (f.targetId === target.id || (f.targetTitle && f.targetTitle.toLowerCase().includes(target.name.toLowerCase())));
        }
      });

      // Constraint: Percentages are calculated ONLY from entries that already have a sentiment
      const analyzedFeedbacks = matching.filter(f => f.sentimentStatus === 'DONE' && f.sentiment !== 'PENDING');
      const totalCount = matching.length;
      const analyzedCount = analyzedFeedbacks.length;

      if (analyzedCount === 0) {
        return {
          id: target.id,
          name: target.name,
          entity_type: target.entity_type,
          department_name: target.department_name,
          total_feedbacks: totalCount,
          analyzed_feedbacks: 0,
          has_data: false,
          positive_percentage: null,
          neutral_percentage: null,
          negative_percentage: null,
          positive_count: 0,
          neutral_count: 0,
          negative_count: 0,
        };
      }

      let pos = 0;
      let neu = 0;
      let neg = 0;

      analyzedFeedbacks.forEach(f => {
        if (f.sentiment === 'POSITIVE') pos += 1;
        else if (f.sentiment === 'NEGATIVE') neg += 1;
        else neu += 1;
      });

      return {
        id: target.id,
        name: target.name,
        entity_type: target.entity_type,
        department_name: target.department_name,
        total_feedbacks: totalCount,
        analyzed_feedbacks: analyzedCount,
        has_data: true,
        positive_percentage: Math.round((pos / analyzedCount) * 1000) / 10,
        neutral_percentage: Math.round((neu / analyzedCount) * 1000) / 10,
        negative_percentage: Math.round((neg / analyzedCount) * 1000) / 10,
        positive_count: pos,
        neutral_count: neu,
        negative_count: neg,
      };
    });

    const categoriesWithData = items.filter(it => it.has_data).length;
    const totalAnalyzed = items.reduce((sum, it) => sum + it.analyzed_feedbacks, 0);
    const totalPos = items.reduce((sum, it) => sum + it.positive_count, 0);
    const totalNeu = items.reduce((sum, it) => sum + it.neutral_count, 0);
    const totalNeg = items.reduce((sum, it) => sum + it.negative_count, 0);

    return {
      category_type: backendCat,
      total_categories: items.length,
      categories_with_data: categoriesWithData,
      total_feedbacks: items.reduce((sum, it) => sum + it.total_feedbacks, 0),
      total_analyzed: totalAnalyzed,
      overall_positive_percentage: totalAnalyzed > 0 ? Math.round((totalPos / totalAnalyzed) * 1000) / 10 : null,
      overall_neutral_percentage: totalAnalyzed > 0 ? Math.round((totalNeu / totalAnalyzed) * 1000) / 10 : null,
      overall_negative_percentage: totalAnalyzed > 0 ? Math.round((totalNeg / totalAnalyzed) * 1000) / 10 : null,
      items,
    };
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
