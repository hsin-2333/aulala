import { Divider } from "@nextui-org/react";
import * as React from "react";
import { ReactNode, useContext, useEffect, useState } from "react";
import { FaBarsProgress } from "react-icons/fa6";
import { NavLink, useLocation, useParams } from "react-router-dom";
import { NavbarComponent } from "../components/Nav/Navbar";
import { AuthContext } from "../context/AuthContext";
import Icon from "./Icon";
import RecentPlayBar, { PlayBar } from "./RecentPlayBar";
import ContentInfoSideBar from "./Sidebar/ContentInfoSideBar";

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
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="flex-1">
        <div className="fixed z-10 w-full">
          <NavbarComponent />
        </div>
        <main
          className={`flex-1 ${storyId ? "pb-14 md:mt-20 md:pb-24" : "pb-0"}`}
        >
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
        <div
          className={`w-full bg-gradient-to-tr ${
            scriptId
              ? "h-60 from-blue-200 to-cyan-200"
              : "h-28 bg-gradient-to-tr from-indigo-200 to-sky-100 sm:h-40"
          }`}
        ></div>
        <main
          className={`m-auto max-w-[1024px] flex-1 px-2 sm:px-6 ${scriptId ? "-mt-44 sm:-mt-32" : "-mt-9 sm:-mt-9"}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export const UserHomeLayout = ({ children }: LayoutProps) => {
  return (
    <div className="flex h-screen flex-col">
      <NavbarComponent />
      <div className="mt-16 flex-grow">{children}</div>
    </div>
  );
};

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen">
      <div className="flex-1">
        <NavbarComponent />
        <main className="flex-1">
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

  const heightStyle =
    (!storyId && !user) || storyId ? "calc(100vh)" : "calc(100vh - 80px)";

  const handleCardClick = () => {
    setIsDetailVisible(true);
  };

  return (
    <div
      style={{ height: heightStyle }}
      className={`custom-scrollbar grid overflow-y-scroll sm:overflow-y-hidden ${
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
          isDetailVisible || !isOuterPage
            ? "col-span-4 lg:col-span-4"
            : "col-span-5 lg:col-span-5"
        } custom-scrollbar scroll-padding space-y-8 p-0 sm:overflow-y-auto lg:border-l`}
      >
        <div className="h-full md:px-4 lg:px-8">
          <div className="h-full space-y-6">
            <div className="h-full border-none p-0 outline-none">
              {React.cloneElement(children as React.ReactElement, {
                onCardClick: handleCardClick,
              })}
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
          <div className="space-y-1">
            <NavLink
              to={`/account/${user?.userName}`}
              end
              className={({ isActive }) =>
                `size-default flex w-full items-center justify-start rounded hover:text-primary-400 ${
                  isActive ? "bg-primary-100" : "none"
                }`
              }
            >
              <Icon name="homepage" />
              Your Homepage
            </NavLink>
            <NavLink
              to={`/user/${user?.userName}/uploads`}
              className={({ isActive }) =>
                `size-default flex w-full items-center justify-start rounded hover:text-primary-400 ${
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
                `size-default flex w-full items-center justify-start rounded hover:text-primary-400 ${
                  isActive ? "bg-primary-100" : "none"
                }`
              }
            >
              <Icon name="notification" />
              Notification
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};
