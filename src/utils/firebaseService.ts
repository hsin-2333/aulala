import { db } from "../../firebaseConfig";
import {
  collection,
  addDoc,
  setDoc,
  getDoc,
  updateDoc,
  getDocs,
  limit,
  onSnapshot,
  serverTimestamp,
  doc,
  query,
  where,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

interface IUserData {
  uid: string;
  avatar: string | null;
  email: string | null;
  userName: string;
  gender: string;
  age: number;
}

const dbApi = {
  async checkUserExists(uid: string) {
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.exists();
  },

  async createUser(userData: IUserData) {
    try {
      const userDocRef = doc(db, "users", userData.uid);
      await setDoc(userDocRef, {
        ...userData,
        created_at: serverTimestamp(),
      });
      console.log("User created with ID: ", userData.uid);
    } catch (e) {
      console.error("Error creating user: ", e);
    }
  },

  async updateUser(userData: IUserData) {
    try {
      const userDocRef = doc(db, "users", userData.uid);
      await updateDoc(userDocRef, {
        ...userData,
        updated_at: serverTimestamp(),
      });
      console.log("User updated with ID: ", userData.uid);
    } catch (e) {
      console.error("Error updating user: ", e);
    }
  },

  async checkUserName(userName: string) {
    const userRef = collection(db, "users");
    const querySnapshot = await getDocs(query(userRef, where("userName", "==", userName)));
    return querySnapshot.empty;
  },

  async getUser(uid: string) {
    const userDoc = await getDoc(doc(db, "users", uid));
    const userDocData = userDoc.data();
    // return userDocData?.userName || null;
    return userDocData || null;
  },
  async addPlaybackHistory(uid: string, playbackHistory: any) {
    try {
      const userDocRef = doc(db, "users", uid);
      await updateDoc(userDocRef, {
        playback_history: playbackHistory.map((item: any) => ({
          ...item,
          last_playback_timestamp: new Date(),
        })),
      });
      console.log("Playback history added for user ID: ", uid);
    } catch (e) {
      console.error("Error adding playback history: ", e);
    }
  },

  async handleUserData(userData: IUserData, playbackHistory: any) {
    const userExists = await this.checkUserExists(userData.uid);
    if (userExists) {
      await this.updateUser(userData);
    } else {
      await this.createUser(userData);
    }
    if (playbackHistory) {
      await this.addPlaybackHistory(userData.uid, playbackHistory);
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

  async getUserData(uid: string) {
    try {
      const userDocRef = doc(db, "users", uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        console.log("No such document!");
        return null;
      }
    } catch (e) {
      console.error("Error getting document: ", e);
      return null;
    }
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

  async queryScriptByTags(tagId: string[]) {
    const scriptRef = collection(db, "scripts");
    const querySnapshot = await getDocs(query(scriptRef, where("tags", "array-contains-any", tagId)));
    const scripts = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return scripts;
  },
  async getStories(limitNum: number) {
    const q = query(collection(db, "stories"), limit(limitNum));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  async getScripts(limitNum: number) {
    const q = query(collection(db, "scripts"), limit(limitNum));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  async getScriptByCategory(category: string) {
    const q = query(collection(db, "scripts"), where("category", "==", category), limit(10));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  async getStoryByCategory(category: string) {
    const q = query(collection(db, "stories"), where("category", "==", category), limit(10));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },
};
export default dbApi;
