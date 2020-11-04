// Load dotenv helper package
import { config } from 'dotenv';

// Load dev.env environment to process.env
config({path: "dev.env"});

// Fine-tune some variables specifically for jest testing:

// Set tiemout to 0 for faster tests.
process.env.MOCK_TIMEOUT = "0";