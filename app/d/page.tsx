"use client"

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
import { valibotResolver } from "@hookform/resolvers/valibot"
import { useNetworkState } from "@uidotdev/usehooks"
import { Plus } from "lucide-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { url, type InferInput, object, pipe, string } from "valibot"

const formSchema = object({
  url: pipe(string(), url()),
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
  const { handleSubmit, register } = form

  const { c } = useSearchParam()

  const { feeds } = useFeeds()

  const onSubmit = handleSubmit(async ({ url }) => {
    m.putFeed({
      id: uuid(),
      value: url.replace(/https?:\/\//, ""),
      channelId: c,
      position: feeds.length,
    })
  })

  return (
    <main className="flex flex-1 flex-col">
      <StatusBar />
      <div className="flex-1">
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
        <div className="flex flex-col">
          {feeds
            .sort(([, a], [, b]) => b.position - a.position)
            .map(([k, feed]) => (
              <Button
                variant="ghost"
                key={k}
                className="flex justify-start gap-1.5 p-2"
                onClick={() => {
                  m.delFeed(k)
                }}
              >
                {feed.value}
              </Button>
            ))}
        </div>
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
