"use client"

import { FeedItem } from "@/app/d/FeedItem"
import { client } from "@/components/QueryProvider"
import { StatusBar } from "@/components/StatusBar"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useFeeds } from "@/hooks/useFeeds"
import { useRCache } from "@/hooks/useRCache"
import { useSearchParam } from "@/hooks/useSearchParams"
import { useSyncing } from "@/hooks/useSyncing"
import { uuid } from "@/utils/ids"
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge"
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index"
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { map, max } from "@fxts/core"
import { pipe } from "@fxts/core"
import { valibotResolver } from "@hookform/resolvers/valibot"
import type { Feed } from "@prisma/client"
import { useNetworkState } from "@uidotdev/usehooks"
import { Plus, Trash } from "lucide-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { type InferInput, object, string } from "valibot"

const formSchema = object({
  url: string(),
})

type FormSchema = InferInput<typeof formSchema>

export default function Page() {
  const { r, m } = useRCache()

  const { online } = useNetworkState()
  const { syncing } = useSyncing()

  useEffect(() => {
    !(async () => {
      const isOffline = client.getQueryData<boolean>(["isOffline"])

      if (isOffline && online) {
        const hasMutations = (await r.experimentalPendingMutations()).length > 0

        if (hasMutations) {
          client.setQueryData(["isOffline"], false)
          r.push({ now: true })
        }
      }
    })()
  }, [online])

  const form = useForm<FormSchema>({
    resolver: valibotResolver(formSchema),
    defaultValues: {
      url: "",
    },
  })
  const { handleSubmit, register, setValue } = form

  const { c } = useSearchParam()

  const { feeds } = useFeeds()

  const onSubmit = handleSubmit(async ({ url }) => {
    const value = (url.startsWith("http") ? url : `https://${url}`)
      .replace(/https?:\/\//, "")
      .replace("www.", "")

    if (value.split(".").filter((v) => !!v).length < 2) {
      return
    }

    m.putFeed({
      id: uuid(),
      value,
      channelId: c,
      order:
        feeds.length === 0
          ? 0
          : pipe(
              feeds,
              map(([, feed]) => feed.order),
              max,
              (max) => max + 2 ** 10,
            ),
    })

    setValue("url", "")
  })

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
  }, [feeds])

  return (
    <main className="flex flex-1 flex-col">
      <StatusBar />
      <div className="flex flex-1 flex-col">
        <Form {...form}>
          <form onSubmit={onSubmit} className="flex gap-1.5 p-2">
            <Input
              {...register("url")}
              placeholder="https://example.com"
              className="flex-1"
              autoComplete="off"
            />
            <Button className="" size="icon" variant="ghost">
              <Plus className="h-5 w-5" />
            </Button>
          </form>
        </Form>
        <ol className="flex flex-1 flex-col overflow-x-hidden">
          {feeds.map(([k, feed], i) => (
            <FeedItem key={k} k={k} i={i} />
          ))}
        </ol>
        {/* <div className="flex h-12 gap-4">
          {!online && (
            <div>
              <CloudOff />
            </div>
          )}
          {online && syncing && <div>Syncing...</div>}
        </div> */}
      </div>
    </main>
  )
}
