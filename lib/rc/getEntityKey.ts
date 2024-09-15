export const getEntityKey = (entity: any) => {
  if (!("id" in entity)) {
    throw new Error("id is required")
  }

  if ("position" in entity) {
    return `channel/${entity.id}`
  }
  if ("value" in entity) {
    return `feed/${entity.id}`
  }

  throw new Error("Unknown entity")
}
