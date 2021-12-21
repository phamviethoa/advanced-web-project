import axios from 'axios';
import { GetServerSideProps } from 'next';
import * as React from 'react';
import { toast } from 'react-toastify';
import Layout, { LayoutOptions } from '../../components/Layout/index';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { useFieldArray, useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { AssignemtDto } from 'types/assignment.dto';
import Modal from 'components/Modal';
import ClassroomExercise from 'components/Class/ClassroomExercise';
import ClassroomNews from 'components/Class/ClassroomNews';
import ClassroomPeople from 'components/Class/ClassroomPeople';
import ClassroomGrade from 'components/Class/ClassroomGrade';
import { ClassroomDto } from 'types/classroom.dto';
import { StudentDto, StudentInSystemDto } from 'types/student.dto';
import { dehydrate, QueryClient, useQuery } from 'react-query';
import classApi from 'api/class';
import { useRouter } from 'next/router';

const assignmentsSchema = yup.object().shape({
  name: yup
    .string()
    .required('Name is required.')
    .max(150, 'Name is max 100 characters.'),
  maxPoint: yup
    .number()
    .typeError('Point must be a number')
    .required('Point is required.'),
});

const schema = yup.object().shape({
  assignments: yup.array().of(assignmentsSchema),
});

type UpdateAssignment = {
  name: string;
  maxPoint: number;
};

type FormFields = {
  assignments: UpdateAssignment[];
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

enum ClassroomTab {
  NEWS = 'NEWS',
  EXERCISE = 'EXERCISE',
  PEOPLE = 'PEOPLE',
  GRADE = 'GRADE',
}

function DetailClassPage() {
  const [currentTab, setCurrentTab] = useState<ClassroomTab>(ClassroomTab.NEWS);

  const router = useRouter();
  const id = router.query.id;

  const { data: classroom } = useQuery<ClassroomDto>(['class', id], () =>
    classApi.getClass(id as string)
  );

  const navbarOptions: LayoutOptions[] = [
    {
      name: 'News',
      onClick: () => setCurrentTab(ClassroomTab.NEWS),
    },
    {
      name: 'Exercise',
      onClick: () => setCurrentTab(ClassroomTab.EXERCISE),
    },
    {
      name: 'People',
      onClick: () => setCurrentTab(ClassroomTab.PEOPLE),
    },
    {
      name: 'Grade',
      onClick: () => setCurrentTab(ClassroomTab.GRADE),
    },
  ];

  const [assignments, setAssignments] = useState<
    UpdateAssignment[] | AssignemtDto[]
  >(classroom?.assignments || []);

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

  const classId = classroom?.id;

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

  const updateAssignment = handleSubmit(async ({ assignments }) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_GATEWAY}/classes/update-assignments/${classId}`,
        {
          assignments,
        }
      );

      setAssignments(assignments);
      closeUpdateAssignmentModal();
      toast.success('Modify assignments successfully.');
    } catch (e) {
      toast.error('Modify assignments unsuccessfully.');
    }
  });

  const handleOnDragEnd = async (result: any) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(assignments);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setAssignments(items);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_GATEWAY}/classes/update-assignments/${classId}`,
        {
          assignments: items,
        }
      );

      setAssignments(items);
    } catch (e) {
      console.log(e);
    }
  };

  const renderTab = {
    [ClassroomTab.NEWS]: (
      <ClassroomNews
        classroom={classroom as ClassroomDto}
        assignments={assignments as AssignemtDto[]}
        onOpenUpdateAssginmentModal={openUpdateAssignmentModal}
        onHandleOnDragEnd={handleOnDragEnd}
        onGetInviteStudentLink={getInviteStudentLink}
      />
    ),
    [ClassroomTab.EXERCISE]: <ClassroomExercise />,
    [ClassroomTab.PEOPLE]: (
      <ClassroomPeople
        classroom={classroom as ClassroomDto}
        students={classroom?.students as StudentDto[]}
      />
    ),
    [ClassroomTab.GRADE]: (
      <ClassroomGrade classroom={classroom as ClassroomDto} />
    ),
  };

  return (
    <div>
      <Layout options={navbarOptions}>{renderTab[currentTab]}</Layout>
      <Modal
        title="Update Assignments"
        isOpen={isOpenUpdateAssignmentModal}
        handleCloseModal={closeUpdateAssignmentModal}
      >
        <form noValidate onSubmit={updateAssignment}>
          {fields.map(({ id }, index) => {
            return (
              <div className="rounded p-2 my-3 border" key={id}>
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
                        (errors.assignments || [])[index]?.maxPoint
                          ? 'is-invalid'
                          : ''
                      }`}
                      {...register(`assignments.${index}.maxPoint` as const)}
                    />
                    <div className="invalid-feedback">
                      {(errors.assignments || [])[index]?.maxPoint?.message}
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
            <button
              onClick={() => console.log('Clicked!')}
              type="submit"
              className="btn btn-primary ms-3"
            >
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
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery(['class', id], () => classApi.getClass(id)),
  ]);

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};

export default DetailClassPage;
