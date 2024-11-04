import { schema } from "@/app/api/chat/schema"
import { system } from "@/app/t/read/prompts"
import { google } from "@ai-sdk/google"
import { openai } from "@ai-sdk/openai"

import { generateObject, streamObject } from "ai"
import { NextResponse } from "next/server"

export const maxDuration = 30
export const runtime = "edge"

export async function POST(req: Request) {
  const { prompt } = await req.json<any>()

  const result = await generateObject({
    model:
      //
      // openai("gpt-4o"),
      openai("gpt-4o-mini"),
    // google(`gemini-1.5-flash-002`, { structuredOutputs: false }),
    // google(`gemini-1.5-pro-002`, { structuredOutputs: false }),
    // output: "array",
    schema,
    // system,
    prompt: `\`\`\`md\n${prompt}\`\`\`\n\n${system}`,
  })

  return NextResponse.json(result.object)
}
