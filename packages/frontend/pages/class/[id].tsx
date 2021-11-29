import axios from 'axios';
import { GetServerSideProps } from 'next';
import * as React from 'react';
import { toast } from 'react-toastify';
import { ClassDto } from 'types/class.dto';
import { UserDto } from 'types/user.dto';
import Layout from '../../components/Layout/index';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import {AssignemtDto} from 'types/assignment.dto';

type Props = {
  classroom: ClassDto;
  teachers: UserDto[];
  students: UserDto[];
  assignments: AssignemtDto[];
};

interface FormFields {
  classid:string;
  name: string;
  point: number;
  order: number;
}

const schema = yup.object().shape({
  classid: yup.string(),
  order: yup.number(),
  name: yup
    .string()
    .required('Subject is required.')
    .max(150, 'Subject is max 150 characters.'),
  point: yup
    .number()
    .required('Subject is required.'),
});

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id;
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_API_GATEWAY}/classes/${id}`
  );
  const classroom: ClassDto = await res.data;

  const studentToClasses = classroom.studentToClass;
  const students: UserDto[] = [];

  for (const studentToClass of studentToClasses || []) {
    const identity = studentToClass.identity;
    const studentToClassId = studentToClass.id;

    const res2 = await axios.get(
      `${process.env.NEXT_PUBLIC_API_GATEWAY}/student-to-class/${studentToClassId}`
    );

    const student = { ...res2.data.student, identity };
    students.push(student);
  }

  const resassignments = await axios.get(
    `${process.env.NEXT_PUBLIC_API_GATEWAY}/assignments/class/${id}`
  );
  const assignments: AssignemtDto = await resassignments.data;

  return {
    props: { classroom, students, teachers: [], assignments },
  };
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

function DetailClassPage({ classroom, teachers, students, assignments }: Props) {
  const classId = classroom.id;
  const [assignmentlist, setassignmentlist]=useState(assignments);

  const getInviteStudentLink = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_GATEWAY}/classes/invite-student-link/${classId}`
      );

      const inviteLink = res.data;
      copyToClipboard(inviteLink);
      toast.success('Invite student link has been copied to the clipboard.');
    } catch (e) {
      toast.error('Get invite link unsuccessfully.');
    }
  };

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormFields>({
    mode: 'all',
    resolver: yupResolver(schema),
  });

  const createClass = handleSubmit(async ({ classid, name, point, order }: FormFields) => {
    classid=classId;
    order=1;
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_GATEWAY}/assignments/`,
        {
          classid,
          name,
          point,
          order
        }
      );
      toast.success('Update assignment grade successfully.');
    } catch {
      toast.error('Update assignment grade unsucessfully.');
    }
  });

  return (
    <div>
      <Layout>
        <h1>Detail Classroom</h1>
        <div className="d-flex justify-content-center">
          <div className="fs-2">Tên môn học: {classroom.subject}</div>
        </div>
        <div className="d-flex justify-content-center">
          <div className="fs-4">Mô tả môn học: {classroom.description}</div>
        </div>
        <div className="d-flex justify-content-center">
            <button type="button" className="btn btn-success mx-3">
              Thêm bài đăng
            </button>
            <button
              onClick={getInviteStudentLink}
              className="btn btn-primary mx-3"
            >
              Get Invite Student Link
            </button>
            <button onClick={getInviteStudentLink} className="btn btn-primary">
              Get Invite Teacher Link
            </button>
          </div>
        <div className="d-flex bd-highlight" >
          <div className="p-2 bd-highlight"> 
            <h3>Assignments</h3>
            <form onSubmit={createClass} noValidate>
              <div className="container ">
                <div className="border border-dark ">
                  <label className="fs-5">Name</label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Name Grade"
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    {...register('name')}
                  />
                  <label className="fs-5">Grade</label>
                  <input
                    type="text"
                    id="Point"
                    placeholder="Point"
                    className={`form-control ${errors.point ? 'is-invalid' : ''}`}
                    {...register('point')}
                  />
                  <div className="d-flex justify-content-around g-md-2">
                    <button type="submit" className="btn btn-primary rounded-pill">Add</button>
                  </div>
                </div>
               </div>
            </form>
          </div>
          <div className="p-2 flex-grow-1 bd-highlight">
          <div className="d-flex justify-content-center">
            <h3>Bài đăng</h3>
          </div>
          <div className="d-flex justify-content-center">
            <div className="fs-4">Chưa có bài đăng</div>
          </div>
          </div>
        </div>
        <h3>Danh sách lớp</h3>
        <h4>Danh sách giáo viên</h4>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">STT</th>
              <th scope="col">Họ và tên</th>
              <th scope="col">Mã số</th>
              <th scope="col">Email</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">1</th>
              <td>Mark</td>
              <td>Otto</td>
              <td>@mdo</td>
            </tr>
          </tbody>
        </table>
        <h4>Danh sách sinh viên</h4>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">STT</th>
              <th scope="col">Họ và tên</th>
              <th scope="col">Mã số</th>
              <th scope="col">Email</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={index}>
                <th scope="row">{index + 1}</th>
                <td>{student.fullName}</td>
                <td>{student.identity}</td>
                <td>{student.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Layout>
    </div>
  );
}

export default DetailClassPage;
