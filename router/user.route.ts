import express from "express"
import { activateUser, loginUser, registrationUser } from "../controllers/user.controller"
const router = express.Router();

router.post(`/registration`,registrationUser);
router.post(`/activate-user`,activateUser);
router.post(`/login-user`,loginUser);

export const userRouter = router 