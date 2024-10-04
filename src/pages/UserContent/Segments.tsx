import { useContext, useEffect, useRef, useMemo, useState } from "react";
import { RecentPlayContext } from "../../context/RecentPlayContext";

const SubtitlesComponent = () => {
  // const subtitlesRef = useRef<HTMLDivElement>(null);
  const context = useContext(RecentPlayContext);
  if (context === undefined) {
    throw new Error("SomeComponent must be used within a RecentPlayProvider");
  }
  const { currentTimeRef } = context;
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(currentTimeRef.current);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTimeRef]);

  return <div>Current Time: {currentTime}</div>;

  // const segments = useMemo(() => context?.storyInfo?.segments || [], [context?.storyInfo?.segments]);
  // const currentTime = context?.currentTimeRef.current || 0;
  // console.log("SubtitlesComponent", segments, currentTime);

  // useEffect(() => {
  //   if (subtitlesRef.current && segments) {
  //     console.log("進入useEffect");
  //     const currentSubtitle = segments.find((segment) => currentTime >= segment.start && currentTime <= segment.end);
  //     if (currentSubtitle) {
  //       const subtitleElement = document.getElementById(`subtitle-${currentSubtitle.start}`);
  //       if (subtitleElement) {
  //         subtitleElement.scrollIntoView({ behavior: "smooth", block: "center" });
  //       }
  //     }
  //   }
  // }, [currentTime, segments]);

  // if (!context) {
  //   return null; // or handle the undefined context case appropriately
  // }

  // return (
  //   <div ref={subtitlesRef}>
  //     {segments.map((segment) => (
  //       <div
  //         key={segment.start}
  //         id={`subtitle-${segment.start}`}
  //         style={{
  //           padding: "5px",

  //           backgroundColor: currentTime >= segment.start && currentTime <= segment.end ? "#E6F1FE" : "transparent",
  //         }}
  //       >
  //         {segment.text}
  //       </div>
  //     ))}
  //   </div>
  // );
};

export default SubtitlesComponent;
