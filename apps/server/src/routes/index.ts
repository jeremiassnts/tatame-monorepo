import { Router } from "express";
import { stripeRouter } from "./stripe";

export const protectedRoutes: Router = Router();

protectedRoutes.use("/stripe", stripeRouter);

export default protectedRoutes;