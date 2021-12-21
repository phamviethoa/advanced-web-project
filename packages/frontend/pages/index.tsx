import axios from 'axios';
import * as React from 'react';
import ClassList from 'pages/class/ClassList';
import { GetServerSideProps } from 'next';
import Layout from 'components/Layout';
import Modal from 'components/Modal';
import { useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import * as yup from 'yup';
import { useForm, FormProvider } from 'react-hook-form';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import Input, { InputType, InputCategory } from 'components/Form/Input';
import { dehydrate, QueryClient, useQuery } from 'react-query';
import classApi from 'api/class';
import { ClassDto } from 'types/class.dto';

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
  const router = useRouter();

  const { data: classes } = useQuery('classes', { enabled: false });

  const [isOpenCreateClassModal, setIsOpenCreateClassModal] =
    useState<boolean>(false);

  const openCreateClassModal = () => setIsOpenCreateClassModal(true);
  const closeCreateClassModal = () => setIsOpenCreateClassModal(false);

  const methods = useForm<FormFields>({
    mode: 'all',
    resolver: yupResolver(schema),
  });

  const { handleSubmit } = methods;

  const createClass = handleSubmit(
    async ({ subject, description }: FormFields) => {
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_GATEWAY}/classes`,
          {
            subject,
            description,
          }
        );

        router.push('/');
        toast.success('Create class successfully.');
      } catch {
        toast.error('Create class unsucessfully.');
      }

      closeCreateClassModal();
    }
  );

  return (
    <Layout>
      <div className="d-flex justify-content-between">
        <h1 className="">Classes</h1>
        <div className="text-muted">
          <a onClick={openCreateClassModal} className="fw-normal">
            <i style={{ fontSize: '0.8rem' }} className="fas fa-plus me-2"></i>
            New class
          </a>
        </div>
      </div>
      <ClassList classes={classes as unknown as ClassDto[]}></ClassList>
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
  await queryClient.prefetchQuery('classes', classApi.getAll);

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};

export default Classes;
