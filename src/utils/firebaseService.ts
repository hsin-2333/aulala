import { db } from "../../firebaseConfig";
import {
  collection,
  addDoc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  doc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const dbApi = {
  async addUserData(userData: any) {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      // 處理 playback_history 中的時間戳
      const playbackHistory = userData.playback_history.map((item: any) => ({
        ...item,
        last_playback_timestamp: new Date(),
      }));

      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        ...userData,
        playback_history: playbackHistory,
        created_at: serverTimestamp(),
      });
      console.log("Document written with ID: ", user.uid);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  },

  subscribeToUserData(callback: (data: any) => void) {
    const auth = getAuth();
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const unsubscribe = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
              callback({ id: doc.id, ...doc.data() });
            } else {
              console.log("No such document!");
            }
          });
          return unsubscribe;
        } else {
          console.log("No such document!");
        }
      } else {
        console.error("User not authenticated");
      }
    });
  },

  async addStoryData(storyData: any) {
    try {
      const docRef = await addDoc(collection(db, "stories"), {
        ...storyData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      console.log("Story document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding story document: ", e);
    }
  },

  async addScriptData(scriptData: any) {
    try {
      const docRef = await addDoc(collection(db, "scripts"), {
        ...scriptData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      console.log("Script document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding script document: ", e);
    }
  },
};
export default dbApi;
