import { useContext, useEffect, useState, ReactNode } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import RecentPlayBar from "./RecentPlayBar";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const [key, setKey] = useState(0);

  useEffect(() => {
    // 每次路由變化時更新 key，強制重新渲染 RecentPlayBar
    setKey((prevKey) => prevKey + 1);
  }, [location]);

  return (
    <div className="flex min-h-screen	">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-4 flex-1 ">{children}</main>
        <RecentPlayBar key={key} />
      </div>
    </div>
  );
};

const Header = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (user) {
      navigate(`/user/${user.userName}`);
    }
  };
  return (
    <header className="bg-gray-800 text-white p-4">
      <nav className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          Storybook
        </Link>
        <ul className="flex space-x-4">
          {/* <li>
            <Link to="/account">Account</Link>
          </li> */}
          {user ? (
            <div onClick={handleProfileClick} className="cursor-pointer">
              <img src={user.avatar} alt="User Avatar" className="w-8 h-8 rounded-full" />
            </div>
          ) : (
            <li>
              <Link to="/login">Login</Link>
            </li>
          )}
          <li>
            <Link to="/upload/story">Upload Story</Link>
          </li>
          <li>
            <Link to="/upload/script">Upload Script</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  // const navigate = useNavigate();

  // useEffect(() => {
  //   if (!user) {
  //     navigate("/");
  //   }
  // }, [user, navigate]);

  return (
    <aside className="bg-gray-200 p-4">
      <ul>
        <li>
          <Link to={`/account/${user?.userName}/contents`}>My Content</Link>
        </li>
        <li>
          <Link to="/script">Script</Link>
        </li>
      </ul>
    </aside>
  );
};

export default Layout;
