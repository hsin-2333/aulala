import { useState, useEffect } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import dbApi from "../utils/firebaseService";
import { Comment } from "../types";

interface InteractionToolbarProps {
  userName: string;
  storyId?: string;
  scriptId?: string;
}

export const InteractionToolbar = ({ userName, storyId, scriptId }: InteractionToolbarProps) => {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchInteraction = async () => {
      const likeStatus = await dbApi.getInteractionStatus(userName, storyId || null, scriptId || null, "like");
      const bookmarkStatus = await dbApi.getInteractionStatus(
        userName,
        storyId || null,
        scriptId || null,
        "bookmarked"
      );
      setLiked(likeStatus);
      setBookmarked(bookmarkStatus);
    };

    fetchInteraction();
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

  const saveMutation = useMutation({
    mutationFn: () => dbApi.updateInteraction(userName, storyId || null, scriptId || null, "bookmarked"),
    onMutate: async () => {
      setBookmarked((prev) => !prev);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["interactions", userName, storyId || scriptId],
      });
    },
  });

  return (
    <div className="interaction-toolbar">
      <button onClick={() => likeMutation.mutate()}>{liked ? "Unlike" : "Like"}</button>
      <button onClick={() => saveMutation.mutate()}>{bookmarked ? "UnBookmarked" : "Bookmark"}</button>
    </div>
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
        <button type="submit">Submit</button>
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