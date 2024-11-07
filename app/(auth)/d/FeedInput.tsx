"use client"

import { useFeedInput } from "@/app/(auth)/d/useFeedInput"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"

export const FeedInput = () => {
  const { form, onSubmit } = useFeedInput()

  const { register } = form

  return (
    <Form {...form}>
      <form
        onSubmit={onSubmit}
        className="sticky top-20 z-50 flex gap-1.5 bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <Input
          {...register("url")}
          placeholder="example.com"
          className="flex-1 text-xs"
          autoComplete="off"
        />
        <Button className="" size="icon" variant="ghost">
          <Plus className="h-5 w-5" />
        </Button>
      </form>
    </Form>
  )
}
