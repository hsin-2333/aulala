import { useEffect, useState } from "react";
import { Timestamp } from "firebase/firestore";
import dbApi from "../utils/firebaseService";
import { InteractionType } from "../types";

interface PlaylistCardProps {
  image: string;
  title: string;
  tags: string[];
  author: string;
  onClick?: () => void;
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

export const AudioCard: React.FC<PlaylistCardProps> = ({ image, title, tags = [], author, onClick }) => {
  return (
    <div
      className="shrink-0 flex  flex-col items-start w-24 h-24 bg-slate-200 rounded-lg  cursor-pointer mb-2"
      onClick={onClick}
    >
      <img className="h-full w-24 object-cover" src={image} alt={title} />
      <div className="flex-grow text-left">
        <div className="font-bold text-l text-wrap">{title}</div>
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
