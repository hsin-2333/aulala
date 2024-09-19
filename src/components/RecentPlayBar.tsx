import React, { useState, useRef, useEffect, useContext } from "react";
import dbApi from "../utils/firebaseService";
import { AuthContext } from "../context/AuthContext";
import { Timestamp } from "firebase/firestore";
import { Story } from "../types";

interface AudioPlayerProps {
  track: {
    cover: string;
    title: string;
    voice_actor: string;
    audioSrc: string;
    played_at?: number;
  };
}

type RecentPlay = {
  id: string;
  user_id: string;
  story_id: string;
  played_at: number;
  updated_at: Timestamp;
};

const RecentPlayBar = ({ track }: AudioPlayerProps) => {
  const { user } = useContext(AuthContext);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(100);
  const [storyInfo, setStoryInfo] = useState<Story>({
    id: "",
    title: "",
    summary: "",
    img_url: [],
    audio_url: "",
    author: "",
    voice_actor: [""],
  });

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const fetchRecentPlay = async () => {
      if (user) {
        const condition = {
          user: user.uid,
        };
        const recentPlays = await dbApi.queryCollection("recentPlays", condition, 1, "updated_at", "desc");
        console.log("最近播放" + JSON.stringify(recentPlays));
        if (recentPlays.length > 0) {
          const recentPlay = recentPlays[0] as RecentPlay;
          console.log("最近播放", recentPlay);
          setCurrentTime(recentPlay.played_at);

          // 根據 story_id 查詢故事資料
          const StoryCondition = {
            id: recentPlay.story_id,
          };
          const storyDocs = await dbApi.queryCollection("stories", StoryCondition, 1);
          if (storyDocs) {
            setStoryInfo(storyDocs[0] as Story);
            console.log("故事資料", storyDocs[0]);
          }
        }
      }
    };
    fetchRecentPlay();
  }, [user]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = +event.target.value;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = +event.target.value;
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  return (
    <div className="bg-gray-300 p-4 rounded-lg flex items-center space-x-4">
      <div className="text-left">
        <img
          src={storyInfo.img_url ? storyInfo.img_url[0] : ""}
          alt={`Cover for ${storyInfo.title}`}
          className="w-12 h-12 rounded-full"
        />
        <div className="text-white">{storyInfo.voice_actor}</div>
        <div className="text-gray-400">{storyInfo.title}</div>
      </div>
      <div className="flex-grow">
        <input type="range" min="0" max={duration} value={currentTime} onChange={handleSeek} className="w-full" />
        <div className="flex justify-between text-sm text-gray-400">
          <span>{new Date(currentTime * 1000).toISOString().substr(14, 5)}</span>
          <span>{new Date(duration * 1000).toISOString().substr(14, 5)}</span>
        </div>
      </div>
      <div>
        <button onClick={togglePlayPause}>{isPlaying ? "Pause" : "Play"}</button>
      </div>
      <input type="range" min="0" max="100" value={volume} onChange={handleVolumeChange} className="w-24" />
      <audio
        ref={audioRef}
        src={track.audioSrc}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
      />
    </div>
  );
};

export default RecentPlayBar;
