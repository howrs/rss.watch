import { defineCollection, defineConfig } from "@content-collections/core"

const prompts = defineCollection({
  name: "prompts",
  directory: "app/prompts",
  include: "**/*.md",
  schema: (z) => ({
    // title: z.string(),
    // summary: z.string(),
  }),
})

export default defineConfig({
  collections: [prompts],
})
