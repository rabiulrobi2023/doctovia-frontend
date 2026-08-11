import type { IJwtPayload } from "./interface/interface";

declare global {
	namespace Express {
		interface Request {
			user: IJwtPayload;
		}
	}
}
