import Layout from 'components/Layout';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { GetServerSideProps } from 'next';

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

type FormFields = {
  identity: string;
};

const schema = yup.object().shape({
  identity: yup.string().required('Identity is required.'),
});

const AddStudentByLink = ({ token, classId }: Props) => {
  const router = useRouter();

  console.log(classId);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormFields>({
    mode: 'all',
    resolver: yupResolver(schema),
  });

  const addStudent = handleSubmit(async ({ identity }: FormFields) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_GATEWAY}/classes/add-student?token=${token}`,
        { identity }
      );

      router.push(`/class/${classId}`);
      toast.success('Join class successfully.');
    } catch (e) {
      toast.error('Join class unsuccessfully.');
    }
  });

  return (
    <Layout>
      <div
        style={{ minHeight: '80vh' }}
        className="d-flex justify-content-center align-items-center"
      >
        <div style={{ width: '300px' }}>
          <form onSubmit={addStudent}>
            <div className="mb-3 row">
              <div className="col">
                <input
                  type="text"
                  className={`form-control ${
                    errors.identity ? 'is-invalid' : ''
                  }`}
                  {...register('identity')}
                  placeholder="Student Identity"
                />
                <div className="invalid-feedback">
                  {errors.identity?.message}
                </div>
              </div>
            </div>
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

export default AddStudentByLink;
