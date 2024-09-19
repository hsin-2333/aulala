import AudioWavePlayer from "../../components/AudioWavePlayer";
import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import { useParams } from "react-router-dom";
import dbApi from "../../utils/firebaseService";
import { Story } from "../../types";
import { InteractionToolbar, CommentToolbar } from "../../components/InteractionToolbar";

function StoryContent() {
  const { user } = useContext(AuthContext);
  const { storyId } = useParams();
  const {
    data: storyData,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["story", storyId],
    // queryFn: () => dbApi.queryCollection("stories", { id: storyId }, 1),
    queryFn: async () => {
      const story = await dbApi.queryCollection("stories", { id: storyId }, 1);
      return story as Story[];
    },
    enabled: !!storyId,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const story = storyData ? storyData[0] : null;
  console.log(story);

  return (
    <div className="text-left">
      <h1 className="text-3xl font-bold mb-4 text-black">Story Page</h1>
      {story && (
        <div>
          <h2 className="text-2xl font-semibold mb-2">{story.title}</h2>
          <p className="text-gray-700 mb-4 before:content-none">{story.summary}</p>
          {/* <img className="w-32 h-auto rounded-lg mb-4" src={story.img_url[0]} alt={story.title} /> */}
          {story.img_url && story.img_url.length > 0 && (
            <img className="w-32 h-auto rounded-lg mb-4" src={story.img_url[0]} alt={story.title} />
          )}
        </div>
      )}
      {story && story.audio_url && <AudioWavePlayer audio_url={story.audio_url} />}
      {user && <InteractionToolbar userId={user.uid} storyId={story?.id} />}
      {user && <CommentToolbar userId={user.uid} storyId={story?.id} />}
    </div>
  );
}

export default StoryContent;
