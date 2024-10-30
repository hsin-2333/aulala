import { Button, Input } from "@nextui-org/react";
import { useContext, useEffect, useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import UserSignUpForm from "../Login/UserInfo";

const LoginComponent = () => {
  const { user, authUser, Login, LoginWithEmail, userExists } =
    useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("testPWD");

  useEffect(() => {
    if (user && userExists) {
      navigate(`/user/${user.userName}`);
    }
  }, [user, userExists, navigate]);

  return (
    <div>
      <div className="flex h-screen align-middle">
        {user || authUser ? (
          <>{!userExists && <UserSignUpForm />}</>
        ) : (
          <>
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
              <div className="flex flex-col space-y-2 text-center">
                <h1 className="mb-1 text-2xl font-semibold tracking-tight">
                  Login / Signup
                </h1>
                <Input
                  type="email"
                  label="Email"
                  size="sm"
                  radius="sm"
                  variant="bordered"
                  className="w-full text-left"
                  description="default: test@example.com"
                  defaultValue="test@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  type="password"
                  label="Password"
                  size="sm"
                  radius="sm"
                  variant="bordered"
                  className="w-full text-left"
                  description="default: testPWD"
                  defaultValue="testPWD"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  className="size-default rounded-md border border-default bg-white text-default-900"
                  onClick={() => LoginWithEmail(email, password)}
                >
                  Login with Email
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="text-muted-foreground bg-background px-2">
                    or continue with
                  </span>
                </div>
              </div>
              <Button
                startContent={<FaGoogle color="white" />}
                className="size-default rounded-md border border-default bg-primary text-white"
                onClick={Login}
              >
                Google Account
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default LoginComponent;
