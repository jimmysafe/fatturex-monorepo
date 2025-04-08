"use client";

import { useEffect } from "react";

export function ImpersonatingOverlay(props: { active: boolean }) {
  useEffect(() => {
    if (props.active)
      window.document.body.style.border = "3px solid red";
    else window.document.body.style.border = "none";

    return () => {
      window.document.body.style.border = "none";
    };
  }, [props.active]);

  return (
    <></>
  );
}
