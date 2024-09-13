import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import UserSignUpForm from "../Login/UserInfo";

const LoginComponent = () => {
  const { user, Login, userExists, Logout } = useContext(AuthContext);
  console.log(user);
  return (
    <div>
      <>
        {user ? (
          <>
            <h2 key={user.uid}>{user.displayName}</h2>
            {userExists ? <div>Welcome back!</div> : <UserSignUpForm />}
            <button onClick={Logout}>Logout</button>
          </>
        ) : (
          <>
            <h2>註冊/登入</h2>
            <button onClick={Login}>Login</button>
          </>
        )}
      </>
    </div>
  );
};
export default LoginComponent;
