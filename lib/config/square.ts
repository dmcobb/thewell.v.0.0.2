import Constants from 'expo-constants';

const isDevelopment = process.env.NODE_ENV === 'development';

export const getSquareConfig = () => {
  const extra = Constants.expoConfig?.extra;
  const squareConfig = extra?.square;

  const environment = squareConfig?.environment || "sandbox";
  const isProduction = environment === "production";

  const applicationId = isProduction
    ? squareConfig?.productionApplicationId
    : squareConfig?.sandboxApplicationId;

  const locationId = isProduction
    ? squareConfig?.productionLocationId
    : squareConfig?.sandboxLocationId;

  if (!applicationId || !locationId) {
    if (isDevelopment) {
      console.error(
        `[The Well] Square is not configured for ${isProduction ? "PRODUCTION" : "SANDBOX"} environment`
      );
    }
    return null;
  }

  if (isDevelopment) {
    console.log(`[The Well] Square initialized in ${isProduction ? "PRODUCTION" : "SANDBOX"} mode`);
  }

  return {
    applicationId,
    locationId,
    environment: isProduction ? "production" : "sandbox",
  };
};