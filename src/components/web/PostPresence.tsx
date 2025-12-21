"use client";
import usePresence from "@convex-dev/presence/react";
import FacePile from "@convex-dev/presence/facepile";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface IPostPresence {
  roomId: Id<"posts">;
  userId: string;
}
function PostPresence({ roomId, userId }: IPostPresence) {
  const presenceState = usePresence(api.presence, roomId, userId);
  if (!presenceState || presenceState.length === 0) {
    return null;
  }
  return (
    <div className="flex items-center gap-2">
      <p className="text-xs uppercase text-muted-foreground tracking-wider">
        Online
      </p>
      <FacePile presenceState={presenceState} />
    </div>
  );
}

export default PostPresence;
