// TODO: cat interface
import {Document, Types} from 'mongoose';
import {Point} from 'geojson';
import {User, UserOutput} from './User';

interface Cat extends Document {
  cat_name: string;
  weight: number;
  filename: string;
  birthdate: Date;
  location: Point;
  owner: UserOutput;
}

export {Cat};
