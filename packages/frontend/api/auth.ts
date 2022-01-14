import axiosClient from 'api/axiosClient';
import queryString from 'query-string';

const authService = {
  forgotPassword: (email: string) => {
    const url = `users/forgot-password`;
    return axiosClient.post(url, { email });
  },

  resetPassword: (params: { token: string; password: string }) => {
    const { token, password } = params;
    const query = queryString.stringify({ token });
    const url = `users/reset-password?${query}`;
    return axiosClient.post(url, { password });
  },
};

export default authService;
