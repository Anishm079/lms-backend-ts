import express from "express"
import { activateUser, getUserInfo, loginUser, logoutUser, registrationUser, updateAccessToken } from "../controllers/user.controller"
import { isAuthenticated } from "../utils/auth";
const router = express.Router();

router.post(`/registration`,registrationUser);
router.post(`/activate-user`,activateUser);
router.post(`/login-user`,loginUser);
router.post(`/logout-user`,isAuthenticated,logoutUser);
router.post(`/refresh`,updateAccessToken);
router.post(`/me`,isAuthenticated,getUserInfo);
router.post(`/social-auth`,isAuthenticated,getUserInfo);

export const userRouter = router;