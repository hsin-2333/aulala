import { ScriptCard, AudioCard } from "../../../components/Card";
import dbApi from "../../../utils/firebaseService";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Timestamp } from "firebase/firestore";
import { Story } from "../../../types";
import { Select, SelectItem } from "@nextui-org/react";

const MyContent = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<string>("story");
  const { userName } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") || "story";
  const { data: storyList, isLoading: isStoryLoading } = useQuery<Story[]>({
    queryKey: ["stories", userName],
    queryFn: async () => {
      const stories = await dbApi.queryCollection("stories", { author: userName || "" }, 20);
      return stories as Story[];
    },
    enabled: selectedTab === "story",
  });

  const { data: scriptList, isLoading: isScriptLoading } = useQuery<Story[]>({
    queryKey: ["scripts", userName],
    queryFn: async () => {
      const scripts = await dbApi.queryCollection("scripts", { author: userName || "" }, 20);
      return scripts as Story[];
    },
    enabled: selectedTab === "script",
  });

  const convertTimestampToDate = (timestamp: { seconds: number; nanoseconds: number }) => {
    return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
  };

  const renderContent = () => {
    if (selectedTab === "story") {
      return storyList?.map((story) => (
        <div key={story.id} className="border border-default-300 rounded-xl w-full">
          <AudioCard
            key={story.id}
            image={story.img_url?.[0] || "default_image_url"}
            title={story.title}
            author={story.author}
            tags={story.tags || []}
            onClick={() => {
              navigate(`/story/${story.id}`);
            }}
            intro={story.intro || ""}
            duration={story.duration || 0}
            date={story.created_at ? convertTimestampToDate(story.created_at as Timestamp).toLocaleDateString() : ""}
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
          date={script.created_at ? convertTimestampToDate(script.created_at as Timestamp).toLocaleDateString() : ""}
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
      <div className="border-b border-gray-200 mb-4 text-left py-4 min-w-52 sm:min-w-72">
        <Select
          label="Sort by"
          labelPlacement="outside-left"
          placeholder="Select a tab"
          className="max-w-xs"
          classNames={{
            label: "text-nowrap h-10 flex justify-center items-center mr-2",
          }}
          variant="bordered"
          onSelectionChange={(keys) => {
            const selectedKey = Array.from(keys).join(""); // 提取選擇的值
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
        {isStoryLoading || isScriptLoading ? <p>Loading...</p> : renderContent()}
      </div>
    </div>
  );
};

export default MyContent;
