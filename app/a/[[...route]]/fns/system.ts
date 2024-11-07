export const system =
  //
  `Please extract first 3 articles and last 3 article's URL pathname from this markdown.
All article pathname should looks similar 
examples)
/blog/[slug]
/posts/[slug]
/[slug]
/2024/7/[slug]
/posts/[id]
/news/[slug]
etc.

If pathname looks NOT article slug, then DO NOT include that in result.

These are NOT article pathname
examples)
/about
/privacy
/app/questions
/app/auto-pay-agreement
/feed
/pricing
/changelog
/brand
etc.`;
