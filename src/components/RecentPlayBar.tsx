import { useState, useRef, useEffect, useContext, useCallback } from "react";
import WaveSurfer from "wavesurfer.js";
import { RecentPlayContext } from "../context/RecentPlayContext";
import { AuthContext } from "../context/AuthContext";
import Icon from "./Icon";
import { debounce } from "lodash";
import dbApi from "../utils/firebaseService";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Story } from "../types";

const RecentPlayBar = () => {
  const { user } = useContext(AuthContext);
  const audioRef = useRef<WaveSurfer | null>(null);
  const volumeRef = useRef<number>(100);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const { storyId } = useParams();

  const context = useContext(RecentPlayContext);
  if (context === undefined) {
    throw new Error("SomeComponent must be used within a RecentPlayProvider");
  }
  const { currentTimeRef, isPlaying, setIsPlaying, recentPlay, storyInfo, fetchRecentPlay } = context;

  const setLastPlayTimestamp = useCallback(() => {
    if (recentPlay) {
      setCurrentTime(recentPlay.played_at);
      currentTimeRef.current = recentPlay.played_at;
      console.log("setLastPlayTimestamp", recentPlay.played_at);
    }
  }, [recentPlay, setCurrentTime, currentTimeRef]);

  useEffect(() => {
    if (storyId && storyInfo?.id !== storyId) {
      fetchRecentPlay();
      setCurrentTime(0);
      currentTimeRef.current = 0;
      console.log("新故事!");
    } else {
      setLastPlayTimestamp();
    }
  }, [storyId, storyInfo?.id, fetchRecentPlay, setLastPlayTimestamp, setCurrentTime, currentTimeRef]);

  useEffect(() => {
    //如果是主頁(aka沒有storyId) 或是 storyId和storyInfo.id一樣，且有audio_url
    if ((storyId === storyInfo?.id && storyInfo?.audio_url) || (!storyId && storyInfo?.audio_url)) {
      const wavesurfer = WaveSurfer.create({
        container: "#waveform_bottom",
        waveColor: "#CCE3FD",
        progressColor: "#66AAF9",
        url: storyInfo.audio_url,
        barWidth: 4,
        barGap: 3,
        barRadius: 16,
        height: 40,
      });

      audioRef.current = wavesurfer;

      // 設置播放時間更新與字幕更新邏輯
      let lastUpdateTime = 0;
      // let animationFrameId: number;

      const updateRecentPlay = debounce((currentTime: number) => {
        if (user && storyInfo?.id) {
          // 更新最近播放到後端
          dbApi.updateRecentPlay(user.uid, storyInfo?.id, currentTime);
          fetchRecentPlay();
          console.log("updateRecentPlay", currentTime);
        }
      }, 1000);

      // 使用 timeupdate 事件來更新 currentTimeRef
      wavesurfer.on("timeupdate", (currentTime) => {
        setCurrentTime(currentTime);
        currentTimeRef.current = currentTime;
        // console.log("更新時間", currentTime, lastUpdateTime);

        if (currentTime - lastUpdateTime > 0.8) {
          lastUpdateTime = currentTime;
          updateRecentPlay(currentTime);
          console.log("timeupdate event時間更新", currentTime);
        }
      });

      wavesurfer.on("ready", () => {
        setDuration(wavesurfer.getDuration());
        if (recentPlay && recentPlay.story_id === storyInfo.id) {
          wavesurfer.seekTo(recentPlay.played_at / wavesurfer.getDuration());
          setCurrentTime(recentPlay.played_at);
          currentTimeRef.current = recentPlay.played_at;
          console.log("音頻準備好，設置當前時間", recentPlay.played_at);
        }
      });

      // 時間軸跳轉
      wavesurfer.on("seeking", (progress) => {
        const newTime = progress;
        setCurrentTime(newTime);
        currentTimeRef.current = newTime;
        lastUpdateTime = newTime;
        updateRecentPlay(newTime);
      });

      return () => {
        // cancelAnimationFrame(animationFrameId);
        wavesurfer.destroy();
      };
    }
  }, [storyInfo?.audio_url, user, storyInfo?.id, fetchRecentPlay, setCurrentTime, currentTimeRef, storyId]);

  const togglePlayPause = () => {
    const wavesurfer = audioRef.current;
    console.log("togglePlayPause", wavesurfer);
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
  return (
    <>
      {recentPlay && (
        <div className="h-12 sm:h-[80px] fixed bottom-14 sm:bottom-0 left-0 right-0 z-10">
          <div className=" bg-slate-800 p-2 mx-1 rounded-md flex items-center space-x-4 justify-between sm:mx-0 sm:rounded-none sm:p-4 md:px-11">
            <div className="text-left flex gap-2 w-5/6 sm:w-1/6  md:gap-4">
              <img
                src={storyInfo?.img_url ? storyInfo.img_url[0] : ""}
                alt={`Cover for ${storyInfo?.title}`}
                className="w-8 h-8 md:w-12 md:h-12 rounded-sm"
              />
              <div className="flex flex-grow max-w-full flex-col">
                <div className="text-white whitespace-nowrap overflow-hidden text-overflow-ellipsis text-xs sm:text-medium">
                  {storyInfo?.voice_actor}
                </div>
                <div className="text-gray-400 whitespace-nowrap overflow-hidden text-overflow-ellipsis text-xs sm:text-medium">
                  {storyInfo?.title}
                </div>
              </div>
            </div>
            <div className="flex justify-end w-fit sm:w-2/6 md:flex-grow flex-row sm:justify-center gap-4">
              <button onClick={togglePlayPause} className="w-20 ">
                <Icon
                  name="play"
                  filled={isPlaying}
                  className="mx-10 h-8 w-8 fill-[none] sm:text-gray-500 sm:mx-auto sm:fill-[hsl(var(--nextui-primary)/0.3)]"
                />{" "}
              </button>
              <div className="hidden sm:flex justify-between text-xs text-gray-400 mt-2">
                <span className="leading-6">{new Date(currentTime * 1000).toISOString().substr(14, 5)}</span>
              </div>
              <div className="hidden sm:block w-3/6">
                <div id="waveform_bottom" className="w-full"></div>
              </div>
              <div className="hidden sm:flex justify-between text-xs text-gray-400 mt-2">
                <span className="leading-6">{new Date(duration * 1000).toISOString().substr(14, 5)}</span>
              </div>
            </div>
            <div className="hidden sm:flex w-2/6 items-center justify-center">
              <button>
                <Icon name="volume" className="h-6 w-6 " />
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                className="w-24"
                style={{
                  background:
                    "linear-gradient(to right, #cccccc 0%, #cccccc " +
                    volume +
                    "%, #cccccc4e " +
                    volume +
                    "%, #cccccc4e 100%)",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RecentPlayBar;

export const PlayBar = () => {
  const audioRef = useRef<WaveSurfer | null>(null);
  const volumeRef = useRef<number>(100);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const { storyId } = useParams();

  const { data: storyData } = useQuery({
    queryKey: ["story", storyId],
    queryFn: async () => {
      const story = await dbApi.queryCollection("stories", { id: storyId }, 1);
      return story as Story[];
    },
    enabled: !!storyId,
  });

  const story = storyData ? storyData[0] : null;

  const context = useContext(RecentPlayContext);
  if (context === undefined) {
    throw new Error("SomeComponent must be used within a RecentPlayProvider");
  }
  const { currentTimeRef, isPlaying, setIsPlaying } = context;

  useEffect(() => {
    if (story) {
      const wavesurfer = WaveSurfer.create({
        container: "#waveform_bottom",
        waveColor: "#CCE3FD",
        progressColor: "#66AAF9",
        url: story.audio_url,
        barWidth: 4,
        barGap: 3,
        barRadius: 16,
        height: 40,
      });

      audioRef.current = wavesurfer;

      let lastUpdateTime = 0;

      wavesurfer.on("timeupdate", (currentTime) => {
        setCurrentTime(currentTime);
        currentTimeRef.current = currentTime;

        if (currentTime - lastUpdateTime > 0.8) {
          lastUpdateTime = currentTime;
          console.log("timeupdate event時間更新", currentTime);
        }
      });

      wavesurfer.on("ready", () => {
        setDuration(wavesurfer.getDuration());
      });

      wavesurfer.on("seeking", (progress) => {
        const newTime = progress;
        setCurrentTime(newTime);
        currentTimeRef.current = newTime;
        lastUpdateTime = newTime;
      });

      return () => {
        wavesurfer.destroy();
      };
    }
  }, [story, currentTimeRef]);

  const togglePlayPause = () => {
    const wavesurfer = audioRef.current;
    console.log("togglePlayPause", wavesurfer);
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
  return (
    <>
      {story && (
        <div className="h-12 sm:h-[80px] fixed bottom-14 sm:bottom-0 left-0 right-0 z-10">
          <div className=" bg-slate-800 p-2 mx-1 rounded-md flex items-center space-x-4 justify-between sm:mx-0 sm:rounded-none sm:p-4 md:px-11">
            <div className="text-left flex gap-2 w-5/6 sm:w-1/6  md:gap-4">
              <img
                src={story?.img_url ? story.img_url[0] : ""}
                alt={`Cover for ${story?.title}`}
                className="w-8 h-8 md:w-12 md:h-12 rounded-sm"
              />
              <div className="flex flex-grow max-w-full flex-col">
                <div className="text-white whitespace-nowrap overflow-hidden text-overflow-ellipsis text-xs sm:text-medium">
                  {story?.voice_actor}
                </div>
                <div className="text-gray-400 whitespace-nowrap overflow-hidden text-overflow-ellipsis text-xs sm:text-medium">
                  {story?.title}
                </div>
              </div>
            </div>
            <div className="flex justify-end w-fit sm:w-2/6 md:flex-grow flex-row sm:justify-center gap-4">
              <button onClick={togglePlayPause} className="w-20 ">
                <Icon
                  name="play"
                  filled={isPlaying}
                  className="mx-10 h-8 w-8 fill-[none] sm:text-gray-500 sm:mx-auto sm:fill-[hsl(var(--nextui-primary)/0.3)]"
                />{" "}
              </button>
              <div className="hidden sm:flex justify-between text-xs text-gray-400 mt-2">
                <span className="leading-6">{new Date(currentTime * 1000).toISOString().substr(14, 5)}</span>
              </div>
              <div className="hidden sm:block w-3/6">
                <div id="waveform_bottom" className="w-full"></div>
              </div>
              <div className="hidden sm:flex justify-between text-xs text-gray-400 mt-2">
                <span className="leading-6">{new Date(duration * 1000).toISOString().substr(14, 5)}</span>
              </div>
            </div>
            <div className="hidden sm:flex w-2/6 items-center justify-center">
              <button>
                <Icon name="volume" className="h-6 w-6 " />
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                className="w-24"
                style={{
                  background:
                    "linear-gradient(to right, #cccccc 0%, #cccccc " +
                    volume +
                    "%, #cccccc4e " +
                    volume +
                    "%, #cccccc4e 100%)",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
