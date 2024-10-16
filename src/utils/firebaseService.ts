import { getAuth } from "firebase/auth";
import {
  QueryConstraint,
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { db, storage } from "../../firebaseConfig";
import { InteractionType, QueryConditions, Story, User } from "../types";
interface IUserData {
  id?: string;
  uid: string;
  avatar: string | null;
  email: string | null;
  userName: string;
  gender: string;
  age: number;
  social_links?: {
    website?: string;
    twitter?: string;
  };
}

type Interactions = InteractionType[];

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

  async updateUser(userData: User) {
    try {
      if (!userData.uid) {
        throw new Error("User ID is undefined");
      }
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
    return userDocData || null;
  },

  async getUserByUserName(userName: string) {
    const q = query(collection(db, "users"), where("userName", "==", userName));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0];
    } else {
      console.error(`User with userName ${userName} not found.`);
      return null;
    }
  },
  async getVAs() {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("role", "==", "VA"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        userName: data.userName,
        avatar: data.avatar,
        email: data.email,
      };
    });
  },

  async sendNotification(notificationData: { recipient: string; message: string; link: string }) {
    try {
      const notificationRef = collection(db, "notifications");
      await addDoc(notificationRef, {
        ...notificationData,
        created_at: serverTimestamp(),
      });
      console.log("Notification sent successfully");
    } catch (e) {
      console.error("Error sending notification: ", e);
    }
  },

  subscribeToUserData(callback: (data: IUserData) => void) {
    const auth = getAuth();
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const unsubscribe = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
              const data = doc.data() as IUserData;
              callback({ id: doc.id, ...data });
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

  async addStoryData(storyData: Story) {
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

  async addScriptData(scriptData: Story) {
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

  async getTags() {
    const tagsRef = collection(db, "tags");
    const querySnapshot = await getDocs(tagsRef);
    return querySnapshot.docs.map((doc) => doc.data().name);
  },

  async getMyCollections(userName: string) {
    const collectionsRef = collection(db, "collections");
    const q = query(collectionsRef, where("userName", "==", userName));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data().collectionName);
  },

  async addOrUpdateTag(tagName: string, scriptId: string | null, storyId: string | null) {
    const tagRef = doc(db, "tags", tagName);
    const tagDoc = await getDoc(tagRef);

    if (tagDoc.exists()) {
      const existingData = tagDoc.data();
      const updatedScriptIds = scriptId ? [...new Set([...existingData.scriptIds, scriptId])] : existingData.scriptIds;
      const updatedStoryIds = storyId ? [...new Set([...existingData.storyIds, storyId])] : existingData.storyIds;

      await updateDoc(tagRef, {
        scriptIds: updatedScriptIds,
        storyIds: updatedStoryIds,
      });
    } else {
      await setDoc(tagRef, {
        name: tagName,
        scriptIds: scriptId ? [scriptId] : [],
        storyIds: storyId ? [storyId] : [],
      });
    }
  },

  async getStoryById(storyId: string) {
    try {
      const storyDocRef = doc(db, "stories", storyId);
      const storyDoc = await getDoc(storyDocRef);
      if (storyDoc.exists()) {
        return { id: storyDoc.id, ...storyDoc.data() } as Story;
      } else {
        return null;
      }
    } catch (e) {
      console.error("Error getting story: ", e);
      throw e;
    }
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

  async queryCollection(
    collectionName: string,
    conditions: QueryConditions,
    limitNum: number = 10,
    orderByField: string | null = null,
    orderDirection: "asc" | "desc" = "asc"
  ) {
    const constraints: QueryConstraint[] = [];

    if (conditions.id) {
      constraints.push(where("__name__", "==", conditions.id));
    }

    if (conditions.script_id) {
      constraints.push(where("script_id", "==", conditions.script_id));
    }

    if (conditions.story_id) {
      constraints.push(where("story_id", "==", conditions.story_id));
    }

    if (conditions.tags) {
      constraints.push(where("tags", "array-contains-any", conditions.tags));
    }
    if (conditions.category) {
      constraints.push(where("category", "==", conditions.category));
    }
    if (conditions.user) {
      constraints.push(where("user_id", "==", conditions.user));
    }
    if (conditions.userName) {
      constraints.push(where("userName", "==", conditions.userName));
    }

    if (conditions.recipient) {
      constraints.push(where("recipient", "==", conditions.recipient));
    }

    if (conditions.interaction_type) {
      constraints.push(where("interaction_type", "==", conditions.interaction_type));
    }

    if (conditions.author) {
      constraints.push(where("author", "==", conditions.author));
    }

    if (orderByField) {
      constraints.push(orderBy(orderByField, orderDirection));
    }

    constraints.push(limit(limitNum));

    const q = query(collection(db, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  async uploadAudioAndSaveStory(file: File, imageFile: File | null, data: Story) {
    try {
      const tempAudioRef = ref(storage, `stories/temp_${file.name}`);
      await uploadBytes(tempAudioRef, file);
      const tempAudioUrl = await getDownloadURL(tempAudioRef);

      let imageUrl = null;
      if (imageFile) {
        const imageRef = ref(storage, `images/${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      const storyData = {
        ...data,
        audio_url: tempAudioUrl,
        img_url: imageUrl ? [imageUrl] : [],
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        tags: data.tags || [],
        collections: data.collections || [],
      };

      console.log("資料庫存取: ", storyData, "data.collections: ", data.collections);

      const storyRef = await addDoc(collection(db, "stories"), storyData);
      const storyId = storyRef.id;

      // Rename and store audio with story ID
      const newAudioRef = ref(storage, `stories/audio_${storyId}`);
      await uploadBytes(newAudioRef, file);
      const newAudioUrl = await getDownloadURL(newAudioRef);
      console.log("newAudioUrl: ", newAudioUrl, "storyId: ", storyId);
      await deleteObject(tempAudioRef);
      await updateDoc(storyRef, { audio_url: newAudioUrl });

      // Trigger transcription
      const transcriptionResponse = await fetch("https://us-central1-aulala-a8757.cloudfunctions.net/transcribeAudio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ audioUrl: newAudioUrl, storyId: storyId, author: data.author }),
      });
      if (!transcriptionResponse.ok) throw new Error("Transcription failed");

      return storyId;
    } catch (e) {
      console.error("Error uploading audio and saving story: ", e);
      throw e;
    }
  },
  async uploadScript(file: File, imageFile: File | null, data: Story) {
    try {
      const storageRef = ref(storage, `script/${file.name}`);
      await uploadBytes(storageRef, file);
      const audioUrl = await getDownloadURL(storageRef);

      let imageUrl = null;
      if (imageFile) {
        const imageRef = ref(storage, `images/${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }
      const scriptData = {
        ...data,
        audio_url: audioUrl,
        img_url: imageUrl ? [imageUrl] : [],
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        tags: data.tags,
      };

      const scriptRef = await addDoc(collection(db, "scripts"), scriptData);
      return scriptRef.id;
    } catch (e) {
      console.error("Error uploading audio and saving story: ", e);
      throw e;
    }
  },

  //獲取點讚、收藏的狀態
  async getInteractionStatus(
    userName: string,
    storyId: string | null,
    scriptId: string | null,
    interactionType: string
  ) {
    const interactionId = `${userName}_${storyId || scriptId}_${interactionType}`;
    const interactionRef = doc(db, "interactions", interactionId);
    const interactionDoc = await getDoc(interactionRef);

    return interactionDoc.exists();
  },

  async updateInteraction(
    userName: string,
    storyId: string | null,
    scriptId: string | null,
    interactionType: string,
    comment?: string
  ) {
    try {
      let interactionId: string;
      if (interactionType === "comment" && comment) {
        interactionId = `${userName}_${storyId || scriptId}_${interactionType}_${uuidv4()}`;
      } else {
        interactionId = `${userName}_${storyId || scriptId}_${interactionType}`;
      }
      const interactionRef = doc(db, "interactions", interactionId);
      const interactionDoc = await getDoc(interactionRef);

      if (interactionDoc.exists()) {
        if (interactionType === "like" || interactionType === "bookmarked") {
          await deleteDoc(interactionRef);
          console.log("Interaction removed successfully");
        }
      } else {
        const data: InteractionType = {
          userName: userName,
          story_id: storyId,
          script_id: scriptId,
          interaction_type: interactionType,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        };

        if (interactionType === "comment" && comment) {
          data.comment = comment;
        }

        await setDoc(interactionRef, data);
        console.log("Interaction added successfully");
      }
    } catch (e) {
      console.error("Error updating interaction: ", e);
      throw e;
    }
  },

  async updateFollow(follower: string, following: string) {
    try {
      const followerDoc = await this.getUserByUserName(follower);
      const followingDoc = await this.getUserByUserName(following);

      if (!followerDoc || !followingDoc) {
        throw new Error("User not found.");
      }

      const followerRef = doc(db, "users", followerDoc.id);
      const followingRef = doc(db, "users", followingDoc.id);

      const batch = writeBatch(db);

      if (followerDoc.data().following?.[followingDoc.id]) {
        batch.update(followerRef, {
          [`following.${followingDoc.id}`]: deleteField(),
        });
        batch.update(followingRef, {
          [`followers.${followerDoc.id}`]: deleteField(),
        });

        console.log("Follow removed successfully");
      } else {
        batch.update(followerRef, {
          [`following.${followingDoc.id}`]: { userName: following, created_at: serverTimestamp() },
        });
        batch.update(followingRef, {
          [`followers.${followerDoc.id}`]: { userName: follower, created_at: serverTimestamp() },
        });

        console.log("Follow added successfully");
      }
      await batch.commit();
    } catch (e) {
      console.error("Error updating follow: ", e);
      throw e;
    }
  },

  async updateRecentPlay(userId: string, storyId: string, currentTime: number) {
    try {
      const recentPlayId = `${userId}_${storyId}`;
      const recentPlayRef = doc(db, "recentPlays", recentPlayId);
      const data = {
        user_id: userId,
        story_id: storyId,
        played_at: currentTime,
        updated_at: serverTimestamp(),
      };
      await setDoc(recentPlayRef, data);
      console.log("Recent play updated successfully");
    } catch (e) {
      console.error("Error updating recent play: ", e);
      throw e;
    }
  },

  async updateStoryStatus(storyId: string, status: string) {
    const storyRef = doc(db, "stories", storyId);
    await updateDoc(storyRef, { status });
  },

  async updateStory(storyId: string, data: { title: string; summary: string }) {
    const storyRef = doc(db, "stories", storyId);
    await updateDoc(storyRef, data);
  },

  async subscribeToStory(author: string, callback: (data: Story[]) => void) {
    const q = query(collection(db, "stories"), where("author", "==", author), orderBy("created_at", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const StoryData: Story[] = [];
      querySnapshot.forEach((doc) => {
        StoryData.push({ id: doc.id, ...doc.data() } as Story);
      });
      callback(StoryData);
    });

    return unsubscribe;
  },

  async subscribeToInteractions(scriptId: string, callback: (data: Interactions) => void) {
    const q = query(collection(db, "interactions"), where("script_id", "==", scriptId));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const interactionsData: InteractionType[] = [];
      querySnapshot.forEach((doc) => {
        interactionsData.push({ id: doc.id, ...doc.data() } as InteractionType);
      });
      callback(interactionsData);
    });

    return unsubscribe;
  },

  async subscribeToNotifications(userName: string, callback: (data: Interactions) => void) {
    const q = query(
      collection(db, "notifications"),
      where("recipient", "==", userName),
      where("status", "==", "unread")
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notificationsData: InteractionType[] = [];
      querySnapshot.forEach((doc) => {
        notificationsData.push({ id: doc.id, ...doc.data() } as InteractionType);
      });
      callback(notificationsData);
    });

    return unsubscribe;
  },

  async markNotificationsAsRead(userName: string) {
    const q = query(
      collection(db, "notifications"),
      where("recipient", "==", userName),
      where("status", "==", "unread")
    );
    const querySnapshot = await getDocs(q);
    console.log("querySnapshot: ", querySnapshot);
    const batch = writeBatch(db);

    querySnapshot.forEach((doc) => {
      batch.update(doc.ref, { status: "read" });
    });

    await batch.commit();
  },

  async deleteStory(storyId: string) {
    try {
      const storyRef = doc(db, "stories", storyId);
      await deleteDoc(storyRef);
      console.log("Story deleted with ID: ", storyId);
    } catch (e) {
      console.error("Error deleting story: ", e);
    }
  },

  async addStoryToCollection(storyId: string, collectionName: string, userName: string) {
    try {
      const collectionRef = doc(db, "collections", collectionName);
      const collectionDoc = await getDoc(collectionRef);
      if (collectionDoc.exists()) {
        const existingData = collectionDoc.data();
        const updatedStoryIds = [...new Set([...existingData.storyIds, storyId])];
        await updateDoc(collectionRef, {
          storyIds: updatedStoryIds,
        });
      } else {
        await setDoc(collectionRef, {
          collectionName: collectionName,
          storyIds: storyId ? [storyId] : [],
          userName: userName,
        });
      }
    } catch (e) {
      console.error("Error adding story to collection: ", e);
    }
  },
};
export default dbApi;
