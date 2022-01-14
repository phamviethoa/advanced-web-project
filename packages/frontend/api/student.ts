import axiosClient from 'api/axiosClient';

const studentService = {
  getGrades: async (params: { classroomId: string; studentId: string }) => {
    const { classroomId, studentId } = params;
    const url = `students/grades/${classroomId}/${studentId}`;
    return axiosClient.get(url);
  },

  joinClassByCode: async (params: { code: string; identity: string }) => {
    const { code, identity } = params;
    const url = `students/join-class-by-code`;
    return axiosClient.post(url, { code, identity });
  },

  requestGradeReview: async (params: {
    gradeId?: string;
    expectation: number;
    explanation: string;
  }) => {
    const { gradeId, expectation, explanation } = params;
    const url = `students/request-grade-review/${gradeId}`;
    return axiosClient.post(url, { expectation, explanation });
  },
};

export default studentService;
