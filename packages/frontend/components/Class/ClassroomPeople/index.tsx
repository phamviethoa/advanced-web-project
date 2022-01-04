import Modal from 'components/Modal';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ClassroomDto } from 'types/classroom.dto';
import { StudentDto } from 'types/student.dto';

type Props = {
  classroom: ClassroomDto;
  students: StudentDto[];
};

const ClassroomPeople = ({ classroom, students }: Props) => {
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

  useEffect(() => {
    const getInviteStudentLink = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_GATEWAY}/classes/invite-student-link/${classroom.id}`
        );

        const inviteLink = res.data;
        inviteStudentLinkRef.current = inviteLink;
      } catch (e) {
        toast.error('Error when get invite student link.');
      }
    };

    const getInviteTeacherLink = async () => {
      // call api to get invite teacher link
      inviteTeacherLinkRef.current = 'this is invite teacher link';
    };

    getInviteStudentLink();
    getInviteTeacherLink();
  }, []);

  const copyToClipboard = (link: string) => () => {
    navigator.clipboard.writeText(link);
    toast.success('Copy to clipboard successfully.');
  };

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
        </div>
      </Modal>
    </div>
  );
};

export default ClassroomPeople;
