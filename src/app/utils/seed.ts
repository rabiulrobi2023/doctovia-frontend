import bcrypt from "bcryptjs";
import { AuthProvider, Role, UserStatus } from "../../../generated/enums";
import envConfig from "../config/envConfig";
import { prisma } from "../lib/prisma";

export const seedSuperAdmin = async () => {
	const isSuperAdminExist = await prisma.user.findFirst({
		where: { role: Role.SUPER_ADMIN },
	});

	if (isSuperAdminExist) {
		console.log("Super admin already exists!");
		return;
	}
	const name = envConfig.SEED_SUPER_ADMIN_NAME;
	const email = envConfig.SEED_SUPER_ADMIN_EMAIL;
	const password = envConfig.SEED_SUPER_ADMIN_PASSWORD;
	if (!name || !email || !password) {
		throw new Error("Super admin name, email, or password missing in env file");
	}
	const hashedPassword = await bcrypt.hash(
		password,
		Number(envConfig.BCRYPT_SALT_ROUND),
	);

	const superAdmin = await prisma.user.create({
		data: {
			name,
			email,
			role: Role.SUPER_ADMIN,
			needPasswordChange: false,
			emailVerifiedAt: new Date(),
			status: UserStatus.ACTIVE,
			authAccounts: {
				create: {
					provider: AuthProvider.CREDENTIAL,
					providerAccountId: email,
					password: hashedPassword,
				},
			},
		},
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			status: true,
		},
	});

	console.log("Super admin created successfully: ", superAdmin);
};
