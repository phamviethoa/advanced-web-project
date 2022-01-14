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
};

export default userService;
