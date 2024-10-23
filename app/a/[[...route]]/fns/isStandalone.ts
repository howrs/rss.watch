import { parse } from "tldts"

// Check if the given url is a standalone page and not the platform url (e.g. youtube.com, twitter.com, substack.com, etc.)
export const isStandalone = (url: string) => {
  const { pathname, hostname } = new URL(url)
  const { domain, subdomain } = parse(url)

  if (!domain) {
    throw new Error(`Invalid URL: ${url}`)
  }

  if (PLATFORMS[hostname] && pathname === "/") {
    return true
  }

  if (PLATFORMS[hostname] && pathname === "/blog") {
    return true
  }

  if (PLATFORMS[domain] && subdomain === "blog") {
    return true
  }

  return false
}

const PLATFORMS: { [key: string]: boolean } = {
  // US
  // Video
  "youtube.com": true,
  "twitch.tv": true,
  "vimeo.com": true,

  // SNS
  "x.com": true,
  "tiktok.com": true,
  "instagram.com": true,
  "facebook.com": true,
  "threads.net": true,
  "mastodon.social": true,
  "bsky.app": true,
  "linkedin.com": true,
  "reddit.com": true,

  // Blog / Newsletter
  "substack.com": true,
  "medium.com": true,
  "tumblr.com": true,
  "t.me": true,

  // KR
  // Video

  // SNS

  // Blog / Newsletter
  "brunch.co.kr": true,
  "blog.naver.com": true,
  "maily.so": true,
  "disquiet.com": true,
  "velog.io": true,
}
