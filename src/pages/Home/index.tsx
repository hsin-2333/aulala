import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import api from "../../utils/firebaseService";
import { useNavigate } from "react-router-dom";
import { CategoryOptions } from "../../constants/categoryOptions";

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
    queryFn: () => (selectedCategory ? api.getStoryByCategory(selectedCategory) : api.getStories(20)),
  });

  const {
    data: scriptList,
    error: scriptError,
    isLoading: isScriptLoading,
  } = useQuery<Story[], Error>({
    queryKey: ["scripts", selectedCategory],
    queryFn: () => (selectedCategory ? api.getScriptByCategory(selectedCategory) : api.getScripts(20)),
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
          <li key={story.id} onClick={() => handleContentClick(story.id, "story")}>
            {story.title}
          </li>
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
