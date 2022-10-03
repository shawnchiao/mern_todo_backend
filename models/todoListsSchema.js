import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const todoListsSchema = new Schema({
  title: { type: String,  required: true},
  type:{ type: String,  required: true},
  todos: { type: Array, required: true },
  setting: {type: Object, require:true},
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "userSchema" }
});

export default mongoose.model('TodoList', todoListsSchema);