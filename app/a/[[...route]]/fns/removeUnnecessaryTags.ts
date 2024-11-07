export const unnecessaryTags = [
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

export const removeUnnecessaryTags = (doc: Document) => {
  unnecessaryTags.map((k) =>
    [...doc.querySelectorAll(k)].map((k) => k.remove()),
  )
}
