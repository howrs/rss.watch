import { isStandalone } from "@/app/a/[[...route]]/fns/isStandalone"

type FeedInfo = {
  title: string
  link: string
  items: FeedItem[]
}

type FeedItem = {
  title: string
  link: string
}

export const getFeedData = async (url: string): Promise<FeedInfo> => {
  if (isStandalone(url)) {
    // Check cached site (from github)
    // Fetch the site
  }
}
