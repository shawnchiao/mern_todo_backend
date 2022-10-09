import { validationResult } from 'express-validator';
import { default as mongoose } from 'mongoose';

import HttpError from '../models/httpError.js'
import TodoListsSchema from '../models/todoListsSchema.js';
import UserSchema from '../models/userSchema.js';


export const getTodoListsByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let todoLists;
  try {
    todoLists = await TodoListsSchema.find({ creator: userId });
  } catch (err) {
    const error = new HttpError('Failed to find to-do lists from the user, please try again', 500);
    return next(error);
  }

  if (!todoLists ) {
    return next(
      new HttpError('Could not find any to-do list from the user', 404)
    );
  };

  res.json({ todoLists: todoLists.map(todoList => todoList.toObject({ getters: true })),  });
};

export const getTodoListById = async (req, res, next) => {
  const todoListId = req.params.tid;

  let todoList;
  try {
    todoList = await TodoListsSchema.findById(todoListId);
  } catch (err) {
    const error = new HttpError('Failed to find the to-do list, please try again', 500);
    return next(error);
  };

  if (!todoList) {
    const error = new HttpError('Could not find the to-do list from the provided id.', 404);
    return next(error);
  };

  res.json({ todoList: todoList.toObject({ getters: true }) });
};

export const createTodoList = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError(' Title is too long, please make sure to limit it to under 70 characters.', 422));
  };

  const { title, creator, isPublic, isEditable, type } = req.body;
  console.log(req.body)
  const createdTodoList = new TodoListsSchema({
    title,
    type,
    todos: [],
    setting: { isPublic: isPublic, isEditable: isEditable},
    creator,
  });

  // check if a exist userid is existing
  let user;
  try {
    user = await UserSchema.findById(creator);
  } catch (err) {
    const error = new HttpError('Failed to create a to-do list when obtaining user data, please try again.', 500)
    return next(error);
  };

  if (!user) {
    const error = new HttpError("the creator doen's exist, please try again", 404)
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdTodoList.save({ session: sess });
    await user.todoLists.push(createdTodoList);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError('Failed to create the to-do list when uploading data, please try again.', 500);
    return next(error);
  };

  res.status(201).json({ todoList: createTodoList });

};


export const updateTodoList = async (req, res, next) => {
  
  const {  todos, setting  } = req.body;
  const todoListId = req.params.tid;

  let todoListToBeUpdated;
  try {
    todoListToBeUpdated = await TodoListsSchema.findById(todoListId);
  } catch (err) {
    const error = new HttpError('Failed to find the to-do list when updating, please try again', 500)
    return next(error);
  };
  if ((todoListToBeUpdated.creator.toString() !== req.userData.userId) && (!todoListToBeUpdated.setting.isEditable)) {
    const error = new HttpError('You are not authorized to edit this list', 401)
    return next(error);
  };
  try {
    await TodoListsSchema.findByIdAndUpdate(todoListId, {
       todos, setting
    })
  } catch (err) {
    const error = new HttpError('Failed to update the to-do list, please try again', 500)
    return next(error);
  };

  res.status(200).json({ todoList: todoListToBeUpdated })

};

export const deleteTodoList = async (req, res, next) => {
  const todoListId = req.params.tid;

  let todoListToBeDeleted;
  try {
    todoListToBeDeleted = await TodoListsSchema.findById(todoListId).populate({ path: 'creator', model: UserSchema });
  } catch (err) {
    const error = new HttpError('Failed to find the to-do list when deleting, please try again', 500);
    return next(error);
  };

  if (!todoListToBeDeleted) {
    const error = new HttpError('Did not find the to-list to be deleted, please try again', 500);
    return next(error);
  }
  // console.log(todoListToBeDeleted)
  if (todoListToBeDeleted.creator.id !== req.userData.userId) {
    const error = new HttpError('You are not authorized to delete this place.', 401);
    return next(error);
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await todoListToBeDeleted.creator.todoLists.pull(todoListToBeDeleted);
    await todoListToBeDeleted.creator.save({ session: sess });
    await TodoListsSchema.findByIdAndDelete(todoListId, { session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err)
    const error = new HttpError('Failed to delete the to-do list, please try again', 500);
    return next(error);
  };

  res.status(200).json({ message: 'place deleted' });
};