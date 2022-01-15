import axiosClient from 'api/axiosClient';
import axios from 'axios';
import FileDownload from 'js-file-download';
import { ClassroomDto, CreateClassroomDto } from 'types/classroom.dto';
import { UpdateGradeDto } from 'types/grade.dto';
import queryString from 'query-string';

const classApi = {
  getAll: () => {
    const url = '/classes';
    return axiosClient.get<Array<ClassroomDto>>(url);
  },

  getOwnedClassroom: () => {
    const url = '/classes/owned';
    return axiosClient.get<ClassroomDto[]>(url);
  },

  getJoinedClassroom: () => {
    const url = '/classes/joined';
    return axiosClient.get<ClassroomDto[]>(url);
  },

  getClass: async (id: string) => {
    const url = `${process.env.NEXT_PUBLIC_API_GATEWAY}/classes/${id}`;
    const { data } = await axios.get<ClassroomDto>(url);
    return data;
  },

  createClass: async (body: CreateClassroomDto) => {
    const url = `${process.env.NEXT_PUBLIC_API_GATEWAY}/classes`;
    const { data } = await axios.post(url, body);
    return data;
  },

  getInviteStudentLink: async (classroomId?: string) => {
    const url = `${process.env.NEXT_PUBLIC_API_GATEWAY}/classes/invite-student-link/${classroomId}`;
    const { data } = await axios.get(url);
    return data;
  },

  // This is logic for invite teacher link
  getInviteTeacherLink: async (classroomId?: string) => {
    const url = `${process.env.NEXT_PUBLIC_API_GATEWAY}/classes/invite-teacher-link/${classroomId}`;
    const { data } = await axios.get(url);
    return data;
  },

  inviteStudentByEmail: async (params: {
    classroomId?: string;
    email: string;
  }) => {
    const { classroomId, email } = params;
    const url = `${process.env.NEXT_PUBLIC_API_GATEWAY}/classes/invite-student-by-email/${classroomId}`;
    const { data } = await axios.post(url, { email });
    return data;
  },

  inviteTeacherByEmail: async (params: {
    classroomId?: string;
    email: string;
  }) => {
    const { classroomId, email } = params;
    const url = `${process.env.NEXT_PUBLIC_API_GATEWAY}/classes/invite-teacher-by-email/${classroomId}`;
    const { data } = await axios.post(url, { email });
    return data;
  },

  addStudent: async (params: { identity: string; token: string }) => {
    const { identity, token } = params;
    const query = queryString.stringify({ token });
    const url = `${process.env.NEXT_PUBLIC_API_GATEWAY}/classes/add-student?${query}`;
    const { data } = await axios.post(url, { identity });
    return data;
  },

  addTeacher: async (token: string) => {
    const query = queryString.stringify({ token });
    const url = `${process.env.NEXT_PUBLIC_API_GATEWAY}/classes/add-teacher?${query}`;
    const { data } = await axios.post(url);
    return data;
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
    const { data } = await axios.post<any>(
      `${process.env.NEXT_PUBLIC_API_GATEWAY}/classes/input-grade-student-assignment`,
      params
    );

    return data;
  },

  markAssignmentFinalized: async (assignmentId: string) => {
    const url = `${process.env.NEXT_PUBLIC_API_GATEWAY}/classes/assignments/${assignmentId}/mark-finalized`;
    const { data } = await axios.post(url);
    return data;
  },

  uploadStudentList: async (params: {
    classroomId: string;
    studentListFile: FormData;
  }) => {
    const { classroomId, studentListFile } = params;

    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_GATEWAY}/classes/${classroomId}/upload-list-student`,
      studentListFile
    );

    return data;
  },

  uploadAssignmentGrade: async (params: {
    assignmentId: string;
    gradeListFile: FormData;
  }) => {
    const { assignmentId, gradeListFile } = params;
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_GATEWAY}/classes/upload-assignment-grades/${assignmentId}`,
      gradeListFile
    );

    return data;
  },
};

export default classApi;
