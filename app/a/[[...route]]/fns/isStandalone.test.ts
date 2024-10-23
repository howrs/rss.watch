import { expect, test } from "vitest"
import { isStandalone } from "./isStandalone"

test("isStandalone", () => {
  expect(isStandalone(`https://youtube.com`)).toBe(true)
  expect(isStandalone(`https://youtube.com/blog`)).toBe(true)
  expect(isStandalone(`https://youtube.com/`)).toBe(true)
  expect(isStandalone(`https://youtube.com/@test`)).toBe(false)
  expect(isStandalone(`https://blog.youtube.com`)).toBe(true)
  expect(isStandalone(`https://substack.com`)).toBe(true)
  expect(isStandalone(`https://test.substack.com`)).toBe(false)
  expect(isStandalone(`https://blog.x.com`)).toBe(true)
  expect(isStandalone(`https://x.com`)).toBe(true)
  expect(isStandalone(`https://x.com/test`)).toBe(false)
  expect(isStandalone(`https://blog.naver.com`)).toBe(true)
  expect(isStandalone(`https://blog.naver.com/test`)).toBe(false)
})
