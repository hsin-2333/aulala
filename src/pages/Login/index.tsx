import { useContext } from "react";
import dbApi from "../../utils/firebaseService";
import { AuthContext } from "../../context/AuthContext";

const LoginComponent = () => {
  const { user, Login } = useContext(AuthContext);

  const handleAddUser = async () => {
    const newUser = {
      username: "exampleUser",
      gender: ["f", "m", "non-binary"],
      email: "test@example.com",
      role: ["user", "va", "writer"],
      avatar: "url_to_avatar",
      followers: ["userId1", "userId2"],
      following: ["userId3", "userId4"],
      saved_stories: ["storyId1", "storyId2"],
      saved_scripts: ["scriptId1", "scriptId2"],
      playback_history: [{ story_id: "storyId1" }],
    };
    await dbApi.addUserData(newUser);
  };

  return (
    <div>
      <button onClick={handleAddUser}>Add User</button>
      {user && user.reloadUserInfo && user.reloadUserInfo.displayName ? (
        <ul>
          <li key={user.uid}>{user.displayName}</li>
          <h2>歡迎</h2>
        </ul>
      ) : (
        <>
          <h2>請登入</h2>
          <button onClick={Login}>Login</button>
        </>
      )}
    </div>
  );
};
export default LoginComponent;
