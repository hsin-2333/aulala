import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import { useParams } from "react-router-dom";
import dbApi from "../../utils/firebaseService";
import { Story } from "../../types";
import { InteractionToolbar, CommentToolbar } from "../../components/InteractionToolbar";
import { Tabs, Tab, Card, CardBody, ScrollShadow, Chip } from "@nextui-org/react";
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
    <>
      {story && story.img_url && (
        <div className="text-left ">
          {story && (
            <div className="flex justify-between mb-4">
              <h2 className="text-2xl font-semibold mb-2">{story.title}</h2>
              {user && <InteractionToolbar userName={user.userName} storyId={story?.id} />}
            </div>
          )}

          <div className="flex ">
            {story && (
              <div className="flex-1">
                {/* <h2 className="text-2xl text-center font-semibold mb-2">{story.title}</h2> */}
                <div className="relative p-4 my-12 m-auto flex justify-center">
                  <img
                    className="object-cover w-60 h-60 rounded-full border-8 border-black border-opacity-20 z-10"
                    src={story.img_url[0]}
                    alt={story.title}
                  />

                  <div className="absolute inset-0 flex justify-center items-center ">
                    <div className="w-72 h-72 rounded-full border-3 bg-black border-white border-opacity-30 bg-opacity-10 absolute z-0"></div>
                    <div className="w-80 h-80 rounded-full border-3 bg-black border-white border-opacity-10 bg-opacity-15 absolute z-0"></div>
                    <div className="w-[21rem] h-[21rem] rounded-full border-5 bg-black border-black border-opacity-20 bg-opacity-45 absolute z-0"></div>
                  </div>
                </div>
              </div>
            )}
            <div className="flex-1 px-6">
              <Tabs aria-label="Story tabs" variant="underlined">
                <Tab key="script" title="Script">
                  <ScrollShadow hideScrollBar size={100} className="h-[400px]">
                    <Card shadow="none" className="max-h-[700px]  ">
                      <CardBody className="custom-scrollbar scroll-padding">
                        <SubtitlesComponent />
                      </CardBody>
                    </Card>
                  </ScrollShadow>
                </Tab>
                <Tab key="summary" title="About">
                  <Card shadow="none" className="max-h-[400px] bg-white ">
                    <CardBody>
                      <p className="text-gray-700 mb-4 before:content-none">{story.summary}</p>
                      <div className="gap-2 flex">
                        {tags.map((tag) => (
                          <Chip key={tag} color="primary" size="md" radius="full" variant="flat">
                            {tag}
                          </Chip>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                </Tab>
                <Tab key="comments" title="Comments">
                  <Card shadow="none" className="max-h-[400px] bg-white ">
                    <CardBody>{user && <CommentToolbar userName={user.userName} storyId={story?.id} />}</CardBody>
                  </Card>
                </Tab>
              </Tabs>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default StoryContent;
