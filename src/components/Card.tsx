import React from "react";
import { Timestamp } from "firebase/firestore";
interface PlaylistCardProps {
  image: string;
  title: string;
  tags: string[];
  author: string;
  onClick: () => void;
}

interface ScriptCardProps {
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

export const PlaylistCard: React.FC<PlaylistCardProps> = ({ image, title, tags = [], author, onClick }) => {
  return (
    <div
      className="flex items-center w-full h-24 bg-slate-200 rounded-lg overflow-hidden cursor-pointer"
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
      <button className="mr-3">Play</button>
    </div>
  );
};

export const ScriptCard: React.FC<ScriptCardProps> = ({ title, author, tags = [], summary, created_at }) => {
  const formattedDate = formatTimestamp(created_at);

  return (
    <div className="flex flex-col w-full bg-gray-100 rounded-lg overflow-hidden shadow-md">
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
          <p className="text-gray-600 hover:text-gray-800">收藏 35</p>
          <p className="text-gray-600 hover:text-gray-800">愛心 35</p>
          <p className="text-gray-600 hover:text-gray-800">留言 35</p>
        </div>
        <p className="text-gray-600 hover:text-gray-800">English</p>
      </div>
    </div>
  );
};
