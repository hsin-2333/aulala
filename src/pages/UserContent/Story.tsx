import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import { useParams } from "react-router-dom";
import dbApi from "../../utils/firebaseService";
import { Story } from "../../types";
import { InteractionToolbar, CommentToolbar } from "../../components/InteractionToolbar";
import { Tabs, Tab, Card, CardBody, ScrollShadow, Chip, Link } from "@nextui-org/react";
import SubtitlesComponent from "../UserContent/Segments";
import { RecentPlayContext } from "../../context/RecentPlayContext";
import { IoIosArrowBack } from "react-icons/io";

function StoryContent() {
  const context = useContext(RecentPlayContext);
  if (context === undefined) {
    throw new Error("SomeComponent must be used within a RecentPlayProvider");
  }
  const { isPlaying } = context;

  const { user } = useContext(AuthContext);
  const { storyId } = useParams();
  const { data: storyData, error } = useQuery({
    queryKey: ["story", storyId],
    queryFn: async () => {
      const story = await dbApi.queryCollection("stories", { id: storyId }, 1);
      return story as Story[];
    },
    enabled: !!storyId,
  });

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const story = storyData ? storyData[0] : null;
  const tags = story?.tags ? story.tags : [];
  return (
    <>
      <div className="absolute left-2 top-3 gap-2 self-center flex justify-center sm:hidden">
        <Link href="/" color="foreground">
          <IoIosArrowBack size={20} className="self-center" />
        </Link>
        <span className="text-medium text-default-800 font-bold"> Upload Story</span>
      </div>
      {story && story.img_url && (
        <div className="text-left mt-16 sm:mt-0 ">
          {story && (
            <div className="flex justify-between mb-4 px-4">
              <h2 className="text-2xl font-semibold mb-2">{story.title}</h2>
              {user && <InteractionToolbar userName={user.userName} storyId={story?.id} />}
            </div>
          )}

          <div className="flex flex-col sm:flex-row">
            {story && (
              <div className="flex-1 px-4 ">
                {/* <h2 className="text-2xl text-center font-semibold mb-2">{story.title}</h2> */}
                <div className="relative p-4 my-16 m-auto flex justify-center">
                  <img
                    className={`object-cover w-32 h-32 sm:w-56 sm:h-56 rounded-full border-8 border-[black] border-opacity-70 z-10 ${
                      isPlaying ? "animate-[spin_8s_linear_infinite]" : ""
                    }`}
                    src={story.img_url[0]}
                    alt={story.title}
                  />

                  <div className="absolute inset-0 flex justify-center items-center ">
                    <div className="w-[16rem] h-[16rem] sm:w-[22rem] sm:h-[22rem] rounded-full border-3 bg-[#27272A] border-[#575757] border-opacity-80  absolute z-3 "></div>
                    <div className="w-[14rem] h-[14rem] sm:w-[20rem] sm:h-[20rem] rounded-full border-2 bg-[#27272A] border-[#575757] border-opacity-30  absolute z-3 "></div>
                    <div className="w-[12rem] h-[12rem] sm:w-[18rem] sm:h-[18rem] rounded-full border-2 bg-[#27272A] border-[#575757] border-opacity-30  absolute z-4 "></div>
                    <div className="w-[10rem] h-[10rem] sm:w-[16rem] sm:h-[16rem] rounded-full border-2 bg-[#27272A] border-[#575757] border-opacity-30 absolute z-5 "></div>
                  </div>
                </div>
              </div>
            )}
            <div className="flex-1 px-4 sm:px-6">
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
