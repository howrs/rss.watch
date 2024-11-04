"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useRCache } from "@/hooks/useRCache"
import { cn } from "@/lib/utils"
import {
  type Edge,
  attachClosestEdge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge"
import { DropIndicator } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box"
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine"
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { pointerOutsideOfPreview } from "@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview"
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview"
import type { Feed } from "@prisma/client"
import { Image } from "components/Image"
import { ExternalLinkIcon, SendHorizontal, Trash } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import type { DeepReadonlyObject } from "replicache"

type Props = {
  k: string
  i: number
  feed: DeepReadonlyObject<Omit<Feed, "createdAt" | "updatedAt">>
}

type DraggableState =
  | { type: "idle" }
  | { type: "preview"; container: HTMLElement }
  | { type: "dragging" }

const idleState: DraggableState = { type: "idle" }
const draggingState: DraggableState = { type: "dragging" }

export function FeedItem({ k, i, feed }: Props) {
  const { m } = useRCache()

  const ref = useRef<HTMLLIElement>(null)

  const [closestEdge, setClosestEdge] = useState<Edge | null>(null)

  const [draggableState, setDraggableState] =
    useState<DraggableState>(idleState)

  useEffect(() => {
    const element = ref.current!

    return combine(
      draggable({
        element,
        getInitialData: () => feed,

        onGenerateDragPreview({ nativeSetDragImage }) {
          setCustomNativeDragPreview({
            nativeSetDragImage,
            getOffset: pointerOutsideOfPreview({
              x: "10px",
              y: "5px",
            }),
            render({ container }) {
              setDraggableState({ type: "preview", container })

              return () => setDraggableState(draggingState)
            },
          })
        },
        onDragStart() {
          setDraggableState(draggingState)
        },
        onDrop() {
          setDraggableState(idleState)
        },
      }),
      dropTargetForElements({
        element,
        getData({ input }) {
          return attachClosestEdge(feed, {
            element,
            input,
            allowedEdges: ["top", "bottom"],
          })
        },
        onDrag({ self, source }) {
          const isSource = source.element === element

          if (isSource) {
            setClosestEdge(null)
            return
          }

          const closestEdge = extractClosestEdge(self.data)

          const sourceIndex = source.data.index as number

          const isItemBeforeSource = i === sourceIndex - 1
          const isItemAfterSource = i === sourceIndex + 1

          const isDropIndicatorHidden =
            (isItemBeforeSource && closestEdge === "bottom") ||
            (isItemAfterSource && closestEdge === "top")

          if (isDropIndicatorHidden) {
            setClosestEdge(null)
            return
          }

          setClosestEdge(closestEdge)
        },
        onDragLeave() {
          setClosestEdge(null)
        },
        onDrop() {
          setClosestEdge(null)
        },
      }),
    )
  }, [])

  const host = new URL(`https://${feed.value}`).host

  return (
    <>
      <li
        ref={ref}
        className={cn(
          "relative flex w-full items-center justify-start gap-2 rounded p-2 px-2 text-sm",
          draggableState.type === "dragging" && "opacity-40",
        )}
      >
        <div
          className={cn(
            "h-6 w-0.5 rounded-3xl bg-green-500 transition",
            typeof feed.enabled === "boolean"
              ? feed.enabled
                ? "bg-green-500"
                : "bg-red-500"
              : "",
          )}
        />
        <div className="group flex h-full flex-1 items-center">
          <Image
            key={`https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${host}&size=64`}
            src={`https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${host}&size=64`}
            className="pointer-events-none h-5 w-5 rounded"
            width={64}
            height={64}
            alt={host}
          />
          <span className="ml-2 line-clamp-1 select-none break-all text-sm">
            {feed.value}
          </span>
          <a
            href={`http://${feed.value}`}
            target="_blank"
            className="group ml-1 flex aspect-square h-6 w-6 items-center justify-center"
            rel="noreferrer noopener"
          >
            <ExternalLinkIcon className="h-3 w-3 opacity-0 transition duration-150 group-hover:opacity-50" />
          </a>
        </div>
        <Switch
          defaultChecked
          checked={feed.enabled}
          onCheckedChange={(enabled) => {
            m.putFeed({ ...feed, enabled })
          }}
        />
        <Button
          className="h-6 w-6 cursor-default"
          variant="ghost"
          size="icon"
          onClick={async (e) => {}}
        >
          <SendHorizontal className="h-4 w-4" />
        </Button>
        <Button
          className="h-6 w-6 cursor-default"
          variant="ghost"
          size="icon"
          onClick={(e) => {
            m.delFeed(k)
          }}
        >
          <Trash className="h-4 w-4" />
        </Button>
        {closestEdge && <DropIndicator edge={closestEdge} />}
      </li>
      {draggableState.type === "preview" &&
        createPortal(<Badge>{feed.value}</Badge>, draggableState.container)}
    </>
  )
}
