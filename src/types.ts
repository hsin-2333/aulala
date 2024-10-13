import { Timestamp, FieldValue } from "firebase/firestore";

export interface User {
  uid?: string;
  userName?: string;
  gender?: "female" | "male" | "non-binary";
  age?: number;
  email?: string;
  about?: string;
  role?: string[];
  avatar?: string;
  social_links?: {
    website?: string;
    twitter?: string;
  };
  followers?: string[];
  following?: string[];
  saved_stories?: string[];
  saved_scripts?: string[];
  created_at?: Date;
  playback_history?: { story_id: string; last_playback_timestamp: Date }[];
  UserCollections?: string[];
  selfIntro?: string;
}

export interface AuthUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  providerId: string;
}

export interface AuthContextType {
  isLogin: boolean;
  loading: boolean;
  user: User | null;
  authUser: AuthUser | null;
  Login: () => void;
  LoginWithEmail: (email: string, password: string) => void;
  Logout: () => void;
  userExists: boolean | undefined;
}

export type QueryConditions = {
  author?: string;
  tags?: string[];
  category?: string;
  user?: string; // user id
  timestamp?: {
    start: Date;
    end: Date;
  };
  likes?: number;
  id?: string;
  script_id?: string;
  story_id?: string;
  interaction_type?: string;
  userName?: string;
  recipient?: string;
};

export interface Story {
  id?: string;
  title: string;
  author: string;
  img_url?: string[];
  status?: string;
  image?: string;
  summary?: string;
  content?: string;
  tags?: string[];
  created_at?: Timestamp | string;
  language?: string;
  voice_actor?: string[];
  audio_url?: string;
  segments?: { text: string; start: number; end: number }[];
  duration?: number;
  intro?: string;
  collections?: string[];
}

export interface InteractionType {
  id?: string;
  userName?: string;
  story_id: string | null;
  script_id: string | null;
  interaction_type: string;
  comment?: string | null;
  created_at: FieldValue | Date;
  updated_at: FieldValue | Date;
}

export interface Comment {
  id?: string;
  title: string;
  userName: string;
  comment?: string;
  created_at?: Timestamp | string;
}
