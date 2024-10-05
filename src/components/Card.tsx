import { useEffect, useState, useContext } from "react";
import { Timestamp } from "firebase/firestore";
import dbApi from "../utils/firebaseService";
import { InteractionType } from "../types";
import Icon from "./Icon";
import { AuthContext } from "../context/AuthContext";
import { RecentPlayContext } from "../context/RecentPlayContext";
import { Button } from "@nextui-org/react";
import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  Image,
  CardFooter,
  Chip,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Link,
} from "@nextui-org/react";
import { LiaComment } from "react-icons/lia";
import { SlOptionsVertical } from "react-icons/sl";
import { useNavigate } from "react-router-dom";

interface PlaylistCardProps {
  id?: string;
  image: string;
  title: string;
  tags: string[];
  author: string;
  onClick?: () => void;
  onCardClick?: () => void;
  duration?: number;
  date?: string;
  intro?: string;
}

interface ScriptCardProps {
  scriptId: string | undefined;
  title: string;
  author?: string;
  tags: string[];
  language?: string;
  summary: string;
  image?: string;
  date: string;
  created_at?: Timestamp;
  onClick?: () => void;
}

// const formatTimestamp = (timestamp?: Timestamp): string => {
//   if (!timestamp) {
//     return "Invalid date";
//   }
//   const date = timestamp.toDate();
//   const year = date.getFullYear();
//   const month = (date.getMonth() + 1).toString().padStart(2, "0");
//   return `${year}${month}`;
// };

export const PlaylistCard = ({ image, title, tags = [], author, onClick }: PlaylistCardProps) => {
  return (
    <div
      className="flex items-center w-full h-24 bg-slate-200 rounded-lg overflow-hidden cursor-pointer mb-2"
      onClick={onClick}
    >
      <img className="h-full w-24 object-cover" src={image} alt={title} />
      <div className="flex-grow pl-4 text-left">
        <div className="font-bold text-l">{title}</div>
        <div className="justify-items-start	">{author}</div>
        <div className="flex space-x-2 mt-2">
          {tags.map((tag, index) => (
            <span key={index} className="rounded-sm bg-slate-300">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// export const ScriptCard = ({ scriptId, title, author, tags = [], summary, created_at, language }: ScriptCardProps) => {
//   const formattedDate = formatTimestamp(created_at);

//   const [interactions, setInteractions] = useState<InteractionType[]>([]);
//   console.log(interactions);
//   useEffect(() => {
//     if (!scriptId) return;

//     const fetchData = async () => {
//       const unsubscribe = await dbApi.subscribeToInteractions(scriptId, setInteractions);
//       return unsubscribe;
//     };

//     const unsubscribePromise = fetchData();

//     return () => {
//       unsubscribePromise.then((unsubscribe) => unsubscribe());
//     };
//   }, [scriptId]);

//   const getCount = (type: string) => {
//     return interactions.filter((interaction) => interaction.interaction_type === type).length;
//   };

//   return (
//     <div className="flex flex-col w-full bg-gray-100 rounded-lg overflow-hidden mb-2">
//       <div className="flex items-center p-4 ">
//         <div className="flex-grow text-left">
//           <div className="font-bold text-xl text-black">{title}</div>
//           <div className="text-gray-600">
//             {author} • {formattedDate}
//           </div>
//           <div className="flex space-x-2 mt-2 ">
//             {tags.map((tag, index) => (
//               <span key={index} className="text-gray-00 text-sm p-1 rounded-sm bg-slate-300">
//                 {tag}
//               </span>
//             ))}
//           </div>
//         </div>
//       </div>
//       <div className="p-4 text-gray-700  text-left">{summary}</div>
//       <div className="flex items-center justify-between p-4 ">
//         <div className="flex space-x-4">
//           <p className="text-gray-600 hover:text-gray-800">收藏 {getCount("bookmarked")}</p>
//           <p className="text-gray-600 hover:text-gray-800">愛心 {getCount("like")}</p>
//           <p className="text-gray-600 hover:text-gray-800">留言 {getCount("comment")}</p>
//         </div>
//         <p className="text-gray-600 hover:text-gray-800">{language}</p>
//       </div>
//     </div>
//   );
// };

export const ScriptCard = ({
  scriptId,
  title,
  tags = [],
  summary,
  language,
  date,
  image,
  onClick,
}: ScriptCardProps) => {
  const [interactions, setInteractions] = useState<InteractionType[]>([]);

  useEffect(() => {
    if (!scriptId) return;

    console.log("不會八");
    const fetchData = async () => {
      const unsubscribe = await dbApi.subscribeToInteractions(scriptId, setInteractions);
      return unsubscribe;
    };

    const unsubscribePromise = fetchData();

    return () => {
      unsubscribePromise.then((unsubscribe) => unsubscribe());
    };
  }, [scriptId]);

  const getCount = (type: string) => {
    return interactions.filter((interaction) => interaction.interaction_type === type).length;
  };

  return (
    <Card className="w-full border border-default-200 mb-1 sm:mb-8 " isPressable onPress={onClick} shadow="none">
      <CardHeader className="flex flex-col items-start">
        <div className="flex gap-2 align-middle items-center">
          <Image alt="story cover image" height={40} radius="sm" width={40} src={image} />
          <div>
            <h2 className="font-bold text-l sm:text-xl break-words whitespace-normal text-left">{title}</h2>
            <p className="text-small text-default-500 text-left">{date}</p>
          </div>
        </div>
      </CardHeader>

      <CardBody className="px-4 py-2 sm:py-4">
        <p className="text-gray-700 break-words whitespace-normal">{summary}</p>
      </CardBody>
      <Divider className="bg-slate-100" />

      <CardFooter className="flex flex-wrap items-center w-full justify-between py-2 sm:py-4 gap-2">
        <div className="flex flex-wrap space-x-2 flex-grow">
          {tags.map((tag, index) => (
            <Chip key={index} color="primary" className="text-xs sm:text-sm">
              {tag}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 ml-1  items-end ">
          <p className="text-default-500 hover:text-gray-800 flex  gap-1 items-center">
            {" "}
            <Icon name="bookmarked" className="h-4 w-4" color="hsl(var(--nextui-default-500))" />
            {getCount("bookmarked")}
          </p>
          <p className="text-default-500 hover:text-gray-800 flex  gap-1 items-center">
            <Icon name="like" className="h-4 w-4" color="hsl(var(--nextui-default-500))" /> {getCount("like")}
          </p>

          <p className="text-default-500 hover:text-gray-800 flex  gap-1 items-center ">
            <LiaComment className="h-5 w-5" color="hsl(var(--nextui-default-500))" /> {getCount("comment")}
          </p>
        </div>
        <p className="text-default-500 hover:text-gray-800">{language}</p>
      </CardFooter>
    </Card>
  );
};

export const AudioCard: React.FC<PlaylistCardProps> = ({
  // id,
  image,
  title,
  duration,
  author,
  date,
  onClick,
  // onCardClick,
  intro,
}) => {
  // const { user } = useContext(AuthContext);
  const context = useContext(RecentPlayContext);
  if (context === undefined) {
    throw new Error("SomeComponent must be used within a RecentPlayProvider");
  }
  // const { storyInfo, isPlaying, setIsPlaying, fetchRecentPlay } = context;

  // const togglePlayPause = async (event: React.MouseEvent) => {
  //   event.stopPropagation(); // 防止事件冒泡
  //   if (user && id) {
  //     try {
  //       await dbApi.updateRecentPlay(user.uid, id, 0);
  //       fetchRecentPlay();
  //       setIsPlaying(true);
  //     } catch (error) {
  //       console.error("Error updating recent play: ", error);
  //     }
  //   }
  //   if (onCardClick) {
  //     onCardClick(); //打開主頁側邊選單
  //     setIsPlaying(!isPlaying);
  //   }
  // };

  // const isCurrentStory = id === storyInfo?.id;
  const storyDuration = duration ? `${Math.round((duration / 60) * 2) / 2} min` : "";
  return (
    <Card className="min-w-52 sm:min-w-72 w-full group" shadow="none" isPressable onPress={onClick}>
      <CardHeader className="flex gap-3  justify-between items-center">
        <div className="flex  gap-3">
          <Image alt="story cover image" height={40} radius="sm" src={image} width={40} />
          <div className="flex flex-col">
            <p className="text-md text-left">{author}</p>
            <p className="text-small text-default-500 text-left">
              {date} • {storyDuration}
            </p>
          </div>
        </div>

        {/* <div>
          <Button
            isIconOnly
            className="text-default-900/60 data-[hover]:bg-foreground/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            radius="full"
            variant="light"
            onClick={togglePlayPause}
          >
            <Icon
              name="play"
              filled={isPlaying && isCurrentStory}
              className="h-6 w-6"
              color="hsl(var(--nextui-primary-200))"
            />
          </Button>
        </div> */}
      </CardHeader>
      <Divider className="bg-slate-100" />
      <CardBody className="flex gap-3">
        <span className="font-bold text-xl break-words whitespace-normal text-left">{title}</span>
        <p className="text-gray-700 break-words whitespace-normal">{intro}</p>
      </CardBody>
      {/* <Divider /> */}
      {/* <CardFooter></CardFooter> */}
    </Card>
  );
};

export const ImageCard: React.FC<PlaylistCardProps> = ({
  id,
  image,
  title,
  duration,
  author,
  date,
  onClick,
  onCardClick,
}) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const context = useContext(RecentPlayContext);
  if (context === undefined) {
    throw new Error("SomeComponent must be used within a RecentPlayProvider");
  }
  const { storyInfo, isPlaying, setIsPlaying, fetchRecentPlay } = context;

  const togglePlayPause = async (event: React.MouseEvent) => {
    event.stopPropagation(); // 防止事件冒泡
    if (user && id) {
      try {
        // await dbApi.updateRecentPlay(user.uid, id, 0);
        // fetchRecentPlay();
        // setIsPlaying(true);
      } catch (error) {
        console.error("Error updating recent play: ", error);
      }
      if (onCardClick) {
        onCardClick(); //打開主頁側邊選單
        // setIsPlaying(!isPlaying);
        navigate(`/story/${id}`);
      }
    } else {
      navigate(`/story/${id}`);
    }
  };

  const isCurrentStory = id === storyInfo?.id;
  const storyDuration = duration ? `${Math.round((duration / 60) * 2) / 2} min` : "";
  return (
    <Card isPressable onPress={onClick} className="flex-shrink-0 bg-transparent " shadow="none" radius="none">
      <CardBody className="overflow-visible py-2 p-0">
        <div className="z-3  relative group w-36 sm:w-60">
          <Image
            src={image}
            alt="Card background"
            className="z-0 object-cover rounded-xl w-36 h-36 sm:w-48 sm:h-48 md:w-60 md:h-60"
          />
          <div className="z-2 absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
          <Button
            isIconOnly
            className="z-10 absolute inset-0 m-auto text-default-900/60 data-[hover]:bg-foreground/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            radius="full"
            variant="light"
            onClick={togglePlayPause}
          >
            <Icon
              name="play"
              filled={isPlaying && isCurrentStory}
              className="h-10 w-10"
              color="hsl(var(--nextui-primary-200))"
            />
          </Button>
        </div>
      </CardBody>
      <CardHeader className="p-0  mt-1 flex-col items-start">
        {/* <p className="text-tiny uppercase font-bold">Daily Mix</p> */}
        <h4 className="font-bold text-large">{title}</h4>
        <small className="text-default-500">
          {date} • {author} • {storyDuration}
        </small>
      </CardHeader>
    </Card>
  );
};

export const SearchResultCard = ({ id, image, intro, duration, title, author, onClick }: PlaylistCardProps) => {
  // const { user } = useContext(AuthContext);
  const context = useContext(RecentPlayContext);
  if (context === undefined) {
    throw new Error("SomeComponent must be used within a RecentPlayProvider");
  }

  const storyDuration = duration ? `${Math.round((duration / 60) * 2) / 2} min` : "";

  return (
    <>
      <Card
        isBlurred
        className="dark:bg-default-100/50 max-w-[860px] cursor-pointer hover:bg-primary-50"
        shadow="none"
        isPressable
        onPress={onClick}
        radius="sm"
      >
        <CardBody>
          <div className="max-h-40  grid grid-cols-6 md:grid-cols-12 gap-6 md:gap-4 items-start justify-center">
            <div className="relative sm:col-span-2 col-span-2 md:col-span-2 md:h-full w-fit ">
              <img
                alt={title}
                className="ml-6 object-cover rounded-lg w-full h-full md:max-w-32 md:max-h-32 "
                src={image}
                width="100%"
                style={{ height: "100px", width: "100px", borderRadius: "0.5rem" }}
              />
            </div>

            <div className="flex flex-col sm:col-span-3  col-span-4 md:col-span-10 h-full">
              <div className="flex justify-between items-start h-full">
                <div className="flex flex-col gap-0 col-span-3 justify-between">
                  <div>
                    <h1 className="text-medium font-semibold ">{title}</h1>
                    <div className="flex gap-1">
                      <Link
                        href={`/user/${author}`}
                        color="foreground"
                        className="text-sm tracking-tight text-default-400 hover:text-default-600"
                      >
                        {author}
                      </Link>
                      <h3 className="text-small tracking-tight text-default-400">•</h3>
                      <h3 className="text-small tracking-tight text-default-400">{storyDuration}</h3>
                    </div>
                    <p className="text-small pt-2 overflow-hidden">{intro}</p>
                  </div>
                </div>

                <div className="flex items-center h-full ">
                  <Dropdown>
                    <DropdownTrigger>
                      <Button isIconOnly size="sm" variant="light">
                        <SlOptionsVertical className="text-default-300" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu>
                      <DropdownItem href={`/story/${id}`}>View</DropdownItem>
                      <DropdownItem>Share</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
      <Divider className="bg-slate-200" />
    </>
  );
};
