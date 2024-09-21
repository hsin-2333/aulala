import dbApi from "../../utils/firebaseService";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Story } from "../../types";
import { InteractionToolbar, CommentToolbar } from "../../components/InteractionToolbar";

function ScriptContent() {
  const { user } = useContext(AuthContext);

  const navigate = useNavigate();
  const { scriptId } = useParams();
  const {
    data: scriptData,
    error: scriptError,
    isLoading: scriptLoading,
  } = useQuery({
    queryKey: ["script", scriptId],
    queryFn: async () => {
      const script = await dbApi.queryCollection("scripts", { id: scriptId }, 1);
      return script as Story[];
    },
    enabled: !!scriptId,
  });

  const {
    data: storiesData,
    error: storiesError,
    isLoading: storiesLoading,
  } = useQuery({
    queryKey: ["stories", scriptId],
    queryFn: async () => {
      const stories = await dbApi.queryCollection("stories", { script_id: scriptId }, 10);
      return stories as Story[];
    },
    enabled: !!scriptId,
  });

  if (scriptLoading || storiesLoading) {
    return <div>Loading...</div>;
  }

  if (scriptError) {
    return <div>Error: {scriptError.message}</div>;
  }

  if (storiesError) {
    return <div>Error: {storiesError.message}</div>;
  }
  const script = scriptData ? scriptData[0] : null;
  const relatedStories = storiesData ? storiesData : null;

  return (
    <div className="text-left">
      <h1 className="text-3xl font-bold mb-4 text-black">Script Page</h1>
      {script && (
        <div>
          <h2 className="text-2xl font-semibold mb-2">{script.title}</h2>
          <p className="text-gray-700 mb-4 before:content-none">{script.summary}</p>
          {/* <img className="w-32 h-auto rounded-lg mb-4" src={scriptData.img_url[0]} alt={scriptData.title} /> */}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex space-x-4 justify-between">
          {user && <InteractionToolbar userName={user.userName} scriptId={script?.id} />}
          {/* <p className="text-gray-600 hover:text-gray-800">留言 35</p> */}
        </div>
        <p className="text-gray-600 hover:text-gray-800">English</p>
      </div>
      <hr className="border-t border-gray-400 my-6" />
      <section className="flex items-start justify-center flex-col ">
        <h4 className="text-2xl font-semibold mb-2">Voice Actors</h4>
        {relatedStories &&
          relatedStories.map((story) => (
            <div key={story.id} className="flex flex-grow w-full justify-between ">
              <div>
                <img src=""></img>
                <h4>{story.voice_actor}</h4>
              </div>
              <button
                className="text-gray-600 hover:text-gray-800"
                onClick={() => {
                  navigate(`/story/${story.id}`);
                }}
              >
                Link
              </button>
            </div>
          ))}
      </section>
      <hr className="border-t border-gray-400 my-6" />
      {user && <CommentToolbar userName={user.userName} storyId={script?.id} />}
    </div>
  );
}
export default ScriptContent;
