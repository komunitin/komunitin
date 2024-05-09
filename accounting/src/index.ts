import { startServer } from "./server/server";

startServer()
  .then(() => {
    console.log("Server started successfully.");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })