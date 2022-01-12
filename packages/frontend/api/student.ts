import axiosClient from 'api/axiosClient';

const studentService = {
  getGrades: async (params: { classroomId: string; studentId: string }) => {
    const { classroomId, studentId } = params;
    const url = `students/grades/${classroomId}/${studentId}`;
    return axiosClient.get(url);
  },
};

export default studentService;
