import React, { useState, useRef, useEffect, useContext } from "react";
import WaveSurfer from "wavesurfer.js";
import dbApi from "../utils/firebaseService";
import { AuthContext } from "../context/AuthContext";
import { Timestamp } from "firebase/firestore";
import { Story } from "../types";
import Icon from "./Icon";

type RecentPlay = {
  id: string;
  user_id: string;
  story_id: string;
  played_at: number;
  updated_at: Timestamp;
};

const RecentPlayBar = () => {
  const { user } = useContext(AuthContext);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<WaveSurfer | null>(null);
  const currentTimeRef = useRef<number>(0);
  const volumeRef = useRef<number>(100);
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
          setCurrentTime(recentPlay.played_at);
          currentTimeRef.current = recentPlay.played_at;

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
    };
    fetchRecentPlay();
  }, [user]);

  useEffect(() => {
    if (storyInfo.audio_url) {
      const wavesurfer = WaveSurfer.create({
        container: "#waveform_bottom",
        waveColor: "rgba(130, 202, 158, 0.531)",
        progressColor: "rgb(76, 117, 92)",
        url: storyInfo.audio_url,
        barWidth: 4,
        barGap: 3,
        barRadius: 16,
        height: 40,
      });

      audioRef.current = wavesurfer;

      wavesurfer.on("ready", () => {
        setDuration(wavesurfer.getDuration());
        wavesurfer.setVolume(volumeRef.current / 100);
        wavesurfer.seekTo(currentTimeRef.current / wavesurfer.getDuration());
      });

      wavesurfer.on("audioprocess", () => {
        setCurrentTime(wavesurfer.getCurrentTime());
      });

      return () => {
        wavesurfer.destroy();
      };
    }
  }, [storyInfo.audio_url]);

  const togglePlayPause = () => {
    const wavesurfer = audioRef.current;
    if (wavesurfer) {
      if (isPlaying) {
        wavesurfer.pause();
      } else {
        wavesurfer.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = +event.target.value;
    setVolume(newVolume);
    volumeRef.current = newVolume;
    if (audioRef.current) {
      audioRef.current.setVolume(newVolume / 100);
    }
  };

  // const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const newTime = +event.target.value;
  //   setCurrentTime(newTime);
  //   if (audioRef.current) {
  //     audioRef.current.seekTo(newTime / duration);
  //   }
  // };

  return (
    <div className="bg-gray-300 p-4 rounded-lg flex items-center space-x-4 justify-between px-11">
      <div className="text-left w-1/6 flex gap-4">
        <img
          src={storyInfo.img_url ? storyInfo.img_url[0] : ""}
          alt={`Cover for ${storyInfo.title}`}
          className="w-12 h-12 rounded-lg"
        />
        <div>
          <div className="text-white">{storyInfo.voice_actor}</div>
          <div className="text-gray-400">{storyInfo.title}</div>
        </div>
      </div>

      <div className="flex flex-grow flex-row justify-center gap-4">
        <button onClick={togglePlayPause} className="w-20">
          <Icon name="play" filled={isPlaying} className="mx-auto h-8 w-8" color="#82ca9eaf" />
        </button>
        <div className="flex justify-between text-sm text-gray-400 mt-2">
          <span className="leading-6">{new Date(currentTime * 1000).toISOString().substr(14, 5)}</span>
        </div>
        <div className="w-3/6">
          <div id="waveform_bottom" className="w-full"></div>
        </div>
        <div className="flex justify-between text-sm text-gray-400 mt-2">
          <span className="leading-6">{new Date(duration * 1000).toISOString().substr(14, 5)}</span>
        </div>
      </div>

      <div></div>
      <input type="range" min="0" max="100" value={volume} onChange={handleVolumeChange} className="w-24" />
    </div>
  );
};

export default RecentPlayBar;
