import dotenv from "dotenv"

export const loadConfig = () => {
  dotenv.config()

  // build configuration object
  const config = {
    STELLAR_NETWORK: (process.env.STELLAR_NETWORK || "testnet") as "testnet" | "local" | "public",
    STELLAR_HORIZON_URL: process.env.STELLAR_HORIZON_URL ||  "https://horizon-testnet.stellar.org",
    STELLAR_FRIENDBOT_URL: process.env.STELLAR_FRIENDBOT_URL || "https://friendbot.stellar.org",
    DOMAIN: process.env.DOMAIN || "komunitin.org",
    MASTER_PASSWORD_SALT: process.env.MASTER_PASSWORD_SALT || undefined,
    // SECRETS
    // TODO: Using environment variables for secrets is a reasonable practice but not a 
    // best practice. Consider other mechanisms for providing secrets to the application.
    SPONSOR_PRIVATE_KEY: process.env.SPONSOR_PRIVATE_KEY || undefined,
    MASTER_PASSWORD: process.env.MASTER_PASSWORD || undefined,
    NEW_MASTER_PASSWORD: process.env.NEW_MASTER_PASSWORD || undefined,
  }
  // Remove secrets from the process.env so other libraries don't use/leak them.
  delete process.env.SPONSOR_PRIVATE_KEY
  delete process.env.MASTER_ENCRYPTION_KEY
  delete process.env.NEW_MASTER_ENCRYPTION_KEY

  // Validate some config
  if (!["testnet", "local", "public"].includes(config.STELLAR_NETWORK)) {
    throw new Error("Invalid STELLAR_NETWORK config")
  }

  return config
}
