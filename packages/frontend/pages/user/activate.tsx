import Layout from 'components/Layout';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import jwt from 'jsonwebtoken';
import { GetServerSideProps } from 'next';
import { useMutation } from 'react-query';
import classApi from 'api/class';
import userService from 'api/user';

type Props = {
  token: string;
  classId: string;
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const token = query.token;

  return {
    props: {
      token,
    },
  };
};

const ActivateAccount = ({ token }: Props) => {
  const router = useRouter();

  const { mutateAsync } = useMutation(userService.activate, {
    onSuccess: () => {
      router.push(`/auth/signin`);
      toast.success('Activate account successfully.');
    },
    onError: () => {
      toast.error('Activate account unsuccessfully.');
    },
  });

  const activate = () => {
    mutateAsync(token);
  };

  return (
    <div
      style={{ minHeight: '80vh' }}
      className="d-flex justify-content-center align-items-center"
    >
      <button onClick={activate} className="btn btn-primary">
        Activate
      </button>
    </div>
  );
};

export default ActivateAccount;
