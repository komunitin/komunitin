import { Config, Networks } from "@stellar/stellar-sdk"

class TestConfigTestnet {
  static STELLAR_NETWORK = Networks.TESTNET
  static STELLAR_FRIENDBOT_URL = "https://friendbot.stellar.org"
  static STELLAR_HORIZON_URL = "https://horizon-testnet.stellar.org"
}

class TestConfigLocal {
  static STELLAR_NETWORK = Networks.STANDALONE
  static STELLAR_FRIENDBOT_URL = "http://localhost:2025/friendbot"
  static STELLAR_HORIZON_URL = "http://localhost:2025"
}

export const TestConfig = TestConfigTestnet

// Allow Http connections to Stellar Horizon server.
Config.setAllowHttp(TestConfig.STELLAR_HORIZON_URL.startsWith("http://"))

