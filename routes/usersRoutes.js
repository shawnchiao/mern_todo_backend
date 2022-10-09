import express from "express";
import { check } from "express-validator";

import { getAllUsers, signUpUser, login } from "../controllers/usersController.js";
import fileUpload from "../middleware/fileUpload.js";
import s3 from '../middleware/s3.js';

const router = express.Router();

router.get("/", getAllUsers);

router.post(
  "/signup",
  fileUpload.single("image"),
  [
    check("name").notEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  s3,
  signUpUser
);

router.post("/login",
  check("email").normalizeEmail(),
  login
);

export default router;
