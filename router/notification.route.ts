import express from "express";
import { authorizeRoles,isAuthenticated } from "../utils/auth";
import { getNotifications, updateNotification } from "../controllers/notification.controller";
const notificationsRoute = express.Router();

notificationsRoute.get("/get-all-notifications",isAuthenticated,authorizeRoles("admin"),getNotifications);
notificationsRoute.get("/update-notification/:id",isAuthenticated,authorizeRoles("admin"),updateNotification);

export default notificationsRoute;