import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
//@ts-expect-error(123)
import lunr from "lunr";
import dbApi from "../../utils/firebaseService";
import { CategoryOptions } from "../../constants/categoryOptions";
import { QueryConditions } from "../../types";
import { AudioCard } from "../../components/Card";
import SortedMenu from "./SortedMenu";
import SearchComponent from "./SearchComponent";
import { Card, CardBody } from "@nextui-org/react";
import { LuFolderHeart } from "react-icons/lu";

interface Story {
  id: string;
  title?: string;
  author?: string;
  created_at?: { seconds: number; nanoseconds: number };
}

interface HomePageProps {
  onCardClick?: () => void;
}

function HomePage({ onCardClick }: HomePageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<lunr.Index.Result[]>([]);
  const [sortOrder, setSortOrder] = useState<string>("由遠到近");

  const navigate = useNavigate();

  const {
    data: storyList,
    error: storyError,
    isLoading: isStoryLoading,
  } = useQuery<Story[], Error>({
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

  const {
    data: scriptList,
    error: scriptError,
    isLoading: isScriptLoading,
  } = useQuery<Story[], Error>({
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

  if (isScriptLoading || isStoryLoading) {
    return <div>Loading...</div>;
  }
  if (storyError || scriptError) {
    return <div>Error fetching data: {storyError?.message || scriptError?.message}</div>;
  }

  const handleContentClick = (id: string, type: "script" | "story") => {
    if (type === "script") navigate(`/script/${id}`);
    if (type === "story") navigate(`/story/${id}`);
  };

  return (
    <>
      <SearchComponent storyList={storyList || []} scriptList={scriptList || []} onSearchResults={setSearchResults} />
      <SortedMenu onSortOrderChange={handleSortOrderChange} />

      <div className="flex items-center justify-between text-left">
        <div className="space-y-1 w-full">
          <h2 className="text-2xl font-semibold tracking-tight">Categories</h2>
          <div className="flex w-2/4 justify-between">
            {CategoryOptions.map((category) => (
              <Card
                shadow="none"
                className={`border border-default-200 w-32 h-20 ${
                  selectedCategory === category.value ? "bg-blue-50" : "bg-white"
                }`}
                key={category.value}
                isPressable
                onPress={() => setSelectedCategory(category.value)}
              >
                <CardBody className="text-small justify-start flex flex-col relative">
                  <p
                    className={`text-medium ${
                      selectedCategory === category.value ? "text-primary-800" : "text-default-900"
                    }`}
                  >
                    {category.label}
                  </p>
                  <LuFolderHeart
                    className="h-6 w-6 absolute bottom-3 right-3"
                    color={
                      selectedCategory === category.value
                        ? "hsl(var(--nextui-primary-500))"
                        : "hsl(var(--nextui-primary-200))"
                    }
                    fill={selectedCategory === category.value ? "hsl(var(--nextui-primary-200))" : "none"}
                  />
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="my-4" />
      </div>

      <div className="flex items-center justify-between text-left">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Stories</h2>
          <p className="text-sm text-muted-foreground">Top picks for you. Updated daily.</p>
        </div>
      </div>
      <div className="relative">
        <div className="my-4" />
      </div>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 2xl:grid-cols-4">
        {searchResults.length > 0 ? (
          searchResults.map((result) => {
            const story = sortedStoryList?.find((s) => s.id === result.ref);
            return (
              story && (
                <AudioCard
                  onClick={() => handleContentClick(story.id, "story")}
                  key={story.id}
                  //@ts-expect-error(123)
                  image={story.img_url?.[0]}
                  title={story.title || "Untitled"}
                  //@ts-expect-error(123)
                  tags={story.tags}
                  author={story.author || "Unknown"}
                />
              )
            );
          })
        ) : (
          <>
            {sortedStoryList?.map((story: Story) => (
              <AudioCard
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
              />
            ))}
          </>
        )}
      </section>
      <br />
      <div className="flex items-center justify-between text-left">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Script</h2>
          <p className="text-sm text-muted-foreground">Top picks for you. Updated daily.</p>
        </div>
      </div>
      <div className="relative">
        <div className="my-4" />
        <ul>
          {searchResults.length > 0
            ? searchResults.map((result) => {
                const script = sortedScriptList?.find((s) => s.id === result.ref);
                return (
                  script && (
                    <AudioCard
                      onClick={() => handleContentClick(script.id, "script")}
                      key={script.id}
                      //@ts-expect-error(123)
                      image={script.img_url?.[0]}
                      title={script.title || "Untitled"}
                      //@ts-expect-error(123)
                      tags={script.tags}
                      author={script.author || "Unknown"}
                    />
                  )
                );
              })
            : sortedScriptList?.map((script: Story) => (
                <AudioCard
                  onClick={() => handleContentClick(script.id, "script")}
                  key={script.id}
                  //@ts-expect-error(123)
                  image={script.img_url?.[0]}
                  title={script.title || "Untitled"}
                  //@ts-expect-error(123)
                  tags={script.tags}
                  author={script.author || "Unknown"}
                />
              ))}
        </ul>
      </div>
    </>
  );
}

export default HomePage;
