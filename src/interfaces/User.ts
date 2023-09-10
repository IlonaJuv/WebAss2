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

interface UserTest {
  user_name: string;
  email: string;
  role?: 'user';
  password: string;
}

export {User, LoginUser, UserOutput, UserTest};
