import { signIn, signOut, useSession } from 'next-auth/client';
import Image from 'next/image';

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  const [session, loading] = useSession();

  console.log(session);

  return (
    <div
      style={{ minHeight: '100vh' }}
      className="d-flex flex-column justify-content-between container-fluid bg-light p-0"
    >
      <nav className="navbar navbar-light bg-primary">
        <div className="container">
          <div>
            <a className="navbar-brand text-white" href="#">
              Navbar
            </a>
          </div>
          <div className="text-light">
            {!session && (
              <button className="btn text-white" onClick={() => signIn()}>
                Login&nbsp;
                <i className="fas fa-sign-in-alt"></i>
              </button>
            )}
            {session && (
              <div className="dropdown">
                <span className="p-0 m-0">
                  {`Hi! ${session.user?.name}`}&nbsp;&nbsp;
                </span>
                <a
                  className="text-white"
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
                    <a className="dropdown-item" href="#">
                      Profile
                    </a>
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

      <main className="container flex-grow-1 ">{children}</main>

      <footer className="container-fluid text-center bg-dark text-white p-3">
        This is footer
      </footer>
    </div>
  );
};

export default Layout;
