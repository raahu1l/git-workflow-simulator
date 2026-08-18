"use client";

import { useState } from "react";

import AlexIntro from "./AlexIntro";

export default function SessionIntro({
  message,
  emotion = "talking",
  actions = null,
}) {
  const [showIntro, setShowIntro] = useState(true);

  if (!showIntro) {
    return null;
  }

  const handleAction = (action) => {
    if (action.onClick) {
      action.onClick();
    }

    setShowIntro(false);
  };

  const resolvedActions = actions
    ? actions.map((action) => ({
        ...action,
        onClick: () => handleAction(action),
      }))
    : null;

  return (
    <AlexIntro
      name="Alex"
      emotion={emotion}
      message={message}
      onContinue={() => setShowIntro(false)}
      actions={resolvedActions}
    />
  );
}