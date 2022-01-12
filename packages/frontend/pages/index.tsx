import * as React from 'react';
import ClassList from 'pages/class/ClassList';
import { GetServerSideProps } from 'next';
import Layout from 'components/Layout';
import Modal from 'components/Modal';
import { useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import * as yup from 'yup';
import { useForm, FormProvider } from 'react-hook-form';
import { toast } from 'react-toastify';
import Input, { InputType, InputCategory } from 'components/Form/Input';
import {
  dehydrate,
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import classApi from 'api/class';
import { ClassroomDto } from 'types/classroom.dto';

interface FormFields {
  subject: string;
  description: string;
}

const schema = yup.object().shape({
  subject: yup
    .string()
    .required('Subject is required.')
    .max(150, 'Subject is max 150 characters.'),
  description: yup
    .string()
    .required('Description is required.')
    .max(250, 'Description is max 250 characters.'),
});

function Classes() {
  const { data: ownedClasses } = useQuery(
    'owned-classes',
    classApi.getOwnedClassroom
  );
  const { data: joinedClasses } = useQuery(
    'joined-classes',
    classApi.getJoinedClassroom
  );

  const [isOpenCreateClassModal, setIsOpenCreateClassModal] =
    useState<boolean>(false);

  const openCreateClassModal = () => setIsOpenCreateClassModal(true);
  const closeCreateClassModal = () => setIsOpenCreateClassModal(false);

  const methods = useForm<FormFields>({
    mode: 'all',
    resolver: yupResolver(schema),
  });

  const { handleSubmit, reset } = methods;

  const queryClient = useQueryClient();

  const { mutateAsync } = useMutation(classApi.createClass, {
    onSuccess: () => {
      queryClient.invalidateQueries('owned-classes');
      toast.success('Create class successfully.');
    },
    onError: () => {
      toast.error('Create class unsucessfully.');
    },
  });

  const createClass = handleSubmit(
    async ({ subject, description }: FormFields) => {
      mutateAsync({ subject, description });
      closeCreateClassModal();
      reset();
    }
  );

  return (
    <Layout>
      <div className="d-flex justify-content-between">
        <div className="text-muted">
          <a onClick={openCreateClassModal} className="fw-normal">
            <i style={{ fontSize: '0.8rem' }} className="fas fa-plus me-2"></i>
            New class
          </a>
        </div>
      </div>
      <div className="mt-5">
        <h2 className="h4">Your Classrooms</h2>
        <ClassList
          classes={ownedClasses as unknown as ClassroomDto[]}
        ></ClassList>
      </div>
      <div className="mt-5">
        <h2 className="h4">Joined Classrooms</h2>
        <ClassList
          classes={joinedClasses as unknown as ClassroomDto[]}
        ></ClassList>
      </div>
      <Modal
        title="Create classroom"
        isOpen={isOpenCreateClassModal}
        handleCloseModal={closeCreateClassModal}
      >
        <div style={{ width: '400px' }}>
          <FormProvider {...methods}>
            <form onSubmit={createClass} noValidate>
              <Input
                type={InputType.TEXT}
                category={InputCategory.INPUT}
                name={'subject'}
                label={'Subject'}
              />
              <Input
                category={InputCategory.TEXTAREA}
                name={'description'}
                label={'Description'}
              />
              <button type="submit" className="btn btn-primary mt-4">
                Tạo lớp học
              </button>
            </form>
          </FormProvider>
        </div>
      </Modal>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const queryClient = new QueryClient();

  Promise.all([
    queryClient.prefetchQuery('owned-classes', classApi.getOwnedClassroom),
    queryClient.prefetchQuery('joined-classes', classApi.getJoinedClassroom),
  ]);

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};

export default Classes;
