import { useState, useEffect } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import dbApi from "../utils/firebaseService";
import { Comment } from "../types";
import Icon from "./Icon";

interface InteractionToolbarProps {
  userName: string;
  storyId?: string;
  scriptId?: string;
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
      <button onClick={() => likeMutation.mutate()} className="flex items-center">
        <Icon name="like" filled={liked} className="mr-2 h-6 w-6" color={liked ? "#fca5a5cc" : "currentColor"} />
      </button>
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
    <button onClick={() => saveMutation.mutate()} className="flex items-center">
      <Icon
        name="bookmarked"
        filled={bookmarked}
        className="mr-2 h-6 w-6"
        color={bookmarked ? "#82ca9e90" : "currentColor"}
      />
    </button>
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
    <button onClick={() => playlistMutation.mutate()} className="flex items-center">
      <Icon
        name={inPlaylist ? "added-to-playlist" : "add-to-playlist"}
        filled={inPlaylist}
        className="mr-2 h-6 w-6"
        color={inPlaylist ? "#82ca9e90" : "currentColor"}
      />
    </button>
  );
};

export const CommentToolbar = ({ userName, storyId, scriptId }: InteractionToolbarProps) => {
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

  if (commentsLoading) {
    return <div>Loading...</div>;
  }

  if (commentsError) {
    return <div>Error: {commentsError.message}</div>;
  }

  const comments = commentsData ? commentsData : [];
  console.log(comments);

  return (
    <>
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Leave a comment"
        ></textarea>
        <button className="flex items-center size-default bg-primary text-white " type="submit">
          Submit
        </button>
      </form>

      <section className="flex items-start justify-center flex-col ">
        <hr className="border-t border-gray-400 m-1" />

        <h2 className="text-lg"> Comments</h2>
        <hr className="border-t border-gray-400 m-1" />

        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="mb-4 border border-gray-600">
              <div className="flex justify-center gap-3">
                <h6 className="text-gray-700">{comment.userName}</h6>
                <h6 className="text-gray-500">
                  {comment.created_at && typeof comment.created_at !== "string"
                    ? new Date(comment.created_at.seconds * 1000).toLocaleString()
                    : comment.created_at}
                </h6>
              </div>
              <p className="text-gray-700">{comment.comment}</p>
            </div>
          ))
        ) : (
          <p>No comments yet</p>
        )}
      </section>
    </>
  );
};
