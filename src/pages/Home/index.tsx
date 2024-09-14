import { useQuery } from "react-query";

import api from "../../utils/firebaseService";

interface Story {
  id: string;
  title?: string;
}
function HomePage() {
  // const [storyList, setStoryList] = useState<Story[]>([]);

  // useEffect(() => {
  //   async function fetchStories() {
  //     try {
  //       const stories = await api.getStories(10);
  //       setStoryList(stories);
  //     } catch (error) {
  //       console.error("Error fetching stories: ", error);
  //     }
  //   }
  //   fetchStories();
  // }, []);

  const {
    data: storyList,
    error,
    isLoading,
  } = useQuery<Story[], Error>("stories", () => api.getStories(20));

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error fetch Stories: {error.message}</div>;
  }
  return (
    <div className="p-4 bg-blue-500 text-white">
      <h1 className="text-2xl font-bold">Home Page</h1>
      <ul>
        {storyList?.map((story: Story) => (
          <li key={story.id}>{story.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default HomePage;
