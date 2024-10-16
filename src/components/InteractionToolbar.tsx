import { Button, Divider, Link, Textarea, User } from "@nextui-org/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { IoCreateOutline } from "react-icons/io5";
import { Comment, User as UserType } from "../types";
import dbApi from "../utils/firebaseService";
import Icon from "./Icon";

interface InteractionToolbarProps {
  userName: string;
  avatar?: string;
  storyId?: string;
  scriptId?: string;
  setCommentCount?: (count: number) => void;
}

interface BookmarkButtonProps {
  userName: string;
  // storyId?: string;
  scriptId?: string;
}

interface PlaylistButtonProps {
  userName: string;
  storyId?: string;
}

export const InteractionToolbar = ({ userName, storyId, scriptId }: InteractionToolbarProps) => {
  const [liked, setLiked] = useState(false);
  const queryClient = useQueryClient();
  useEffect(() => {
    const fetchLikeStatus = async () => {
      const likeStatus = await dbApi.getInteractionStatus(userName, storyId || null, scriptId || null, "like");
      setLiked(likeStatus);
    };

    fetchLikeStatus();
  }, [userName, storyId, scriptId]);

  const likeMutation = useMutation({
    mutationFn: () => dbApi.updateInteraction(userName, storyId || null, scriptId || null, "like"),
    onMutate: async () => {
      const previousLiked = liked;
      setLiked((prev) => !prev);
      return { previousLiked };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["interactions", userName, storyId || scriptId],
      });
    },
  });

  return (
    <div className="interaction-toolbar flex">
      {/* <button onClick={() => likeMutation.mutate()} className="flex items-center"> */}
      <Button
        isIconOnly
        className=" text-default-900/60 data-[hover]:bg-foreground/10  "
        radius="full"
        variant="light"
        onPress={() => likeMutation.mutate()}
        // onClick={togglePlayPause}
      >
        <Icon
          name="like"
          filled={liked}
          className="h-5 w-5 sm:h-6 sm:w-6"
          color={liked ? "#fca5a5cc" : "currentColor"}
        />
      </Button>

      {storyId ? (
        <PlaylistButton userName={userName} storyId={storyId} />
      ) : (
        <BookmarkButton userName={userName} scriptId={scriptId} />
      )}
    </div>
  );
};

export const BookmarkButton = ({ userName, scriptId }: BookmarkButtonProps) => {
  const [bookmarked, setBookmarked] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchBookmarkStatus = async () => {
      const bookmarkStatus = await dbApi.getInteractionStatus(userName, null, scriptId || null, "bookmarked");
      setBookmarked(bookmarkStatus);
    };

    fetchBookmarkStatus();
  }, [userName, scriptId]);

  const saveMutation = useMutation({
    mutationFn: () => dbApi.updateInteraction(userName, null, scriptId || null, "bookmarked"),
    onMutate: async () => {
      setBookmarked((prev) => !prev);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["interactions", userName, scriptId],
      });
    },
  });

  return (
    <Button
      isIconOnly
      className=" text-default-900/60 data-[hover]:bg-foreground/10  "
      radius="full"
      variant="light"
      onPress={() => saveMutation.mutate()}
      // onClick={togglePlayPause}
    >
      <Icon
        name="bookmarked"
        filled={bookmarked}
        className="h-5 w-5 sm:h-6 sm:w-6"
        color={bookmarked ? "#82ca9e90" : "currentColor"}
      />
    </Button>
  );
};

export const PlaylistButton = ({ userName, storyId }: PlaylistButtonProps) => {
  const [inPlaylist, setInPlaylist] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchPlaylistStatus = async () => {
      const playlistStatus = await dbApi.getInteractionStatus(userName, storyId || null, null, "playlist");
      setInPlaylist(playlistStatus);
    };

    fetchPlaylistStatus();
  }, [userName, storyId]);

  const playlistMutation = useMutation({
    mutationFn: () => dbApi.updateInteraction(userName, storyId || null, null, "playlist"),
    onMutate: async () => {
      setInPlaylist((prev) => !prev);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["interactions", userName, storyId],
      });
    },
  });

  return (
    <Button
      isIconOnly
      className=" text-default-900/60 data-[hover]:bg-foreground/10  "
      radius="full"
      variant="light"
      onPress={() => playlistMutation.mutate()}
      // onClick={togglePlayPause}
    >
      <Icon
        name={inPlaylist ? "added-to-playlist" : "add-to-playlist"}
        filled={inPlaylist}
        className="h-5 w-5 sm:h-6 sm:w-6"
        color={inPlaylist ? "#82ca9e90" : "currentColor"}
      />
    </Button>
  );
};

export const CommentToolbar = ({ userName, storyId, scriptId, setCommentCount }: InteractionToolbarProps) => {
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();
  const [userAvatars, setUserAvatars] = useState<{ [key: string]: string }>({});

  const addCommentMutation = useMutation({
    mutationFn: (newComment: string) =>
      dbApi.updateInteraction(userName, storyId || null, scriptId || null, "comment", newComment),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", storyId || scriptId],
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCommentMutation.mutate(comment);
    setComment("");
  };

  const { data: commentsData, error: commentsError } = useQuery({
    queryKey: ["comments", storyId || scriptId],
    queryFn: async () => {
      const comments = await dbApi.queryCollection(
        "interactions",
        {
          interaction_type: "comment",
          ...(scriptId ? { script_id: scriptId } : { story_id: storyId }),
        },
        10,
        "created_at",
        "desc"
      );
      return comments as Comment[];
    },
    enabled: !!scriptId || !!storyId,
  });

  useEffect(() => {
    if (commentsData) {
      const fetchUserAvatars = async () => {
        const avatars: { [key: string]: string } = {};
        for (const comment of commentsData) {
          if (!avatars[comment.userName]) {
            const condition = { userName: comment.userName };
            const user = (await dbApi.queryCollection("users", condition, 1)) as UserType[];
            if (user.length > 0) {
              avatars[comment.userName] = user[0].avatar || "";
            }
          }
        }
        setUserAvatars(avatars);
      };

      fetchUserAvatars();
    }
  }, [commentsData]);

  useEffect(() => {
    if (commentsData && setCommentCount) {
      setCommentCount(commentsData.length); // 更新評論數量
    }
  }, [commentsData, setCommentCount]);

  if (commentsError) {
    return <div>Error: {commentsError.message}</div>;
  }

  const comments = commentsData ? commentsData : [];

  return (
    <>
      <section className="flex items-start justify-center flex-col ">
        {userName ? (
          <form onSubmit={handleSubmit} className="w-full text-right my-4">
            <Textarea
              variant="bordered"
              labelPlacement="outside"
              placeholder="Leave a comment"
              minRows={comment ? 3 : 1}
              maxRows={5}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="flex justify-end h-8 mb-4 gap-1">
              {comment && (
                <>
                  <Button
                    size="sm"
                    radius="sm"
                    variant="flat"
                    className="my-2 bg-transparent"
                    onClick={() => setComment("")}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" radius="sm" color="primary" type="submit" className="my-2">
                    Comment
                  </Button>
                </>
              )}
            </div>
          </form>
        ) : (
          <div className="h-12 my-2">
            <Button
              as={Link}
              href="/login"
              size="md"
              color="primary"
              radius="full"
              variant="ghost"
              startContent={<IoCreateOutline size={20} />}
            >
              Add a comment
            </Button>
          </div>
        )}
        <h2 className="text-lg mb-4"> Comments</h2>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} avatar={userAvatars[comment.userName]} />
          ))
        ) : (
          <p>No comments yet</p>
        )}
      </section>
    </>
  );
};

export const CommentItem = ({ comment, avatar }: { comment: Comment; avatar: string }) => {
  return (
    <div key={comment.id} className="mb-4 pb-3 w-full">
      <div className="flex mb-2 gap-3 justify-between">
        <User
          name={comment.userName}
          description={
            comment.created_at && typeof comment.created_at !== "string"
              ? new Date(comment.created_at.seconds * 1000).toLocaleString()
              : comment.created_at
          }
          avatarProps={{
            src: avatar,
            size: "sm",
            name: comment.userName,
          }}
        />
      </div>
      <p className="text-default-900 whitespace-pre-wrap break-words">{comment.comment}</p>{" "}
      <Divider className="my-2 " />
    </div>
  );
};
