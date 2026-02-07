// Frontend Square configuration that dynamically switches between Sandbox and Production
// based on SQUARE_ENVIRONMENT variable, matching backend approach

export const getSquareConfig = () => {
  const environment = process.env.EXPO_PUBLIC_SQUARE_ENVIRONMENT || "sandbox"
  const isProduction = environment === "production"

  const applicationId = isProduction
    ? process.env.EXPO_PUBLIC_SQUARE_APPLICATION_ID
    : process.env.EXPO_PUBLIC_SQUARE_SANDBOX_APPLICATION_ID

  const locationId = isProduction
    ? process.env.EXPO_PUBLIC_SQUARE_LOCATION_ID
    : process.env.EXPO_PUBLIC_SQUARE_SANDBOX_LOCATION_ID

  if (!applicationId || !locationId) {
    console.error(
      `[Anointed Innovations] Square is not configured for ${isProduction ? "PRODUCTION" : "SANDBOX"} environment`
    )
    return null
  }

  console.log(`[Anointed Innovations] ✅ Square initialized in ${isProduction ? "PRODUCTION" : "SANDBOX"} mode`)

  return {
    applicationId,
    locationId,
    environment: isProduction ? "production" : "sandbox",
  }
}