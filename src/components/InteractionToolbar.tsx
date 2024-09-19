import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import dbApi from "../utils/firebaseService";

interface InteractionToolbarProps {
  userId: string;
  storyId?: string;
  scriptId?: string;
}

export const InteractionToolbar = ({ userId, storyId, scriptId }: InteractionToolbarProps) => {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: () => dbApi.updateInteraction(userId, storyId || null, scriptId || null, "like"),
    onMutate: async () => {
      const previousLiked = liked;
      setLiked((prev) => !prev);
      return { previousLiked };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["interactions", userId, storyId || scriptId],
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: () => dbApi.updateInteraction(userId, storyId || null, scriptId || null, "bookmarked"),
    onMutate: async () => {
      setBookmarked((prev) => !prev);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["interactions", userId, storyId || scriptId],
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

export const CommentToolbar = ({ userId, storyId, scriptId }: InteractionToolbarProps) => {
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();

  const addCommentMutation = useMutation({
    mutationFn: (newComment: string) =>
      dbApi.updateInteraction(userId, storyId || null, scriptId || null, "comment", newComment),
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

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Leave a comment"
      ></textarea>
      <button type="submit">Submit</button>
    </form>
  );
};
