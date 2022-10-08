import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


import HttpError from "../models/httpError.js";
import UserSchema from "../models/userSchema.js";
import TodoListsSchema from '../models/todoListsSchema.js';

export const getAllUsers = async (req, res, next) => {
  let allUsers;
  try {
    allUsers = await UserSchema.find({}, "-password");
  } catch (err) {
    const error = new HttpError(
      "Can't retreive the user data, please try again",
      500
    );
    return next(error);
  }
  let allTodoLists;
  try {
    allTodoLists = await TodoListsSchema.find({});
  } catch (err) {
    const error = new HttpError(
      "Can't retreive the user data, please try again",
      500
    );
    return next(error);
  }
  let listsInfo = [];
  for (let todoList of allTodoLists) {
    listsInfo.push({id: todoList.id, setting: todoList.setting, creator: todoList.creator})
  }

  res
    .status(200)
    .json({ users: allUsers.map((user) => user.toObject({ getters: true })), listInfo: listsInfo})

};

export const signUpUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    const error = new HttpError(
      "Invalid inputs passed, please check your data",
      422
    );
    return next(error);
  }

  const { name, email, password, image } = req.body;

  let existingUser;
  try {
    existingUser = await UserSchema.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Something went wrong, please try again", 500);
    return next(error);
  }
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = HttpError("Could not create user, please try again.", 500);
    return next(error);
  }
  console.log(req.file + " !!!!!!!!!!!!!!!!")
  let newUser;
  if (!existingUser) {
    newUser = new UserSchema({
      name,
      email,
      password: hashedPassword,
      todoLists: [],
      image:
        req.file && !image ? 'http://localhost:5000/uploads/images/' + req.file.filename : image,
    });
  } else {
    const error = new HttpError("the email exist, please try again", 500);
    return next(error);
  }
  try {
    await newUser.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not create the user",
      500
    );
    return next(error);
  }
  let token;
  try {
    token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_KEY,
      { expiresIn: '1h' }
    )
  } catch (err) {
    const error = new HttpError('Something went wrong, could not create the user', 500);
    return next(error);
  };

  res.status(201).json({ userId: newUser.id, email: newUser.email, token,});
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await UserSchema.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Failed to retrieve data from database, please try again later",
      500
    );
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "You have not signed up yet, please sign up an account",
      401
    );
    return next(error);
  }

  let isValidPasspord;
  try {
    isValidPasspord = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError("Failed to log in now, please try again", 500);
    return next(error);
  }

  if (!isValidPasspord) {
    const error = new HttpError("Invalid credentials, please try again", 401);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Failed to log in now, please try again.", 500);
    return next(error);
  }

  res
    .status(200)
    // .json({ 
    //   message: 'You have logged in!', user: existingUser.toObject({ getters: true }) });
    .json({
      userId: existingUser.id,
      email: existingUser.email,
      token:token
    });

};
