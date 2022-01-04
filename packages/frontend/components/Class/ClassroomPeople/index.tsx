import Modal from 'components/Modal';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { ClassroomDto } from 'types/classroom.dto';
import { StudentDto } from 'types/student.dto';
import { useMutation } from 'react-query';
import classApi from 'api/class';
import Input, { InputCategory, InputType } from 'components/Form/Input';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { useForm, FormProvider } from 'react-hook-form';

type Props = {
  classroom: ClassroomDto;
  students: StudentDto[];
};

type FormFields = {
  email: string;
};

enum Role {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
}

const schema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required.')
    .max(150, 'Email is max 150 characters.')
    .email('Email is in correct'),
});

const ClassroomPeople = ({ classroom, students }: Props) => {
  const methods = useForm<FormFields>({
    mode: 'all',
    resolver: yupResolver(schema),
  });

  const { handleSubmit, reset } = methods;

  const [isOpenInviteStudentModal, setIsOpenInviteStudentModal] =
    useState<boolean>(false);
  const [isOpenInviteTeacherModal, setIsOpenInviteTeacherModal] =
    useState<boolean>(false);

  const inviteStudentLinkRef = useRef<string>('');
  const inviteTeacherLinkRef = useRef<string>('');

  const openInviteStudentModal = () => setIsOpenInviteStudentModal(true);
  const closeInviteStudentModal = () => setIsOpenInviteStudentModal(false);
  const openInviteTeacherModal = () => setIsOpenInviteTeacherModal(true);
  const closeInviteTeacherModal = () => setIsOpenInviteTeacherModal(false);

  const { mutateAsync: mutateInviteStudentLink } = useMutation(
    classApi.getInviteStudentLink,
    {
      onSuccess: (link) => {
        inviteStudentLinkRef.current = link;
      },
      onError: () => {
        toast.error('Get invite student link unsuccessfully.');
      },
    }
  );

  const { mutateAsync: mutateInviteTeacherLink } = useMutation(
    classApi.getInviteTeacherLink,
    {
      onSuccess: (link) => {
        inviteTeacherLinkRef.current = link;
      },
      onError: () => {
        toast.error('Get invite teacher link unsuccessfully.');
      },
    }
  );

  const { mutateAsync: inviteStudentByEmail } = useMutation(
    classApi.inviteStudentByEmail,
    {
      onSuccess: () => {
        toast.success('Invite student by email successfully.');
      },
      onError: () => {
        toast.error('Invite student by email unsuccessfully.');
      },
    }
  );

  const { mutateAsync: inviteTeacherByEmail } = useMutation(
    classApi.inviteTeacherByEmail,
    {
      onSuccess: () => {
        toast.success('Invite teacher by email successfully.');
      },
      onError: () => {
        toast.error('Invite teacher by email unsuccessfully.');
      },
    }
  );

  useEffect(() => {
    const getInviteStudentLink = async () => {
      mutateInviteStudentLink(classroom.id);
    };

    const getInviteTeacherLink = async () => {
      //mutateInviteTeacherLink(classroom.id);
      inviteTeacherLinkRef.current = 'dummy link';
    };

    getInviteStudentLink();
    getInviteTeacherLink();
  }, []);

  const copyToClipboard = (link: string) => () => {
    navigator.clipboard.writeText(link);
    toast.success('Copy to clipboard successfully.');
  };

  const inviteByEmail = (role: Role) =>
    handleSubmit(({ email }: FormFields) => {
      if (role === Role.STUDENT) {
        console.log('send invitation email for student.');
        //inviteStudentByEmail({ classroomId: classroom.id, email });
        closeInviteStudentModal();
      }

      if (role === Role.TEACHER) {
        console.log('send invitation email for teacher.');
        //inviteTeacherByEmail({ classroomId: classroom.id, email });
        closeInviteTeacherModal();
      }

      reset();
    });

  return (
    <div>
      <div className="row">
        <div className="border-bottom border-primary d-flex justify-content-between text-primary">
          <h2 className="h3">Teachers</h2>
          <i onClick={openInviteTeacherModal} className="fas fa-user-plus"></i>
        </div>
        {classroom.teachers?.map((teacher) => (
          <div key={teacher.id} className="my-3 d-flex align-items-center">
            <div
              style={{ width: '30px', height: '30px' }}
              className="bg-primary rounded-circle"
            ></div>
            <h2 className="h6 m-0 p-0 ms-3">{teacher.fullName}</h2>
          </div>
        ))}
      </div>
      <div className="row mt-5">
        <div className="border-bottom border-primary d-flex justify-content-between text-primary">
          <h2 className="h3">Students</h2>
          <i onClick={openInviteStudentModal} className="fas fa-user-plus"></i>
        </div>
        {students.map((student) => (
          <div key={student.id} className="my-3 d-flex align-items-center">
            <div
              style={{ width: '30px', height: '30px' }}
              className="bg-primary rounded-circle"
            ></div>
            <h2 className="h6 m-0 p-0 ms-3">{student.fullName}</h2>
          </div>
        ))}
      </div>
      <div className="row mt-5 text-primary">
        <a onClick={openInviteStudentModal}>
          <i className="fas fa-user-plus me-3"></i>
          Invite student
        </a>
      </div>
      <Modal
        isOpen={isOpenInviteStudentModal}
        title={`Invite Student`}
        handleCloseModal={closeInviteStudentModal}
      >
        <div style={{ width: '400px' }} className="mb-3">
          <div className="row mb-3">
            <label htmlFor="exampleFormControlInput1" className="form-label">
              Invite Link
            </label>
            <div className="d-flex align-items-center">
              <input
                type="text"
                className="form-control"
                id="exampleFormControlInput1"
                placeholder={inviteStudentLinkRef.current}
                readOnly
              />
              <i
                onClick={copyToClipboard(inviteStudentLinkRef.current)}
                className="fas fa-copy text-primary ms-3"
              ></i>
            </div>
          </div>
          <FormProvider {...methods}>
            <form onSubmit={inviteByEmail(Role.STUDENT)} noValidate>
              <Input
                type={InputType.TEXT}
                category={InputCategory.INPUT}
                name={'email'}
                label="Student Email"
              />
              <button type="submit" className="btn btn-primary">
                Invite
              </button>
            </form>
          </FormProvider>
        </div>
      </Modal>
      <Modal
        isOpen={isOpenInviteTeacherModal}
        title={`Invite Teacher`}
        handleCloseModal={closeInviteTeacherModal}
      >
        <div style={{ width: '400px' }} className="mb-3">
          <div className="row mb-3">
            <label htmlFor="exampleFormControlInput1" className="form-label">
              Invite Link
            </label>
            <div className="d-flex align-items-center">
              <input
                type="text"
                className="form-control"
                id="exampleFormControlInput1"
                placeholder={inviteTeacherLinkRef.current}
                readOnly
              />
              <i
                onClick={copyToClipboard(inviteTeacherLinkRef.current)}
                className="fas fa-copy text-primary ms-3"
              ></i>
            </div>
          </div>
          <FormProvider {...methods}>
            <form onSubmit={inviteByEmail(Role.TEACHER)} noValidate>
              <Input
                type={InputType.TEXT}
                category={InputCategory.INPUT}
                name={'email'}
                label="Teacher Email"
              />
              <button type="submit" className="btn btn-primary">
                Invite
              </button>
            </form>
          </FormProvider>
        </div>
      </Modal>
    </div>
  );
};

export default ClassroomPeople;
