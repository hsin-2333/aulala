import { RecentPlayContext } from "../../context/RecentPlayContext";
import { useContext, useEffect, useState } from "react";
import dbApi from "../../utils/firebaseService";
import { Card, CardHeader, CardBody, Button, Chip, User, Link } from "@nextui-org/react";
import { IoClose } from "react-icons/io5";

type UserWithAvatar = {
  id: string;
  userName: string;
  avatar: string;
};

type ClickHandler = {
  setIsDetailVisible: (visible: boolean) => void;
};

const ContentInfoSideBar = ({ setIsDetailVisible }: ClickHandler) => {
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
        <div className="pb-12 overflow-y-auto" style={{ height: "calc(100vh - 80px)" }}>
          <div className="space-y-4 py-4">
            <div className="px-4 py-2">
              <div className="flex justify-between">
                <h2 className="text-left mb-2 text-lg font-semibold tracking-tight">{title}</h2>

                <Button
                  isIconOnly
                  className="text-default-900/60 data-[hover]:bg-foreground/10 -translate-y-2 translate-x-2"
                  radius="full"
                  variant="light"
                  onClick={() => setIsDetailVisible(false)}
                >
                  <IoClose name="closed" className="h-6 w-6" />
                </Button>
              </div>
              <div className="space-y-1 ">
                <div className="w-full justify-start flex gap-2">
                  {tags.map((tag, index) => (
                    <Chip key={index} className="capitalize" color="primary" size="sm" variant="flat">
                      {tag}
                    </Chip>
                  ))}
                </div>
              </div>
              <div className="flex m-2 bg-white-200  h-[8px] w-full"></div>
              <Card shadow="none" radius="lg" className="space-y-1 py-2">
                <CardHeader>
                  <h2 className="text-left text-lg font-semibold tracking-tight">Summary</h2>
                </CardHeader>
                <CardBody>
                  <div className="text-left flex flex-row gap-4 justify-start">
                    <p className="text-left text-sm font-thin tracking-tight">{summary}</p>
                  </div>
                </CardBody>
              </Card>
              <div className="flex m-2 bg-white-200  h-[8px] w-full"></div>
              <Card shadow="none" radius="lg" className="space-y-1 py-2">
                <CardHeader>
                  <h2 className="text-left text-lg font-semibold tracking-tight">Attendees</h2>
                </CardHeader>
                <CardBody>
                  <div className="text-left flex flex-row gap-4 justify-start">
                    {avatars.map((attendee, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <User
                          name={
                            <Link href={`/user/${attendee.userName}`} size="sm" color="foreground" underline="hover">
                              {attendee.userName}
                            </Link>
                          }
                          description="voice actor"
                          avatarProps={{
                            src: attendee.avatar,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ContentInfoSideBar;
