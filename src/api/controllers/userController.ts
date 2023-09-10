// TODO: create the following functions:
// - userGet - get user by id
// - userListGet - get all users
// - userPost - create new user. Remember to hash password
// - userPutCurrent - update current user
// - userDeleteCurrent - delete current user
// - checkToken - check if current user token is valid: return data from req.user. No need for database query
import {Request, Response, NextFunction} from 'express';
import CustomError from '../../classes/CustomError';
import {User, UserOutput} from '../../interfaces/User';
import Usermodel from '../models/userModel';
import DBMessageResponse from '../../interfaces/DBMessageResponse';
import {validationResult} from 'express-validator';
import bcrypt from 'bcryptjs';
const salt = bcrypt.genSaltSync(12);

const userGet = async (
  req: Request<{id: string}, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      next(new CustomError(messages, 400));
      return;
    }
    const user = await Usermodel.findById(req.params.id).select(
      '-role -password'
    );
    if (!user) {
      next(new CustomError('User not found', 404));
    }
    res.json(user as UserOutput);
  } catch (error) {
    next(new CustomError('Something went wrong with the server', 500));
  }
};

const userListGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await Usermodel.find().select('-role -password');
    if (!users || users.length === 0) {
      next(new CustomError('No users found', 404));
      return;
    }
    res.json(users);
  } catch (error) {
    next(new CustomError('Something went wrong with the server', 500));
  }
};

const userPost = async (
  req: Request<{}, {}, User>,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      next(new CustomError(messages, 400));
      return;
    }

    const user = req.body as User;
    const hash = await bcrypt.hash(user.password, salt);
    user.password = hash;
    user.role = 'user';
    const created = await Usermodel.create(user);
    const message: DBMessageResponse = {
      message: 'User created',
      data: {
        _id: created._id,
        user_name: created.user_name,
        email: created.email,
      },
    };
    res.json(message);
  } catch (error) {
    next(new CustomError('Something went wrong with the server', 500));
  }
};

const userPutCurrent = async (
  req: Request<{}, {}, User>,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    console.log('user_PutCurrent validation', messages);
    next(new CustomError(messages, 400));
    return;
  }
  try {
    const user = await Usermodel.findByIdAndUpdate(
      (req.user as User)._id,
      req.body,
      {new: true}
    );
    if (!user) {
      next(new CustomError('User not found', 404));
      return;
    }
    const message: DBMessageResponse = {
      message: 'User updated',
      data: {
        _id: user._id,
        user_name: user.user_name,
        email: user.email,
      },
    };
    res.json(message);
  } catch (error) {
    next(error);
  }
};

const userDeleteCurrent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    console.log('user_deletecurrent validation', messages);
    next(new CustomError(messages, 400));
    return;
  }
  try {
    const user = await Usermodel.findByIdAndDelete((req.user as User)._id);
    if (!user) {
      next(new CustomError('User not found', 404));
      return;
    }
    const message: DBMessageResponse = {
      message: 'User deleted',
      data: {
        _id: (req.user as User)._id,
        user_name: (req.user as User).user_name,
        email: (req.user as User).email,
      },
    };
    res.json(message);
  } catch (error) {
    next(error);
  }
};

const checkToken = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    next(new CustomError('token not valid', 403));
  } else {
    const user: UserOutput = {
      _id: (req.user as User)._id,
      user_name: (req.user as User).user_name,
      email: (req.user as User).email,
    };
    res.json(user);
  }
};

export {
  userDeleteCurrent,
  userGet,
  userListGet,
  userPost,
  userPutCurrent,
  checkToken,
};
