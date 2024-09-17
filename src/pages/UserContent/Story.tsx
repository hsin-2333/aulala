import AudioWavePlayer from "../../components/AudioWavePlayer";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import dbApi from "../../utils/firebaseService";

function StoryContent() {
  const { storyId } = useParams();
  console.log("路由" + storyId);
  const {
    data: storyData,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["story", storyId],
    queryFn: () => dbApi.getStoryById(storyId as string),
    enabled: !!storyId,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="text-left">
      <h1 className="text-3xl font-bold mb-4 text-black">Story Page</h1>
      {storyData && (
        <div>
          <h2 className="text-2xl font-semibold mb-2">{storyData.title}</h2>
          <p className="text-gray-700 mb-4 before:content-none">{storyData.summary}</p>
          <img className="w-32 h-auto rounded-lg mb-4" src={storyData.img_url[0]} alt={storyData.title} />
        </div>
      )}
      {storyData && storyData.audio_url && <AudioWavePlayer audio_url={storyData.audio_url} />}
    </div>
  );
}

export default StoryContent;
