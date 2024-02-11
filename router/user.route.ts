import express from "express"
import { activateUser, loginUser, logoutUser, registrationUser } from "../controllers/user.controller"
const router = express.Router();

router.post(`/registration`,registrationUser);
router.post(`/activate-user`,activateUser);
router.post(`/login-user`,loginUser);
router.post(`/logout-user`,logoutUser);

export const userRouter = router 