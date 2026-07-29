import type { MetadataRoute } from "next";

/** Web app manifest, so the app can be installed to a phone home screen. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Recipe Maker AI",
    short_name: "Recipe AI",
    description:
      "Enter the ingredients in your kitchen and get recipes you can cook right now.",
    start_url: "/",
    display: "standalone",
    background_color: "#f9fafb",
    theme_color: "#4caf50",
    orientation: "portrait-primary",
    categories: ["food", "lifestyle", "utilities"],
    icons: [
      {
        // Inline SVG icon — no binary asset to keep in sync with the brand colour.
        src:
          "data:image/svg+xml," +
          encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="#4CAF50"/><path fill="#fff" d="M256 96c-53 0-96 39.4-96 88 0 30.6 17 57.5 42.7 73.2V336h106.6v-78.8C335 241.5 352 214.6 352 184c0-48.6-43-88-96-88Zm-53.3 272v24c0 13.3 10.7 24 24 24h58.6c13.3 0 24-10.7 24-24v-24H202.7Z"/></svg>`,
          ),
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
