export const getFaviconURLFromHost = (host: string, size = 64) =>
  // `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${host}&size=${size}`

  `https://www.google.com/s2/favicons?domain=https://${host}&sz=${size}`
// `https://plausible.io/favicon/sources/${host}`
