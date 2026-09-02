import { Router } from "express";
import { AuthRouter } from "../modules/auth/auth.routes";
import { UserRouter } from "../modules/user/user.routes";

const router = Router();
interface IRoutes {
	path: string;
	route: ReturnType<typeof Router>;
}

const routes: IRoutes[] = [
	{
		path: "/auth",
		route: AuthRouter,
	},
	{
		path: "/user",
		route: UserRouter,
	},
];

routes.forEach(({ path, route }) => {
	router.use(path, route);
});
export default router;
