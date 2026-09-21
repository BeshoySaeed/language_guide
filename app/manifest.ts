import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Language Guide",
    short_name: "Language Guide",
    description: "Structured lessons, focused practice, and smart daily review.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f8f7",
    theme_color: "#173f45",
    icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}

