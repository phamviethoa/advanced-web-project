import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import authService from 'api/auth';
import { useMutation } from 'react-query';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';

type FormFields = {
  email: string;
};

const schema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required.')
    .max(150, 'Email is max 150 characters.')
    .email('Email is not correct.'),
});

const ForgotPassword = () => {
  const router = useRouter();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormFields>({
    mode: 'all',
    resolver: yupResolver(schema),
  });

  const { mutateAsync } = useMutation(authService.forgotPassword, {
    onSuccess: () => {
      router.push('/auth/signin');
      toast.success('Send forgot password required successfully.');
    },
    onError: () => {
      toast.error('Send forgot password required unsuccessfully.');
    },
  });

  const sendForgotPasswordRequest = handleSubmit(({ email }: FormFields) => {
    mutateAsync(email);
  });

  return (
    <div
      style={{ minHeight: '100vh' }}
      className="container-fluid bg-light d-flex justify-content-center align-items-center"
    >
      <div style={{ width: '400px' }} className="rounded shadow p-5">
        <h2 className="text-center mb-5">Forgot Password</h2>

        <form onSubmit={sendForgotPasswordRequest}>
          <div className="mb-3 row">
            <div className="col">
              <input
                type="text"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                {...register('email')}
                placeholder="Email"
              />
              <div className="invalid-feedback">{errors.email?.message}</div>
            </div>
          </div>
          <button
            className="d-block btn bg-primary w-100 px-5 py-3 text-center text-white my-3"
            type="submit"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
