import { Router } from "express";
import { register, login, logout, getProfile, forgortPassword, updateUser ,resetPassword, changePassword } from "../controllers/userController.js";
import { isLoggedIn } from "../middleware/AuthMiddleWare.js";
import upload from "../middleware/multerMiddleWare.js";

const router = Router();

router.post('/register', upload.single("avatar"), register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me',isLoggedIn,getProfile);
router.post('/reset',forgortPassword);
router.post('/reset/:resetToken',resetPassword);
router.post('/changepassword', isLoggedIn, changePassword)
router.put('/update/', isLoggedIn,upload.single("avatar"),updateUser )

export default router;