import AudioWavePlayer from "../../components/AudioWavePlayer";
import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "../../context/AuthContext";
import { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import dbApi from "../../utils/firebaseService";
import { Story } from "../../types";
import { InteractionToolbar, CommentToolbar } from "../../components/InteractionToolbar";

function StoryContent() {
  const { user } = useContext(AuthContext);
  const { storyId } = useParams();
  const [activeTab, setActiveTab] = useState("audio");
  const {
    data: storyData,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["story", storyId],
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

  return (
    <div className="text-left">
      {/* <h1 className="text-3xl font-bold mb-4 text-black">Story Page</h1> */}
      {story && (
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl font-semibold mb-2">{story.title}</h2>
          {user && <InteractionToolbar userName={user.userName} storyId={story?.id} />}
        </div>
      )}
      {/* {story && (
        <div>
          <h2 className="text-2xl font-semibold mb-2">{story.title}</h2>
          {user && <InteractionToolbar userName={user.userName} storyId={story?.id} />}
          <p className="text-gray-700 mb-4 before:content-none">{story.summary}</p>
          {story.img_url && story.img_url.length > 0 && (
            <img className="w-32 h-auto rounded-lg mb-4" src={story.img_url[0]} alt={story.title} />
          )}
        </div>
      )} */}
      <div className="tabs">
        <div className="flex border-b border-gray-200">
          <button
            className={`px-4 py-2 -mb-px font-semibold text-gray-700 border-b-2 ${
              activeTab === "audio" ? "border-blue-500" : "border-transparent"
            }`}
            onClick={() => setActiveTab("audio")}
          >
            Audio
          </button>
          <button
            className={`px-4 py-2 -mb-px font-semibold text-gray-700 border-b-2 ${
              activeTab === "script" ? "border-blue-500" : "border-transparent"
            }`}
            onClick={() => setActiveTab("script")}
          >
            Script
          </button>
        </div>
        <div className="tab-content mt-4 ">
          {activeTab === "audio" && (
            <div className="relative ">
              {story && story.img_url && story.img_url.length > 0 && (
                <div className="relative mb-8">
                  <img className="w-full h-80 object-cover rounded-lg mb-4" src={story.img_url[0]} alt={story.title} />
                  <div className="absolute inset-0 bg-black bg-opacity-50  rounded-lg"></div>
                </div>
              )}
              {story && story.audio_url && story.id && story.segments && (
                <AudioWavePlayer
                  audio_url={story.audio_url}
                  storyId={story.id}
                  segments={story.segments}
                  showSubtitles={false}
                />
              )}
            </div>
          )}
          {activeTab === "script" && (
            <div>
              {story && story.audio_url && story.id && story.segments && (
                <AudioWavePlayer
                  audio_url={story.audio_url}
                  storyId={story.id}
                  segments={story.segments}
                  showSubtitles={true}
                />
              )}
            </div>
          )}
        </div>
      </div>
      {user && <CommentToolbar userName={user.userName} storyId={story?.id} />}
    </div>
  );
}

export default StoryContent;
