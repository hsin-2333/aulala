import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import dbApi from "../utils/firebaseService";

interface InteractionToolbarProps {
  userId: string;
  storyId?: string;
  scriptId?: string;
}

const InteractionToolbar = ({ userId, storyId, scriptId }: InteractionToolbarProps) => {
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

export default InteractionToolbar;
