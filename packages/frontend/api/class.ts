import axiosClient from 'api/axiosClient';
import FileDownload from 'js-file-download';
import { ClassroomDto, CreateClassroomDto } from 'types/classroom.dto';
import { UpdateGradeDto } from 'types/grade.dto';
import queryString from 'query-string';

const classApi = {
  getOwnedClassroom: () => {
    const url = '/classes/owned';
    return axiosClient.get<ClassroomDto[]>(url);
  },

  getJoinedClassroom: () => {
    const url = '/classes/joined';
    return axiosClient.get<ClassroomDto[]>(url);
  },

  getClass: async (id: string) => {
    const url = `/classes/${id}`;
    return await axiosClient.get(url);
  },

  createClass: async (body: CreateClassroomDto) => {
    const url = `/classes`;
    return await axiosClient.post(url, body);
  },

  getInviteStudentLink: async (classroomId?: string) => {
    const url = `/classes/invite-student-link/${classroomId}`;
    return await axiosClient.get(url);
  },

  getInviteTeacherLink: async (classroomId?: string) => {
    const url = `/classes/invite-teacher-link/${classroomId}`;
    return await axiosClient.get(url);
  },

  inviteStudentByEmail: async (params: {
    classroomId?: string;
    email: string;
  }) => {
    const { classroomId, email } = params;
    const url = `/classes/invite-student-by-email/${classroomId}`;
    return await axiosClient.post(url, { email });
  },

  inviteTeacherByEmail: async (params: {
    classroomId?: string;
    email: string;
  }) => {
    const { classroomId, email } = params;
    const url = `/classes/invite-teacher-by-email/${classroomId}`;
    return await axiosClient.post(url, { email });
  },

  addStudent: async (params: { identity: string; token: string }) => {
    const { identity, token } = params;
    const query = queryString.stringify({ token });
    const url = `/classes/add-student?${query}`;
    return await axiosClient.post(url, { identity });
  },

  addTeacher: async (token: string) => {
    const query = queryString.stringify({ token });
    const url = `/classes/add-teacher?${query}`;
    return await axiosClient.post(url);
  },

  downloadStudentlistTemplate: async () => {
    const url = `/classes/download-student-list-template`;
    const data = await axiosClient.get(url, { responseType: 'stream' });
    FileDownload(
      data as unknown as string | ArrayBufferView | ArrayBuffer | Blob,
      'template.xlsx'
    );
  },

  updateGrade: async (params: UpdateGradeDto) => {
    const url = `/classes/input-grade-student-assignment`;
    return await axiosClient.post(url, params);
  },

  markAssignmentFinalized: async (assignmentId: string) => {
    const url = `/classes/assignments/${assignmentId}/mark-finalized`;
    return await axiosClient.post(url);
  },

  uploadStudentList: async (params: {
    classroomId: string;
    studentListFile: FormData;
  }) => {
    const { classroomId, studentListFile } = params;
    const url = `/classes/${classroomId}/upload-list-student`;
    return await axiosClient.post(url, studentListFile);
  },

  uploadAssignmentGrade: async (params: {
    assignmentId: string;
    gradeListFile: FormData;
  }) => {
    const { assignmentId, gradeListFile } = params;
    const url = `/classes/upload-assignment-grades/${assignmentId}`;
    return await axiosClient.post(url, gradeListFile);
  },

  getManagedClassrooms: async () => {
    const url = `/classes/managed`;
    return await axiosClient.get(url);
  },
};

export default classApi;
