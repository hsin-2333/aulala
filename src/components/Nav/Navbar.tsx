import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Avatar,
  Button,
  Link,
  DropdownSection,
  Input,
} from "@nextui-org/react";
import { FiSearch } from "react-icons/fi";
import { GiSpellBook } from "react-icons/gi";
// import { RxUpload } from "react-icons/rx";
import { IoAdd } from "react-icons/io5";
import { VscAccount } from "react-icons/vsc";
import { IoMdNotificationsOutline } from "react-icons/io";

import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export function NavbarComponent() {
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const { Logout } = useContext(AuthContext);
  const { user } = useContext(AuthContext);

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

  return (
    <>
      {/*電腦版*/}
      <div className="hidden sm:block">
        <Navbar maxWidth="full">
          <NavbarBrand as={Link} className="cursor-pointer" href="/">
            <p className="font-bold text-inherit">StoryBook LOGO</p>
          </NavbarBrand>

          <NavbarContent className="flex flex-grow gap-4" justify="center"></NavbarContent>

          <NavbarContent as="div" justify="end">
            {user ? (
              <>
                <form onSubmit={handleSearchSubmit} className="flex items-center">
                  <Input
                    classNames={{
                      base: "max-w-full sm:max-w-[10rem] h-10",
                      mainWrapper: "h-full",
                      input: "text-small",
                      inputWrapper: "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
                    }}
                    placeholder="Search Title, Author, Summary, Tags"
                    size="sm"
                    startContent={<FiSearch size={18} />}
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </form>
                <Button as={Link} color="primary" variant="flat" radius="sm" href="/upload/story">
                  Upload
                </Button>
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <Avatar
                      isBordered
                      as="button"
                      className="transition-transform"
                      color="secondary"
                      name={user.userName}
                      size="sm"
                      src={user.avatar}
                    />
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Profile Actions" variant="flat">
                    <DropdownSection showDivider>
                      <DropdownItem key="profile" className="h-14 gap-2">
                        <p className="font-semibold">{user.role}</p>
                        <p className="font-semibold">{user.email}</p>
                      </DropdownItem>
                      <DropdownItem key="contents" href={`/account/${user.userName}`}>
                        My Contents
                      </DropdownItem>
                      <DropdownItem key="user_settings" href={`/user/${user.userName}/setting`}>
                        Setting
                      </DropdownItem>
                      <DropdownItem key="analytics" href={`/user/${user.userName}/analytics`}>
                        Analytics
                      </DropdownItem>
                    </DropdownSection>
                    <DropdownItem key="logout" color="danger" onClick={handleLogout}>
                      Log Out
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </>
            ) : (
              <Button as={Link} color="primary" variant="flat" radius="sm" href={`/login`}>
                Login
              </Button>
            )}
          </NavbarContent>
        </Navbar>
      </div>

      {/* 手機板 */}
      <div className="z-50 block sm:hidden fixed bottom-0 left-0 right-0 bg-slate-300 h-[50px]">
        <div className="flex justify-around p-1 ">
          <Link href="/" className="text-center flex items-center justify-end flex-col gap-[2px]">
            <GiSpellBook size={22} color="var(--color-primary)" />
            <span className="text-xs text-end text-default-600 ">Explore</span>
          </Link>

          <Link href="/upload/story" className="text-center items-center justify-end flex flex-col gap-[2px]">
            <IoAdd size={22} color="var(--color-primary)" />
            <span className="text-xs  text-end text-default-600">Upload</span>
          </Link>
          {user && (
            <Link
              href={`/account/${user.userName}/notification`}
              className="text-center items-center justify-end flex flex-col gap-[0px]"
            >
              <IoMdNotificationsOutline size={21} color="var(--color-primary)" />
              <span className="text-xs text-end text-default-600"> InBox</span>
            </Link>
          )}
          {user ? (
            <Link
              href={`/user/${user.userName}`}
              className="text-center items-center justify-end flex flex-col gap-[2px]"
            >
              <VscAccount size={18} color="var(--color-primary)" />
              <span className="text-xs text-end text-default-600"> Profile</span>
            </Link>
          ) : (
            <Link href="/login" className="text-center items-center justify-end flex flex-col gap-[2px]">
              <VscAccount size={18} color="var(--color-primary)" />
              <span className="text-xs text-end text-default-600"> Profile</span>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
