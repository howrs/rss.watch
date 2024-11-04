import { fromEntries, map, pipe, toArray } from "@fxts/core"
import { allPrompts } from "content-collections"

const prompts = pipe(
  allPrompts,
  map(
    (p) =>
      [
        p._meta.fileName.replace(`.${p._meta.extension}`, ""),
        p.content,
      ] as const,
  ),
  fromEntries,
)

export const system = prompts["system"]
