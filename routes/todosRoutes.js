import express from "express";
import { check } from "express-validator";

import {
  getTodoListsByUserId,
  getTodoListById,
  createTodoList,
  updateTodoList,
  deleteTodoList,
} from "../controllers/todoListsController.js";
import checkAuth from "../middleware/checkAuth.js";

const router = express.Router();

router.get("/user/:uid", getTodoListsByUserId);

router.get("/:tid", getTodoListById);

router.use(checkAuth);
router.post("/", [check("title").trim().isLength({ max: 70 })], createTodoList);


router.patch(
  "/:tid",
  updateTodoList
);

router.delete("/:tid", deleteTodoList);

export default router;
