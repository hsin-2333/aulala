import { useEffect, useState, useContext } from "react";
import { Timestamp } from "firebase/firestore";
import dbApi from "../utils/firebaseService";
import { InteractionType } from "../types";
import Icon from "./Icon";
import { AuthContext } from "../context/AuthContext";
import { RecentPlayContext } from "../context/RecentPlayContext";
import { Card, CardBody, Button } from "@nextui-org/react";

interface PlaylistCardProps {
  id?: string;
  image: string;
  title: string;
  tags: string[];
  author: string;
  onClick?: () => void;
  onCardClick?: () => void;
}

interface ScriptCardProps {
  scriptId: string | undefined;
  title: string;
  author: string;
  tags: string[];
  language: string;
  summary: string;
  created_at: Timestamp;
}

const formatTimestamp = (timestamp?: Timestamp): string => {
  if (!timestamp) {
    return "Invalid date";
  }
  const date = timestamp.toDate();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${year}${month}`;
};

export const PlaylistCard = ({ image, title, tags = [], author, onClick }: PlaylistCardProps) => {
  return (
    <div
      className="flex items-center w-full h-24 bg-slate-200 rounded-lg overflow-hidden cursor-pointer mb-2"
      onClick={onClick}
    >
      <img className="h-full w-24 object-cover" src={image} alt={title} />
      <div className="flex-grow pl-4 text-left">
        <div className="font-bold text-l">{title}</div>
        <div className="justify-items-start	">{author}</div>
        <div className="flex space-x-2 mt-2">
          {tags.map((tag, index) => (
            <span key={index} className="rounded-sm bg-slate-300">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ScriptCard = ({ scriptId, title, author, tags = [], summary, created_at, language }: ScriptCardProps) => {
  const formattedDate = formatTimestamp(created_at);

  const [interactions, setInteractions] = useState<InteractionType[]>([]);
  console.log(interactions);
  useEffect(() => {
    if (!scriptId) return;

    const fetchData = async () => {
      const unsubscribe = await dbApi.subscribeToInteractions(scriptId, setInteractions);
      return unsubscribe;
    };

    const unsubscribePromise = fetchData();

    return () => {
      unsubscribePromise.then((unsubscribe) => unsubscribe());
    };
  }, [scriptId]);

  const getCount = (type: string) => {
    return interactions.filter((interaction) => interaction.interaction_type === type).length;
  };

  return (
    <div className="flex flex-col w-full bg-gray-100 rounded-lg overflow-hidden mb-2">
      <div className="flex items-center p-4 ">
        <div className="flex-grow text-left">
          <div className="font-bold text-xl text-black">{title}</div>
          <div className="text-gray-600">
            {author} • {formattedDate}
          </div>
          <div className="flex space-x-2 mt-2 ">
            {tags.map((tag, index) => (
              <span key={index} className="text-gray-00 text-sm p-1 rounded-sm bg-slate-300">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="p-4 text-gray-700  text-left">{summary}</div>
      <div className="flex items-center justify-between p-4 ">
        <div className="flex space-x-4">
          <p className="text-gray-600 hover:text-gray-800">收藏 {getCount("bookmarked")}</p>
          <p className="text-gray-600 hover:text-gray-800">愛心 {getCount("like")}</p>
          <p className="text-gray-600 hover:text-gray-800">留言 {getCount("comment")}</p>
        </div>
        <p className="text-gray-600 hover:text-gray-800">{language}</p>
      </div>
    </div>
  );
};
export const AudioCard: React.FC<PlaylistCardProps> = ({
  id,
  image,
  title,
  tags = [],
  author,
  onClick,
  onCardClick,
}) => {
  const { user } = useContext(AuthContext);
  const context = useContext(RecentPlayContext);
  if (context === undefined) {
    throw new Error("SomeComponent must be used within a RecentPlayProvider");
  }
  const { isPlaying, setIsPlaying, fetchRecentPlay } = context;

  const togglePlayPause = async (event: React.MouseEvent) => {
    event.stopPropagation(); // 防止事件冒泡
    if (user && id) {
      // const currentTime = Date.now();
      const currentTime = 0;
      try {
        console.log("更新時間點=", currentTime);
        await dbApi.updateRecentPlay(user.uid, id, currentTime);
        fetchRecentPlay();
        console.log("Updated recent play");
      } catch (error) {
        console.error("Error updating recent play: ", error);
      }
    }
    if (onCardClick) {
      console.log("onCardClick");
      onCardClick(); //打開主頁側邊選單
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <Card
      isBlurred
      className="border-none bg-background/60 dark:bg-default-100/50 max-w-[510px] cursor-pointer mb-2"
      shadow="sm"
      // onClick={onClick}
      isPressable
      onPress={onClick}
    >
      <CardBody>
        <div className="grid grid-cols-6 md:grid-cols-12 gap-6 md:gap-4 items-center justify-center">
          <div className="relative col-span-6 md:col-span-4 w-full h-36 md:h-full">
            <img
              alt={title}
              className="object-cover rounded-lg w-full h-full md:max-w-32 md:max-h-32 "
              src={image}
              width="100%"
              style={{ height: "100%", borderRadius: "0.5rem" }}
            />
          </div>

          <div className="flex h-full flex-col col-span-6 md:col-span-8">
            <div className="flex justify-between items-start h-full">
              <div className="flex flex-col gap-0 justify-between">
                <div>
                  <h1 className="text-medium font-semibold ">{title}</h1>
                  <h3 className="text-small tracking-tight text-default-400">by {author}</h3>
                  <p className="text-small pt-2 overflow-hidden">
                    這邊要放 Intro!! Frontend developer and UI/UX enthusiast. Join me on this coding adventure!
                  </p>
                </div>

                <div className="flex space-x-2 mt-2 text-small text-default-400">
                  {tags.map((tag, index) => (
                    <span key={index} className="rounded-sm ">
                      # {tag}
                    </span>
                  ))}
                </div>
              </div>

              <Button
                isIconOnly
                className="text-default-900/60 data-[hover]:bg-foreground/10 -translate-y-2 translate-x-2"
                radius="full"
                variant="light"
                onClick={togglePlayPause}
              >
                <Icon name="play" className="h-6 w-6" color="hsl(var(--nextui-primary-200))" />
              </Button>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
