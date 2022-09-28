import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const todoListsSchema = new Schema({
  title: { type: String},
  image: { type: String, required: true },
  todo: { type: Array, required: true },
  isShared: { type: Boolean, required: true },
  isEdited: { type: Boolean, required: true },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "userSchema" }
});

export default mongoose.model('TodoList', todoListsSchema);