import { z } from "zod"

const articleSchema = z.object({
  pathname: z
    .string()
    .describe(
      "Pathname of the article. All pathname should looks similar form.",
    ),
  title: z
    .string()
    .describe("Title of the article. If no title, return empty string."),
})

export const schema = z.object({
  first3: z.array(articleSchema).describe("First 3 articles."),
  last3: z.array(articleSchema).describe("Last 3 article."),
})
