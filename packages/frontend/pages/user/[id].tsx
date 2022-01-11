import { GetServerSideProps } from 'next';
import InlineEdit from '@atlaskit/inline-edit';
import * as React from 'react';
import Layout from '../../components/Layout/index';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { useForm, FormProvider } from 'react-hook-form';
import {
  dehydrate,
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import userService from 'api/user';
import { UserDto } from 'types/user.dto';
import Input, { InputCategory, InputType } from 'components/Form/Input';
import { useState } from 'react';
import Modal from 'components/Modal';

export interface ProfilePageProps {}

interface FormFields {
  fullName: string;
}

const schema = yup.object().shape({
  fullName: yup
    .string()
    .required('Subject is required.')
    .max(150, 'Subject is max 150 characters.'),
});

export default function ProfilePage() {
  const router = useRouter();
  const id = router.query.id;

  const [isOpenUpdateProfileModal, setIsOpenUpdateProfileModal] =
    useState<boolean>(false);

  const openUpdateProfileModal = () => setIsOpenUpdateProfileModal(true);
  const closeUpdateProfileModal = () => setIsOpenUpdateProfileModal(false);

  const { data: user } = useQuery<UserDto>(['user', id], () =>
    userService.getUser(id as string)
  );

  const queryClient = useQueryClient();

  const methods = useForm<FormFields>({
    mode: 'all',
    resolver: yupResolver(schema),
  });

  const { handleSubmit, reset } = methods;

  const { mutateAsync } = useMutation(userService.updateUser, {
    onSuccess: () => {
      queryClient.invalidateQueries(['user', id]);
      reset();
      toast.success('Update user successfully.');
    },
    onError: () => {
      toast.error('Update user unsuccessfully.');
    },
  });

  const createClass = handleSubmit(async ({ fullName }: FormFields) => {
    const id = user?.id as string;
    mutateAsync({ id, fullName });
    closeUpdateProfileModal();
    reset();
  });

  return (
    <Layout>
      <Modal
        title="Update profile"
        isOpen={isOpenUpdateProfileModal}
        handleCloseModal={closeUpdateProfileModal}
      >
        <div style={{ width: '400px' }}>
          <FormProvider {...methods}>
            <div style={{ width: '300px' }}>
              <form onSubmit={createClass} noValidate>
                <Input
                  type={InputType.TEXT}
                  category={InputCategory.INPUT}
                  name="fullName"
                  label="Full Name"
                  defaultValue={user?.fullName}
                />
                <button type="submit" className="btn btn-primary">
                  Update
                </button>
              </form>
            </div>
          </FormProvider>
        </div>
      </Modal>
      <h2 className="text-primary mb-5">
        Your profile
        <i
          onClick={openUpdateProfileModal}
          style={{ fontSize: '1rem' }}
          className="ms-3 fas fa-pen text-muted"
        ></i>
      </h2>
      <div className="d-flex align-items-center">
        <img
          src="http://placekitten.com/g/200/200"
          className="rounded-circle me-5"
          style={{ width: '100px' }}
        />
        <div style={{ width: '500px' }}>
          <div className="row mb-2">
            <div className="col-3">
              <span className="fw-bold">Email</span>
            </div>
            <div className="col">{user?.email}</div>
          </div>
          <div className="row">
            <div className="col-3">
              <span className="fw-bold">Full Name</span>
            </div>
            <div className="col">{user?.fullName}</div>
          </div>
        </div>
      </div>
      <div></div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id;

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(['user', id], () =>
    userService.getUser(id as string)
  );

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};
