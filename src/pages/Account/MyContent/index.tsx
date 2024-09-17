import { PlaylistCard, ScriptCard } from "../../../components/Card";
import dbApi from "../../../utils/firebaseService";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Timestamp } from "firebase/firestore";

interface Story {
  id: string;
  title: string;
  author: string;
  img_url?: string[];
  image?: string;
  summary?: string;
  tags?: string[];
  created_at?: Timestamp;
}

const MyContent = () => {
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

  const renderContent = () => {
    if (selectedTab === "story") {
      return storyList?.map((story) => (
        <PlaylistCard key={story.id} image={story.img_url?.[0]} title={story.title} author={story.author} />
      ));
    } else if (selectedTab === "script") {
      return scriptList?.map((script) => (
        <ScriptCard
          key={script.id}
          image={script.img_url?.[0]}
          title={script.title}
          author={script.author}
          summary={script.summary}
          tags={script.tags}
          created_at={script.created_at}
        />
      ));
    }
  };

  useEffect(() => {
    setSelectedTab(initialTab);
  }, [initialTab]);

  return (
    <div>
      <h2>My Stories</h2>
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setSelectedTab("story")}
            className={`whitespace-nowrap border-b-2 font-medium text-sm ${
              selectedTab === "story"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Story
          </button>
          <button
            onClick={() => setSelectedTab("script")}
            className={`whitespace-nowrap  border-b-2 font-medium text-sm ${
              selectedTab === "script"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Script
          </button>
        </nav>
      </div>
      <div className="flex flex-wrap justify-center">
        {isStoryLoading || isScriptLoading ? <p>Loading...</p> : renderContent()}
      </div>
    </div>
  );
};

export default MyContent;
