// TODO: create following functions:
// - catGetByUser - get all cats by current user id
// - catGetByBoundingBox - get all cats by bounding box coordinates (getJSON)
// - catPutAdmin - only admin can change cat owner
// - catDeleteAdmin - only admin can delete cat
// - catDelete - only owner can delete cat
// - catPut - only owner can update cat
// - catGet - get cat by id
// - catListGet - get all cats
// - catPost - create new cat
import {Point} from 'geojson';
import {Request, Response, NextFunction} from 'express';
import CustomError from '../../classes/CustomError';
import {Cat} from '../../interfaces/Cat';
import Catmodel from '../models/catModel';
import DBMessageResponse from '../../interfaces/DBMessageResponse';
import {validationResult} from 'express-validator';
import {User} from '../../interfaces/User';
import rectangleBounds from '../../utils/rectangleBounds';

const catGetByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cats = await Catmodel.find({'owner._id': (req.user as User)._id});
    if (!cats || cats.length === 0) {
      next(new CustomError('No cats found', 404));
      return;
    }
    res.json(cats);
  } catch (error) {
    next(new CustomError('Something went wrong with the server', 500));
  }
};

const catGet = async (
  req: Request<{id: string}, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const messages = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    next(new CustomError(messages, 400));
    return;
  }
  try {
    const cat = await Catmodel.findById(req.params.id);
    if (!cat) {
      next(new CustomError('No cats found', 404));
      return;
    }
    res.json(cat);
  } catch (error) {
    next(new CustomError('Something went wrong with the server', 500));
  }
};

const catListGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cats = await Catmodel.find();
    if (!cats || cats.length === 0) {
      next(new CustomError('No cats found', 404));
      return;
    }
    res.json(cats);
  } catch (error) {
    next(new CustomError('Something went wrong with the server', 500));
  }
};

const catPost = async (
  req: Request<{}, {}, Cat>,
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

    const user = req.user as User;
    const cat = req.body as Cat;
    cat.owner = {
      _id: user._id,
      user_name: user.user_name,
      email: user.email,
    };
    cat.filename = req.file?.originalname as string;
    cat.location = res.locals.coords as Point;
    const added = await Catmodel.create(cat);
    if (!added) {
      next(new CustomError('No cats added', 404));
      return;
    }
    const message: DBMessageResponse = {
      message: 'Cat created',
      data: added,
    };
    res.json(message);
  } catch (error) {
    next(new CustomError('Something went wrong with the server', 500));
  }
};

const catPut = async (
  req: Request<{id: string}, {}, Cat>,
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
    const query = {_id: req.params.id, 'owner._id': (req.user as User)._id};
    const cat = await Catmodel.findOneAndUpdate(query, req.body, {new: true});
    if (!cat) {
      next(new CustomError("couldn't update cat", 404));
      return;
    }
    const message: DBMessageResponse = {
      message: 'Cat updated',
      data: cat,
    };
    res.json(message);
  } catch (error) {
    next(new CustomError('Something went wrong with the server', 500));
  }
};

const catPutAdmin = async (
  req: Request<{id: string}, {}, Cat>,
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
    if ((req.user as User).role !== 'admin') {
      next(new CustomError('admin only', 403));

      return;
    }
    const cat = await Catmodel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!cat) {
      next(new CustomError("couldn't update cat", 404));
      return;
    }
    const message: DBMessageResponse = {
      message: 'Cat updated',
      data: cat,
    };
    res.json(message);
  } catch (error) {
    next(new CustomError('Something went wrong with the server', 500));
  }
};

const catDelete = async (
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
    const query = {_id: req.params.id, 'owner._id': (req.user as User)._id};
    const cat = await Catmodel.findOneAndDelete(query);
    if (!cat) {
      next(new CustomError("couldn't delete cat", 404));
      return;
    }
    const message: DBMessageResponse = {
      message: 'Cat deleted',
      data: cat,
    };
    res.json(message);
  } catch (error) {
    next(new CustomError('Something went wrong with the server', 500));
  }
};

const catDeleteAdmin = async (
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
    if ((req.user as User).role !== 'admin') {
      next(new CustomError('admin only', 403));
      return;
    }
    const cat = await Catmodel.findByIdAndDelete(req.params.id);
    if (!cat) {
      next(new CustomError("couldn't delete cat", 404));
      return;
    }
    const message: DBMessageResponse = {
      message: 'Cat deleted',
      data: cat,
    };
    res.json(message);
  } catch (error) {
    next(new CustomError('Something went wrong with the server', 500));
  }
};
const catGetByBoundingBox = async (
  req: Request<{}, {}, {}, {topRight: string; bottomLeft: string}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      throw new CustomError(message, 400);
    }
    const {topRight, bottomLeft} = req.query;
    const [topRightLat, topRightLng] = topRight.split(',');
    const [bottomLeftLat, bottomLeftLng] = bottomLeft.split(',');
    const bounds = rectangleBounds(
      {lat: Number(topRightLat), lng: Number(topRightLng)},
      {lat: Number(bottomLeftLat), lng: Number(bottomLeftLng)}
    );
    console.log(bounds.coordinates);
    const cats = await Catmodel.find({
      location: {
        $geoWithin: {
          $geometry: bounds,
        },
      },
    });
    if (!cats || cats.length === 0) {
      next(new CustomError('Cats not found', 404));
      return;
    }
    res.json(cats);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};
export {
  catGet,
  catGetByUser,
  catPost,
  catListGet,
  catDelete,
  catPut,
  catGetByBoundingBox,
  catPutAdmin,
  catDeleteAdmin,
};
