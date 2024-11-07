import "./html-collection"

import { Node, NodeList } from "linkedom/worker"
import { isServer } from "utils/isServer"

if (isServer()) {
  ;(globalThis as any).NodeList = NodeList
  // ;(globalThis as any).HTMLCollection = HTMLCollection
  ;(globalThis as any).Node = Node
  ;(globalThis as any).CSS = false
}
