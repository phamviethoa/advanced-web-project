import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { useMutation } from 'react-query';
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
      <div className="p-5 rounded shadow" style={{ width: '300px' }}>
        <h2 className="h4 mb-5">Click below button to activate your account</h2>
        <button onClick={activate} className="btn btn-primary">
          Activate
        </button>
      </div>
    </div>
  );
};

export default ActivateAccount;
