import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import authService from 'api/auth';
import { useRouter } from 'next/router';
import { useMutation } from 'react-query';
import { toast } from 'react-toastify';

type FormFields = {
  password: string;
  confirmationPassword: string;
};

const schema = yup.object().shape({
  password: yup
    .string()
    .required('Password is required.')
    .max(150, 'Password is max 150 characters.')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
      'Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character.'
    ),
  confirmationPassword: yup
    .string()
    .required('Password is required.')
    .max(150, 'Password is max 150 characters.')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
      'Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character.'
    )
    .oneOf([yup.ref('password'), null], 'Confirmation Password must match'),
});

const ResetPassword = () => {
  const router = useRouter();
  const token = router.query.token as string;

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormFields>({
    mode: 'all',
    resolver: yupResolver(schema),
  });

  const { mutateAsync } = useMutation(authService.resetPassword, {
    onSuccess: () => {
      router.push('/auth/signin');
      toast.success('Reset password successfully.');
    },
    onError: () => {
      toast.error('Reset password unsuccessfully.');
    },
  });

  const resetPassword = handleSubmit(({ password }: FormFields) => {
    mutateAsync({ token, password });
  });

  return (
    <div
      style={{ minHeight: '100vh' }}
      className="container-fluid bg-light d-flex justify-content-center align-items-center"
    >
      <div style={{ width: '400px' }} className="rounded shadow p-5">
        <h2 className="text-center mb-5">Reset Password</h2>

        <form onSubmit={resetPassword}>
          <div className="mb-3 row">
            <div className="col">
              <input
                type="password"
                {...register('password')}
                className={`form-control ${
                  errors.password ? 'is-invalid' : ''
                }`}
                placeholder="Password"
              />
              <div className="invalid-feedback">{errors.password?.message}</div>
            </div>
          </div>
          <div className="mb-3 row">
            <div className="col">
              <input
                type="password"
                {...register('confirmationPassword')}
                className={`form-control ${
                  errors.confirmationPassword ? 'is-invalid' : ''
                }`}
                placeholder="Confirmation Password"
              />
              <div className="invalid-feedback">
                {errors.confirmationPassword?.message}
              </div>
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

export default ResetPassword;
