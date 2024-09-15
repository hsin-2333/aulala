import { useQuery } from "@tanstack/react-query";

import api from "../../utils/firebaseService";

interface Story {
  id: string;
  title?: string;
}
function HomePage() {
  const {
    data: storyList,
    error: storyError,
    isLoading: isStoryLoading,
  } = useQuery<Story[], Error>({
    queryKey: ["stories"],
    queryFn: () => api.getStories(20),
  });

  const {
    data: scriptList,
    error: scriptError,
    isLoading: isScriptLoading,
  } = useQuery<Story[], Error>({
    queryKey: ["scripts"],
    queryFn: () => api.getScripts(20),
  });

  if (isScriptLoading || isStoryLoading) {
    return <div>Loading...</div>;
  }
  if (storyError || scriptError) {
    return <div>Error fetching data: {storyError?.message || scriptError?.message}</div>;
  }
  return (
    <div>
      <h2>Home Page</h2>
      <br />
      <br />
      <h2>Stories</h2>
      <ul>
        {storyList?.map((story: Story) => (
          <li key={story.id}>{story.title}</li>
        ))}
      </ul>
      <br />
      <h2>Scripts</h2>
      <ul>
        {scriptList?.map((script: Story) => (
          <li key={script.id}>{script.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default HomePage;
