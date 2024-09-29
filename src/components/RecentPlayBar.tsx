import { useState, useRef, useEffect, useContext, useCallback } from "react";
import WaveSurfer from "wavesurfer.js";
import { RecentPlayContext } from "../context/RecentPlayContext";
import { AuthContext } from "../context/AuthContext";
import Icon from "./Icon";
import { debounce } from "lodash";
import dbApi from "../utils/firebaseService";

const RecentPlayBar = () => {
  const { user } = useContext(AuthContext);
  const audioRef = useRef<WaveSurfer | null>(null);
  const currentTimeRef = useRef<number>(0);
  const volumeRef = useRef<number>(100);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  // const [isReady, setIsReady] = useState(false); // 新增 isReady 状态

  const context = useContext(RecentPlayContext);
  if (context === undefined) {
    throw new Error("SomeComponent must be used within a RecentPlayProvider");
  }
  const { isPlaying, setIsPlaying, recentPlay, storyInfo, currentTime, setCurrentTime, fetchRecentPlay } = context;

  // const [isPlaying, setIsPlaying] = useState(false);

  const setLastPlayTimestamp = useCallback(() => {
    if (recentPlay) {
      setCurrentTime(recentPlay.played_at);
      currentTimeRef.current = recentPlay.played_at;
      console.log("setLastPlayTimestamp", recentPlay.played_at);
    }
  }, [recentPlay, setCurrentTime]);
  useEffect(() => {
    console.log("useEffect 設定最新時間setLastPlayTimestamp");
    setLastPlayTimestamp();
  }, [setLastPlayTimestamp]);

  useEffect(() => {
    if (storyInfo?.audio_url) {
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
        console.log("ready");
        setDuration(wavesurfer.getDuration());
        wavesurfer.setVolume(volumeRef.current / 100);
        wavesurfer.seekTo(currentTimeRef.current / wavesurfer.getDuration());
        // setIsReady(true);
        if (isPlaying) {
          wavesurfer.play();
        }
      });

      wavesurfer.on("audioprocess", () => {
        const currentTime = wavesurfer.getCurrentTime();
        console.log("currentTime", currentTime);
        setCurrentTime(currentTime);
        currentTimeRef.current = currentTime;
      });

      const debouncedUpdateRecentPlay = debounce((currentTime: number) => {
        if (user && storyInfo.id) {
          dbApi.updateRecentPlay(user.uid, storyInfo.id, currentTime);
          console.log("更新最近播放");
          fetchRecentPlay();
        }
      }, 1000);

      let lastUpdateTime = 0;
      let animationFrameId: number;
      const updateCurrentTime = () => {
        const currentTime = wavesurfer.getCurrentTime();
        setCurrentTime(currentTime);
        if (currentTime - lastUpdateTime > 0.8) {
          lastUpdateTime = currentTime;
          console.log("更新," + lastUpdateTime, " currentTime=", currentTime);
          debouncedUpdateRecentPlay(currentTime);
        }
        animationFrameId = requestAnimationFrame(updateCurrentTime);
      };

      animationFrameId = requestAnimationFrame(updateCurrentTime);

      return () => {
        cancelAnimationFrame(animationFrameId);
        wavesurfer.destroy();
      };
    }
  }, [storyInfo?.audio_url, setCurrentTime, fetchRecentPlay, user, storyInfo?.id, isPlaying]);

  const togglePlayPause = () => {
    const wavesurfer = audioRef.current;
    if (wavesurfer) {
      if (isPlaying) {
        wavesurfer.pause();
      } else {
        wavesurfer.play();
        wavesurfer.seekTo(currentTimeRef.current / wavesurfer.getDuration());
      }
      setIsPlaying(!isPlaying);
    }
  };

  // useEffect(() => {
  //   const wavesurfer = audioRef.current;
  //   console.log("下方播放條 isPlaying", isPlaying);
  //   if (wavesurfer && isReady) {
  //     console.log("有 wavesurfer", wavesurfer);
  //     if (isPlaying) {
  //       wavesurfer.play();
  //       console.log("播放");
  //     } else {
  //       wavesurfer.pause();
  //     }
  //   }
  // }, [isPlaying, isReady]);

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
        <div className="h-[80px] fixed bottom-0 left-0 right-0 z-10">
          <div className=" bg-slate-800 p-4  flex items-center space-x-4 justify-between px-11">
            <div className="text-left w-1/6 flex gap-4">
              <img
                src={storyInfo?.img_url ? storyInfo.img_url[0] : ""}
                alt={`Cover for ${storyInfo?.title}`}
                className="w-12 h-12 rounded-lg"
              />
              <div>
                <div className="text-white">{storyInfo?.voice_actor}</div>
                <div className="text-gray-400">{storyInfo?.title}</div>
              </div>
            </div>

            <div className="flex w-2/6  flex-grow flex-row justify-center gap-4">
              <button onClick={togglePlayPause} className="w-20">
                <Icon name="play" filled={isPlaying} className="mx-auto h-9 w-9" color="#82ca9eaf" />
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

            <div className="flex w-2/6 items-center justify-center">
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
                    "linear-gradient(to right, #82ca9e 0%, #82ca9e " +
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
