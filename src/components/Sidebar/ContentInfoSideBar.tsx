import { RecentPlayContext } from "../../context/RecentPlayContext";
import { useContext, useEffect, useState } from "react";
import dbApi from "../../utils/firebaseService";

type UserWithAvatar = {
  id: string;
  userName: string;
  avatar: string;
};

const ContentInfoSideBar = () => {
  const context = useContext(RecentPlayContext);
  if (context === undefined) {
    throw new Error("SomeComponent must be used within a RecentPlayProvider");
  }
  const { storyInfo } = context;

  const tags = storyInfo?.tags || [];
  const title = storyInfo?.title || "";
  const summary = storyInfo?.summary || "";
  const [avatars, setAvatars] = useState<{ userName: string; avatar: string }[]>([]);

  useEffect(() => {
    const fetchAvatars = async () => {
      if (storyInfo?.voice_actor) {
        const avatarPromises = storyInfo.voice_actor.map(async (userName: string) => {
          const condition = { userName };
          const users = await dbApi.queryCollection("users", condition);
          if (users.length > 0) {
            const user = users[0] as UserWithAvatar;
            console.log("user", user);
            return { userName: user.userName, avatar: user.avatar };
          }
          return { userName, avatar: "" };
        });

        const avatars = await Promise.all(avatarPromises);
        setAvatars(avatars);
      }
    };

    fetchAvatars();
  }, [storyInfo]);

  return (
    <>
      {storyInfo && (
        <div className="pb-12">
          <div className="space-y-4 py-4">
            <div className="px-3 py-2">
              <h2 className="text-left mb-2 px-4 text-lg font-semibold tracking-tight">{title}</h2>
              <div className="space-y-1 ">
                <div className="w-full justify-start flex items-center size-default gap-2">
                  {tags.map((tag, index) => (
                    <span key={index} className="text-gray-00 text-sm p-1 rounded-sm bg-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-left mb-2 px-4 text-sm font-thin tracking-tight">{summary}</p>
              </div>
              <div className="flex m-2 px-4  bg-white-200  h-[1px] w-full"></div>
              <h2 className="text-left mb-2 px-4 text-lg font-semibold tracking-tight">Attendees</h2>
              <div className="text-left mb-2 px-4  flex flex-row gap-4 justify-start">
                {avatars.map((attendee, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <img
                      src={attendee.avatar}
                      alt={`Avatar of ${attendee.userName}`}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="text-left text-sm font-semibold tracking-tight leading-7">{attendee.userName}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ContentInfoSideBar;
