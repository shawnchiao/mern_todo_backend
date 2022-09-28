import express from "express";
import { check } from "express-validator";

import { getAllUsers, signUpUser, login } from "../controllers/usersController.js";
import fileUpload from "../models/fileUpload.js";
// import s3 = from '../middleware/s3';

const router = express.Router();

router.get("/", getAllUsers);

router.post(
  "/signup",
  // fileUpload.single("image"),
  [
    check("name").notEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  // s3.uploadFileS3,
  signUpUser
);

router.post("/login",
  check("email").normalizeEmail(),
  login
);

export default router;
