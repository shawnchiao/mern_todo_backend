import fs  from 'fs';
import path  from 'path';

import express from "express";
import mongoose from "mongoose";
import cors from 'cors';

import HttpError from './models/httpError.js';
import todosRoutes from './routes/todosRoutes.js';
import usersRoutes from './routes/usersRoutes.js';

const app = express();

app.use(express.json());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use(cors());

app.use('/todolists', todosRoutes);

app.use('/users', usersRoutes);

app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error;
})

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => console.log(err));
  };

  if (res.headerSent) {
    return next(error);
  };
  res.status(error.code || 500);
  res.json({message: error.message || 'An unkonwn error occurred!'});
});

const url = "mongodb+srv://shawnjoe:asdf8869@cluster0.vidsobg.mongodb.net/MERNTODO?retryWrites=true&w=majority";
mongoose.connect( url,
  () => {
    app.listen(process.env.PORT || 5000);
    console.log('connected to database');
  },
  (err) => {
    console.log(err);
  }
);
