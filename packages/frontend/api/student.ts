import axiosClient from 'api/axiosClient';

const studentService = {
  getGrades: async (classroomId?: string) => {
    const url = `classes/student-view-grades-compositions/${classroomId}`;
    return axiosClient.get(url);
  },
};

export default studentService;
