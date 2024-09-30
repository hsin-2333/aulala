import dbApi from "../../utils/firebaseService";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Story } from "../../types";
import { InteractionToolbar, CommentToolbar } from "../../components/InteractionToolbar";
import { Card, Chip, CardBody, Image, Tabs, Tab } from "@nextui-org/react";
import { MdLanguage } from "react-icons/md";
import { FaHashtag } from "react-icons/fa6";

function ScriptContent() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { scriptId } = useParams();
  const tabsRef = useRef<HTMLDivElement>(null);

  const {
    data: scriptData,
    error: scriptError,
    isLoading: scriptLoading,
  } = useQuery({
    queryKey: ["script", scriptId],
    queryFn: async () => {
      const script = await dbApi.queryCollection("scripts", { id: scriptId }, 1);
      return script as Story[];
    },
    enabled: !!scriptId,
  });

  const {
    data: storiesData,
    error: storiesError,
    isLoading: storiesLoading,
  } = useQuery({
    queryKey: ["stories", scriptId],
    queryFn: async () => {
      const stories = await dbApi.queryCollection("stories", { script_id: scriptId }, 10);
      return stories as Story[];
    },
    enabled: !!scriptId,
  });

  if (scriptLoading || storiesLoading) {
    return <div>Loading...</div>;
  }

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
      {script && script.img_url && (
        <div className="text-left">
          <Card
            isBlurred
            shadow="md"
            radius="lg"
            className="p-2 bg-white bg-opacity-85 border-6 border-white border-opacity-50"
          >
            <CardBody className="flex flex-row gap-8 m-auto">
              <Image className="w-32 h-auto rounded-lg" src={script.img_url[0]} alt={script.title} />
              <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-semibold">{script.title}</h2>
                <p className="text-gray-700 mb-4 before:content-none">{script.summary}</p>
              </div>

              <div className="text-sm flex flex-col gap-4">
                <div className="gap-1 flex flex-col">
                  <div>Tag</div>
                  <div>
                    {tags.map((tag) => (
                      <Chip
                        startContent={<FaHashtag size={14} />}
                        key={tag}
                        color="default"
                        size="md"
                        className="mb-1"
                        radius="none"
                        variant="flat"
                      >
                        {tag}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div className="gap-1 flex flex-col">
                  <div>Language</div>
                  <div>
                    <Chip
                      className="mr-1"
                      startContent={<MdLanguage size={14} />}
                      color="default"
                      size="md"
                      radius="none"
                      variant="flat"
                    >
                      <p className="text-gray-600 hover:text-gray-800">{script?.language}</p>
                    </Chip>
                  </div>
                </div>
              </div>
              <div className="gap-1 flex flex-col w-fit items-end">
                {user && <InteractionToolbar userName={user.userName} scriptId={script?.id} />}
              </div>
            </CardBody>
          </Card>

          <p className="text-gray-700 my-8 before:content-none">{script.content}</p>

          <div ref={tabsRef}>
            <Tabs
              fullWidth={true}
              aria-label="Options"
              color="primary"
              variant="underlined"
              classNames={{
                tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                cursor: "w-full bg-primary-200",
                tab: "max-w-fit px-0 h-12",
                tabContent: "group-data-[selected=true]:text-primary-600",
              }}
              className="sticky top-16 bg-white z-10"
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
                      35
                    </Chip>
                  </div>
                }
              >
                {user && <CommentToolbar userName={user.userName} scriptId={script?.id} />}
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
                <section className="flex items-start justify-center flex-col min-h-[300px]">
                  <h4 className="text-2xl font-semibold mb-2">Voice Actors</h4>
                  {relatedStories &&
                    relatedStories.map((story) => (
                      <div key={story.id} className="flex w-full h-fit justify-between">
                        <div>
                          <img src="" />
                          <h4>{story.voice_actor}</h4>
                        </div>
                        <button
                          className="text-gray-600 hover:text-gray-800"
                          onClick={() => {
                            navigate(`/story/${story.id}`);
                          }}
                        >
                          Link
                        </button>
                      </div>
                    ))}
                  <div className="w-full flex flex-grow"></div>
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
