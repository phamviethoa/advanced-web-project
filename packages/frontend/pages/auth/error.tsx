import Link from 'next/link';

const Error = () => {
  return (
    <div
      style={{ minHeight: '100vh' }}
      className="container-fluid bg-light d-flex justify-content-center align-items-center"
    >
      <div className="p-5 rounded shadow text-center">
        <h2 className="text-danger mb-3">Sign in error!</h2>
        <p>Username or password is incorrect</p>
        <Link href="/auth/signin">
          <a className="btn btn-primary">Back to sign in</a>
        </Link>
      </div>
    </div>
  );
};

export default Error;
