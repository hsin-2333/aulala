import { Divider } from "@nextui-org/divider";
import { useContext, useEffect, useState } from "react";
import empty_notification from "../../assets/empty_notification.png";
import { AuthContext } from "../../context/AuthContext";
import dbApi from "../../utils/firebaseService";

type Notification = {
  id: string;
  message: string;
  link: string;
  status?: string;
  title?: string;
  created_at: { seconds: number; nanoseconds: number };
};

const Notifications = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (user && user.userName) {
        try {
          const userNotifications = await dbApi.queryCollection(
            "notifications",
            { recipient: user.userName },
            10,
          );
          setNotifications(userNotifications as Notification[]);
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      } else {
        console.log("User or userName is undefined");
      }
    };
    fetchNotifications();
  }, [user]);

  return (
    <div>
      {notifications.length > 0 ? (
        notifications.map((notification, index) => (
          <div key={index} className="flex flex-1 flex-col p-4">
            <div className="flex items-start">
              <div className="flex items-start gap-4 text-sm">
                <div className="grid gap-1 text-left">
                  <div className="font-semibold">
                    🥰 {notification.title || "A script invitation"}
                  </div>
                  <div className="line-clamp-1 text-xs">
                    {notification.message}
                  </div>
                </div>
              </div>
              {notification.created_at && (
                <div className="text-muted-foreground ml-auto text-xs">
                  {new Date(
                    notification.created_at.seconds * 1000,
                  ).toLocaleString()}
                </div>
              )}
            </div>
            <Divider className="my-6 bg-default-200 pl-4" />
          </div>
        ))
      ) : (
        <div className="h-3/4 w-full p-8 text-center">
          <img
            src={empty_notification}
            alt="No notifications"
            className="mx-auto mb-1 mt-8 h-40"
          />
          <span className="text-default-400">No Notifications Yet</span>
        </div>
      )}
    </div>
  );
};

export default Notifications;
