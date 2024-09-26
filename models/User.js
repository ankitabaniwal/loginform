
const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamps');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  mobile: { type: String, required: true },
  country: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: Number, default: 2 , enum:[1,2]},
  lastlogin: { type: Date},

   createdAt: Date,
   updatedAt: Date
  });
  
  

UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.plugin(timestamps,{ index: true});
module.exports = mongoose.model('User', UserSchema);
