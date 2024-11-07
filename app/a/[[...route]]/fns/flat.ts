export const flat = (node: HTMLElement): HTMLElement[] => {
  let result: HTMLElement[] = []

  // Get the children of the current node
  const children = Array.from(node.childNodes)

  // Loop through each child node
  children.map((child) => {
    result.push(child as HTMLElement) // Add the current child to the result array
    result = result.concat(flat(child as HTMLElement)) // Recursively flatten child nodes
  })

  return result
}
