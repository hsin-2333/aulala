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
}

function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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
        {storyList?.map((story: Story) => (
          // <li key={story.id} onClick={() => handleContentClick(story.id, "story")}>
          //   {story.title}
          // </li>
          <PlaylistCard
            onClick={() => handleContentClick(story.id, "story")}
            key={story.id}
            image={story.img_url?.[0]}
            title={story.title}
            tags={story.tags}
            author={story.author}
          />
        ))}
      </ul>
      <br />
      <h2>Scripts</h2>
      <ul>
        {scriptList?.map((script: Story) => (
          <li key={script.id} onClick={() => handleContentClick(script.id, "script")}>
            {script.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HomePage;
