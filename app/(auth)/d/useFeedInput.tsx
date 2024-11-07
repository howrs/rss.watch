import { useFeeds } from "@/hooks/useFeeds"
import { getSearchParams } from "@/hooks/useSearchParams"
import { m } from "@/lib/rc/RC"
import { uuid } from "@/utils/ids"
import { map, max } from "@fxts/core"
import { pipe } from "@fxts/core"
import { valibotResolver } from "@hookform/resolvers/valibot"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { type InferInput, object, string } from "valibot"

const formSchema = object({
  url: string(),
})

type FormSchema = InferInput<typeof formSchema>

export const useFeedInput = () => {
  const form = useForm<FormSchema>({
    resolver: valibotResolver(formSchema),
    defaultValues: {
      url: "",
    },
  })

  const { handleSubmit, setValue } = form

  const { feeds } = useFeeds()

  const onSubmit = handleSubmit(async ({ url }) => {
    const value = (url.startsWith("http") ? url : `https://${url}`)
      .replace(/https?:\/\//, "")
      .replace("www.", "")
      .replace(/\/$/, "")

    if (feeds.some(([, feed]) => feed.value === value)) {
      toast("Feed already exists")
      setValue("url", "")
      return
    }

    if (value.split(".").filter((v) => !!v).length < 2) {
      return
    }

    const { c } = getSearchParams()

    m.putFeed({
      id: uuid(),
      value,
      channelId: c,
      enabled: true,
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

  return {
    form,
    onSubmit,
  }
}
