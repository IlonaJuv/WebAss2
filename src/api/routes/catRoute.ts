import express, {Request} from 'express';
import {
  catDelete,
  catGet,
  catListGet,
  catPost,
  catPut,
  catGetByUser,
  catGetByBoundingBox,
  catPutAdmin,
  catDeleteAdmin,
} from '../controllers/catController';
import multer, {FileFilterCallback} from 'multer';
import {body, param, query} from 'express-validator';
import passport from '../../passport';
import {getCoordinates, makeThumbnail} from '../../middlewares';

const fileFilter = (
  request: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (file.mimetype.includes('image')) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({dest: './uploads/', fileFilter});
const router = express.Router();

// TODO: add validation

router
  .route('/')
  .get(catListGet)
  .post(
    passport.authenticate('jwt', {session: false}),
    upload.single('cat'),
    makeThumbnail,
    getCoordinates,
    body('cat_name').notEmpty().escape(),
    body('birthdate').isDate(),
    body('weight').isNumeric(),
    catPost
  );

router
  .route('/area')
  .get(
    query('bottomLeft').notEmpty(),
    query('topRight').notEmpty(),
    catGetByBoundingBox
  );

router
  .route('/user')
  .get(passport.authenticate('jwt', {session: false}), catGetByUser);

router
  .route('/admin/:id')
  .put(
    passport.authenticate('jwt', {session: false}),
    param('id').isString().notEmpty(),
    body('cat_name').notEmpty().escape().optional(),
    body('birthdate').isDate().optional(),
    body('weight').isNumeric().optional(),
    catPutAdmin
  )
  .delete(
    passport.authenticate('jwt', {session: false}),
    param('id').isString().notEmpty(),
    catDeleteAdmin
  );

router
  .route('/:id')
  .get(param('id').isString().notEmpty(), catGet)
  .put(
    passport.authenticate('jwt', {session: false}),
    param('id').isString().notEmpty(),
    catPut
  )
  .delete(
    passport.authenticate('jwt', {session: false}),
    param('id').isString().notEmpty(),
    catDelete
  );

export default router;
