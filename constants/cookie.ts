import { APP_NAME } from "constants/urls"

export const COOKIE_PREFIX = APP_NAME

export const COOKIE = {
  USER_ID: `${COOKIE_PREFIX}:user_id`,
  TOKEN: `${COOKIE_PREFIX}:token`,
} as const
