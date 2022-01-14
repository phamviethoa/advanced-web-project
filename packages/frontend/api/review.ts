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

  closeReview: async (params: {
    reviewId: string;
    classroomId: string;
    grade: number;
  }) => {
    const { reviewId, classroomId, grade } = params;
    const url = `classes/${classroomId}/close-review/${reviewId}`;
    return await axiosClient.post(url, { grade });
  },
};

export default reviewService;
