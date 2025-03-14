import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fatturex",
    short_name: "Fatturex",
    description: "La prima piattaforma che ti permette di gestire le tue fatture ed avere un calcolo preciso delle tasse da pagare.",
    start_url: "/",
    display: "standalone",
    background_color: "#fff",
    theme_color: "#fff",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
