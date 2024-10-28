import { Button } from "@nextui-org/react";
import { Timestamp } from "firebase/firestore";
import { motion } from "framer-motion";
import { useContext, useEffect, useState } from "react";
import { RecentPlayContext } from "../../context/RecentPlayContext";
import { InteractionType } from "../../types";
import dbApi from "../../utils/firebaseService";
import Icon from "./Icon";

import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Image,
  Link,
} from "@nextui-org/react";
import { LiaComment } from "react-icons/lia";
import { SlOptionsVertical } from "react-icons/sl";

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

export const PlaylistCard = ({
  image,
  title,
  tags = [],
  author,
  onClick,
}: PlaylistCardProps) => {
  return (
    <div
      className="mb-2 flex h-24 w-full cursor-pointer items-center overflow-hidden rounded-lg bg-slate-200"
      onClick={onClick}
    >
      <img className="h-full w-24 object-cover" src={image} alt={title} />
      <div className="flex-grow pl-4 text-left">
        <div className="text-l font-bold">{title}</div>
        <div className="justify-items-start">{author}</div>
        <div className="mt-2 flex space-x-2">
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
    const fetchData = async () => {
      const unsubscribe = await dbApi.subscribeToInteractions(
        scriptId,
        setInteractions,
      );
      return unsubscribe;
    };

    const unsubscribePromise = fetchData();

    return () => {
      unsubscribePromise.then((unsubscribe) => unsubscribe());
    };
  }, [scriptId]);

  const getCount = (type: string) => {
    return interactions.filter(
      (interaction) => interaction.interaction_type === type,
    ).length;
  };

  return (
    <Card
      className="mb-1 w-full border border-default-200 hover:bg-default-50 sm:mb-8"
      isPressable
      onPress={onClick}
      shadow="none"
    >
      <CardHeader className="flex flex-col items-start">
        <div className="flex items-center gap-2 align-middle">
          <Image
            alt="story cover image"
            height={40}
            radius="sm"
            width={40}
            src={image}
          />
          <div>
            <h2 className="text-l whitespace-normal break-words text-left font-bold sm:text-xl">
              {title}
            </h2>
            <p className="text-left text-small text-default-500">{date}</p>
          </div>
        </div>
      </CardHeader>

      <CardBody className="px-4 py-2 sm:py-4">
        <p className="whitespace-normal break-words text-gray-700">{summary}</p>
      </CardBody>
      <Divider className="bg-slate-100" />

      <CardFooter className="flex w-full flex-wrap items-center justify-between gap-2 py-2 sm:py-4">
        <div className="flex flex-grow flex-wrap space-x-2">
          {tags.map((tag, index) => (
            <Chip key={index} color="primary" className="text-xs sm:text-sm">
              {tag}
            </Chip>
          ))}
        </div>
        <div className="ml-1 flex flex-wrap items-end gap-2">
          <p className="flex items-center gap-1 text-default-500 hover:text-gray-800">
            <Icon
              name="bookmarked"
              className="h-4 w-4"
              color="hsl(var(--nextui-default-500))"
            />
            {getCount("bookmarked")}
          </p>
          <p className="flex items-center gap-1 text-default-500 hover:text-gray-800">
            <Icon
              name="like"
              className="h-4 w-4"
              color="hsl(var(--nextui-default-500))"
            />{" "}
            {getCount("like")}
          </p>

          <p className="flex items-center gap-1 text-default-500 hover:text-gray-800">
            <LiaComment
              className="h-5 w-5"
              color="hsl(var(--nextui-default-500))"
            />{" "}
            {getCount("comment")}
          </p>
        </div>
        <p className="text-default-500 hover:text-gray-800">{language}</p>
      </CardFooter>
    </Card>
  );
};

export const AudioCard: React.FC<PlaylistCardProps> = ({
  image,
  title,
  duration,
  author,
  date,
  onClick,
  intro,
}) => {
  const context = useContext(RecentPlayContext);
  if (context === undefined) {
    throw new Error("SomeComponent must be used within a RecentPlayProvider");
  }

  const storyDuration = duration
    ? `${Math.round((duration / 60) * 2) / 2} min`
    : "";
  return (
    <Card
      className="group w-full min-w-52 sm:min-w-72"
      shadow="none"
      isPressable
      onPress={onClick}
    >
      <CardHeader className="flex items-center justify-between gap-3">
        <div className="flex gap-3">
          <Image
            alt="story cover image"
            height={40}
            radius="sm"
            src={image}
            width={40}
          />
          <div className="flex flex-col">
            <p className="text-md text-left">{author}</p>
            <p className="text-left text-small text-default-500">
              {date} • {storyDuration}
            </p>
          </div>
        </div>
      </CardHeader>
      <Divider className="bg-slate-100" />
      <CardBody className="flex gap-3">
        <span className="whitespace-normal break-words text-left text-xl font-bold">
          {title}
        </span>
        <p className="whitespace-normal break-words text-gray-700">{intro}</p>
      </CardBody>
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
}) => {
  const context = useContext(RecentPlayContext);
  if (context === undefined) {
    throw new Error("SomeComponent must be used within a RecentPlayProvider");
  }
  const { storyInfo, isPlaying } = context;

  const isCurrentStory = id === storyInfo?.id;
  const storyDuration = duration
    ? `${Math.round((duration / 60) * 2) / 2} min`
    : "";
  return (
    <Card
      isPressable
      onPress={onClick}
      className="max-w-[240px] flex-shrink-0 bg-transparent"
      shadow="none"
      radius="none"
    >
      <CardBody className="overflow-visible p-0 py-2">
        <div className="z-3 group relative w-36 sm:w-60">
          <Image
            src={image}
            alt="Card background"
            className="z-0 h-36 w-36 rounded-xl object-cover sm:h-48 sm:w-48 md:h-60 md:w-60"
          />
          <div className="z-2 absolute inset-0 rounded-xl bg-black bg-opacity-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          <Button
            isIconOnly
            className="absolute inset-0 z-10 m-auto text-default-900/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100 data-[hover]:bg-foreground/10"
            radius="full"
            variant="light"
            onClick={onClick}
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
      <CardHeader className="mt-1 w-full flex-col items-start p-0">
        <motion.p
          className="items-start overflow-hidden whitespace-nowrap text-left text-large font-bold"
          whileHover={{ x: ["0", "-100%"] }}
          transition={{ duration: 4, ease: "linear", repeat: Infinity }}
        >
          {title}
        </motion.p>
        <small className="text-default-500">
          {date} • {author} • {storyDuration}
        </small>
      </CardHeader>
    </Card>
  );
};

export const SearchResultCard = ({
  id,
  image,
  intro,
  duration,
  title,
  tags,
  author,
  onClick,
}: PlaylistCardProps) => {
  const context = useContext(RecentPlayContext);
  if (context === undefined) {
    throw new Error("SomeComponent must be used within a RecentPlayProvider");
  }

  const storyDuration = duration
    ? `${Math.round((duration / 60) * 2) / 2} min`
    : "";

  return (
    <>
      <Card
        isBlurred
        className="max-w-[860px] cursor-pointer hover:bg-primary-50"
        shadow="none"
        isPressable
        onPress={onClick}
        radius="sm"
      >
        <CardBody>
          <div className="grid max-h-40 grid-cols-6 items-start justify-center gap-6 md:grid-cols-12 md:gap-4">
            <div className="relative col-span-2 w-fit sm:col-span-2 md:col-span-2 md:h-full">
              <img
                alt={title}
                className="ml-0 h-full w-full rounded-lg object-cover sm:ml-6 md:max-h-32 md:max-w-32"
                src={image}
                width="100%"
                style={{
                  height: "100px",
                  width: "100px",
                  borderRadius: "0.5rem",
                }}
              />
            </div>

            <div className="col-span-4 flex h-full flex-col sm:col-span-3 md:col-span-10">
              <div className="flex h-full items-start justify-between">
                <div className="col-span-3 flex flex-col justify-between gap-0">
                  <div>
                    <h1 className="text-medium font-semibold">{title}</h1>
                    <div className="flex gap-1">
                      <Link
                        href={`/user/${author}`}
                        color="foreground"
                        className="text-xs tracking-tight text-default-400 hover:text-default-600 sm:text-sm"
                      >
                        {author}
                      </Link>
                      <h3 className="text-xs tracking-tight text-default-400 sm:text-sm">
                        •
                      </h3>
                      <h3 className="text-xs tracking-tight text-default-400 sm:text-sm">
                        {storyDuration}
                      </h3>
                    </div>
                    <p className="overflow-hidden pt-2 text-small">{intro}</p>
                    {tags.map((tag, index) => (
                      <Chip
                        key={index}
                        variant="flat"
                        color="primary"
                        isDisabled
                        size="sm"
                        radius="sm"
                        className="mr-1 mt-1"
                      >
                        # {tag}
                      </Chip>
                    ))}
                  </div>
                </div>

                <div className="flex h-full items-center">
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
