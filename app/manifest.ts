import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Language Guide",
    short_name: "Language Guide",
    description: "Structured lessons, focused practice, and smart daily review.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#f6f8f7",
    theme_color: "#173f45",
    categories: ["education", "productivity"],
    icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
    shortcuts: [
      { name: "Continue learning", short_name: "Learn", url: "/learn" },
      { name: "Offline lessons", short_name: "Offline", url: "/offline" },
      { name: "Daily review", short_name: "Review", url: "/review" },
    ],
  };
}
