import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import UserSignUpForm from "../Login/UserInfo";
import { useNavigate } from "react-router-dom";

const LoginComponent = () => {
  const { user, Login, userExists, Logout } = useContext(AuthContext);
  const navigate = useNavigate();

  console.log("登入頁面的", user);
  return (
    <div>
      <>
        {user ? (
          <>
            <h2 key={user.uid}>{user.displayName}</h2>
            {userExists ? navigate(`/user/${user.userName}`) : <UserSignUpForm />}
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
