import { Router } from "express";
import { register, verifyPhone } from "../controllers/authController.js";

const routerAuth = Router();

routerAuth.post('/auth/register', register);
routerAuth.post('/auth/verify', verifyPhone);
// routerAuth.post('/auth/login', login);
// routerAuth.post('/auth/logout', protect, logout);

export default routerAuth;