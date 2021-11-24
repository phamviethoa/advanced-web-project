import axios from 'axios';
import { GetServerSideProps } from 'next';
import * as React from 'react';
import { toast } from 'react-toastify';
import { ClassDto } from 'types/class.dto';
import { UserDto } from 'types/user.dto';
import Layout from '../../components/Layout/index';

type Props = {
  classroom: ClassDto;
  teachers: UserDto[];
  students: UserDto[];
};

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

  return {
    props: { classroom, students, teachers: [] },
  };
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

function DetailClassPage({ classroom, teachers, students }: Props) {
  const classId = classroom.id;

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
        <div className="d-flex justify-content-between">
          <h3>Bài đăng</h3>
          <div>
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
        </div>

        <div className="d-flex justify-content-center">
          <div className="fs-4">Chưa có bài đăng</div>
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
