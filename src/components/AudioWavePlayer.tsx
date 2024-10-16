import { debounce } from "lodash";
import { useContext, useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { AuthContext } from "../context/AuthContext";
import { RecentPlayContext } from "../context/RecentPlayContext";
import dbApi from "../utils/firebaseService";
import Icon from "./Icon";

interface AudioWavePlayerProps {
  audio_url: string;
  storyId: string;
  segments: { text: string; start: number; end: number }[];
  showSubtitles: boolean;
}

function AudioWavePlayer({ audio_url, storyId, segments, showSubtitles }: AudioWavePlayerProps) {
  const { user } = useContext(AuthContext);
  const audioRefMain = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  // const [isPlaying, setIsPlaying] = useState(false);
  const currentTextRef = useRef<string>("");
  const [currentText, setCurrentText] = useState<string[]>([]);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState<number>(-1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const context = useContext(RecentPlayContext);
  if (context === undefined) {
    throw new Error("SomeComponent must be used within a RecentPlayProvider");
  }
  const { isPlaying, setIsPlaying, fetchRecentPlay } = context;

  const AudioSegments = segments;
  useEffect(() => {
    if (audioRefMain.current) {
      const wavesurfer = WaveSurfer.create({
        container: audioRefMain.current,
        // barHeight: 0.5,
        cursorWidth: 0,
        height: 80,
        waveColor: "rgba(130, 202, 158, 0.531)",
        progressColor: "rgb(76, 117, 92)",
        url: audio_url,
        barWidth: 4,
        barGap: 3,
        barRadius: 16,
      });

      wavesurferRef.current = wavesurfer;

      let lastUpdateTime = 0;
      let animationFrameId: number;

      const updateSubtitles = (currentTime: number) => {
        let currentSegmentIndex = AudioSegments.findIndex(
          (segment) => currentTime >= segment.start && currentTime <= segment.end
        );

        if (currentSegmentIndex === -1) {
          currentSegmentIndex = AudioSegments.findIndex((_, index) => {
            const nextSegment = AudioSegments[index + 1];
            return nextSegment && currentTime < nextSegment.start;
          });
        }

        if (currentSegmentIndex !== -1) {
          const start = Math.max(0, currentSegmentIndex - 2);
          const end = Math.min(AudioSegments.length, currentSegmentIndex + 3);
          const segmentsToShow = AudioSegments.slice(start, end).map((segment) => segment.text);

          if (segmentsToShow.join() !== currentTextRef.current) {
            currentTextRef.current = segmentsToShow.join();
            setCurrentText(segmentsToShow);
            setCurrentSegmentIndex(currentSegmentIndex - start);
          }
        }
      };

      const debouncedUpdateRecentPlay = debounce((currentTime: number) => {
        if (user && user.uid) {
          dbApi.updateRecentPlay(user.uid, storyId, currentTime);
          fetchRecentPlay();
        }
      }, 1000);

      const updateCurrentTime = () => {
        const currentTime = wavesurfer.getCurrentTime();
        setCurrentTime(currentTime);
        if (currentTime - lastUpdateTime > 0.8) {
          lastUpdateTime = currentTime;
          updateSubtitles(currentTime);
          debouncedUpdateRecentPlay(currentTime);
        }
        animationFrameId = requestAnimationFrame(updateCurrentTime);
      };

      animationFrameId = requestAnimationFrame(updateCurrentTime);

      const initialSegments = AudioSegments.slice(0, 3).map((segment) => segment.text);
      setCurrentText(initialSegments);
      setCurrentSegmentIndex(0);

      const handleSeek = debounce((currentTime: number) => {
        lastUpdateTime = 0;
        updateSubtitles(currentTime);
      }, 100);

      wavesurfer.on("seeking", handleSeek);
      wavesurfer.on("ready", () => {
        setDuration(wavesurfer.getDuration());
      });

      return () => {
        cancelAnimationFrame(animationFrameId);
        wavesurfer.destroy();
      };
    }
  }, [audioRefMain, audio_url, storyId, user, AudioSegments, fetchRecentPlay]);

  const handlePlayPause = async () => {
    const wavesurfer = wavesurferRef.current;
    if (wavesurfer) {
      if (isPlaying) {
        wavesurfer.pause();
      } else {
        wavesurfer.play();
      }
      if (user && user.uid) {
        const currentTime = wavesurfer.getCurrentTime();
        console.log("更新時間");
        await dbApi.updateRecentPlay(user.uid, storyId, currentTime);
        fetchRecentPlay();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="mb-6">
      {showSubtitles && (
        <div className="subtitle w-full h-72 border border-gray-200 rounded-lg p-8  mb-8">
          <div className="flex gap-3">
            {/* <div>
              <span className="leading-6">換成start time</span>
            </div> */}
            <div className="flex-1">
              {currentText.map((text, index) => (
                <p
                  key={index}
                  className={
                    index === currentSegmentIndex
                      ? "highlight mb-4 before:content-none"
                      : "text-gray-700 mb-4 before:content-none"
                  }
                >
                  {text}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      <div id="waveform" ref={audioRefMain} />
      <div className="flex justify-between text-sm text-gray-400 mt-2">
        <span className="leading-6">{new Date(currentTime * 1000).toISOString().substr(14, 5)}</span>
        <span className="leading-6">{new Date(duration * 1000).toISOString().substr(14, 5)}</span>
      </div>

      <div className="flex items-center justify-center gap-4  mt-4 ">
        <button onClick={handlePlayPause} className="flex items-center">
          <Icon name="play" filled={isPlaying} className="mr-2 h-8 w-8" color="#82ca9eaf" />
        </button>
      </div>
    </div>
  );
}

export default AudioWavePlayer;
