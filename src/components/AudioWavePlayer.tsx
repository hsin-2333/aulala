import WaveSurfer from "wavesurfer.js";
import { useEffect, useRef, useState } from "react";
import mySound from "../assets/The Phantom of the Opera.mp3";

function AudioWavePlayer() {
  const audioRef = useRef<HTMLDivElement>(null);
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      console.log("waveformRef.current exists"); // 確認容器存在
      const wavesurfer = WaveSurfer.create({
        container: audioRef.current,
        waveColor: "violet",
        progressColor: "purple",
        url: mySound,

        barWidth: 8,
        barGap: 12,
        barRadius: 12,
      });
      console.log("WaveSurfer instance created");
      setWavesurfer(wavesurfer);
      return () => wavesurfer.destroy();
    }
  }, []);

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
    </div>
  );
}

export default AudioWavePlayer;
