import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import dbApi from "../utils/firebaseService";
import { AuthContext } from "../context/AuthContext";
import { Timestamp } from "firebase/firestore";
import { Story } from "../types";

type RecentPlay = {
  id: string;
  user_id: string;
  story_id: string;
  played_at: number;
  updated_at: Timestamp;
};

type RecentPlayContextType = {
  recentPlay: RecentPlay | null;
  storyInfo: Story | null;
  fetchRecentPlay: () => Promise<void>;
};

export const RecentPlayContext = createContext<RecentPlayContextType | undefined>(undefined);

export const RecentPlayProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useContext(AuthContext);
  const [recentPlay, setRecentPlay] = useState<RecentPlay | null>(null);
  const [storyInfo, setStoryInfo] = useState<Story | null>(null);

  const fetchRecentPlay = useCallback(async () => {
    if (user) {
      const condition = {
        user: user.uid,
      };
      const recentPlays = await dbApi.queryCollection("recentPlays", condition, 1, "updated_at", "desc");
      console.log("最近播放" + JSON.stringify(recentPlays));
      if (recentPlays.length > 0) {
        const recentPlay = recentPlays[0] as RecentPlay;
        setRecentPlay(recentPlay);

        // 根據 story_id 查詢故事資料
        const StoryCondition = {
          id: recentPlay.story_id,
        };
        const storyDocs = await dbApi.queryCollection("stories", StoryCondition, 1);
        if (storyDocs) {
          setStoryInfo(storyDocs[0] as Story);
        }
      }
    }
  }, [user]);

  useEffect(() => {
    fetchRecentPlay();
  }, [user, fetchRecentPlay]);

  return (
    <RecentPlayContext.Provider value={{ recentPlay, storyInfo, fetchRecentPlay }}>
      {children}
    </RecentPlayContext.Provider>
  );
};

// export const useRecentPlay = () => {
//   const context = useContext(RecentPlayContext);
//   if (context === undefined) {
//     throw new Error("useRecentPlay must be used within a RecentPlayProvider");
//   }
//   return context;
// };
