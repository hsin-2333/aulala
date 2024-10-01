import { useContext, useEffect, useState, ReactNode } from "react";
import * as React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import RecentPlayBar from "./RecentPlayBar";
import ContentInfoSideBar from "./Sidebar/ContentInfoSideBar";
import { NavbarComponent } from "../components/Nav/Navbar";
import { FaBarsProgress } from "react-icons/fa6";
import { Divider } from "@nextui-org/react";

interface LayoutProps {
  children: ReactNode;
  isOuterPage?: boolean;
}

export const OuterLayout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const [key, setKey] = useState(0);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // 每次路由變化時更新 key，強制重新渲染 RecentPlayBar
    setKey((prevKey) => prevKey + 1);
  }, [location]);

  return (
    <div className="flex h-screen overflow-hidden  flex-col">
      <div className="flex-1">
        <NavbarComponent />
        <main className=" flex-1 pb-24">
          <MainContent isOuterPage={true}>{children}</MainContent>
        </main>
        {user && <RecentPlayBar key={key} />}
      </div>
    </div>
  );
};

export const ScriptLayout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col">
      <div className="flex-1">
        <NavbarComponent />
        <Divider />
        <div className="bg-gradient-to-tr from-blue-200 to-cyan-200 w-full h-60"></div>
        <main className=" flex-1 px-6 max-w-[1024px] m-auto  -mt-32">{children}</main>
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

  const handleCardClick = () => {
    setIsDetailVisible(true);
  };

  return (
    <div
      style={{ height: "calc(100vh-80px)" }}
      className={`grid overflow-y-scroll custom-scrollbar sm:overflow-y-hidden ${
        isOuterPage ? "grid-cols-1 lg:grid-cols-5" : "lg:grid-cols-5"
      }`}
    >
      {!isOuterPage && <Sidebar />}
      <div
        style={{ height: "calc(100vh - 80px)" }}
        className={`${
          isDetailVisible || !isOuterPage ? "col-span-4 lg:col-span-4" : "col-span-5 lg:col-span-5"
        } lg:border-l  sm:overflow-y-auto p-0 custom-scrollbar scroll-padding space-y-8`}
      >
        <div className="px-4 md:px-4 lg:px-8">
          <div className="space-y-6">
            <div className="border-none p-0 outline-none">
              {/* {children} */}
              {React.cloneElement(children as React.ReactElement, { onCardClick: handleCardClick })}
            </div>
          </div>
        </div>
      </div>
      {isDetailVisible && (
        <div className="hidden sm:block">
          <ContentInfoSideBar setIsDetailVisible={setIsDetailVisible} />
        </div>
      )}
    </div>
  );
};

//https://github.com/shadcn-ui/ui/blob/main/apps/www/app/(app)/examples/music/page.tsx
// return (
//   <>
//     <div className="md:hidden">
//       <Image
//         src="/examples/music-light.png"
//         width={1280}
//         height={1114}
//         alt="Music"
//         className="block dark:hidden"
//       />
//       <Image
//         src="/examples/music-dark.png"
//         width={1280}
//         height={1114}
//         alt="Music"
//         className="hidden dark:block"
//       />
//     </div>
//     <div className="hidden md:block">
//       <Menu />
//       <div className="border-t">
//         <div className="bg-background">
//           <div className="grid lg:grid-cols-5">
//             <Sidebar playlists={playlists} className="hidden lg:block" />
//             <div className="col-span-3 lg:col-span-4 lg:border-l">
//               <div className="h-full px-4 py-6 lg:px-8">
//                 <Tabs defaultValue="music" className="h-full space-y-6">
//                   <div className="space-between flex items-center">
//                     <TabsList>
//                       <TabsTrigger value="music" className="relative">
//                         Music
//                       </TabsTrigger>
//                       <TabsTrigger value="podcasts">Podcasts</TabsTrigger>
//                       <TabsTrigger value="live" disabled>
//                         Live
//                       </TabsTrigger>
//                     </TabsList>
//                     <div className="ml-auto mr-4">
//                       <Button>
//                         <PlusCircledIcon className="mr-2 h-4 w-4" />
//                         Add music
//                       </Button>
//                     </div>
//                   </div>
//                   <TabsContent
//                     value="music"
//                     className="border-none p-0 outline-none"
//                   >
//                     <div className="flex items-center justify-between">
//                       <div className="space-y-1">
//                         <h2 className="text-2xl font-semibold tracking-tight">
//                           Listen Now
//                         </h2>
//                         <p className="text-sm text-muted-foreground">
//                           Top picks for you. Updated daily.
//                         </p>
//                       </div>
//                     </div>
//                     <Separator className="my-4" />
//                     <div className="relative">
//                       <ScrollArea>
//                         <div className="flex space-x-4 pb-4">
//                           {listenNowAlbums.map((album) => (
//                             <AlbumArtwork
//                               key={album.name}
//                               album={album}
//                               className="w-[250px]"
//                               aspectRatio="portrait"
//                               width={250}
//                               height={330}
//                             />
//                           ))}
//                         </div>
//                         <ScrollBar orientation="horizontal" />
//                       </ScrollArea>
//                     </div>
//                     <div className="mt-6 space-y-1">
//                       <h2 className="text-2xl font-semibold tracking-tight">
//                         Made for You
//                       </h2>
//                       <p className="text-sm text-muted-foreground">
//                         Your personal playlists. Updated daily.
//                       </p>
//                     </div>
//                     <Separator className="my-4" />
//                     <div className="relative">
//                       <ScrollArea>
//                         <div className="flex space-x-4 pb-4">
//                           {madeForYouAlbums.map((album) => (
//                             <AlbumArtwork
//                               key={album.name}
//                               album={album}
//                               className="w-[150px]"
//                               aspectRatio="square"
//                               width={150}
//                               height={150}
//                             />
//                           ))}
//                         </div>
//                         <ScrollBar orientation="horizontal" />
//                       </ScrollArea>
//                     </div>
//                   </TabsContent>
//                   <TabsContent
//                     value="podcasts"
//                     className="h-full flex-col border-none p-0 data-[state=active]:flex"
//                   >
//                     <div className="flex items-center justify-between">
//                       <div className="space-y-1">
//                         <h2 className="text-2xl font-semibold tracking-tight">
//                           New Episodes
//                         </h2>
//                         <p className="text-sm text-muted-foreground">
//                           Your favorite podcasts. Updated daily.
//                         </p>
//                       </div>
//                     </div>
//                     <Separator className="my-4" />
//                     <PodcastEmptyPlaceholder />
//                   </TabsContent>
//                 </Tabs>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   </>

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="pb-12">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          {/* <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Discover</h2> */}
          <div className="space-y-1 ">
            <NavLink
              to={`/account/${user?.userName}`}
              end
              className={({ isActive }) =>
                `w-full justify-start flex items-center size-default hover:bg-primary/50 ${
                  isActive ? "bg-primary/50" : "none"
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
                `w-full justify-start flex items-center size-default hover:bg-primary/50 ${
                  isActive ? "bg-primary/50" : "none"
                }`
              }
            >
              <FaBarsProgress className="mr-2" />
              Upload Content
            </NavLink>
            <NavLink
              to={`/account/${user?.userName}/notification`}
              className={({ isActive }) =>
                `w-full justify-start flex items-center size-default hover:bg-primary/50 ${
                  isActive ? "bg-primary/50" : "none"
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

            {/* <button className="w-full justify-start align-middle ">
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
                <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
                <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
                <circle cx="12" cy="12" r="2" />
                <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
                <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
              </svg>
              Radio
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};
