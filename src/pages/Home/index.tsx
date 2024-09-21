import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import lunr from "lunr";
import dbApi from "../../utils/firebaseService";
import { useNavigate } from "react-router-dom";
import { CategoryOptions } from "../../constants/categoryOptions";
import { QueryConditions } from "../../types";
import { PlaylistCard } from "../../components/Card";
import SortedMenu from "./SortedMenu";

interface Story {
  id: string;
  title?: string;
  author?: string;
  created_at?: { seconds: number; nanoseconds: number };
}

function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<lunr.Index.Result[]>([]);
  const [searchClicked, setSearchClicked] = useState<boolean>(false);
  const [sortOrder, setSortOrder] = useState<string>("由遠到近");

  console.log("searchResults", searchResults);
  console.log("searchTerm", searchTerm);
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
      // return dbApi.queryCollection("stories", conditions, 20);
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
      // return dbApi.queryCollection("scripts", conditions, 20);
      const stories = await dbApi.queryCollection("scripts", conditions, 20);
      return stories.map((script) => ({ ...script, id: script.id }));
    },
  });

  const idx = useMemo(() => {
    if (!storyList || !scriptList) return null;

    return lunr(function () {
      this.ref("id");
      this.field("id");
      this.field("title");
      this.field("author");
      this.field("summary");
      this.field("tags");

      storyList.forEach((story) => {
        this.add(story);
      });

      scriptList.forEach((script) => {
        this.add(script);
      });
    });
  }, [storyList, scriptList]);

  const handleSearch = () => {
    setSearchClicked(true);
    if (idx && searchTerm) {
      const results = idx.search(searchTerm);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

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

  //之後替換成skeleton
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
  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setSearchClicked(false);
  };

  return (
    <div>
      <div className="mb-4 relative">
        <div className="flex gap-4 align-middle">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onKeyDown={handleKeyDown}
            onChange={(e) => setSearchTerm(e.target.value)}
            // onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className=" w-1 h-1 border-none absolute right-6 top-2 bg-transparent text-gray-500 hover:text-gray-700"
            >
              ✖
            </button>
          )}
          <SortedMenu onSortOrderChange={handleSortOrderChange} />
        </div>
      </div>

      <div className="text-left">
        {CategoryOptions.map((category) => (
          <span
            className="mr-4 cursor-pointer inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10"
            key={category.value}
            onClick={() => setSelectedCategory(category.value)}
          >
            {category.label}
          </span>
        ))}
      </div>

      <div className="relative">
        <div className="my-4" />
      </div>

      <div className="flex items-center justify-between text-left">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight ">Stories</h2>
          <p className="text-sm text-muted-foreground">Top picks for you. Updated daily.</p>
        </div>
      </div>
      <div className="relative">
        <div className="my-4" />
      </div>
      <ul>
        {searchClicked ? (
          searchResults.length > 0 ? (
            searchResults.map((result) => {
              const story = sortedStoryList?.find((s) => s.id === result.ref);
              return (
                story && (
                  <PlaylistCard
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
            <div>沒有結果喔 試試其他關鍵字</div>
          )
        ) : (
          sortedStoryList?.map((story: Story) => (
            <PlaylistCard
              onClick={() => handleContentClick(story.id, "story")}
              key={story.id}
              //@ts-expect-error(123)
              image={story.img_url?.[0]}
              title={story.title || "Untitled"}
              //@ts-expect-error(123)
              tags={story.tags}
              author={story.author || "Unknown"}
            />
          ))
        )}
      </ul>
      <br />
      <div className="flex items-center justify-between text-left">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight ">Script</h2>
          <p className="text-sm text-muted-foreground">Top picks for you. Updated daily.</p>
        </div>
      </div>
      <div className="relative">
        <div className="my-4" />
        <ul>
          {searchClicked ? (
            searchResults.length > 0 ? (
              searchResults.map((result) => {
                const script = sortedScriptList?.find((s) => s.id === result.ref);
                return (
                  script && (
                    <PlaylistCard
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
            ) : (
              <div>沒有結果喔 試試其他關鍵字</div>
            )
          ) : (
            sortedScriptList?.map((script: Story) => (
              <PlaylistCard
                onClick={() => handleContentClick(script.id, "script")}
                key={script.id}
                //@ts-expect-error(123)
                image={script.img_url?.[0]}
                title={script.title || "Untitled"}
                //@ts-expect-error(123)
                tags={script.tags}
                author={script.author || "Unknown"}
              />
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default HomePage;
