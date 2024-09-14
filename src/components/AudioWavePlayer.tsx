import WaveSurfer from "wavesurfer.js";
import { useEffect, useRef, useState } from "react";
import mySound from "../assets/The Phantom of the Opera.mp3";
import fakeData from "../assets/fakeStory.json";

function AudioWavePlayer() {
  const audioRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const isPlayingRef = useRef(false);
  const currentTextRef = useRef<string>("");
  const [currentText, setCurrentText] = useState<string>("");
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

      wavesurferRef.current = wavesurfer;

      let lastUpdateTime = 0;
      let animationFrameId: number;

      const updateCurrentTime = () => {
        const currentTime = wavesurfer.getCurrentTime();
        if (currentTime - lastUpdateTime > 0.8) {
          lastUpdateTime = currentTime;

          const currentSegment = fakeData.content.segments.find(
            (segment) =>
              currentTime >= segment.start_time &&
              currentTime <= segment.end_time
          );

          if (
            currentSegment &&
            currentSegment.text !== currentTextRef.current
          ) {
            currentTextRef.current = currentSegment.text;
            setCurrentText(currentSegment.text);
          }
        }
        //使用 requestAnimationFrame 來替代 wavesurfer.on("audioprocess") 事件
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
    const wavesurfer = wavesurferRef.current;
    if (wavesurfer) {
      if (isPlayingRef.current) {
        wavesurfer.pause();
        console.log("暫停");
      } else {
        wavesurfer.play();
        console.log("播放");
      }
      isPlayingRef.current = !isPlayingRef.current;
    }
  };

  return (
    <div>
      <div id="waveform" ref={audioRef}></div>
      <button onClick={handlePlayPause}>
        {isPlayingRef.current ? "Pause" : "Play"}
      </button>
      <div className="subtitle">
        <p>{currentText}</p> {/* 顯示字幕 */}
      </div>
    </div>
  );
}

export default AudioWavePlayer;
