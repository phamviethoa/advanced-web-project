import axiosClient from 'api/axiosClient';
import axios from 'axios';
import FileDownload from 'js-file-download';
import { ClassDto } from 'types/class.dto';
import { ClassroomDto } from 'types/classroom.dto';
import { UpdateGradeDto } from 'types/grade.dto';

const classApi = {
  getAll: () => {
    const url = '/classes';
    return axiosClient.get<Array<ClassDto>>(url);
  },

  getClass: async (id: string) => {
    const url = `${process.env.NEXT_PUBLIC_API_GATEWAY}/classes/${id}`;
    const { data } = await axios.get<ClassroomDto>(url);
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
