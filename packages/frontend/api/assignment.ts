import { UpdateAssignmentDto } from 'types/assignment.dto';
import axiosClient from './axiosClient';

const assignmentApi = {
  update: (params: {
    classroomId?: string;
    updateAssignmentDto: UpdateAssignmentDto;
  }) => {
    const { classroomId, updateAssignmentDto } = params;
    const url = `/classes/update-assignments/${classroomId}`;
    return axiosClient.post(url, { assignments: updateAssignmentDto });
  },
};

export default assignmentApi;
