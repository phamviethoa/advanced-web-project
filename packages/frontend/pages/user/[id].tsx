import { GetServerSideProps } from 'next';
import * as React from 'react';
import Layout from '../../components/Layout/index';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import {
  dehydrate,
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import userService from 'api/user';
import { UserDto } from 'types/user.dto';

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

  const { data: user } = useQuery<UserDto>(['user', id], () =>
    userService.getUser(id as string)
  );

  const queryClient = useQueryClient();

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<FormFields>({
    mode: 'all',
    resolver: yupResolver(schema),
  });

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
  });

  return (
    <div>
      <Layout>
        <h1>Thông tin người dùng</h1>
        <div className="d-flex justify-content-center">
          <img
            src="http://placekitten.com/g/200/200"
            className="rounded-circle"
          />
        </div>
        <form onSubmit={createClass} noValidate>
          <div className="mb-3">
            <label htmlFor="formGroupExampleInput" className="form-label">
              Thông tin cá nhân
            </label>
            <div className="form-label">Họ và tên</div>
            <input
              type="text"
              id="fullName"
              placeholder={user?.fullName}
              className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
              {...register('fullName')}
            />
          </div>
          <div className="col-auto mt-3">
            <button type="submit" className="btn btn-primary">
              Lưu thông tin
            </button>
          </div>
        </form>
      </Layout>
    </div>
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
