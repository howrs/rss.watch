import { customAlphabet } from "nanoid"
import { v7 as uid } from "uuid"

export const uuid = () => uid().replaceAll("-", "")

const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz"

export const nanoid = (len = 5) => customAlphabet(alphabet, len)()
