import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";

function Account() {
  const { Logout } = useContext(AuthContext);

  return (
    <div>
      <h2>Account Page</h2>
      <button onClick={Logout}>Logout</button>
    </div>
  );
}

export default Account;
