export interface User {
  uid: string;
  userName: string;
  gender: "female" | "male" | "non-binary";
  age: number;
  email: string;
  about: string;
  role: string[];
  avatar: string;
  social_links?: string[];
  followers: string[];
  following: string[];
  saved_stories: string[];
  saved_scripts: string[];
  created_at: Date;
  playback_history: { story_id: string; last_playback_timestamp: Date }[];
  UserCollections: string[];
}

export interface AuthContextType {
  isLogin: boolean;
  loading: boolean;
  user: User | null;
  Login: () => void;
  Logout: () => void;
  userExists: boolean | undefined;
}

export type QueryConditions = {
  tags?: string[];
  category?: string;
  user?: string;
  timestamp?: {
    start: Date;
    end: Date;
  };
  likes?: number;
};
