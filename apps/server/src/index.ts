import { env } from "@tatame-monorepo/env/server";
import { createApp } from "./app";

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`Server is running on http://localhost:${env.PORT}`);
  console.log(`CORS enabled for all origins (development mode)`);
});
