import { useQuery } from "@tanstack/react-query";
import dbApi from "../../../utils/firebaseService";
import { Story } from "../../../types";
import { AuthContext } from "../../../context/AuthContext";
import { useContext } from "react";
import { Timestamp } from "firebase/firestore";

const StoryTable = () => {
  const { user } = useContext(AuthContext);

  const {
    data: storyData,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["stories", user?.userName],
    queryFn: async () => {
      const story = await dbApi.queryCollection("stories", { author: user?.userName }, 10, "created_at", "desc");
      return story as Story[];
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading story data: {error.message}</div>;
  console.log(storyData);

  return (
    <div className="space-y-4 text-left">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Title
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Created At
              </th>
              {/* <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Category
              </th> */}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {storyData?.map((story) => (
              <tr key={story.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{story.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{story.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {story.created_at instanceof Timestamp
                    ? story.created_at.toDate().toLocaleString()
                    : story.created_at}
                </td>
                {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{story.category}</td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default StoryTable;
