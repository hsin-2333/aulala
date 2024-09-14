import WaveSurfer from "wavesurfer.js";
import { useEffect, useRef, useState } from "react";
import mySound from "../assets/The Phantom of the Opera.mp3";
import fakeData from "../assets/fakeStory.json";

function AudioWavePlayer() {
  const audioRef = useRef<HTMLDivElement>(null);
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentText, setCurrentText] = useState<string>("");
  const [currentTime, setCurrentTime] = useState(0);
  useEffect(() => {
    if (audioRef.current) {
      const wavesurfer = WaveSurfer.create({
        container: audioRef.current,
        waveColor: "violet",
        progressColor: "purple",
        url: mySound,
        barWidth: 8,
        barGap: 12,
        barRadius: 12,
      });

      setWavesurfer(wavesurfer);

      let lastUpdateTime = 0;
      let animationFrameId: number;

      const updateCurrentTime = () => {
        const currentTime = wavesurfer.getCurrentTime();
        if (currentTime - lastUpdateTime > 0.8) {
          setCurrentTime(currentTime);
          lastUpdateTime = currentTime;

          const currentSegment = fakeData.content.segments.find(
            (segment) =>
              currentTime >= segment.start_time &&
              currentTime <= segment.end_time
          );

          if (currentSegment && currentSegment.text !== currentText) {
            setCurrentText(currentSegment.text);
          }
        }
        animationFrameId = requestAnimationFrame(updateCurrentTime);
      };

      animationFrameId = requestAnimationFrame(updateCurrentTime);

      return () => {
        cancelAnimationFrame(animationFrameId);
        wavesurfer.destroy();
      };
    }
  }, [audioRef]);

  const handlePlayPause = () => {
    if (wavesurfer) {
      if (isPlaying) {
        wavesurfer.pause();
        console.log("暫停");
      } else {
        wavesurfer.play();
        console.log("播放");
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div>
      <div id="waveform" ref={audioRef}></div>
      <button onClick={handlePlayPause}>{isPlaying ? "Pause" : "Play"}</button>
      <div className="subtitle">
        <p>{currentText}</p> {/* 顯示字幕 */}
      </div>
    </div>
  );
}

export default AudioWavePlayer;
