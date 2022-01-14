import axiosClient from 'api/axiosClient';

const commentService = {
  addGradeComment: async (params: { reviewId: string; message: string }) => {
    const { reviewId, message } = params;
    const url = `/comments`;
    return await axiosClient.post(url, { reviewId, message });
  },
};

export default commentService;
