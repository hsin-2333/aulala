import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Link,
  User,
} from "@nextui-org/react";
import { useContext, useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { RecentPlayContext } from "../../context/RecentPlayContext";
import dbApi from "../../utils/firebaseService";

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
  const [avatars, setAvatars] = useState<
    { userName: string; avatar: string }[]
  >([]);

  useEffect(() => {
    const fetchAvatars = async () => {
      if (storyInfo?.voice_actor) {
        const avatarPromises = storyInfo.voice_actor.map(
          async (userName: string) => {
            const condition = { userName };
            const users = await dbApi.queryCollection("users", condition);
            if (users.length > 0) {
              const user = users[0] as UserWithAvatar;
              console.log("user", user);
              return { userName: user.userName, avatar: user.avatar };
            }
            return { userName, avatar: "" };
          },
        );

        const avatars = await Promise.all(avatarPromises);
        setAvatars(avatars);
      }
    };

    fetchAvatars();
  }, [storyInfo]);

  return (
    <>
      {storyInfo && (
        <div
          className="m-4 overflow-y-auto rounded-lg bg-default-100 pb-12"
          style={{ height: "calc(100vh - 190px)" }}
        >
          <div className="space-y-4 py-4">
            <div className="px-4 py-2">
              <div className="flex justify-between">
                <h2 className="mb-2 text-left text-lg font-semibold tracking-tight">
                  {title}
                </h2>

                <Button
                  isIconOnly
                  className="-translate-y-2 translate-x-2 text-default-900/60 data-[hover]:bg-foreground/10"
                  radius="full"
                  variant="light"
                  onClick={() => setIsDetailVisible(false)}
                >
                  <IoClose name="closed" className="h-6 w-6" />
                </Button>
              </div>
              <div className="space-y-1">
                <div className="flex w-full justify-start gap-2">
                  {tags.map((tag, index) => (
                    <Chip
                      key={index}
                      className="capitalize"
                      color="primary"
                      size="sm"
                      variant="flat"
                    >
                      {tag}
                    </Chip>
                  ))}
                </div>
              </div>
              <div className="bg-white-200 m-2 flex h-[8px] w-full"></div>
              <Card
                shadow="none"
                radius="lg"
                className="space-y-1 border-4 border-slate-200 border-opacity-30 bg-white py-2"
              >
                <CardHeader>
                  <h2 className="text-left text-lg font-semibold tracking-tight">
                    Summary
                  </h2>
                </CardHeader>
                <CardBody>
                  <div className="flex flex-row justify-start gap-4 text-left">
                    <p className="text-left text-sm font-thin tracking-tight">
                      {summary}
                    </p>
                  </div>
                </CardBody>
              </Card>
              <div className="bg-white-200 m-2 flex h-[8px] w-full"></div>
              <Card
                shadow="none"
                radius="lg"
                className="space-y-1 border-4 border-slate-200 border-opacity-30 bg-white py-2"
              >
                <CardHeader>
                  <h2 className="text-left text-lg font-semibold tracking-tight">
                    Attendees
                  </h2>
                </CardHeader>
                <CardBody>
                  <div className="flex flex-row justify-start gap-4 text-left">
                    {avatars.map((attendee, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <User
                          name={
                            <Link
                              href={`/user/${attendee.userName}`}
                              size="sm"
                              color="foreground"
                              underline="hover"
                            >
                              {attendee.userName}
                            </Link>
                          }
                          description="voice actor"
                          avatarProps={{
                            src: attendee.avatar,
                            isBordered: true,
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
