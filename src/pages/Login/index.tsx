import { useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import UserSignUpForm from "../Login/UserInfo";
import { useNavigate } from "react-router-dom";

const LoginComponent = () => {
  const { user, authUser, Login, userExists, Logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && userExists) {
      navigate(`/user/${user.userName}`);
    }
  }, [user, userExists, navigate]);

  return (
    <div>
      <>
        {user || authUser ? (
          <>
            {/* <h2 key={user.uid}>{user.displayName}</h2>
            {!userExists && <UserSignUpForm />}
            <button onClick={Logout}>Logout</button> */}
            <h2 key={user?.uid || authUser?.uid}>{user?.userName || authUser?.displayName}</h2>
            {!userExists && <UserSignUpForm />}
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
