import { useContext, useEffect, useRef, useMemo } from "react";
import { RecentPlayContext } from "../../context/RecentPlayContext";

const SubtitlesComponent = () => {
  const context = useContext(RecentPlayContext);
  const subtitlesRef = useRef<HTMLDivElement>(null);

  const segments = useMemo(() => context?.storyInfo?.segments || [], [context?.storyInfo?.segments]);
  const currentTime = context?.currentTime || 0;

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

  if (!context) {
    return null; // or handle the undefined context case appropriately
  }

  return (
    <div ref={subtitlesRef}>
      {segments.map((segment) => (
        <div
          key={segment.start}
          id={`subtitle-${segment.start}`}
          style={{
            padding: "5px",
            backgroundColor: currentTime >= segment.start && currentTime <= segment.end ? "yellow" : "transparent",
          }}
        >
          {segment.text}
        </div>
      ))}
    </div>
  );
};

export default SubtitlesComponent;
