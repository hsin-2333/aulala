import {
  Button,
  Card,
  CardBody,
  Chip,
  Divider,
  Image,
  Link,
  Tab,
  Tabs,
  Tooltip,
  User,
} from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";
import { useContext, useRef, useState } from "react";
import { FaHashtag } from "react-icons/fa6";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { MdLanguage } from "react-icons/md";
import { SlCloudUpload } from "react-icons/sl";
import { useNavigate, useParams } from "react-router-dom";
import {
  CommentToolbar,
  InteractionToolbar,
} from "../../components/Common/InteractionToolbar";
import { AuthContext } from "../../context/AuthContext";
import { Story, User as VoiceActor } from "../../types";
import dbApi from "../../utils/firebaseService";

function ScriptContent() {
  const { user } = useContext(AuthContext);
  const { scriptId } = useParams();
  const tabsRef = useRef<HTMLDivElement>(null);
  const [commentCount, setCommentCount] = useState(0);

  const { data: scriptData, error: scriptError } = useQuery({
    queryKey: ["script", scriptId],
    queryFn: async () => {
      const script = await dbApi.queryCollection(
        "scripts",
        { id: scriptId },
        1,
      );
      return script as Story[];
    },
    enabled: !!scriptId,
  });

  const { data: storiesData, error: storiesError } = useQuery({
    queryKey: ["stories", scriptId],
    queryFn: async () => {
      const stories = await dbApi.queryCollection(
        "stories",
        { script_id: scriptId },
        10,
      );
      return stories as Story[];
    },
    enabled: !!scriptId,
  });

  const { data: VAData } = useQuery({
    queryKey: ["users", storiesData?.map((story) => story.voice_actor)],
    queryFn: async () => {
      if (!storiesData) return [];
      const voiceActors = storiesData.map((story) => story.voice_actor).flat();
      const users = await Promise.all(
        voiceActors.map(async (voiceActor) => {
          const user = await dbApi.queryCollection("users", {
            userName: voiceActor,
          });
          return user;
        }),
      );
      return users as VoiceActor[];
    },
    enabled: !!storiesData,
  });
  const flattenedVAData = VAData?.flat() || [];

  const userLookup =
    flattenedVAData.reduce(
      (acc, user) => {
        if (user && user.userName) {
          acc[user.userName] = user;
        }
        return acc;
      },
      {} as Record<string, VoiceActor>,
    ) || {};

  if (scriptError) {
    return <div>Error: {scriptError.message}</div>;
  }

  if (storiesError) {
    return <div>Error: {storiesError.message}</div>;
  }

  const script = scriptData ? scriptData[0] : null;
  const relatedStories = storiesData ? storiesData : null;
  const tags = script?.tags ? script.tags : [];

  const handleTabClick = () => {
    if (tabsRef.current) {
      tabsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <div className="absolute left-2 top-3 sm:hidden">
        <Link href="/" color="foreground">
          <IoIosArrowBack />
        </Link>
      </div>
      {script && script.img_url && (
        <div className="text-left">
          {/* 手機版 書名在上面 */}

          <div className="mb-2 flex gap-2 sm:hidden">
            <Image
              className="flex h-auto w-32 rounded-lg"
              src={script.img_url[0]}
              alt={script.title}
            />
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold">{script.title}</h2>
              <p className="whitespace-pre-wrap text-sm text-gray-700 before:content-none">
                {script.summary}
              </p>
            </div>
          </div>
          {/* 電腦版 書名在卡片裡*/}
          <Card
            isBlurred
            shadow="md"
            radius="lg"
            className="border-6 border-white border-opacity-50 bg-white bg-opacity-85 p-2"
          >
            <CardBody className="m-auto flex flex-row justify-between gap-8">
              <div className="hidden gap-4 sm:flex">
                <Image
                  className="h-auto w-32 rounded-lg"
                  src={script.img_url[0]}
                  alt={script.title}
                />
                <div className="flex flex-col gap-2">
                  <h2 className="text-2xl font-semibold">{script.title}</h2>
                  <p className="mb-4 ml-1 text-medium text-gray-700 before:content-none">
                    {script.summary}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-4 text-sm">
                <div className="flex flex-col gap-1">
                  <div>Tag</div>
                  <div>
                    {tags.map((tag) => (
                      <Chip
                        startContent={<FaHashtag size={12} />}
                        key={tag}
                        color="default"
                        size="md"
                        className="mb-1 pl-2"
                        radius="lg"
                        variant="flat"
                      >
                        {tag}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div>Language</div>
                  <div>
                    <Chip
                      className="mr-1 pl-2"
                      startContent={<MdLanguage size={14} />}
                      color="default"
                      size="md"
                      radius="lg"
                      variant="flat"
                    >
                      <p className="text-gray-600 hover:text-gray-800">
                        {script?.language}
                      </p>
                    </Chip>
                  </div>
                </div>
              </div>
              <div className="flex w-fit flex-col items-end gap-1">
                {user && user.userName && (
                  <InteractionToolbar
                    userName={user.userName}
                    scriptId={script?.id}
                  />
                )}
              </div>
            </CardBody>
          </Card>

          <p className="my-8 whitespace-pre-wrap break-words text-justify text-small text-gray-700 before:content-none sm:text-medium">
            {script.content}
          </p>

          <div ref={tabsRef}>
            <Tabs
              fullWidth={true}
              aria-label="Options"
              color="primary"
              variant="underlined"
              classNames={{
                tabList:
                  "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                cursor: "w-full bg-primary-200",
                tab: "text-small sm:text-medium max-w-fit px-0 h-10 sm:h-12",
                tabContent: "group-data-[selected=true]:text-primary-600",
              }}
              className="sticky top-16 z-10 bg-white"
              onSelectionChange={handleTabClick}
            >
              <Tab
                key="comments"
                title={
                  <div className="flex items-center space-x-2">
                    <span>Comments</span>
                    <Chip
                      size="sm"
                      variant="flat"
                      className="group-data-[selected=true]:bg-primary-100 group-data-[selected=true]:text-primary-600"
                    >
                      {commentCount}
                    </Chip>
                  </div>
                }
              >
                <CommentToolbar
                  userName={user?.userName ?? ""}
                  scriptId={script?.id}
                  setCommentCount={setCommentCount}
                />
              </Tab>
              <Tab
                key="voiceActors"
                title={
                  <div className="flex items-center space-x-2">
                    <span>Voice Actors</span>
                    <Chip
                      size="sm"
                      variant="flat"
                      className="group-data-[selected=true]:bg-primary-100 group-data-[selected=true]:text-primary-600"
                    >
                      {relatedStories ? relatedStories.length : 0}
                    </Chip>
                  </div>
                }
              >
                <section className="flex min-h-[300px] flex-col items-start justify-center">
                  <AudioUploader />

                  <VoiceActorsList
                    relatedStories={relatedStories || []}
                    userLookup={userLookup}
                  />
                  <div className="flex w-full flex-grow"></div>
                </section>
              </Tab>
            </Tabs>
          </div>
        </div>
      )}
    </>
  );
}

export default ScriptContent;

type VoiceActorsListProps = {
  relatedStories: Story[];
  userLookup: Record<string, VoiceActor>;
};

const VoiceActorsList = ({
  relatedStories,
  userLookup,
}: VoiceActorsListProps) => {
  return (
    <>
      {relatedStories.map((story) => (
        <Link
          href={`/story/${story.id}`}
          className="flex w-full flex-col gap-2 px-2 pt-2 hover:bg-gray-100"
          color="foreground"
          key={story.id}
        >
          <div key={story.id} className="flex h-fit w-full justify-between">
            <div>
              {story.voice_actor?.map((voiceActor) => {
                const VAUser = userLookup[voiceActor];
                return (
                  <User
                    key={voiceActor}
                    name={voiceActor}
                    description="Voice Actor"
                    avatarProps={{
                      src: VAUser?.avatar,
                      size: "md",
                    }}
                  />
                );
              })}
            </div>

            <Button
              variant="light"
              className="text-default-400"
              href={`/story/${story.id}`}
              startContent={<IoIosArrowForward size={20} />}
            />
          </div>
          <Divider className="bg-slate-200" />
        </Link>
      ))}
    </>
  );
};

const AudioUploader = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const AudioInputRef = useRef<HTMLInputElement>(null);

  const handleAudioUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const audioUrl = URL.createObjectURL(selectedFile);

      navigate("/upload/story", {
        state: {
          script_audioName: selectedFile.name,
          script_audioUrl: audioUrl,
        },
      });
    }
  };

  return (
    <>
      {user ? (
        <div className="mb-4 mt-2 hidden w-full justify-end gap-4 sm:flex">
          <input
            type="file"
            accept="audio/*"
            onChange={handleAudioUpload}
            ref={AudioInputRef}
            className="hidden"
          />
          <Tooltip color="default" content="create your unique story">
            <Button
              className="items-center border-1 border-dashed text-primary"
              variant="bordered"
              type="button"
              startContent={<SlCloudUpload size={18} />}
              onClick={() => {
                if (AudioInputRef.current) {
                  AudioInputRef.current.click();
                }
              }}
              radius="sm"
            >
              Upload
            </Button>
          </Tooltip>
        </div>
      ) : (
        <div className="my-2 h-12">
          <Button
            as={Link}
            href="/login"
            size="md"
            color="primary"
            radius="full"
            variant="ghost"
            startContent={<SlCloudUpload size={18} />}
          >
            Upload your unique story
          </Button>
        </div>
      )}
    </>
  );
};
