import axios from 'axios';
import { GetServerSideProps } from 'next';
import * as React from 'react';
import { toast } from 'react-toastify';
import { ClassDto } from 'types/class.dto';
import { UserDto } from 'types/user.dto';
import Layout from '../../components/Layout/index';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { AssignemtDto } from 'types/assignment.dto';
import Modal from 'components/Modal';

type Props = {
  classroom: ClassDto;
  teachers: UserDto[];
  students: UserDto[];
  assignments: AssignemtDto[];
};

const assignmentsSchema = yup.object().shape({
  name: yup
    .string()
    .required('Name is required.')
    .max(150, 'Name is max 100 characters.'),
  point: yup
    .number()
    .typeError('Point must be a number')
    .required('Point is required.'),
});

const schema = yup.object().shape({
  assignments: yup.array().of(assignmentsSchema),
});

type FormFields = {
  assignments: {
    name: string;
    point: string;
  }[];
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

function DetailClassPage({
  classroom,
  teachers,
  students,
}: //assignments,
Props) {
  const [assignments, setAssignments] = useState([
    {
      name: 'Giua ky',
      point: '30',
    },
    {
      name: 'Cuoi ky',
      point: '70',
    },
  ]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormFields>({
    mode: 'all',
    resolver: yupResolver(schema),
    defaultValues: {
      assignments,
    },
  });

  const { fields, append, remove } = useFieldArray<FormFields>({
    control,
    name: 'assignments',
  });

  const classId = classroom.id;

  const [isOpenUpdateAssignmentModal, setIsOpenUpdateAssignmentModal] =
    useState<boolean>(false);

  const openUpdateAssignmentModal = () => setIsOpenUpdateAssignmentModal(true);
  const closeUpdateAssignmentModal = () =>
    setIsOpenUpdateAssignmentModal(false);

  useEffect(() => {
    reset({ assignments });
  }, [assignments]);

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

  const items = useWatch({
    control,
    name: 'assignments',
  });

  console.log('Items: ', items);
  console.log('Error: ', errors);

  const updateAssignment = handleSubmit(async ({ assignments }) => {
    setAssignments(assignments);
    closeUpdateAssignmentModal();
  });

  return (
    <div>
      <Modal
        title="Update Assignments"
        isOpen={isOpenUpdateAssignmentModal}
        handleCloseModal={closeUpdateAssignmentModal}
      >
        <form noValidate onSubmit={updateAssignment}>
          {fields.map(({ id }, index) => {
            return (
              <div className="rounded shadow-sm p-2 my-3 border" key={id}>
                <div className="row p-3">
                  <div className="col">
                    <input
                      type="text"
                      className={`form-control ${
                        (errors.assignments || [])[index]?.name
                          ? 'is-invalid'
                          : ''
                      }`}
                      {...register(`assignments.${index}.name` as const)}
                    />
                    <div className="invalid-feedback">
                      {(errors.assignments || [])[index]?.name?.message}
                    </div>
                  </div>
                  <div className="col">
                    <input
                      type="text"
                      className={`form-control ${
                        (errors.assignments || [])[index]?.point
                          ? 'is-invalid'
                          : ''
                      }`}
                      {...register(`assignments.${index}.point` as const)}
                    />
                    <div className="invalid-feedback">
                      {(errors.assignments || [])[index]?.point?.message}
                    </div>
                  </div>
                  <div className="col-1 text-center">
                    <a onClick={() => remove(index)}>
                      <i className="fas fa-trash icon-md text-danger"></i>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}

          <a onClick={() => append({})} className="btn btn-primary">
            Add Assignment
          </a>

          <div className="border-top mt-4 pt-3 d-flex flex-row-reverse">
            <button type="submit" className="btn btn-primary ms-3">
              Submit
            </button>
            <button
              onClick={closeUpdateAssignmentModal}
              type="button"
              className="btn btn-light"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
      <Layout>
        <div className="row mt-5">
          <div className="col-3 rounded shadow bg-white p-4 me-3">
            <h2 className="h5 mb-4">
              Assignments
              <a onClick={openUpdateAssignmentModal}>
                <i className="fas fa-pencil-alt d-inline-block ms-3 icon-sm"></i>
              </a>
            </h2>
            {assignments.map((assignment, index) => (
              <div
                key={index}
              >{`${assignment.name} - ${assignment.point}`}</div>
            ))}
          </div>
          <div className="col rounded shadow bg-white p-4">
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
              <button
                onClick={getInviteStudentLink}
                className="btn btn-primary"
              >
                Get Invite Teacher Link
              </button>
            </div>
            <div className="d-flex bd-highlight">
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
          </div>
        </div>
      </Layout>
    </div>
  );
}

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

export default DetailClassPage;
