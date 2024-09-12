import { useEffect, useState } from "react";
import dbApi from "../../utils/firebaseService";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const UploadScript = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const auth = getAuth();
    auth.onAuthStateChanged((user) => {
      if (user) {
        const unsubscribe = dbApi.subscribeToUserData(setUser);
        return () => unsubscribe();
      }
    });
  }, []);
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

  const handleLogin = async () => {
    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, "test@example.com", "password");
    } catch (error) {
      console.error("Error logging in: ", error);
    }
  };

  const handleAddStory = async () => {
    const newStory = {
      intro: "Story introduction",
      voice_actor: ["url1", "url2"],
      duration: 120,
      type: ["scripted", "unscripted"],
      script_id: "scriptId1", //or null
      title: "title",
      summary: "summary",
      scheduled_release_date: new Date(),
      popularity_score: 100,
      UserInteractions: "interactionId1",
      playback_count: 10,
      most_played_sections: [{ start: 0, end: 60, playCount: 5 }],
      audio_url: "audio_url",
      img_url: ["cover_url", "other_img_url"],
    };
    await dbApi.addStoryData(newStory);
  };

  const handleAddScript = async () => {
    const newScript = {
      title: "Script Title",
      summary: "Script Summary",
      content: "Script Content",
      language: ["English", "Spanish"],
      category: ["Drama", "Comedy"],
      tags: ["tag1", "tag2"],
      author: "authorId1",
      popularity_score: 50,
      UserInteractions: ["userId1", "userId2"],
      status: ["public"],
      allowed_va: ["vaId1", "vaId2"],
    };
    await dbApi.addScriptData(newScript);
  };

  return (
    <div>
      <button onClick={handleLogin}>Login</button>
      <br /> <br />
      <button onClick={handleAddUser}>Add User</button>
      <button onClick={handleAddStory}>Add Story</button>
      <br /> <br />
      <button onClick={handleAddScript}>Add Script</button>
      {user && (
        <ul>
          <li key={user.id}>{user.username}</li>
        </ul>
      )}
    </div>
  );
};
export default UploadScript;
