import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import pagefind from "astro-pagefind";

export default defineConfig({
  site: "https://bdmendes.com",
  vite: {
    plugins: [
      tailwindcss({
        applyBaseStyles: false,
      }),
    ],
  },
  integrations: [
    icon(),
    sitemap(),
    pagefind({
      indexConfig: {
        excludeSelectors: [".pagefind-exclude"],
        forceLanguage: "pt",
      },
    }),
  ],
});
