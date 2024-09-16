import React from "react";

interface PlaylistCardProps {
  image: string;
  title: string;
  author: string;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({ image, title, author }) => {
  return (
    <div className="flex items-center w-full h-24 bg-slate-200 rounded-lg overflow-hidden ">
      <img className="h-full w-24 object-cover" src={image} alt={title} />
      <div className="flex-grow p-4  text-left">
        <div className="font-bold text-xl">{title}</div>
        <div className="text-gray-600 justify-items-start	">{author}</div>
      </div>
      <button className="items-center justify-center mr-3">Play</button>
    </div>
  );
};
