function parseExpiredIn(value) {
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? null : parsed
}

function checkForCode(event) {
  const params = new URLSearchParams(window.location.search)
  const code = params.get("code")
  if (code) {
    event.source.postMessage(
      {
        code: code,
      },
      event.origin,
    )
  } else {
    const error = params.get("error_description") || params.get("error")
    if (error) {
      event.source.postMessage(
        {
          error: params.get("error"),
          error_description: params.get("error_description"),
        },
        event.origin,
      )
    }
  }
}

// https://discord.com/developers/docs/topics/oauth2#implicit-grant
function checkForToken(event) {
  // Remove the leading #
  const params = new URLSearchParams(window.location.hash.substring(1))
  const access_token = params.get("access_token")
  if (access_token) {
    const expires_in = parseExpiredIn(params.get("expires_in"))
    const token_type = params.get("token_type")
    const scope = params.get("scope")
    event.source.postMessage(
      {
        access_token,
        expires_in,
        token_type,
        scope,
      },
      event.origin,
    )
  } else {
    const error = params.get("error_description") || params.get("error")
    if (error) {
      event.source.postMessage(
        {
          error: params.get("error"),
          error_description: params.get("error_description"),
        },
        event.origin,
      )
    }
  }
}

window.addEventListener("message", (event) => {
  if (event.data.source !== "discord-login-popup") {
    return
  }

  if (event.data.params.responseType === "code") {
    checkForCode(event)
  }
  if (event.data.params.responseType === "token") {
    checkForToken(event)
  }
})
