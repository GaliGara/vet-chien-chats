"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      richColors
      position="top-center"
      toastOptions={{
        style: {
          borderRadius: "18px",
          borderColor: "#E8D6DE",
          background: "#FFFDFB",
          color: "#2F2433",
        },
      }}
    />
  );
}
