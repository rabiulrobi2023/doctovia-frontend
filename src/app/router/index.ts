import { Router } from "express";
import { AuthRouter } from "../modules/auth/auth.routes";

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
];

routes.forEach(({ path, route }) => {
  router.use(path, route);
});
export default router;
