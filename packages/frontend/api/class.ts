import axiosClient from 'api/axiosClient';
import { ClassDto } from 'types/class.dto';

const classApi = {
  getAll: () => {
    const url = '/classes';
    return axiosClient.get<Array<ClassDto>>(url);
  },

  getById: (id: string) => {
    const url = `/classes/${id}`;
    return axiosClient.get<ClassDto>(url);
  },
};

export default classApi;
