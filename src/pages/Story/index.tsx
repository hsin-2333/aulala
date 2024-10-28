import {
  Card,
  CardBody,
  Chip,
  Link,
  ScrollShadow,
  Tab,
  Tabs,
} from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useParams } from "react-router-dom";
import {
  CommentToolbar,
  InteractionToolbar,
} from "../../components/Common/InteractionToolbar";
import { AuthContext } from "../../context/AuthContext";
import { RecentPlayContext } from "../../context/RecentPlayContext";
import { Story, User } from "../../types";
import dbApi from "../../utils/firebaseService";
import SubtitlesComponent from "./Segments";

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
  return (
    <>
      <MobileBackLink />
      {story && (
        <div className="mt-16 h-full text-left sm:mt-0">
          <div className="mb-4 flex justify-between px-4 lg:px-0">
            <h2 className="mb-2 text-2xl font-semibold">{story.title}</h2>
            {user && user.userName && (
              <InteractionToolbar
                userName={user.userName}
                storyId={story?.id}
              />
            )}
          </div>

          <div className="flex flex-col sm:flex-row">
            <VinylImage story={story} isPlaying={isPlaying} />
            <StoryTabs story={story} user={user} />
          </div>
        </div>
      )}
    </>
  );
}

export default StoryContent;

type VinylImageProps = {
  story: Story;
  isPlaying: boolean;
};

const VinylImage = ({ story, isPlaying }: VinylImageProps) => {
  return (
    <div className="flex-1 px-4 sm:px-6">
      <div className="relative m-auto my-16 flex justify-center p-4">
        <img
          className={`z-10 h-32 w-32 rounded-full border-8 border-[black] border-opacity-70 object-cover sm:h-56 sm:w-56 ${
            isPlaying ? "animate-[spin_8s_linear_infinite]" : ""
          }`}
          src={story.img_url[0]}
          alt={story.title}
        />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="z-3 absolute h-[16rem] w-[16rem] rounded-full border-3 border-[#575757] border-opacity-80 bg-[#27272A] sm:h-[22rem] sm:w-[22rem]"></div>
          <div className="z-3 absolute h-[14rem] w-[14rem] rounded-full border-2 border-[#575757] border-opacity-30 bg-[#27272A] sm:h-[20rem] sm:w-[20rem]"></div>
          <div className="z-4 absolute h-[12rem] w-[12rem] rounded-full border-2 border-[#575757] border-opacity-30 bg-[#27272A] sm:h-[18rem] sm:w-[18rem]"></div>
          <div className="z-5 absolute h-[10rem] w-[10rem] rounded-full border-2 border-[#575757] border-opacity-30 bg-[#27272A] sm:h-[16rem] sm:w-[16rem]"></div>
        </div>
      </div>
    </div>
  );
};

type StoryTabsProps = {
  story: Story;
  user: User | null;
};

const StoryTabs = ({ story, user }: StoryTabsProps) => {
  const tags = story.tags || [];

  return (
    <div className="flex-1 px-4 sm:px-6">
      <Tabs aria-label="Story tabs" variant="underlined">
        <Tab key="script" title="Script">
          <ScrollShadow hideScrollBar size={100} className="h-[400px]">
            <Card shadow="none" className="max-h-[700px]">
              <CardBody className="p-2">
                <SubtitlesComponent />
              </CardBody>
            </Card>
          </ScrollShadow>
        </Tab>
        <Tab key="summary" title="About">
          <Card shadow="none" className="max-h-[400px] bg-white">
            <CardBody>
              <p className="mb-4 text-gray-700">{story.summary}</p>
              <div className="flex gap-2">
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    color="primary"
                    size="md"
                    radius="full"
                    variant="flat"
                  >
                    {tag}
                  </Chip>
                ))}
              </div>
            </CardBody>
          </Card>
        </Tab>
        <Tab key="comments" title="Comments">
          <Card shadow="none" className="max-h-[400px] bg-white">
            <CardBody>
              {user && user.userName ? (
                <CommentToolbar
                  avatar={user.avatar}
                  userName={user.userName}
                  storyId={story.id}
                />
              ) : (
                <p className="w-full text-medium">Login to comment!</p>
              )}
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};

const MobileBackLink = () => (
  <div className="absolute left-2 top-3 flex justify-center gap-2 self-center sm:hidden">
    <Link href="/" color="foreground">
      <IoIosArrowBack size={20} className="self-center" />
    </Link>
    <span className="text-medium font-bold text-default-800">Upload Story</span>
  </div>
);
