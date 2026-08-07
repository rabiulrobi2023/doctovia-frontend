import { Router } from "express";
import { AuthRouter } from "../modules/auth/auth.routes";

const router = Router();
interface IRoutes {
  path: string;
  router: ReturnType<typeof Router>;
}

const routes: IRoutes[] = [
  {
    path: "/auth",
    router: AuthRouter,
  },
];

routes.forEach((route) => router.use(route.path, route.router));
export default router;
