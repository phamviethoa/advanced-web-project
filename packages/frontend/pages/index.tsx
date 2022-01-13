import * as React from 'react';
import ClassList from 'pages/class/ClassList';
import { GetServerSideProps } from 'next';
import Layout from 'components/Layout';
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
import { PlusOutlined } from '@ant-design/icons';
import { Menu, Dropdown, Modal, Button } from 'antd';
import studentService from 'api/student';

interface FormFields {
  subject: string;
  description: string;
}

interface JoinClassFormFields {
  code: string;
  identity: string;
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

const joinClassSchema = yup.object().shape({
  code: yup.string().required('Classroom code is required.'),
  identity: yup.string().required('Classroom code is required.'),
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

  const [isOpenJoinClassModal, setIsOpenJoinClassModal] =
    useState<boolean>(false);
  const openJoinClassModal = () => setIsOpenJoinClassModal(true);
  const closeJoinClassModal = () => setIsOpenJoinClassModal(false);

  const methods = useForm<FormFields>({
    mode: 'all',
    resolver: yupResolver(schema),
  });

  const joinClassMethods = useForm<JoinClassFormFields>({
    mode: 'all',
    resolver: yupResolver(joinClassSchema),
  });

  const { handleSubmit, reset } = methods;
  const { handleSubmit: joinClassHandleSubmit, reset: joinClassReset } =
    joinClassMethods;

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

  const { mutateAsync: joinClassMutateAsync } = useMutation(
    studentService.joinClassByCode,
    {
      onSuccess: () => {
        queryClient.invalidateQueries('joined-classes');
        toast.success('Join class successfully.');
      },
      onError: () => {
        toast.error('Join class unsucessfully.');
      },
    }
  );

  const createClass = handleSubmit(
    async ({ subject, description }: FormFields) => {
      mutateAsync({ subject, description });
      closeCreateClassModal();
      reset();
    }
  );

  const joinClass = joinClassHandleSubmit(
    async ({ code, identity }: JoinClassFormFields) => {
      joinClassMutateAsync({ code, identity });
      closeJoinClassModal();
      joinClassReset();
    }
  );

  const menu = (
    <Menu>
      <Menu.Item key="1">
        <span onClick={openCreateClassModal}>Add new class</span>
      </Menu.Item>
      <Menu.Item key="2">
        <span onClick={openJoinClassModal}>Join a class</span>
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout>
      <div className="d-flex justify-content-between">
        <div className="text-muted">
          <Dropdown trigger={['click']} overlay={menu}>
            <PlusOutlined />
          </Dropdown>
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
        visible={isOpenCreateClassModal}
        onCancel={closeCreateClassModal}
        footer={[
          <Button key="back" onClick={closeCreateClassModal}>
            Close
          </Button>,
          <Button key="submit" type="primary" onClick={createClass}>
            Add Class
          </Button>,
        ]}
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
            </form>
          </FormProvider>
        </div>
      </Modal>
      <Modal
        title="Join classroom"
        visible={isOpenJoinClassModal}
        onCancel={closeJoinClassModal}
        footer={[
          <Button key="back" onClick={closeJoinClassModal}>
            Close
          </Button>,
          <Button key="submit" type="primary" onClick={joinClass}>
            Join Classroom
          </Button>,
        ]}
      >
        <div style={{ width: '400px' }}>
          <FormProvider {...joinClassMethods}>
            <form onSubmit={joinClass} noValidate>
              <Input
                type={InputType.TEXT}
                category={InputCategory.INPUT}
                name={'code'}
                label={'Classroom Code'}
              />
              <Input
                type={InputType.TEXT}
                category={InputCategory.INPUT}
                name={'identity'}
                label={'Identity'}
              />
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
