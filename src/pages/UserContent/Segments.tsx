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
    if (subtitlesRef.current && segments) {
      const currentSubtitle = segments.find((segment) => currentTime >= segment.start && currentTime <= segment.end);
      if (currentSubtitle) {
        const subtitleElement = document.getElementById(`subtitle-${currentSubtitle.start}`);
        if (subtitleElement) {
          subtitleElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
  }, [currentTime, segments]);
  return (
    <div ref={subtitlesRef} className="overflow-hidden " style={{ height: "calc(-400px + 100vh)" }}>
      <div className="overflow-y-auto max-h-full">
        {segments.map((segment) => (
          <div
            key={segment.start}
            id={`subtitle-${segment.start}`}
            className={`p-2 ${
              currentTime >= segment.start && currentTime <= segment.end ? "bg-blue-100" : "bg-transparent"
            }`}
          >
            {segment.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubtitlesComponent;
