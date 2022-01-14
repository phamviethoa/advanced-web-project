import axiosClient from 'api/axiosClient';

const notificationService = {
  getNotifications: async () => {
    const url = `/notifications`;
    return await axiosClient.get(url);
  },
};

export default notificationService;
