import express from "express"
import { activateUser, deleteUser, getAllUsers, getUserInfo, loginUser, logoutUser, registrationUser, socialAuth, updateAccessToken, updatePassword, updateProfilePicture, updateUserInfo, updateUserRole } from "../controllers/user.controller"
import { authorizeRoles, isAuthenticated } from "../utils/auth";
const router = express.Router();

router.post(`/registration`,registrationUser);
router.post(`/activate-user`,activateUser);
router.post(`/login-user`,loginUser);
router.post(`/logout-user`,isAuthenticated,logoutUser);
router.post(`/refresh`,updateAccessToken);
router.get(`/me`,isAuthenticated,getUserInfo);
router.post(`/social-auth`,socialAuth);
router.put(`/update-user-info`,isAuthenticated,updateUserInfo);//from here
router.put(`/update-user-password`,isAuthenticated,updatePassword);
router.put(`/update-user-profile-picture`,isAuthenticated,updateProfilePicture);
router.get(`get-users`,isAuthenticated,authorizeRoles("admin"),getAllUsers);
router.get(`update-user`,isAuthenticated,authorizeRoles("admin"),updateUserRole);
router.delete(`delete-user/:id`,isAuthenticated,authorizeRoles("admin"),deleteUser);
export const userRouter = router;