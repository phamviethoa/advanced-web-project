import axiosClient from 'api/axiosClient';
import queryString from 'query-string';
import axios from 'axios';

const userService = {
  getUser: (id: string) =>
    axios
      .get(`${process.env.NEXT_PUBLIC_API_GATEWAY}/users/${id}`)
      .then((res) => res.data),

  activate: (token: string) => {
    const query = queryString.stringify({ token });
    const url = `/users/activate?${query}`;
    return axiosClient.post(url);
  },

  updateUser: async (params: { id?: string; fullName: string }) => {
    const { id } = params;
    const url = `${process.env.NEXT_PUBLIC_API_GATEWAY}/users/${id}`;
    return axios.patch(url, params).then((res) => res.data);
  },

  getUsers: async () => {
    const url = `users`;
    return await axiosClient.get(url);
  },

  addAdmin: async (params: {
    email: string;
    fullName: string;
    password: string;
    isInitial?: boolean;
  }) => {
    const { email, fullName, password, isInitial } = params;
    const url = `users/create-account-admin`;
    return await axiosClient.post(url, {
      email,
      fullName,
      password,
      isInitial: isInitial || false,
    });
  },

  removeUser: async (id: string) => {
    const url = `users/${id}`;
    return await axiosClient.delete(url);
  },

  banUser: async (id: string) => {
    const url = `users/${id}/ban-user`;
    return await axiosClient.get(url);
  },

  unBanUser: async (id: string) => {
    const url = `users/${id}/unban-user`;
    return await axiosClient.get(url);
  },
};

export default userService;
