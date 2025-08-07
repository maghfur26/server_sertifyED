import userController from "../controllers/authcontroller";
import { validateLogin, validateRegister } from "../middleware/validation";
import { Router } from "express";
import protectRoute from "../middleware/protectRoute";
const authRoute = Router();

authRoute.post("/login", validateLogin, userController.login);
authRoute.post("/register", validateRegister, userController.register);
authRoute.get("/refresh-token", userController.refreshToken);
authRoute.post("/logout", protectRoute, userController.logout);

export default authRoute;
