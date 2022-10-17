// Load "mirage" environment.
import env from "../../.quasar.env.json";
Object.assign(process.env, env.mirage);

// Fine-tune some variables specifically for jest testing:
process.env.MOCK_ENVIRONMENT = "test";
