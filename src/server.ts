import app from "./app";
import envConfig from "./app/config/envConfig";
import { transporter } from "./app/lib/nodemailer";

import { prisma } from "./app/lib/prisma";
import { redisClient } from "./app/lib/redis";
import { seedSuperAdmin } from "./app/utils/seed";

async function main() {
	const port = envConfig.PORT;
	try {
		await prisma.$connect();
		console.log("Postgres database connected successfully!");

		await redisClient.connect();
		console.log("Redis database connected successfully!");

		await transporter.verify();
		console.log("Nodemailer email service connected successfully!");

		await seedSuperAdmin();
		app.listen(port, () =>
			console.log(
				`${envConfig.SERVER_NAME} server is running on port: ${port}`,
			),
		);
	} catch (error) {
		console.log("Error starting the server", error);
		await prisma.$disconnect();
		process.exit(1);
	}
}

main();
