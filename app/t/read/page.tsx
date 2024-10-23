"use client"

import path from "path"
import { Input } from "@/components/ui/input"
import { filter, map, pipe, toArray, uniqBy } from "@fxts/core"
import { Readability } from "@mozilla/readability"
import { useState } from "react"
import { useForm } from "react-hook-form"

type FormValues = {
  url: string
}

export default function Page() {
  const {
    handleSubmit,
    register,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      url: "",
    },
  })
  const [md, setMd] = useState("")
  const [title, setTitle] = useState("")

  const onSubmit = handleSubmit(async (data) => {
    const url = data.url.startsWith(`https://`)
      ? data.url
      : `https://${data.url}`
    const text = await fetch(`/t/p?url=${url}`).then((res) => res.text())

    // const dom = new JSDOM(text)

    // const doc = dom.window.document
    const doc = new DOMParser().parseFromString(text, "text/html")

    // removes

    const removeTags = [
      "head",
      "style",
      "script",
      "noscript",
      "footer",
      "header",
      "nav",
      "title",
      "img",
      "hr",
      "svg",
      "aside",
      "iframe",
      "video",
      "audio",
      "canvas",
      "map",
      "object",
      "embed",
      "details",
      "figure",
      "dialog",
      "time",
      "input",
      "button",
      "select",
      "textarea",
    ]

    const flat = (node: ChildNode | HTMLElement): HTMLElement[] => {
      let result: HTMLElement[] = []

      // Get the children of the current node
      const children = node.childNodes

      // Loop through each child node
      children.forEach((child) => {
        result.push(child as HTMLElement) // Add the current child to the result array
        result = result.concat(flat(child)) // Recursively flatten child nodes
      })

      return result
    }

    removeTags.map((k) => [...doc.querySelectorAll(k)].map((k) => k.remove()))

    doc.querySelector(`a[href="/"]`)?.remove()

    ![...doc.querySelectorAll(`a`)]
      .filter((k) => k.textContent?.trim() === "")
      .map((k) => k.remove())

    console.log(doc)

    const links = pipe(
      [...doc.querySelectorAll(`a`)],
      uniqBy((k) => k.getAttribute("href")),
      filter((k) => k.href),
      map((k) => {
        k.setAttribute(
          "href",
          k.getAttribute("href")?.startsWith("http")
            ? k.getAttribute("href")!
            : `https://${path.join(new URL(url).hostname, k.getAttribute("href")!)}`,
        )
        return k
      }),
      toArray,
    )
      .filter((k) => k.getAttribute("href") !== "/")
      .filter(
        (k) =>
          !(
            (k.getAttribute("href")?.startsWith("http") &&
              new URL(k.href).host.replace("www.", "") !==
                new URL(url).host.replace("www.", "")) ||
            k.getAttribute("href")?.startsWith("mailto:") ||
            k.getAttribute("href")?.startsWith("tel:") ||
            k.getAttribute("href")?.startsWith("javascript:") ||
            k.getAttribute("href")?.startsWith("#") ||
            k.pathname.replace(/\/$/, "") ===
              new URL(url).pathname.replace(/\/$/, "") ||
            k.pathname === "/"
          ),
      )
      .map(
        (k) =>
          [
            k,
            (() => {
              // if (k.childNodes[0].nodeType === 3) {
              //   return k.childNodes[0].textContent
              // }

              const fk = flat(k)

              const headings = fk.filter((k) =>
                ["H1", "H2", "H3", "H4"].includes(k.tagName),
              )

              if (headings.length > 0) {
                // if (headings[0].childNodes[0].nodeType === 3) {
                //   return headings[0].childNodes[0].textContent?.trim()
                // }

                return flat(headings[0])
                  .filter((k) => k.nodeType === 3)
                  .filter((k) => k.textContent?.trim() !== "")
                  .map((k) => k.textContent?.trim())
                  .join(" | ")
              }

              return fk
                .filter((k) => k.nodeType === 3)
                .filter((k) => k.textContent?.trim() !== "")
                .map((k) => k.textContent?.trim())
                .join(" | ")
            })(),
          ] as const,
      )

    setMd(
      links
        .map(
          ([a, k]) =>
            // `[${k}](https://${path.join(new URL(url).hostname, a.getAttribute("href")!)})`,
            `[${k}](${new URL(a.getAttribute("href")!).pathname})`,
        )
        .slice(0, 100)
        .join("\n"),
    )

    const firstPostURL = links[0][0].getAttribute("href")

    const firstPostText = await fetch(`/t/p?url=${firstPostURL}`).then((res) =>
      res.text(),
    )

    // mozillareadability
    const article = new Readability(
      new DOMParser().parseFromString(firstPostText, "text/html"),
    ).parse()

    if (!article) {
      return
    }

    setTitle(article.title)
  })

  return (
    <form className="m-2 max-w-full p-2" onSubmit={onSubmit}>
      <Input
        {...register("url", { required: true })}
        placeholder="https://example.com"
      />
      {isSubmitting ? (
        <div>Loading...</div>
      ) : (
        <div className="flex max-w-full flex-row gap-2 overflow-x-hidden whitespace-pre-wrap">
          <div className="flex-2 break-words">{md}</div>
          <div className="flex-1 break-words">{title}</div>
        </div>
      )}
    </form>
  )
}
