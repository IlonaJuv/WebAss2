import {body, param} from 'express-validator';
import express from 'express';
import {
  checkToken,
  userDeleteCurrent,
  userGet,
  userListGet,
  userPost,
  userPutCurrent,
} from '../controllers/userController';
import passport from '../../passport';

const router = express.Router();

// TODO: add validation

router
  .route('/')
  .get(userListGet)
  .post(
    body('user_name').notEmpty().escape(),
    body('email').notEmpty().isEmail(),
    body('password').notEmpty(),
    userPost
  )
  .put(
    passport.authenticate('jwt', {session: false}),
    body('user_name').notEmpty().escape().optional(),
    body('email').isEmail().optional(),
    body('password').notEmpty().optional(),
    body('role').notEmpty().optional(),
    userPutCurrent
  )
  .delete(passport.authenticate('jwt', {session: false}), userDeleteCurrent);

router.get(
  '/token',
  passport.authenticate('jwt', {session: false}),
  checkToken
);

router.route('/:id').get(param('id').isString().notEmpty(), userGet);

export default router;
