import express from "express";
import { addAnswer, addQuestion, addReview, deleteCourse, editCourse, getAllCourses, getCourseByUser, getSingleCourse, uploadCourse } from "../controllers/course.controller";
import { authorizeRoles, isAuthenticated } from "../utils/auth";
const courseRouter = express.Router();

courseRouter.post("/create-course",isAuthenticated,authorizeRoles("admin"),uploadCourse);
courseRouter.post("/edit-course",isAuthenticated,authorizeRoles("admin"),editCourse);
courseRouter.get("/get-course/:id",getSingleCourse);
courseRouter.get("/get-courses",getAllCourses);
courseRouter.get("/get-course-content/:id",isAuthenticated,getCourseByUser);
courseRouter.post("/add-question",isAuthenticated,addQuestion);
courseRouter.post("/add-answer",isAuthenticated,addAnswer);
courseRouter.post("/add-review/:id",isAuthenticated,addReview);
courseRouter.post("/add-reply",isAuthenticated,authorizeRoles("admin"),addReview);
courseRouter.get("/get-courses",isAuthenticated,authorizeRoles("admin"),getAllCourses);
courseRouter.delete("/delete-course/:id",isAuthenticated,authorizeRoles("admin"),deleteCourse);

export default courseRouter;