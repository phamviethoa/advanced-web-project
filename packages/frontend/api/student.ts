import axiosClient from 'api/axiosClient';

const studentService = {
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

  getStudents: async () => {
    const url = `students`;
    return await axiosClient.get(url);
  },

  unMapStudent: async (id: string) => {
    const url = `students/${id}/unmap`;
    return await axiosClient.get(url);
  },

  mapStudent: async (params: { id: string; accountId: string }) => {
    const { id, accountId } = params;
    const url = `students/${id}/map`;
    return await axiosClient.post(url, { accountId });
  },
};

export default studentService;
