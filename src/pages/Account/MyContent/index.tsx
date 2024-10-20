import { Select, SelectItem } from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";
import { Timestamp } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AudioCard, ScriptCard } from "../../../components/Card";
import { AuthContext } from "../../../context/AuthContext";
import { RecentPlayContext } from "../../../context/RecentPlayContext";
import { Story } from "../../../types";
import { convertTimestampToDate } from "../../../utils/convertTimestampToDate";
import dbApi from "../../../utils/firebaseService";

const MyContent = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [selectedTab, setSelectedTab] = useState<string>("story");
  const { userName } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") || "story";
  const context = useContext(RecentPlayContext);
  if (context === undefined) {
    throw new Error("SomeComponent must be used within a RecentPlayProvider");
  }
  const { fetchRecentPlay } = context;

  const { data: storyList, isLoading: isStoryLoading } = useQuery<Story[]>({
    queryKey: ["stories", userName],
    queryFn: async () => {
      const stories = await dbApi.queryCollection(
        "stories",
        { author: userName || "" },
        20,
      );
      return stories as Story[];
    },
    enabled: selectedTab === "story",
  });

  const { data: scriptList, isLoading: isScriptLoading } = useQuery<Story[]>({
    queryKey: ["scripts", userName],
    queryFn: async () => {
      const scripts = await dbApi.queryCollection(
        "scripts",
        { author: userName || "" },
        20,
      );
      return scripts as Story[];
    },
    enabled: selectedTab === "script",
  });

  const handleContentClick = (id: string, type: "script" | "story") => {
    if (type === "script") navigate(`/script/${id}`);
    if (type === "story") {
      if (user && user.uid) {
        dbApi.updateRecentPlay(user.uid, id, 0).then(() => {
          fetchRecentPlay();
        });
      }
      navigate(`/story/${id}`);
    }
  };

  const renderContent = () => {
    if (selectedTab === "story") {
      return storyList?.map((story) => (
        <div
          key={story.id}
          className="w-full rounded-xl border border-default-300"
        >
          <AudioCard
            key={story.id}
            image={story.img_url?.[0] || "default_image_url"}
            title={story.title}
            author={story.author}
            tags={story.tags || []}
            onClick={() => {
              if (story.id) handleContentClick(story.id, "story");
            }}
            intro={story.intro || ""}
            duration={story.duration || 0}
            date={
              story.created_at
                ? convertTimestampToDate(
                    story.created_at as Timestamp,
                  ).toLocaleDateString()
                : ""
            }
          />
        </div>
      ));
    } else if (selectedTab === "script") {
      return scriptList?.map((script) => (
        <ScriptCard
          key={script.id}
          scriptId={script.id}
          image={script.img_url?.[0]}
          language={script.language || ""}
          title={script.title}
          author={script.author}
          summary={script.summary || ""}
          tags={script.tags || []}
          created_at={script.created_at as Timestamp}
          date={
            script.created_at
              ? convertTimestampToDate(
                  script.created_at as Timestamp,
                ).toLocaleDateString()
              : ""
          }
          onClick={() => {
            navigate(`/script/${script.id}`);
          }}
        />
      ));
    }
  };

  useEffect(() => {
    setSelectedTab(initialTab);
  }, [initialTab]);

  return (
    <div className="">
      <div className="relative">
        <div className="my-4" />
      </div>
      <div className="mb-4 min-w-52 border-b border-gray-200 py-4 text-left sm:min-w-72">
        <Select
          label="Browse by"
          labelPlacement="outside-left"
          placeholder="Select a tab"
          className="max-w-xs"
          classNames={{
            label: "text-nowrap h-10 flex justify-center items-center mr-2",
          }}
          variant="bordered"
          onSelectionChange={(keys) => {
            const selectedKey = Array.from(keys).join("");
            setSelectedTab(selectedKey);
          }}
          defaultSelectedKeys={["story"]}
          scrollShadowProps={{
            isEnabled: false,
          }}
        >
          <SelectItem key="story" value="story">
            Story
          </SelectItem>
          <SelectItem key="script" value="script">
            Script
          </SelectItem>
        </Select>
      </div>
      <div className="flex flex-wrap justify-start gap-4">
        {isStoryLoading || isScriptLoading ? (
          <p>Loading...</p>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  );
};

export default MyContent;
