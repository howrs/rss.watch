import { f } from "@/app/a/[[...route]]/fns/f"
import { findCommonAncestor } from "@/app/a/[[...route]]/fns/findCommonAncestor"
import { flat } from "@/app/a/[[...route]]/fns/flat"
import { MAX_ITEMS } from "@/app/a/[[...route]]/fns/getFeedFromURL"
import { removeUnnecessaryTags } from "@/app/a/[[...route]]/fns/removeUnnecessaryTags"
import { schema } from "@/app/a/[[...route]]/fns/schema"
import { system } from "@/app/a/[[...route]]/fns/system"
import { openai } from "@ai-sdk/openai"
import {
  concurrent,
  filter,
  map,
  pipe,
  slice,
  toArray,
  toAsync,
  uniq,
  uniqBy,
} from "@fxts/core"
import { Readability } from "@mozilla/readability"
import { generateObject } from "ai"
import { getCssSelector } from "css-selector-generator"
import { parseHTML } from "linkedom/worker"

type Params = {
  url: string
  text: string
  hash: string
  // sel?: string | null
}

const getDoc = (text: string) => {
  return parseHTML(text).document
}

export const getFeedFromHtml = async ({ url, text, hash }: Params) => {
  const doc = getDoc(text)

  const title = doc.title

  removeUnnecessaryTags(doc)

  doc.querySelector(`a[href="/"]`)?.remove()

  ![...doc.querySelectorAll(`a`)]
    .filter((k) => k.textContent?.trim() === "")
    .filter((k) => k.children.length > 0)
    .map((k) => k.remove())

  const links = pipe(
    [...doc.querySelectorAll(`a`)],
    filter((k) => !!k.href),
    // map((k) => {
    //   k.setAttribute(
    //     "href",
    //     k.getAttribute("href")?.startsWith("http")
    //       ? k.getAttribute("href")!
    //       : `https://${new URL(url).hostname}${k.getAttribute("href")!}`,
    //   )
    //   return k
    // }),
    // map((k) => k.href),
    filter((k) => k.pathname !== "/"),
    map((k) => {
      k.href = k.href.startsWith("http")
        ? new URL(k.href).href.replace(/\/$/, "")
        : new URL(k.href, url).href.replace(/\/$/, "")
      return k
    }),
    uniqBy((k) => k.href),
    filter(
      (k) =>
        !(
          (
            (k.href.startsWith("http") &&
              new URL(k.href).host.replace("www.", "") !==
                new URL(url).host.replace("www.", "")) ||
            k.href.includes("mailto:") ||
            k.href.includes("tel:") ||
            k.href.includes("javascript:")
          )
          // k.pathname?.replace(/\/$/, "") ===
          //   new URL(url).pathname?.replace(/\/$/, "") ||
          // k.pathname === "/"
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
        `[${k}](${new URL(a.href).pathname})`,
    )
    .slice(0, 100)
    .join("\n")

  console.log(md)

  const result = await generateObject({
    model:
      //
      // openai("gpt-4o"),
      openai("gpt-4o-mini"),
    // google(`gemini-1.5-flash-002`, { structuredOutputs: false }),
    // google(`gemini-1.5-pro-002`, { structuredOutputs: false }),
    // output: "array",
    schema,
    prompt: `\`\`\`md\n${md}\`\`\`\n\n${system}`,
  })

  const { first3, last3 } = result.object

  console.log(`AI: ${url}`)
  console.log(result.object)

  if (first3.length === 0) {
    return {
      sel: undefined,
      json: {
        title,
        url: url.startsWith("http")
          ? url
          : `https://${new URL(url).host}${url}`,
        items: [],
      },
    }
  }

  const firstPostURL = `${new URL(url).origin}${first3[0].pathname}`

  // const firstPostText = await fetch(`/t/p?url=${firstPostURL}`).then((res) =>
  //   res.text()
  // );

  // const docu = new DOMParser().parseFromString(firstPostText, "text/html");

  // const title = new Readability(docu).parse()?.title ?? "??";
  // const title = docu.querySelector("title")?.textContent ?? "??";
  // const title3 = first3[0].title;

  const newDoc = doc.cloneNode(true) as Document

  const As = pipe(
    [...newDoc.querySelectorAll(`a`)],
    filter((k) => k.href),
    // map((k) => {
    //   k.setAttribute(
    //     "href",
    //     k.getAttribute("href")?.startsWith("http")
    //       ? k.getAttribute("href")!
    //       : `https://${new URL(url).hostname}${k.getAttribute("href")!}`,
    //   )
    //   return k
    // }),
    filter((k) => k.pathname !== "/"),
    map((k) => {
      k.href = k.href.startsWith("http")
        ? new URL(k.href).href.replace(/\/$/, "")
        : new URL(k.href, url).href.replace(/\/$/, "")
      return k
    }),
    uniqBy((k) => k.href),
    filter(
      (k) =>
        !(
          (
            (k.href.startsWith("http") &&
              new URL(k.href).host.replace("www.", "") !==
                new URL(url).host.replace("www.", "")) ||
            k.href.includes("mailto:") ||
            k.href.includes("tel:") ||
            k.href.includes("javascript:")
          )
          // k.pathname?.replace(/\/$/, "") ===
          //   new URL(url).pathname?.replace(/\/$/, "") ||
          // k.pathname === "/"
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

  let rootSel = getCssSelector(root!, { root: newDoc })

  rootSel = rootSel.includes(":nth-") ? "body" : rootSel

  let selector = getCssSelector(targets, {
    root: root as ParentNode,
    selectors: ["class"],
    includeTag: true,
  })

  const finalSelector =
    first3.length === 1
      ? `${selector}${targets[0].className === "" ? `:not([class])` : ""}`
      : selector.includes(":nth-")
        ? `${rootSel} a.${
            targets[0].className === "" ? `:not([class])` : targets[0].className
          }`
        : `${rootSel} ${selector}${
            targets[0].className === "" ? `:not([class])` : ""
          }`

  const els = await pipe(
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
    slice(0, MAX_ITEMS),
    toAsync,
    map(async (k) => {
      const txt = (await f(k.href))._data!

      const doc = getDoc(txt)

      const title = new Readability(doc).parse()?.title ?? doc.title

      return {
        title,
        url: k.href,
      }
    }),
    concurrent(MAX_ITEMS),
    toArray,
  )

  if (first3.length === 1) {
    return {
      sel: finalSelector,
      json: {
        title,
        url,
        items: [
          {
            title: first3[0].title,
            url: `https://${new URL(url).host}${first3[0].pathname}`,
          },
        ],
      },
    }
  }

  console.log({ rootSel, finalSelector })

  return {
    sel: finalSelector,
    json: {
      title,
      url: url.startsWith("http") ? url : `https://${new URL(url).host}${url}`,
      items: els,
    },
  }
}
