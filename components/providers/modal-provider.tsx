"use client";

import { useEffect, useState } from "react";
import { AiMentorModal } from "@/components/modals/ai-mentor-modal";
import { CourseCompletedModal } from "@/components/modals/course-completed-modal";

export function ModalProvider() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <AiMentorModal />
      <CourseCompletedModal />
    </>
  );
}
