import {
  Avatar,
  Button,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Input,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  Tooltip,
} from "@nextui-org/react";
import { useContext, useEffect, useState } from "react";
import { FaBarsProgress } from "react-icons/fa6";
import { FiLogOut, FiSearch } from "react-icons/fi";
import { GiSpellBook } from "react-icons/gi";
import { IoMdNotificationsOutline } from "react-icons/io";
import { IoAdd } from "react-icons/io5";
import { SlCloudUpload } from "react-icons/sl";
import { VscAccount } from "react-icons/vsc";
import { useLocation, useNavigate } from "react-router-dom";
import Logo from "../../assets/logo";
import { AuthContext } from "../../context/AuthContext";
import dbApi from "../../utils/firebaseService";

export function NavbarComponent() {
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { Logout } = useContext(AuthContext);
  const { user } = useContext(AuthContext);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  const handleLogout = () => {
    Logout();
    navigate("/");
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  useEffect(() => {
    if (user && user.userName) {
      const unsubscribePromise = dbApi.subscribeToNotifications(
        user.userName,
        (notifications) => {
          if (notifications.length > 0) {
            setHasUnreadNotifications(true);
          } else {
            setHasUnreadNotifications(false);
          }
        },
      );

      unsubscribePromise
        .then((unsubscribe) => {
          return () => unsubscribe();
        })
        .catch((error) => {
          console.error("Failed to subscribe to notifications:", error);
        });
    }
  }, [user]);

  const handleNotificationClick = async (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    event.preventDefault();
    setHasUnreadNotifications(false);
    if (user && user.userName) {
      try {
        await dbApi.markNotificationsAsRead(user.userName);
        navigate(`/account/${user.userName}/notification`);
      } catch (error) {
        console.error("Failed to mark notifications as read:", error);
      }
    }
  };

  return (
    <>
      {/*電腦版*/}
      <div className="hidden sm:block">
        <Navbar maxWidth="full" className="px-2">
          <NavbarBrand as={Link} className="cursor-pointer" href="/">
            {/* <p className="font-bold text-[var(--color-primary)]">StoryBook LOGO</p> */}
            <Logo />
          </NavbarBrand>

          <NavbarContent
            className="flex flex-grow gap-4"
            justify="center"
          ></NavbarContent>

          <NavbarContent as="div" className="flex flex-shrink-0" justify="end">
            {user ? (
              <>
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex flex-shrink-0 items-center"
                >
                  <Input
                    classNames={{
                      base: "max-w-full sm:max-w-[10rem] h-10",
                      mainWrapper: "h-full",
                      input: "text-small",
                      inputWrapper:
                        "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
                    }}
                    placeholder="Search..."
                    size="sm"
                    startContent={<FiSearch size={18} />}
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </form>

                <Tooltip
                  key="upload"
                  placement="bottom"
                  content="upload your audio story"
                  color="foreground"
                  offset={22}
                  className="bg-opacity-60"
                >
                  <Button
                    as={Link}
                    color="primary"
                    variant="flat"
                    radius="sm"
                    href="/upload/story"
                    startContent={<SlCloudUpload size={18} />}
                  >
                    Upload
                  </Button>
                </Tooltip>
                <Tooltip
                  key="notification"
                  placement="bottom"
                  content="notifications"
                  color="foreground"
                  offset={22}
                  className="bg-opacity-60"
                >
                  <Button
                    isIconOnly
                    className="-mx-2 text-default-900/60 data-[hover]:bg-foreground/10"
                    radius="full"
                    variant="light"
                  >
                    <Link
                      href={`/account/${user.userName}/notification`}
                      color="foreground"
                      onClick={handleNotificationClick}
                      className="data-[hover]:bg-foreground/70"
                    >
                      <div className="relative">
                        <IoMdNotificationsOutline
                          size={24}
                          color="var(--color-primary)"
                        />
                        {hasUnreadNotifications && (
                          <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-[#E0756D]"></span>
                        )}
                      </div>
                    </Link>
                  </Button>
                </Tooltip>
                <Divider orientation="vertical" className="h-8" />
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <Avatar
                      isBordered
                      as="button"
                      className="h-8 w-8 flex-shrink-0 transition-transform"
                      name={user.userName}
                      size="sm"
                      src={user.avatar}
                      color="primary"
                    />
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Profile Actions"
                    variant="flat"
                    disabledKeys={["user_settings", "analytics"]}
                  >
                    <DropdownSection showDivider>
                      <DropdownItem
                        key="profile"
                        className="h-14 gap-2"
                        textValue={user.email}
                      >
                        <p className="font-semibold">{user.email}</p>
                      </DropdownItem>
                      <DropdownItem
                        key="contents"
                        href={`/user/${user.userName}/uploads`}
                        startContent={<FaBarsProgress size={16} />}
                        textValue="My Content"
                      >
                        My Content
                      </DropdownItem>
                    </DropdownSection>
                    <DropdownItem
                      key="logout"
                      color="danger"
                      onClick={handleLogout}
                      startContent={<FiLogOut size={16} />}
                      textValue="logout"
                      className="data-[hover=true]:bg-[#fba19a47] data-[hover=true]:text-[#f66969]"
                    >
                      Log Out
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </>
            ) : (
              <>
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex flex-shrink-0 items-center"
                >
                  <Input
                    classNames={{
                      base: "max-w-full sm:max-w-[10rem] h-10",
                      mainWrapper: "h-full",
                      input: "text-small",
                      inputWrapper:
                        "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
                    }}
                    placeholder="Search..."
                    size="sm"
                    startContent={<FiSearch size={18} />}
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </form>
                <Button
                  as={Link}
                  color="primary"
                  variant="flat"
                  radius="sm"
                  href={`/login`}
                >
                  Login
                </Button>
              </>
            )}
          </NavbarContent>
        </Navbar>
      </div>

      {/* 手機板 */}
      {location.pathname !== "/upload/story" && (
        <div className="fixed bottom-0 left-0 right-0 z-50 block h-[50px] bg-slate-300 sm:hidden">
          <div className="flex justify-around p-1">
            <Link
              href="/"
              className="flex flex-col items-center justify-end gap-[2px] text-center"
            >
              <GiSpellBook size={22} color="var(--color-primary)" />
              <span className="text-end text-xs text-default-600">Explore</span>
            </Link>

            <Link
              href="/upload/story"
              className="flex flex-col items-center justify-end gap-[2px] text-center"
            >
              <IoAdd size={22} color="var(--color-primary)" />
              <span className="text-end text-xs text-default-600">Upload</span>
            </Link>
            {user && (
              <Link
                href={`/account/${user.userName}/notification`}
                className="flex flex-col items-center justify-end gap-[0px] text-center"
              >
                <IoMdNotificationsOutline
                  size={21}
                  color="var(--color-primary)"
                />
                <span className="text-end text-xs text-default-600">
                  {" "}
                  InBox
                </span>
              </Link>
            )}
            {user ? (
              <Link
                href={`/user/${user.userName}`}
                className="flex flex-col items-center justify-end gap-[2px] text-center"
              >
                <VscAccount size={18} color="var(--color-primary)" />
                <span className="text-end text-xs text-default-600">
                  {" "}
                  Profile
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex flex-col items-center justify-end gap-[2px] text-center"
              >
                <VscAccount size={18} color="var(--color-primary)" />
                <span className="text-end text-xs text-default-600">
                  {" "}
                  Profile
                </span>
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
