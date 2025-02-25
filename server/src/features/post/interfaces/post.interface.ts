import { IReactions } from '@reaction/interfaces/reactions.interface';
import mongoose, { Document } from 'mongoose';

export interface IPostDocument extends Document {
  _id?: string | mongoose.Types.ObjectId;
  userId: string;
  username: string;
  email: string;
  avatarColor: string;
  profilePicture: string;
  post: string;
  bgColor: string;
  commentsCount: number;
  imgVersion?: string;
  imgId: string;
  feelings?: string;
  gifUrl?: string;
  privacy?: string;
  reactions?: IReactions;
  createdAt?: Date;
}

export interface IGetPostsQuery {
  _id?: string | mongoose.Types.ObjectId;
  username?: string;
  imgId?: string;
  gifUrl?: string;
}

export interface ISavePostToCache {
  key: string | mongoose.Types.ObjectId;
  currentUserId: string;
  uId: string;
  createdPost: IPostDocument;
}

export interface IPostJob {
  userId?: string;
  value?: IPostDocument;
  keyOne?: string;
  keyTwo?: string;
}

export interface IQueryComplete {
  ok?: number;
  n?: number;
}

export interface IQueryDeleted {
  deletedCount?: number;
}
export { IReactions };
