import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import pagefind from "astro-pagefind";

// https://astro.build/config
export default defineConfig({
  site: "https://bdmendes.com",
  integrations: [
    icon(),
    sitemap(),
    tailwind({
      applyBaseStyles: false,
    }),
    pagefind({
      indexConfig: {
        excludeSelectors: [".pagefind-exclude"],
        forceLanguage: "pt",
      },
    }),
  ],
});
