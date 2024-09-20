import WaveSurfer from "wavesurfer.js";
import { useEffect, useRef, useState, useContext } from "react";
// import fakeData from "../assets/fakeStory.json";
// import AudioData from "../assets/poetry.json";
import { debounce } from "lodash";
import dbApi from "../utils/firebaseService";
import { AuthContext } from "../context/AuthContext";

interface AudioWavePlayerProps {
  audio_url: string;
  storyId: string;
  segments: { text: string; start: number; end: number }[];
}

function AudioWavePlayer({ audio_url, storyId, segments }: AudioWavePlayerProps) {
  const { user } = useContext(AuthContext);
  const audioRefMain = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const isPlayingRef = useRef(false);
  const currentTextRef = useRef<string>("");
  const [currentText, setCurrentText] = useState<string[]>([]);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState<number>(-1);
  const AudioSegments = segments;
  useEffect(() => {
    if (audioRefMain.current) {
      const wavesurfer = WaveSurfer.create({
        container: audioRefMain.current,
        waveColor: "violet",
        progressColor: "purple",
        url: audio_url,
        barWidth: 8,
        barGap: 12,
        barRadius: 12,
      });

      wavesurferRef.current = wavesurfer;

      let lastUpdateTime = 0;
      let animationFrameId: number;

      const updateSubtitles = (currentTime: number) => {
        // findIndex 沒找到會回傳 -1
        let currentSegmentIndex = AudioSegments.findIndex(
          (segment) => currentTime >= segment.start && currentTime <= segment.end
        );

        // 如果找不到當前時間的字幕段，則找到最近的字幕段
        if (currentSegmentIndex === -1) {
          currentSegmentIndex = AudioSegments.findIndex((_, index) => {
            const nextSegment = AudioSegments[index + 1];
            console.log("nextSegment", nextSegment);
            return nextSegment && currentTime < nextSegment.start;
          });
        }

        if (currentSegmentIndex !== -1) {
          const start = Math.max(0, currentSegmentIndex - 2);
          const end = Math.min(AudioSegments.length, currentSegmentIndex + 3);
          const segmentsToShow = AudioSegments.slice(start, end).map((segment) => segment.text);

          if (segmentsToShow.join() !== currentTextRef.current) {
            console.log("segmentsToShow.join()", segmentsToShow.join());
            currentTextRef.current = segmentsToShow.join();
            setCurrentText(segmentsToShow);
            setCurrentSegmentIndex(currentSegmentIndex - start);
          }
        }
      };

      const debouncedUpdateRecentPlay = debounce((currentTime: number) => {
        if (user) {
          dbApi.updateRecentPlay(user.uid, storyId, currentTime);
        }
        console.log("更新最近播放", currentTime);
      }, 1000);

      const updateCurrentTime = () => {
        const currentTime = wavesurfer.getCurrentTime();
        if (currentTime - lastUpdateTime > 0.8) {
          lastUpdateTime = currentTime;
          updateSubtitles(currentTime);
          debouncedUpdateRecentPlay(currentTime); //wavesurfer.pause() 暫停時， updateCurrentTime 仍會執行，所以會更新最近播放
        }
        animationFrameId = requestAnimationFrame(updateCurrentTime);
      };

      animationFrameId = requestAnimationFrame(updateCurrentTime);

      // Initialize the first segment of text
      const initialSegments = AudioSegments.slice(0, 3).map((segment) => segment.text);
      setCurrentText(initialSegments);
      setCurrentSegmentIndex(0);

      const handleSeek = debounce((currentTime: number) => {
        lastUpdateTime = 0; // 重置 lastUpdateTime
        updateSubtitles(currentTime);
      }, 100); // 100ms 的防抖時間

      wavesurfer.on("seeking", handleSeek);

      return () => {
        cancelAnimationFrame(animationFrameId);
        wavesurfer.destroy();
      };
    }
  }, [audioRefMain, audio_url, storyId, user, AudioSegments]);

  const handlePlayPause = () => {
    const wavesurfer = wavesurferRef.current;
    if (wavesurfer) {
      if (isPlayingRef.current) {
        wavesurfer.pause();
      } else {
        wavesurfer.play();
      }
      isPlayingRef.current = !isPlayingRef.current;
    }
  };

  return (
    <div>
      <div className="subtitle">
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
      <div id="waveform" ref={audioRefMain}></div>
      <button onClick={handlePlayPause}>{isPlayingRef.current ? "Pause" : "Play"}</button>
    </div>
  );
}

export default AudioWavePlayer;
