// TODO: user interface

import {Document, Types} from 'mongoose';

interface User extends Document {
  user_name: string;
  email: string;
  role: 'user' | 'admin';
  password: string;
}

interface LoginUser extends User {
  _id: Types.ObjectId;
}

interface UserOutput {
  _id: Types.ObjectId;
  user_name: string;
  email: string;
}

type UserTest = Partial<User>;

export {User, LoginUser, UserOutput, UserTest};
