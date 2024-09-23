import React, { useState, useRef, useEffect, useContext } from "react";
import WaveSurfer from "wavesurfer.js";
import { RecentPlayContext } from "../context/RecentPlayContext";
import Icon from "./Icon";

const RecentPlayBar = () => {
  // const { recentPlay, storyInfo } = useRecentPlay();
  const audioRef = useRef<WaveSurfer | null>(null);
  const currentTimeRef = useRef<number>(0);
  const volumeRef = useRef<number>(100);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(100);
  const context = useContext(RecentPlayContext);
  if (context === undefined) {
    throw new Error("SomeComponent must be used within a RecentPlayProvider");
  }
  const { recentPlay, storyInfo } = context;
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (recentPlay) {
      setCurrentTime(recentPlay.played_at);
      currentTimeRef.current = recentPlay.played_at;
    }
  }, [recentPlay]);

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
  }, [storyInfo?.audio_url]);

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

  return (
    <div className="fixed bottom-0 left-0 right-0 ">
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
  );
};

export default RecentPlayBar;
