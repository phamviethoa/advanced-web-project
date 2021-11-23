import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';

type FormFields = {
  username: string;
  fullName: string;
  password: string;
};

const schema = yup.object().shape({
  username: yup
    .string()
    .required('Username is required.')
    .max(150, 'Username is max 150 characters.'),
  fullName: yup
    .string()
    .required('Full Name is required.')
    .max(150, 'Full Name is max 150 characters.'),
  password: yup
    .string()
    .required('Password is required.')
    .max(150, 'Password is max 150 characters.')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
      'Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character.'
    ),
});

const Signup = () => {
  const router = useRouter();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormFields>({
    mode: 'all',
    resolver: yupResolver(schema),
  });

  console.log('Hello');

  const signup = handleSubmit(
    async ({ username, fullName, password }: FormFields) => {
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_GATEWAY}/users/signup`,
          { username, fullName, password }
        );

        router.push('/auth/signin');
        toast.success('Signup successfully.');
      } catch (e) {
        toast.error('Signup unsucessfully.');
      }
    }
  );

  return (
    <div
      style={{ minHeight: '100vh' }}
      className="container-fluid bg-light d-flex justify-content-center align-items-center"
    >
      <div style={{ width: '400px' }} className="rounded shadow p-5">
        <h2 className="text-center mb-4">Signup</h2>
        <form onSubmit={signup} className="needs-validation" noValidate>
          <div className="mb-3 row">
            <div className="col">
              <input
                type="text"
                className={`form-control ${
                  errors.username ? 'is-invalid' : ''
                }`}
                {...register('username')}
                placeholder="Username"
              />
              <div className="invalid-feedback">{errors.username?.message}</div>
            </div>
          </div>
          <div className="mb-3 row">
            <div className="col">
              <input
                type="text"
                className={`form-control ${
                  errors.fullName ? 'is-invalid' : ''
                }`}
                {...register('fullName')}
                placeholder="Full Name"
              />
              <div className="invalid-feedback">{errors.fullName?.message}</div>
            </div>
          </div>
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
          <button
            className="d-block btn bg-primary w-100 px-5 py-3 text-center text-white my-3"
            type="submit"
          >
            Signup
          </button>
        </form>

        <div className="text-center text-primary">
          <Link href="/auth/signin">
            <a>Already have an account?</a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
