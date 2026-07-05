import "dotenv/config";
import app from "./app";
import { env } from "./config/env";

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`   Environment : ${env.NODE_ENV}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});
