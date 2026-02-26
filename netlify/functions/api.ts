import serverless from "serverless-http";
import { app, startServer } from "../../server";

// Initialize the app logic (routes, middleware, etc.)
// We don't call startServer() because it includes app.listen()
// But we need the routes to be registered.
// Since startServer() registers routes on the 'app' instance, we call it once.

let initialized = false;

async function initialize() {
  if (!initialized) {
    // We need to mock some things or ensure startServer doesn't fail in lambda
    // Note: SQLite will be read-only or reset on each execution if not handled.
    await startServer();
    initialized = true;
  }
}

const serverlessHandler = serverless(app);

export const handler: any = async (event: any, context: any) => {
  await initialize();
  return await serverlessHandler(event, context);
};
