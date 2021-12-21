import { signIn, signOut, useSession } from 'next-auth/client';
import { useRouter } from 'next/router';
import Link from 'next/link';

export type LayoutOptions = {
  name: string;
  onClick: () => void;
};

type Props = {
  children: React.ReactNode;
  options?: LayoutOptions[];
};

type Session = {
  expires: string;
  user: {
    email: string;
    iat: string;
    id: string;
    image: any;
    name: string;
    sub: string;
  };
};

const Layout = ({ children, options }: Props) => {
  const router = useRouter();
  const [session, loading] = useSession();

  const id = (session as Session)?.user?.id;

  const callbackUrl = router.asPath;

  if (session === null) {
    router.push(`/auth/signin?callbackUrl=${callbackUrl}`);
  }

  return (
    <div
      style={{ minHeight: '100vh' }}
      className="d-flex flex-column justify-content-between container-fluid bg-light p-0"
    >
      <nav className="navbar navbar-light shadow">
        <div className="container">
          <div>
            <Link href="/">
              <a className="navbar-brand fw-bold text-primary">Classroom</a>
            </Link>
          </div>
          {options && (
            <ul className="d-flex list-unstyled m-0 p-0">
              {options.map(({ name, onClick }) => (
                <li
                  key={name}
                  onClick={onClick}
                  className="d-inline-block mx-5"
                >
                  <a href="#">{name}</a>
                </li>
              ))}
            </ul>
          )}
          <div className="text-light">
            {!session && (
              <button className="btn text-dark" onClick={() => signIn()}>
                Login&nbsp;
                <i className="fas fa-sign-in-alt"></i>
              </button>
            )}
            {session && (
              <div className="dropdown">
                <span className="p-0 m-0 text-dark">
                  {`Hi! ${session.user?.name}`}&nbsp;&nbsp;
                </span>
                <a
                  className="text-dark"
                  id="dropdownMenuButton1"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="fas fa-user"></i>
                </a>
                <ul
                  className="dropdown-menu"
                  aria-labelledby="dropdownMenuButton1"
                >
                  <li>
                    <Link href={`/user/${id}`}>
                      <a className="dropdown-item" href="#">
                        Profile
                      </a>
                    </Link>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      Setting
                    </a>
                  </li>
                  <li onClick={() => signOut()}>
                    <a className="dropdown-item" href="#">
                      Logout
                    </a>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="container flex-grow-1 mb-5 pt-5">{children}</main>

      <footer className="container-fluid text-center bg-dark text-white p-3">
        This is footer
      </footer>
    </div>
  );
};

export default Layout;
