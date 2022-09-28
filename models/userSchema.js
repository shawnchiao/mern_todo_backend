import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minLength: 6 },
  image: { type: String },
  todoLists: [{ type: mongoose.Types.ObjectId, required: true, ref: "todoListsSchema" }]
});


export default mongoose.model('User', UserSchema)
