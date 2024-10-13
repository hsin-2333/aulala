import { useContext, useEffect, useState, ReactNode } from "react";
import * as React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import RecentPlayBar, { PlayBar } from "./RecentPlayBar";
import ContentInfoSideBar from "./Sidebar/ContentInfoSideBar";
import { NavbarComponent } from "../components/Nav/Navbar";
import { FaBarsProgress } from "react-icons/fa6";
import { Divider } from "@nextui-org/react";
import { useParams } from "react-router-dom";
interface LayoutProps {
  children: ReactNode;
  isOuterPage?: boolean;
}

export const OuterLayout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const [key, setKey] = useState(0);
  const { user } = useContext(AuthContext);
  const { storyId } = useParams();

  useEffect(() => {
    setKey((prevKey) => prevKey + 1);
  }, [location]);

  return (
    <div className="flex h-screen overflow-hidden  flex-col">
      <div className="flex-1">
        <div className="fixed z-10 w-full">
          <NavbarComponent />
        </div>
        <main className={` flex-1 ${storyId ? "pb-14 md:pb-24 md:mt-20" : "pb-0"}`}>
          <MainContent isOuterPage={true}>{children}</MainContent>
        </main>
        {user ? <RecentPlayBar key={key} /> : <PlayBar />}
      </div>
    </div>
  );
};

export const ScriptLayout = ({ children }: LayoutProps) => {
  const { scriptId } = useParams();

  return (
    <div className="flex flex-col">
      <div className="flex-1">
        <div className="fixed z-10 w-full">
          <NavbarComponent />
        </div>
        <Divider />
        {/* <div className="bg-gradient-to-tr from-blue-200 to-cyan-200 w-full h-60"></div> */}
        <div
          className={`bg-gradient-to-tr  w-full ${
            scriptId ? "h-60 from-blue-200 to-cyan-200" : "h-28 sm:h-40  bg-gradient-to-tr from-indigo-200  to-sky-100"
          }`}
        ></div>
        <main
          className={`flex-1 px-2 sm:px-6 max-w-[1024px] m-auto  ${scriptId ? "-mt-44 sm:-mt-32" : "-mt-9 sm:-mt-9"}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export const UserHomeLayout = ({ children }: LayoutProps) => {
  return (
    <div className="h-screen flex flex-col">
      <NavbarComponent />
      <div className="flex-grow mt-16 ">{children}</div>
    </div>
  );
};

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen	">
      <div className="flex-1">
        <NavbarComponent />
        <main className="flex-1 ">
          <MainContent isOuterPage={false}>{children}</MainContent>
        </main>
      </div>
    </div>
  );
};

const MainContent = ({ isOuterPage, children }: LayoutProps) => {
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const { storyId } = useParams();
  const { user } = useContext(AuthContext);

  const heightStyle = (!storyId && !user) || storyId ? "calc(100vh)" : "calc(100vh - 80px)";

  const handleCardClick = () => {
    setIsDetailVisible(true);
  };

  return (
    <div
      style={{ height: heightStyle }}
      className={`grid overflow-y-scroll custom-scrollbar sm:overflow-y-hidden ${
        isOuterPage ? "grid-cols-1 lg:grid-cols-5" : "lg:grid-cols-5"
      }`}
    >
      {!isOuterPage && (
        <div className="hidden sm:block">
          <Sidebar />
        </div>
      )}
      <div
        style={{ height: heightStyle }}
        className={`${
          isDetailVisible || !isOuterPage ? "col-span-4 lg:col-span-4" : "col-span-5 lg:col-span-5"
        } lg:border-l  sm:overflow-y-auto p-0 custom-scrollbar scroll-padding space-y-8`}
      >
        <div className=" md:px-4 lg:px-8 h-full">
          <div className="space-y-6 h-full">
            <div className="border-none p-0 outline-none h-full">
              {/* {children} */}
              {React.cloneElement(children as React.ReactElement, { onCardClick: handleCardClick })}
            </div>
          </div>
        </div>
      </div>
      {isDetailVisible && (
        <div className="hidden lg:block">
          <ContentInfoSideBar setIsDetailVisible={setIsDetailVisible} />
        </div>
      )}
    </div>
  );
};

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="pb-12">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1 ">
            <NavLink
              to={`/account/${user?.userName}`}
              end
              className={({ isActive }) =>
                `w-full justify-start flex items-center size-default hover:text-primary-400 rounded  ${
                  isActive ? "bg-primary-100" : "none"
                }`
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-4 w-4"
              >
                <rect width="7" height="7" x="3" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="14" rx="1" />
                <rect width="7" height="7" x="3" y="14" rx="1" />
              </svg>
              Your Homepage
            </NavLink>
            <NavLink
              to={`/user/${user?.userName}/uploads`}
              className={({ isActive }) =>
                `w-full justify-start flex items-center size-default hover:text-primary-400 rounded  ${
                  isActive ? "bg-primary-100" : "none"
                }`
              }
            >
              <FaBarsProgress className="mr-2" />
              Upload Content
            </NavLink>
            <NavLink
              to={`/account/${user?.userName}/notification`}
              className={({ isActive }) =>
                `w-full justify-start flex items-center size-default hover:text-primary-400 rounded ${
                  isActive ? "bg-primary-100" : "none"
                }`
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-4 w-4"
              >
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              Notification
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};
