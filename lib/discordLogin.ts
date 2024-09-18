const isAccessTokenResponse = (
  data: OnSuccessParams | OnErrorParams,
): data is OnSuccessTokenParams =>
  Boolean((data as OnSuccessTokenParams).access_token)

const isCodeResponse = (
  data: OnSuccessParams | OnErrorParams,
): data is OnSuccessCodeParams => Boolean((data as OnSuccessCodeParams).code)

const isErrorResponse = (
  data: OnSuccessParams | OnErrorParams,
): data is OnErrorParams =>
  Boolean((data as OnErrorParams).error) ||
  Boolean((data as OnErrorParams).error_description)

export const discordLogin = ({
  popupWidth = 485,
  popupHeight = 725,
  redirectUrl,
  scope = "identify",
  onStart,
  onError,
  clientId,
  responseType = "token",
  permissions,
  integration_type = "0",
}: DiscordLoginPopupParams) => {
  return new Promise<OnSuccessTokenParams | OnSuccessCodeParams>(
    (resolve, reject) => {
      const url = `https://discord.com/api/oauth2/authorize?${new URLSearchParams(
        {
          client_id: clientId,
          redirect_uri: redirectUrl,
          response_type: responseType,
          integration_type,
          scope,
          ...(!!permissions && { permissions }),
        },
      )}`

      const popup = open(
        url,
        "Discord Auth",
        Object.entries({
          scrollbars: "no",
          resizable: "no",
          status: "no",
          location: "no",
          toolbar: "no",
          menubar: "no",
          top: window?.screen?.height / 2 - popupHeight / 2,
          left: window?.screen?.width / 2 - popupWidth / 2,
          width: popupWidth,
          height: popupHeight,
        })
          .map(([key, value]) => `${key}=${value}`)
          .join(","),
      )

      onStart?.()

      const discordLoginMessageInterval = setInterval(() => {
        popup!.postMessage(
          { params: { responseType }, source: "discord-login-popup" },
          window?.location?.origin || "*",
        )
      }, 100)

      const closeTimer = setInterval(() => {
        if (popup?.closed) {
          clearInterval(closeTimer)
          reject()
        }
      }, 100)

      addEventListener(
        "message",
        (event: { data: OnSuccessParams | OnErrorParams }) => {
          let closePopup = false
          const eventData = event.data
          if (isAccessTokenResponse(eventData) || isCodeResponse(eventData)) {
            resolve(eventData)
            closePopup = true
          } else if (isErrorResponse(eventData)) {
            onError?.(eventData)
            closePopup = true
          }

          if (closePopup) {
            clearInterval(closeTimer)
            clearInterval(discordLoginMessageInterval)
            popup!.close()
          }
        },
        false,
      )
    },
  )
}

/**
 * Parameters passed to the onError callback function.
 */
type OnErrorParams = {
  /** Error Message */
  error: string
  /** Error Description */
  error_description: string
}

/**
 * Parameters passed to the onSuccess callback function when responseType is 'token'.
 */
type OnSuccessTokenParams = {
  /** Access Token */
  access_token: string
  /** Access Token Expires In, value is in seconds */
  expires_in: number
  /** Access Token Scope */
  scope: string
  /** Access Token Type */
  token_type: string
}

/**
 * Parameters passed to the onSuccess callback function when responseType is 'code'.
 */
type OnSuccessCodeParams = {
  /** Authorization Code */
  code: string
}

/**
 * Union type for the onSuccess callback parameters.
 */
type OnSuccessParams = OnSuccessTokenParams | OnSuccessCodeParams

/**
 * Parameters for the Discord login popup.
 */
type DiscordLoginPopupParams = {
  /** Discord App Client ID */
  clientId: string
  /**
   * Callback function that will be called when the popup is closed via the close button.
   * Optional.
   */
  onClose?: () => void
  /**
   * Callback function that will be called when the Discord login flow fails.
   * Optional.
   */
  onError?: (data: OnErrorParams) => void
  /**
   * Callback function that will be called when the Discord login flow starts.
   * Optional.
   */
  onStart?: () => void
  /**
   * Callback function that will be called when the Discord login flow is successful.
   * Depending on the responseType, either OnSuccessTokenParams or OnSuccessCodeParams will be passed as data.
   * Optional.
   */
  onSuccess?: (data: OnSuccessParams) => void
  /**
   * Popup height in pixels.
   * Default is 800.
   * Optional.
   */
  popupHeight?: number
  /**
   * Popup width in pixels.
   * Default is 700.
   * Optional.
   */
  popupWidth?: number
  /** Redirect URL, must be the same as the one set in the Discord Developer Portal */
  redirectUrl: string
  /**
   * Response Type, can be either 'token' or 'code'.
   * Optional.
   */
  responseType?: "token" | "code"
  /**
   * Scopes for the OAuth2 flow.
   * Default is 'identify'.
   * Optional.
   */
  scope?: string

  permissions?: string

  integration_type?: string
}
