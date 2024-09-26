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
} from "@nextui-org/react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export function NavbarComponent() {
  const navigate = useNavigate();
  const { Logout } = useContext(AuthContext);
  const { user } = useContext(AuthContext);

  const handleLogout = () => {
    Logout();
    navigate("/");
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
                  <DropdownItem key="contents" href={`/user/${user.userName}`}>
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
