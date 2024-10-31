import { Link } from "@nextui-org/link";
import { useQuery } from "@tanstack/react-query";
import { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import WaveSurfer from "wavesurfer.js";
import { AuthContext } from "../../context/AuthContext";
import { RecentPlayContext } from "../../context/RecentPlayContext";
import { Story } from "../../types";
import dbApi from "../../utils/firebaseService";
import Icon from "../Common/Icon";

const RecentPlayBar = () => {
  const { user } = useContext(AuthContext);
  const audioRef = useRef<{
    instance: WaveSurfer | null;
    storyId: string | null;
  }>({
    instance: null,
    storyId: null,
  });
  const volumeRef = useRef<number>(100);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const { storyId } = useParams();

  const context = useContext(RecentPlayContext);
  if (context === undefined) {
    throw new Error("SomeComponent must be used within a RecentPlayProvider");
  }
  const { currentTimeRef, isPlaying, setIsPlaying, recentPlay, storyInfo } =
    context;
  const [currentStoryInfo, setCurrentStoryInfo] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [istheSameStory, setIstheSameStory] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (storyId) {
      setIsLoading(true);

      if (storyInfo && storyInfo.id === storyId) {
        setIstheSameStory(true);
        setCurrentStoryInfo(storyInfo);
      } else {
        const fetchStoryInfo = async () => {
          const storyData = await dbApi.getStoryById(storyId);
          if (isMounted) {
            setCurrentStoryInfo(storyData);
            setIsLoading(false);
          }
        };
        fetchStoryInfo();
        setIstheSameStory(false);
      }

      setIsLoading(false);
    } else {
      setCurrentStoryInfo(storyInfo);
      setIsLoading(false);
    }

    setIsPlaying(false);

    return () => {
      isMounted = false;
    };
  }, [storyId, storyInfo, setIsPlaying]);

  useEffect(() => {
    if (currentStoryInfo) {
      const existingStoryId = audioRef.current.storyId;

      if (
        (existingStoryId === currentStoryInfo.id &&
          audioRef.current.instance) ||
        (istheSameStory && audioRef.current.instance)
      ) {
        return;
      } else {
        if (audioRef.current.instance) {
          audioRef.current.instance.destroy();
        }
        const wavesurfer = WaveSurfer.create({
          container: "#waveform_bottom",
          waveColor: "#CCE3FD",
          progressColor: "#66AAF9",
          url: currentStoryInfo.audio_url,
          barWidth: 4,
          barGap: 3,
          barRadius: 16,
          height: 40,
        });

        if (currentStoryInfo.id) {
          audioRef.current = {
            instance: wavesurfer,
            storyId: currentStoryInfo.id,
          };
        }
        let lastUpdateTime = 0;

        const updateRecentPlay = (currentTime: number) => {
          if (user && user.uid && currentStoryInfo.id) {
            dbApi.updateRecentPlay(user.uid, currentStoryInfo.id, currentTime);
          }
        };

        wavesurfer.on("timeupdate", (currentTime) => {
          setCurrentTime(currentTime);
          currentTimeRef.current = currentTime;

          if (currentTime - lastUpdateTime > 0.999) {
            lastUpdateTime = currentTime;
            updateRecentPlay(currentTime);
          }
        });

        wavesurfer.on("ready", () => {
          setDuration(wavesurfer.getDuration());

          if (istheSameStory && currentTimeRef.current > 0) {
            wavesurfer.seekTo(
              currentTimeRef.current / wavesurfer.getDuration(),
            );
          } else if (
            currentStoryInfo.id === recentPlay?.story_id &&
            recentPlay &&
            recentPlay.played_at > 0
          ) {
            wavesurfer.seekTo(recentPlay.played_at / wavesurfer.getDuration());
          }
        });

        wavesurfer.on("seeking", (progress) => {
          const newTime = progress;
          setCurrentTime(newTime);
          currentTimeRef.current = newTime;
          lastUpdateTime = newTime;
          if (!istheSameStory) {
            updateRecentPlay(newTime);
          }
        });

        wavesurfer.on("finish", () => {
          setIsPlaying(false);
        });
      }
    }
  }, [
    currentStoryInfo,
    currentTimeRef,
    recentPlay,
    setIsPlaying,
    storyInfo?.id,
    user,
    istheSameStory,
  ]);

  const togglePlayPause = () => {
    const wavesurfer = audioRef.current.instance;
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
    if (audioRef.current.instance) {
      audioRef.current.instance.setVolume(newVolume / 100);
    }
  };
  return (
    <>
      {!isLoading && currentStoryInfo ? (
        <div className="fixed bottom-14 left-0 right-0 z-10 h-12 sm:bottom-0 sm:h-[80px]">
          <div className="mx-1 flex items-center justify-between space-x-4 rounded-md bg-slate-800 p-2 sm:mx-0 sm:rounded-none sm:p-4 md:px-11">
            <div className="flex w-5/6 gap-2 text-left sm:w-1/6 md:gap-4">
              <img
                src={
                  currentStoryInfo?.img_url ? currentStoryInfo.img_url[0] : ""
                }
                alt={`Cover for ${currentStoryInfo?.title}`}
                className="h-8 w-8 rounded-sm md:h-12 md:w-12"
              />
              <div className="flex max-w-full flex-grow flex-col">
                <div className="text-overflow-ellipsis overflow-hidden whitespace-nowrap text-xs sm:text-medium">
                  <Link
                    href={`/user/${currentStoryInfo?.voice_actor}`}
                    underline="hover"
                    className="text-white"
                  >
                    {currentStoryInfo?.voice_actor}
                  </Link>
                </div>
                <div className="text-overflow-ellipsis overflow-hidden whitespace-nowrap text-xs sm:text-medium">
                  <Link
                    href={`/story/${currentStoryInfo.id}`}
                    underline="hover"
                    className="text-gray-400"
                  >
                    {currentStoryInfo?.title}
                  </Link>
                </div>
              </div>
            </div>
            <div className="flex w-fit flex-row justify-end gap-4 sm:w-2/6 sm:justify-center md:flex-grow">
              <button onClick={togglePlayPause} className="w-20">
                <Icon
                  name="play"
                  filled={isPlaying}
                  className="mx-10 h-8 w-8 fill-[none] sm:mx-auto sm:fill-[hsl(var(--nextui-primary)/0.3)] sm:text-gray-500"
                />
              </button>
              <div className="mt-2 hidden justify-between text-xs text-gray-400 sm:flex">
                <span className="leading-6">
                  {new Date(currentTime * 1000).toISOString().substr(14, 5)}
                </span>
              </div>
              <div className="hidden w-3/6 sm:block">
                <div id="waveform_bottom" className="w-full"></div>
              </div>
              <div className="mt-2 hidden justify-between text-xs text-gray-400 sm:flex">
                <span className="leading-6">
                  {new Date(duration * 1000).toISOString().substr(14, 5)}
                </span>
              </div>
            </div>
            <div className="hidden w-2/6 items-center justify-center sm:flex">
              <button>
                <Icon name="volume" className="h-6 w-6" />
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
      ) : (
        <div className="fixed bottom-14 left-0 right-0 z-10 mx-1 flex h-12 items-center justify-between space-x-4 rounded-md bg-slate-800 p-2 sm:bottom-0 sm:mx-0 sm:h-[80px] sm:rounded-none sm:p-4 md:px-11">
          <div className="h-8 w-8 animate-pulse rounded-sm bg-gray-700 md:h-12 md:w-12"></div>
          <div className="flex max-w-full flex-grow flex-col space-y-2">
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-700"></div>
          </div>
          <div className="h-8 w-20 animate-pulse rounded bg-gray-700"></div>
          <div className="hidden h-8 w-3/6 animate-pulse rounded bg-gray-700 sm:block"></div>
          <div className="hidden h-8 w-2/6 animate-pulse rounded bg-gray-700 sm:flex"></div>
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

      wavesurfer.on("finish", () => {
        setIsPlaying(false);
      });

      return () => {
        wavesurfer.unAll();
        wavesurfer.destroy();
        audioRef.current = null;
      };
    }
  }, [story, currentTimeRef, setIsPlaying]);

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
        <div className="fixed bottom-14 left-0 right-0 z-10 h-12 sm:bottom-0 sm:h-[80px]">
          <div className="mx-1 flex items-center justify-between space-x-4 rounded-md bg-slate-800 p-2 sm:mx-0 sm:rounded-none sm:p-4 md:px-11">
            <div className="flex w-5/6 gap-2 text-left sm:w-1/6 md:gap-4">
              <img
                src={story?.img_url ? story.img_url[0] : ""}
                alt={`Cover for ${story?.title}`}
                className="h-8 w-8 rounded-sm md:h-12 md:w-12"
              />
              <div className="flex max-w-full flex-grow flex-col">
                <div className="text-overflow-ellipsis overflow-hidden whitespace-nowrap text-xs text-white sm:text-medium">
                  {story?.voice_actor}
                </div>
                <div className="text-overflow-ellipsis overflow-hidden whitespace-nowrap text-xs text-gray-400 sm:text-medium">
                  {story?.title}
                </div>
              </div>
            </div>
            <div className="flex w-fit flex-row justify-end gap-4 sm:w-2/6 sm:justify-center md:flex-grow">
              <button onClick={togglePlayPause} className="w-20">
                <Icon
                  name="play"
                  filled={isPlaying}
                  className="mx-10 h-8 w-8 fill-[none] sm:mx-auto sm:fill-[hsl(var(--nextui-primary)/0.3)] sm:text-gray-500"
                />
              </button>
              <div className="mt-2 hidden justify-between text-xs text-gray-400 sm:flex">
                <span className="leading-6">
                  {new Date(currentTime * 1000).toISOString().substr(14, 5)}
                </span>
              </div>
              <div className="hidden w-3/6 sm:block">
                <div id="waveform_bottom" className="w-full"></div>
              </div>
              <div className="mt-2 hidden justify-between text-xs text-gray-400 sm:flex">
                <span className="leading-6">
                  {new Date(duration * 1000).toISOString().substr(14, 5)}
                </span>
              </div>
            </div>
            <div className="hidden w-2/6 items-center justify-center sm:flex">
              <button>
                <Icon name="volume" className="h-6 w-6" />
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
