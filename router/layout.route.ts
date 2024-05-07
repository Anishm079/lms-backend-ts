import express from "express";
import { authorizeRoles, isAuthenticated } from "../utils/auth";
import { createLayout, editLayout, getLayoutByType } from "../controllers/layout.controller";
const layoutRouter = express.Router();

layoutRouter.post("/create-layout",isAuthenticated,authorizeRoles("admin"),createLayout);
layoutRouter.put("/edit-layout",isAuthenticated,authorizeRoles("admin"),editLayout);
layoutRouter.put("/get-layout/:type",getLayoutByType);

export default layoutRouter;