export function findCommonAncestor(
  nodes: HTMLElement[],
  doc: Document,
): HTMLElement | null {
  if (nodes.length === 0) return null
  if (nodes.length === 1) return nodes[0]

  // Function to get the ancestors of a node
  function getAncestors(node: HTMLElement): HTMLElement[] {
    const ancestors: HTMLElement[] = []
    while (node && node !== doc.documentElement) {
      ancestors.push(node)
      // @ts-ignore
      node = node.parentElement!
    }
    return ancestors
  }

  // Get ancestors of the first node
  let commonAncestors = getAncestors(nodes[0])

  // Compare with ancestors of all other nodes
  for (let i = 1; i < nodes.length; i++) {
    const ancestors = getAncestors(nodes[i])

    // Keep only common ancestors
    commonAncestors = commonAncestors.filter((ancestor) =>
      ancestors.includes(ancestor),
    )

    // If there's no common ancestor left, return null
    if (commonAncestors.length === 0) {
      return null
    }
  }

  // Return the lowest common ancestor (the last one in the list)
  return commonAncestors[0]
}
