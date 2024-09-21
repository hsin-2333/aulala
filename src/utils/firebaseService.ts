import { db, storage } from "../../firebaseConfig";
import { v4 as uuidv4 } from "uuid";
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
  QueryConstraint,
  deleteDoc,
  orderBy,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { QueryConditions, Story, InteractionType } from "../types";

interface IUserData {
  id: string;
  uid: string;
  avatar: string | null;
  email: string | null;
  userName: string;
  gender: string;
  age: number;
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
    return userDocData || null;
  },

  //目前還沒有使用到
  // async handleUserData(userData: IUserData, playbackHistory: any) {
  //   const userExists = await this.checkUserExists(userData.uid);
  //   if (userExists) {
  //     await this.updateUser(userData);
  //   } else {
  //     await this.createUser(userData);
  //   }
  //   if (playbackHistory) {
  //     await this.addPlaybackHistory(userData.uid, playbackHistory);
  //   }
  // },
  subscribeToUserData(callback: (data: IUserData) => void) {
    const auth = getAuth();
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const unsubscribe = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
              //@ts-expect-error(123)
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
  // async getUserData(uid: string) {
  //   try {
  //     const userDocRef = doc(db, "users", uid);
  //     const docSnap = await getDoc(userDocRef);
  //     if (docSnap.exists()) {
  //       return { id: docSnap.id, ...docSnap.data() };
  //     } else {
  //       console.log("No such document!");
  //       return null;
  //     }
  //   } catch (e) {
  //     console.error("Error getting document: ", e);
  //     return null;
  //   }
  // },

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

    if (conditions.interaction_type) {
      constraints.push(where("interaction_type", "==", conditions.interaction_type));
    }
    // if (conditions.timestamp) {
    //   constraints.push(where("timestamp", ">=", conditions.timestamp.start));
    //   constraints.push(where("timestamp", "<=", conditions.timestamp.end));
    // }
    // if (conditions.likes) {
    //   constraints.push(where("likes", ">=", conditions.likes));
    // }
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

  // async uploadAudioAndSaveStory(file: File, imageFile: File | null, data: Story) {
  //   try {
  //     const tempAudioRef = ref(storage, `stories/temp_${file.name}`);
  //     await uploadBytes(tempAudioRef, file);
  //     const tempAudioUrl = await getDownloadURL(tempAudioRef);

  //     let imageUrl = null;
  //     if (imageFile) {
  //       const imageRef = ref(storage, `images/${imageFile.name}`);
  //       await uploadBytes(imageRef, imageFile);
  //       imageUrl = await getDownloadURL(imageRef);
  //     }
  //     const storyData = {
  //       ...data,
  //       audio_url: tempAudioUrl,
  //       img_url: imageUrl ? [imageUrl] : [],
  //       created_at: serverTimestamp(),
  //       updated_at: serverTimestamp(),
  //       tags: data.tags,
  //     };

  //     const storyRef = await addDoc(collection(db, "stories"), storyData);
  //     const storyId = storyRef.id;

  //     // Step 3: Rename the audio file in Firebase Storage using the storyId
  //     const newAudioRef = ref(storage, `stories/audio_${storyId}`);
  //     await uploadBytes(newAudioRef, file);
  //     const newAudioUrl = await getDownloadURL(newAudioRef);

  //     // Delete the temporary audio file
  //     await deleteObject(tempAudioRef);

  //     // Step 4: Update the Firestore document with the new audio URL
  //     await updateDoc(storyRef, { audio_url: newAudioUrl });

  //     return storyId;
  //   } catch (e) {
  //     console.error("Error uploading audio and saving story: ", e);
  //     throw e;
  //   }
  // },
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
        tags: data.tags,
      };

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
        body: JSON.stringify({ audioUrl: newAudioUrl, storyId: storyId }),
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
      console.log("scriptData: ", scriptData);
      console.log("data.tags: ", data.tags);
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
        // 對於留言，使用 UUID 生成唯一的 interactionId
        interactionId = `${userName}_${storyId || scriptId}_${interactionType}_${uuidv4()}`;
      } else {
        // 對於點讚和收藏，保持原有的 interactionId 生成方式
        interactionId = `${userName}_${storyId || scriptId}_${interactionType}`;
      }
      const interactionRef = doc(db, "interactions", interactionId);
      const interactionDoc = await getDoc(interactionRef);

      if (interactionDoc.exists()) {
        if (interactionType === "like" || interactionType === "bookmarked") {
          // 如果是第二次點讚or收藏，則刪除互動(取消收藏or取消讚)
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

        console.log("comment: ", comment);
        if (interactionType === "comment" && comment) {
          console.log("comment留言: ", comment);
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
};
export default dbApi;
