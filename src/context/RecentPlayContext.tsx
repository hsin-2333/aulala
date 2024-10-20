import { Timestamp } from "firebase/firestore";
import { debounce } from "lodash";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AuthContext } from "../context/AuthContext";
import { Story } from "../types";
import dbApi from "../utils/firebaseService";

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
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  fetchRecentPlay: () => Promise<void>;
  currentTimeRef: React.MutableRefObject<number>;
};

const debouncedFetchRecentPlay = debounce(
  async (user, setRecentPlay, setStoryInfo) => {
    if (user) {
      const condition = {
        user: user.uid,
      };
      const recentPlays = await dbApi.queryCollection(
        "recentPlays",
        condition,
        1,
        "updated_at",
        "desc",
      );
      if (recentPlays.length > 0) {
        const recentPlay = recentPlays[0] as RecentPlay;
        setRecentPlay(recentPlay);

        const StoryCondition = {
          id: recentPlay.story_id,
        };
        const storyDocs = await dbApi.queryCollection(
          "stories",
          StoryCondition,
          1,
        );
        if (storyDocs) {
          setStoryInfo(storyDocs[0] as Story);
        }
      }
    }
  },
  1000,
);

export const RecentPlayContext = createContext<
  RecentPlayContextType | undefined
>(undefined);
export const RecentPlayProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useContext(AuthContext);
  const [recentPlay, setRecentPlay] = useState<RecentPlay | null>(null);
  const [storyInfo, setStoryInfo] = useState<Story | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const currentTimeRef = useRef(0);

  const fetchRecentPlay = useCallback(async () => {
    await debouncedFetchRecentPlay(user, setRecentPlay, setStoryInfo);
  }, [user]);

  useEffect(() => {
    fetchRecentPlay();
  }, [user, fetchRecentPlay]);

  return (
    <RecentPlayContext.Provider
      value={{
        currentTimeRef,
        recentPlay,
        storyInfo,
        isPlaying,
        setIsPlaying,
        fetchRecentPlay,
      }}
    >
      {children}
    </RecentPlayContext.Provider>
  );
};
