import { Router } from "express";
import { AuthRouter } from "../modules/auth/auth.routes";
import { UserRouter } from "../modules/user/user.routes";
import { AppointmentRouter } from "../modules/appointment/appointment.route";
import { PaymentRouter } from "../modules/payment/payment.route";

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
	{
		path: "/appointment",
		route: AppointmentRouter
	},
	{
		path: "/payment",
		route: PaymentRouter
	},
];

routes.forEach(({ path, route }) => {
	router.use(path, route);
});
export default router;
