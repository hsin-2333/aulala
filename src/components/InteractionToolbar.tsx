import { useState, useEffect } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import dbApi from "../utils/firebaseService";
import { Comment } from "../types";
import Icon from "./Icon";
import { Textarea, Button, Divider } from "@nextui-org/react";

interface InteractionToolbarProps {
  userName: string;
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
  console.log("storyId", storyId, "scriptId", scriptId);
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
      {/* </button> */}
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
      className="h-5 w-5 sm:h-6 sm:w-6 text-default-900/60 data-[hover]:bg-foreground/10  "
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

  const addCommentMutation = useMutation({
    mutationFn: (newComment: string) =>
      dbApi.updateInteraction(userName, storyId || null, scriptId || null, "comment", newComment),
    onSuccess: () => {
      // 在成功新增留言後，無效化相關的查詢以便重新獲取最新的資料
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

  const {
    data: commentsData,
    error: commentsError,
    isLoading: commentsLoading,
  } = useQuery({
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

  // 使用 useEffect 來監聽 commentsData 的變化
  useEffect(() => {
    if (commentsData && setCommentCount) {
      setCommentCount(commentsData.length); // 更新評論數量
    }
  }, [commentsData, setCommentCount]);

  if (commentsLoading) {
    return <div>Loading...</div>;
  }

  if (commentsError) {
    return <div>Error: {commentsError.message}</div>;
  }

  const comments = commentsData ? commentsData : [];

  return (
    <>
      <section className="flex items-start justify-center flex-col ">
        <h2 className="text-lg"> Comments</h2>
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
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="mb-4 pb-3 w-full">
              <div className="flex  gap-3 justify-between">
                <h6 className="text-small text-default-400">{comment.userName}</h6>
                <h6 className="text-small text-default-400">
                  {comment.created_at && typeof comment.created_at !== "string"
                    ? new Date(comment.created_at.seconds * 1000).toLocaleString()
                    : comment.created_at}
                </h6>
              </div>
              <p className="text-default-900">{comment.comment}</p> <Divider className="my-2 " />
            </div>
          ))
        ) : (
          <p>No comments yet</p>
        )}
      </section>
    </>
  );
};
