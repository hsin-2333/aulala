import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import dbApi from "../../utils/firebaseService";
import { useNavigate } from "react-router-dom";
import { CategoryOptions } from "../../constants/categoryOptions";
import { QueryConditions } from "../../types";
import { PlaylistCard } from "../../components/Card";

interface Story {
  id: string;
  title?: string;
  author?: string;
}

function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const navigate = useNavigate();

  const {
    data: storyList,
    error: storyError,
    isLoading: isStoryLoading,
  } = useQuery<Story[], Error>({
    queryKey: ["stories", selectedCategory],
    queryFn: () => {
      const conditions: QueryConditions = {};
      if (selectedCategory) {
        conditions.category = selectedCategory;
      }
      return dbApi.queryCollection("stories", conditions, 20);
    },
  });

  const {
    data: scriptList,
    error: scriptError,
    isLoading: isScriptLoading,
  } = useQuery<Story[], Error>({
    queryKey: ["scripts", selectedCategory],
    queryFn: () => {
      const conditions: QueryConditions = {};
      if (selectedCategory) {
        conditions.category = selectedCategory;
      }
      return dbApi.queryCollection("scripts", conditions, 20); // 假設 scripts 和 stories 使用相同的結構
    },
  });

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
  return (
    <div>
      <h2>Home Page</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      {CategoryOptions.map((category) => (
        <span
          className="mr-4 cursor-pointer inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10"
          key={category.value}
          onClick={() => setSelectedCategory(category.value)}
        >
          {category.label}
        </span>
      ))}
      <br />
      <br />
      <h2>Stories</h2>
      <ul>
        {storyList
          ?.filter((story) => story.title?.toLowerCase().includes(searchTerm.toLocaleLowerCase()))
          .map((story: Story) => (
            // <li key={story.id} onClick={() => handleContentClick(story.id, "story")}>
            //   {story.title}
            // </li>
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
          ))}
      </ul>
      <br />
      <h2>Scripts</h2>
      <ul>
        {scriptList
          ?.filter((script) => script.title?.toLowerCase().includes(searchTerm.toLowerCase()))
          .map((script: Story) => (
            // <li key={script.id} onClick={() => handleContentClick(script.id, "script")}>
            //   {script.title}
            // </li>
            <PlaylistCard
              onClick={() => handleContentClick(script.id, "script")}
              //@ts-expect-error(123)
              image={script.img_url?.[0]}
              key={script.id}
              title={script.title || "Untitled"}
              //@ts-expect-error(123)
              tags={script.tags}
              author={script.author || "Unknown"}
            />
          ))}
      </ul>
    </div>
  );
}

export default HomePage;
