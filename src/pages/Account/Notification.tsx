import { useState, useEffect, useContext } from "react";
import dbApi from "../../utils/firebaseService";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { Divider } from "@nextui-org/divider";

type Notification = {
  id: string;
  message: string;
  link: string;
  created_at: { seconds: number; nanoseconds: number };
};

const Notifications = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (user && user.userName) {
        console.log("Fetching notifications for user:", user.userName);
        try {
          const userNotifications = await dbApi.queryCollection("notifications", { recipient: user.userName }, 10);
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
      {notifications ? (
        notifications.map((notification, index) => (
          <div key={index} className="flex flex-1 flex-col p-4">
            <div className="flex items-start">
              <div className="flex items-start gap-4 text-sm">
                {/* <Avatar>
                <AvatarImage alt={mail.name} />
                <AvatarFallback>
                  {mail.name
                    .split(" ")
                    .map((chunk) => chunk[0])
                    .join("")}
                </AvatarFallback>
              </Avatar> */}
                <div className="grid gap-1 text-left">
                  <div className="font-semibold">🥰 A script invitation</div>
                  <div className="line-clamp-1 text-xs">{notification.message}</div>
                  <div className="line-clamp-1 text-xs">
                    <Link to={notification.link} className="text-xs text-blue-500">
                      View Script
                    </Link>
                  </div>
                </div>
              </div>
              {notification.created_at && (
                <div className="ml-auto text-xs text-muted-foreground">
                  {new Date(notification.created_at.seconds * 1000).toLocaleString()}{" "}
                </div>
              )}
            </div>
            <Divider className="my-6 pl-4 bg-default-200" />
          </div>
        ))
      ) : (
        <div className="p-8 text-center text-muted-foreground">No message selected</div>
      )}
    </div>
  );
};

export default Notifications;
