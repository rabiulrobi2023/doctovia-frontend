import app from "./app";
import { config } from "./app/config/envConfig";
import { prisma } from "./app/lib/prisma";

async function main() {
  const port = config.PORT;
  try {
    await prisma.$connect();
    console.log("Postgres database connected successfully");
    app.listen(port, () => console.log(`${config.SERVER_NAME} server is running on port: ${port}`));
  } catch (error) {
    console.log("Error starting the server", error);
    await prisma.$disconnect();
    process.exit();
  }
}

main()
