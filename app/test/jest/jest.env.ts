// Load environment variables from file ".env.test"
import { config } from "dotenv"
config({ path: ".env.test" })

// Fine-tune some variables specifically for jest testing:
process.env.MOCK_ENVIRONMENT = "test";
