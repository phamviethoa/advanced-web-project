import { GetServerSideProps } from 'next';
import { getProviders, csrfToken, signIn } from 'next-auth/client';
import { useRouter } from 'next/router';
import Link from 'next/link';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';

type Props = {
  providers: any;
  csrfToken: string;
};

enum ProviderType {
  OAUTH = 'oauth',
  CREDENTIALS = 'credentials',
}

type FormFields = {
  username: string;
  password: string;
};

const schema = yup.object().shape({
  username: yup
    .string()
    .required('Username is required.')
    .max(150, 'Username is max 150 characters.'),
  password: yup
    .string()
    .required('Password is required.')
    .max(150, 'Password is max 150 characters.')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
      'Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character.'
    ),
});

const Signin = ({ providers, csrfToken }: Props) => {
  const router = useRouter();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormFields>({
    mode: 'all',
    resolver: yupResolver(schema),
  });

  const socialProviders = Object.values(providers).filter(
    (provider: any) => provider.type === ProviderType.OAUTH
  );

  const credentialProviders = Object.values(providers).filter(
    (provider: any) => provider.type === ProviderType.CREDENTIALS
  );

  const signin = handleSubmit(async ({ username, password }: FormFields) => {
    signIn('login', {
      callbackUrl: (router.query.callbackUrl as string) || '/',
      username,
      password,
    });
  });

  return (
    <div
      style={{ minHeight: '100vh' }}
      className="container-fluid bg-light d-flex justify-content-center align-items-center"
    >
      <div style={{ width: '400px' }} className="rounded shadow p-5">
        <h2 className="text-center mb-4">Signin</h2>
        <div>
          {socialProviders.map((provider: any) => (
            <button
              key={provider.id}
              className="d-block btn bg-primary w-100 px-5 py-3 text-center text-white my-3"
              onClick={() =>
                signIn(provider.id, {
                  callbackUrl: router.query.callbackUrl as string,
                })
              }
            >
              Signin with {provider.name}
            </button>
          ))}
        </div>

        <div className="text-center mb-3">Or</div>

        <form onSubmit={signin}>
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
          {credentialProviders.map((provider: any) => (
            <button
              key={provider.id}
              className="d-block btn bg-primary w-100 px-5 py-3 text-center text-white my-3"
              type="submit"
            >
              Signin with {provider.name}
            </button>
          ))}
        </form>

        <div className="text-center text-primary">
          <Link href="/auth/signup">
            <a>Create a account?</a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      providers: await getProviders(),
      csrfToken: await csrfToken(context),
    },
  };
};

export default Signin;
