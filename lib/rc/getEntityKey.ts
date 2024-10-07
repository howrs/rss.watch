export const getEntityKey = (entity: any) => {
  if (!("id" in entity)) {
    throw new Error("id is required")
  }

  if ("parentId" in entity) {
    return `channel/${entity.id}`
  }
  if ("value" in entity) {
    return `feed/${entity.id}`
  }
  if ("avatar" in entity) {
    return `user/${entity.id}`
  }
  if ("url" in entity) {
    return `webhook/${entity.id}`
  }

  throw new Error("Unknown entity")
}
