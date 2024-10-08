import { useState, useMemo, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import dbApi from "../../utils/firebaseService";
import { CategoryOptions } from "../../constants/categoryOptions";
import { QueryConditions } from "../../types";
import { ImageCard, ScriptCard } from "../../components/Card";
import SortedMenu from "./SortedMenu";
import { Divider, Button } from "@nextui-org/react";
import { AuthContext } from "../../context/AuthContext";
import { RecentPlayContext } from "../../context/RecentPlayContext";

interface Story {
  id: string;
  title?: string;
  author?: string;
  created_at?: { seconds: number; nanoseconds: number };
  duration?: number;
  summary?: string;
}

interface HomePageProps {
  onCardClick?: () => void;
}

function HomePage({ onCardClick }: HomePageProps) {
  const { user } = useContext(AuthContext);
  const context = useContext(RecentPlayContext);
  if (context === undefined) {
    throw new Error("SomeComponent must be used within a RecentPlayProvider");
  }
  const { fetchRecentPlay } = context;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<string>("由遠到近");

  const navigate = useNavigate();

  const { data: storyList, error: storyError } = useQuery<Story[], Error>({
    queryKey: ["stories", selectedCategory],
    queryFn: async () => {
      const conditions: QueryConditions = {};
      if (selectedCategory) {
        conditions.category = selectedCategory;
      }
      const stories = await dbApi.queryCollection("stories", conditions, 20);
      return stories.map((story) => ({ ...story, id: story.id }));
    },
  });

  const { data: scriptList, error: scriptError } = useQuery<Story[], Error>({
    queryKey: ["scripts", selectedCategory],
    queryFn: async () => {
      const conditions: QueryConditions = {};
      if (selectedCategory) {
        conditions.category = selectedCategory;
      }
      const scripts = await dbApi.queryCollection("scripts", conditions, 20);
      return scripts.map((script) => ({ ...script, id: script.id }));
    },
  });

  const handleSortOrderChange = (order: string) => {
    setSortOrder(order);
  };

  const convertTimestampToDate = (timestamp: { seconds: number; nanoseconds: number }) => {
    return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
  };

  const sortedStoryList = useMemo(() => {
    if (!storyList) return [];
    return [...storyList].sort((a, b) => {
      const dateA = convertTimestampToDate(a.created_at!).getTime();
      const dateB = convertTimestampToDate(b.created_at!).getTime();
      if (sortOrder === "Ascending") {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });
  }, [storyList, sortOrder]);

  const sortedScriptList = useMemo(() => {
    if (!scriptList) return [];
    return [...scriptList].sort((a, b) => {
      const dateA = convertTimestampToDate(a.created_at!).getTime();
      const dateB = convertTimestampToDate(b.created_at!).getTime();
      if (sortOrder === "Ascending") {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });
  }, [scriptList, sortOrder]);

  const latestReleases = useMemo(() => {
    const combinedList = [...(storyList || [])];
    return combinedList
      .sort((a, b) => {
        const dateA = convertTimestampToDate(a.created_at!).getTime();
        const dateB = convertTimestampToDate(b.created_at!).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [storyList]);

  if (storyError || scriptError) {
    return <div>Error fetching data: {storyError?.message || scriptError?.message}</div>;
  }

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

  return (
    <div className="px-4 sm:px-0">
      <div className="flex items-center justify-between text-left">
        <div className="space-y-1 w-full ">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight py-2 sm:py-6">Explore</h2>
          <div className="flex w-full justify-start gap-4 mt-2 overflow-x-auto custom-scrollbar">
            {CategoryOptions.map((category) => {
              const IconComponent = category.icon; // 動態獲取圖標組件
              return (
                <Button
                  key={category.value}
                  radius="full"
                  className={`border border-default-200 flex-shrink-0 h-7 sm:h-8 ${
                    selectedCategory === category.value ? "bg-blue-50" : "bg-white"
                  }`}
                  onClick={() => setSelectedCategory(category.value)}
                  startContent={
                    IconComponent && (
                      <IconComponent
                        color={selectedCategory === category.value ? "hsl(var(--nextui-primary-500))" : ""}
                        fill={selectedCategory === category.value ? "hsl(var(--nextui-primary-200))" : "none"}
                        size={16}
                      />
                    )
                  }
                >
                  <div className="justify-start flex flex-shrink-0 flex-row sm:gap-2">
                    <p
                      className={`text-sm sm:text-medium ${
                        selectedCategory === category.value ? "text-primary-800" : "text-default-900"
                      }`}
                    >
                      {category.label}
                    </p>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
      <Divider className="my-4" />

      <div className="relative">
        <div className="my-4" />
      </div>

      <div className="flex items-center justify-between text-left">
        <div className="sm:space-y-1">
          <h2 className="text-xl sm:text-2xl  font-semibold tracking-tight">New Stories</h2>
          <p className="text-sm text-muted-foreground">Check out the latest releases.</p>
        </div>
      </div>
      <div className="relative">
        <div className="my-4" />
      </div>

      <section className="mb-4 h-auto whitespace-nowrap flex overflow-x-auto space-x-8 custom-scrollbar scroll-padding ">
        {latestReleases.map((release: Story) => {
          const date = release.created_at ? convertTimestampToDate(release.created_at).toLocaleDateString() : "";
          return (
            <ImageCard
              onCardClick={onCardClick}
              onClick={() => handleContentClick(release.id, "story")}
              key={release.id}
              id={release.id}
              //@ts-expect-error(123)
              image={release.img_url?.[0]}
              title={release.title || "Untitled"}
              //@ts-expect-error(123)
              tags={release.tags}
              author={release.author || "Unknown"}
              duration={release.duration}
              date={date}
            />
          );
        })}
      </section>

      <div className="flex items-center  justify-between text-left">
        <div className="space-y-1 w-full">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Stories</h2>
          <div className="flex justify-between ">
            <p className="text-sm text-muted-foreground">Top picks for you. </p>
            <SortedMenu onSortOrderChange={handleSortOrderChange} />
          </div>
        </div>
      </div>
      <div className="relative">
        <div className="my-4" />
      </div>

      <section className="mb-4 h-auto whitespace-nowrap flex overflow-x-auto space-x-8 custom-scrollbar scroll-padding ">
        {sortedStoryList?.map((story: Story) => {
          const date = story.created_at ? convertTimestampToDate(story.created_at).toLocaleDateString() : "";
          return (
            <ImageCard
              onCardClick={onCardClick}
              onClick={() => handleContentClick(story.id, "story")}
              key={story.id}
              id={story.id}
              //@ts-expect-error(123)
              image={story.img_url?.[0]}
              title={story.title || "Untitled"}
              //@ts-expect-error(123)
              tags={story.tags}
              author={story.author || "Unknown"}
              duration={story.duration}
              date={date}
            />
          );
        })}
      </section>
      <br />
      <div className="flex items-center justify-between text-left">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Script</h2>
          <p className="text-sm text-muted-foreground">Top picks for you. Updated daily.</p>
        </div>
      </div>
      <div className="relative">
        <div className="my-4 " />
      </div>
      <section className="h-auto flex flex-wrap gap-2 sm:gap-4 custom-scrollbar scroll-padding">
        {sortedScriptList?.map((script: Story) => (
          <div key={script.id} className="flex flex-grow justify-start sm:w-1/2 lg:w-1/3 xl:w-1/4 ">
            <ScriptCard
              onClick={() => handleContentClick(script.id, "script")}
              key={script.id}
              //@ts-expect-error(123)
              image={script.img_url?.[0]}
              title={script.title || "Untitled"}
              //@ts-expect-error(123)
              tags={script.tags}
              author={script.author || "Unknown"}
              summary={script.summary || ""}
              scriptId={script.id}
              date={script.created_at ? convertTimestampToDate(script.created_at).toLocaleDateString() : ""}
            />
          </div>
        ))}
      </section>
      <div className="relative">
        <div className="my-4 h-20" />
      </div>
    </div>
  );
}

export default HomePage;
