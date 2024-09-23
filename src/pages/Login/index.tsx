import { useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import UserSignUpForm from "../Login/UserInfo";
import { useNavigate } from "react-router-dom";

const LoginComponent = () => {
  const { user, authUser, Login, userExists } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && userExists) {
      navigate(`/user/${user.userName}`);
    }
  }, [user, userExists, navigate]);

  return (
    <div>
      <div className="h-screen flex align-middle">
        {user || authUser ? (
          <>
            {/* <h2 key={user.uid}>{user.displayName}</h2>
            {!userExists && <UserSignUpForm />}
            <button onClick={Logout}>Logout</button> */}
            {/* <h2 key={user?.uid || authUser?.uid}>{user?.userName || authUser?.displayName}</h2> */}
            {!userExists && <UserSignUpForm />}
            {/* <button onClick={Logout}>Logout</button> */}
          </>
        ) : (
          <>
            <div className="mx-auto flex w-full flex-col justify-center  space-y-6 sm:w-[350px]">
              <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">Login / Signup</h1>
                {/* <p className="text-sm text-muted-foreground">Enter your email below to create your account</p> */}
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background bg-white px-2 text-muted-foreground"> continue with</span>
                </div>
              </div>
              <button className="rounded-md size-default bg-primary text-white " onClick={Login}>
                Google Account
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default LoginComponent;
