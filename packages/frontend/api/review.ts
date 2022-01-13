import axiosClient from 'api/axiosClient';

const reviewService = {
  getAll: async (classroomId: string) => {
    const url = `classes/${classroomId}/reviews`;
    return await axiosClient.get(url);
  },

  getReview: async (params: { reviewId: string; classroomId: string }) => {
    const { reviewId, classroomId } = params;
    const url = `classes/${classroomId}/review/${reviewId}`;
    return await axiosClient.get(url);
  },
};

export default reviewService;
