import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const todoListsSchema = new Schema({
  title: { type: String,  required: true},
  type:{ type: String,  required: true},
  todo: { type: Array, required: true },
  isPublic: { type: Boolean, required: true },
  isEditable: { type: Boolean, required: true },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "userSchema" }
});

export default mongoose.model('TodoList', todoListsSchema);