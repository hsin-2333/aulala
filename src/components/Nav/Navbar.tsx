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
    <Navbar maxWidth="full">
      <NavbarBrand as={Link} className="cursor-pointer" href="/">
        <p className="font-bold text-inherit">StoryBook LOGO</p>
      </NavbarBrand>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {/* <NavbarItem>
          <Link color="foreground" href="#">
            Features
          </Link>
        </NavbarItem>
        <NavbarItem isActive>
          <Link href="#" aria-current="page" color="secondary">
            Customers
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="#">
            Integrations
          </Link>
        </NavbarItem> */}
      </NavbarContent>

      <NavbarContent as="div" justify="end">
        {" "}
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
  );
}
