// import AudioWavePlayer from "../../components/AudioWavePlayer";
import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import { useParams } from "react-router-dom";
import dbApi from "../../utils/firebaseService";
import { Story } from "../../types";
import { InteractionToolbar, CommentToolbar } from "../../components/InteractionToolbar";
import { Button } from "@nextui-org/react";
import { Tabs, Tab, Card, CardBody, ScrollShadow } from "@nextui-org/react";
import SubtitlesComponent from "../UserContent/Segments";

function StoryContent() {
  const { user } = useContext(AuthContext);
  const { storyId } = useParams();
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
  const tags = story?.tags ? story.tags : [];
  return (
    <div className="text-left">
      {story && (
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl font-semibold mb-2">{story.title}</h2>
          {user && <InteractionToolbar userName={user.userName} storyId={story?.id} />}
        </div>
      )}

      <div className="flex ">
        {story && (
          <div className="flex-1">
            <p className="text-gray-700 mb-4 before:content-none">{story.summary}</p>
            {story.img_url && story.img_url.length > 0 && (
              <div className="relative mb-8">
                <img className="w-full h-auto rounded-lg mb-4" src={story.img_url[0]} alt={story.title} />
                <div className="absolute inset-0 bg-black bg-opacity-50  rounded-lg"></div>
              </div>
            )}
            {tags.map((tag) => (
              <Button key={tag} color="primary" size="sm" className="mr-2" radius="full" variant="flat">
                {tag}
              </Button>
            ))}
          </div>
        )}
        <div className="flex-1 px-6">
          <Tabs aria-label="Story tabs" variant="underlined">
            <Tab key="script" title="Script">
              <ScrollShadow hideScrollBar size={100} className="h-[400px]">
                <Card shadow="none" className="max-h-[700px]">
                  <CardBody>
                    {/* {story && story.audio_url && story.id && story.segments && (
                    <AudioWavePlayer
                      audio_url={story.audio_url}
                      storyId={story.id}
                      segments={story.segments}
                      showSubtitles={true}
                    />
                  )} */}
                    <SubtitlesComponent />
                  </CardBody>
                </Card>
              </ScrollShadow>
            </Tab>
            <Tab key="Comments" title="Comments">
              <Card shadow="none" className="max-h-[400px] bg-white">
                <CardBody>{user && <CommentToolbar userName={user.userName} storyId={story?.id} />}</CardBody>
              </Card>
            </Tab>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default StoryContent;
