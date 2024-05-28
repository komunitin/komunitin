import { startServer } from "./server/server";

startServer()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })