import { useContext, useEffect, useRef, useMemo, useState } from "react";
import { RecentPlayContext } from "../../context/RecentPlayContext";

const SubtitlesComponent = () => {
  const subtitlesRef = useRef<HTMLDivElement>(null);
  const context = useContext(RecentPlayContext);
  if (context === undefined) {
    throw new Error("SomeComponent must be used within a RecentPlayProvider");
  }
  const { currentTimeRef } = context;
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(currentTimeRef.current);
    }, 800);

    return () => clearInterval(interval);
  }, [currentTimeRef]);

  const segments = useMemo(() => context?.storyInfo?.segments || [], [context?.storyInfo?.segments]);

  useEffect(() => {
    if (subtitlesRef.current) {
      const activeIndex = segments.findIndex((segment) => currentTime >= segment.start && currentTime <= segment.end);
      if (activeIndex !== -1 && subtitlesRef.current) {
        const totalSegments = segments.length;
        const element = subtitlesRef.current.children[activeIndex] as HTMLDivElement;

        // 滾動到字幕
        if (activeIndex < totalSegments - 4) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
          subtitlesRef.current.scrollTo({
            top: subtitlesRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
      }
    }
  }, [currentTime, segments]);

  return (
    <div className="relative overflow-y-auto h-80" ref={subtitlesRef}>
      {segments.map((segment, index) => (
        <div
          key={index}
          className={`py-2 ${
            currentTime >= segment.start && currentTime <= segment.end ? "text-slate-500  font-bold" : "text-gray-300"
          }`}
        >
          {segment.text}
        </div>
      ))}
    </div>
  );
};

export default SubtitlesComponent;
