"use client"

import path from "path"
import type { schema } from "@/app/api/chat/schema"
import { findCommonAncestor } from "@/app/t/read/findCommonAncestor"
import { system } from "@/app/t/read/prompts"
import { Input } from "@/components/ui/input"
import { openai } from "@ai-sdk/openai"
import { filter, identity, map, pipe, toArray, uniqBy } from "@fxts/core"
import { Readability } from "@mozilla/readability"
import { generateObject, generateText, tool } from "ai"
import { experimental_useObject as useObject } from "ai/react"
import { getCssSelector } from "css-selector-generator"
import { useState } from "react"
import { useForm } from "react-hook-form"
import type { z } from "zod"

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

    const doc = new DOMParser().parseFromString(text, "text/html")

    const isCloudflareBlock =
      doc.querySelector("title")?.textContent === "Just a moment..."

    if (isCloudflareBlock) {
      console.error("Cloudflare block")
      return
    }

    console.log(doc)

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
      .filter((k) => k.children.length > 0)
      .map((k) => k.remove())

    const links = pipe(
      [...doc.querySelectorAll(`a`)],
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
      uniqBy((k) => k.getAttribute("href")),
      filter((k) => k.getAttribute("href") !== "/"),
      filter(
        (k) =>
          !(
            (k.getAttribute("href")?.startsWith("http") &&
              new URL(k.href).host.replace("www.", "") !==
                new URL(url).host.replace("www.", "")) ||
            k.getAttribute("href")?.includes("mailto:") ||
            k.getAttribute("href")?.includes("tel:") ||
            k.getAttribute("href")?.includes("javascript:") ||
            k.getAttribute("href")?.startsWith("#") ||
            k.pathname.replace(/\/$/, "") ===
              new URL(url).pathname.replace(/\/$/, "") ||
            k.pathname === "/"
          ),
      ),
      map(
        (k) =>
          [
            k,
            (() => {
              const fk = flat(k)

              const headings = fk.filter((k) =>
                ["H1", "H2", "H3", "H4"].includes(k.tagName),
              )

              if (headings.length > 0) {
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
      ),
      toArray,
    )

    const md = links
      .map(
        ([a, k]) =>
          // `[${k}](https://${path.join(new URL(url).hostname, a.getAttribute("href")!)})`,
          `[${k}](${new URL(a.getAttribute("href")!).pathname})`,
      )
      .slice(0, 100)
      .join("\n")

    setMd(md)

    const result = await fetch(`/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: md,
      }),
    }).then<z.infer<typeof schema>>((res) => res.json())

    const { first3, last3 } = result

    console.log(JSON.stringify(result, null, 2))

    const firstPostURL = `${new URL(url).origin}${first3[0].pathname}`

    const firstPostText = await fetch(`/t/p?url=${firstPostURL}`).then((res) =>
      res.text(),
    )

    const docu = new DOMParser().parseFromString(firstPostText, "text/html")

    const title = new Readability(docu).parse()?.title ?? "??"
    const title2 = docu.querySelector("title")?.textContent ?? "??"
    const title3 = first3[0].title

    setTitle(
      JSON.stringify(
        {
          mozila: title,
          title: title2,
          ai: title3,
        },
        null,
        2,
      ),
    )

    const newDoc = doc.cloneNode(true) as Document

    const As = pipe(
      [...newDoc.querySelectorAll(`a`)],
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
      uniqBy((k) => k.getAttribute("href")),
      filter((k) => k.getAttribute("href") !== "/"),
      filter(
        (k) =>
          !(
            (k.getAttribute("href")?.startsWith("http") &&
              new URL(k.href).host.replace("www.", "") !==
                new URL(url).host.replace("www.", "")) ||
            k.getAttribute("href")?.includes("mailto:") ||
            k.getAttribute("href")?.includes("tel:") ||
            k.getAttribute("href")?.includes("javascript:") ||
            k.getAttribute("href")?.startsWith("#") ||
            k.pathname.replace(/\/$/, "") ===
              new URL(url).pathname.replace(/\/$/, "") ||
            k.pathname === "/"
          ),
      ),
      map(
        (k) =>
          [
            k,
            (() => {
              const fk = flat(k)

              const headings = fk.filter((k) =>
                ["H1", "H2", "H3", "H4"].includes(k.tagName),
              )

              if (headings.length > 0) {
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
      ),
      map((k) => k[0]),
      toArray,
    )

    console.log(As.map((k) => k.href).join("\n"))

    const targets = pipe(
      [
        As.find((k) => new URL(k.href).pathname === first3[0]?.pathname),
        As.find((k) => new URL(k.href).pathname === first3[1]?.pathname),
        As.find((k) => new URL(k.href).pathname === first3[2]?.pathname),
        As.find((k) => new URL(k.href).pathname === last3[0]?.pathname),
        As.find((k) => new URL(k.href).pathname === last3[1]?.pathname),
        As.find((k) => new URL(k.href).pathname === last3[2]?.pathname),
      ],
      filter((a) => !!a),
      toArray,
    )

    ![...newDoc.querySelectorAll(`a`)]
      .filter((a) => !targets.includes(a))
      .map((a) => {
        a.remove()
      })

    const root = findCommonAncestor(targets, newDoc)

    console.log(root)

    const rootSel = getCssSelector(root!, { root: newDoc })

    let selector = getCssSelector(targets, {
      root: root as ParentNode,
      selectors: ["class"],
      includeTag: true,
    })

    const finalSelector = `${rootSel} ${selector}${
      targets[0].className === "" ? `:not([class])` : ""
    }`

    console.log(finalSelector)

    const els = pipe(
      [...doc.querySelectorAll<HTMLAnchorElement>(finalSelector)],
      filter((k) => k.href),
      filter(
        (k) =>
          new URL(k.href).host.replace("www.", "") ===
          new URL(url).host.replace("www.", ""),
      ),
      uniqBy((k) => k.href),
      filter(
        (k) =>
          new URL(k.href).pathname.split("/").length >=
          new URL(firstPostURL).pathname.split("/").length,
      ),
      toArray,
    )

    console.log(els.map((k) => k.href).join("\n"))
  })

  return (
    <form
      className="m-2 flex max-w-full flex-col gap-4 p-2"
      onSubmit={onSubmit}
    >
      <Input
        {...register("url", { required: true })}
        placeholder="https://example.com"
      />
      {isSubmitting ? (
        <div>Loading...</div>
      ) : (
        <div className="flex max-w-full flex-col gap-2 overflow-x-hidden whitespace-pre-wrap text-xs">
          <div className="flex flex-1 flex-col gap-4 break-words">
            <span>{title}</span>
          </div>
          <div className="flex-1 break-words">{md}</div>
        </div>
      )}
    </form>
  )
}
