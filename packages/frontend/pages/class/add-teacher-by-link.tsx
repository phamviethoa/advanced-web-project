import Layout from 'components/Layout';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import jwt from 'jsonwebtoken';
import { GetServerSideProps } from 'next';
import { useMutation } from 'react-query';
import classApi from 'api/class';

type Props = {
  token: string;
  classId: string;
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const token = query.token;
  const payload = jwt.verify(token as string, 'secret');
  const classId = (payload as { classId: string }).classId;

  return {
    props: {
      token,
      classId,
    },
  };
};

const AddTeacherByLink = ({ token, classId }: Props) => {
  const router = useRouter();

  const { handleSubmit } = useForm();

  const { mutateAsync } = useMutation(classApi.addTeacher, {
    onSuccess: () => {
      router.push(`/class/${classId}`);
      toast.success('Join class successfully.');
    },
    onError: () => {
      toast.error('Join class unsuccessfully.');
    },
  });

  const addTeacher = handleSubmit(async () => {
    mutateAsync(token);
  });

  return (
    <Layout>
      <div
        style={{ minHeight: '80vh' }}
        className="d-flex justify-content-center align-items-center"
      >
        <div style={{ width: '300px' }}>
          <form onSubmit={addTeacher}>
            <button
              className="d-block btn bg-primary w-100 px-5 py-3 text-center text-white my-3"
              type="submit"
            >
              Join class
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AddTeacherByLink;
