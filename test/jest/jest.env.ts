// Load "mirage" environment.
import env from "../../.quasar.env.json";
Object.assign(process.env, env.mirage);

// Fine-tune some variables specifically for jest testing:

// Set tiemout to 0 for faster tests.
process.env.MOCK_TIMEOUT = "0";