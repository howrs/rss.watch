"use client"

import { FeedItem } from "@/app/(auth)/d/FeedItem"
import { useFeeds } from "@/hooks/useFeeds"
import { m } from "@/lib/rc/RC"
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge"
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index"
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import type { Feed } from "@prisma/client"
import { useEffect } from "react"

export function FeedList() {
  const { feeds } = useFeeds()

  useEffect(() => {
    return monitorForElements({
      onDrop({ location, source }) {
        const target = location.current.dropTargets[0]

        if (!target) {
          return
        }

        const sourceData = source.data as Feed
        const targetData = target.data as Feed

        const sourceRef = feeds.find(
          ([, feed]) => feed.id === sourceData.id,
        )?.[1]

        const targetRef = feeds.find(
          ([, feed]) => feed.id === targetData.id,
        )?.[1]

        if (!targetRef) {
          console.error("targetRef not found")
          return
        }

        if (!sourceRef) {
          console.error("soureRef not found")
          return
        }

        const indexOfTarget = feeds.findIndex(
          ([, feed]) => feed.id === targetData.id,
        )
        const indexOfSource = feeds.findIndex(
          ([, feed]) => feed.id === sourceData.id,
        )
        if (indexOfTarget < 0) {
          return
        }

        // top or bottom
        const closestEdgeOfTarget = extractClosestEdge(targetData)

        const finishIndex = getReorderDestinationIndex({
          startIndex: indexOfSource,
          closestEdgeOfTarget,
          indexOfTarget,
          axis: "vertical",
        })

        if (finishIndex === indexOfSource) {
          return
        }

        // calculate the new order
        const prevData =
          indexOfTarget === 0
            ? null
            : closestEdgeOfTarget === "top"
              ? feeds[indexOfTarget - 1]?.[1]
              : targetRef

        const nextData =
          indexOfTarget === feeds.length - 1
            ? null
            : closestEdgeOfTarget === "bottom"
              ? feeds[indexOfTarget + 1]?.[1]
              : targetRef

        const newOrder =
          prevData && nextData
            ? (prevData.order + nextData.order) / 2
            : !prevData && nextData
              ? nextData.order + 2 ** 10
              : prevData && !nextData
                ? prevData.order - 2 ** 10
                : 0

        m.putFeed({
          ...sourceRef,
          order: newOrder,
        })
      },
    })
  }, [feeds, m])

  return (
    <ol className="flex flex-1 flex-col">
      {feeds.map(([k, feed], i) => (
        <FeedItem key={k} k={k} i={i} feed={feed} />
      ))}
    </ol>
  )
}
