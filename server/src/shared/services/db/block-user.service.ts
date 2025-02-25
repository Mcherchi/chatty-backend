import { UserModel } from '@user/models/user.schema';
import mongoose from 'mongoose';

class BlockUserService {
  public async blockUser(userId: string, followerId: string): Promise<void> {
    await UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: userId, blocked: { $ne: new mongoose.Types.ObjectId(followerId) } },
          update: { $push: { blocked: new mongoose.Types.ObjectId(followerId) } }
        }
      },
      {
        updateOne: {
          filter: { _id: followerId, blockedBy: { $ne: new mongoose.Types.ObjectId(userId) } },
          update: { $push: { blockedBy: new mongoose.Types.ObjectId(userId) } }
        }
      }
    ]);
  }

  public async unBlockUser(userId: string, followerId: string): Promise<void> {
    await UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: userId },
          update: { $pull: { blocked: new mongoose.Types.ObjectId(followerId) } }
        }
      },
      {
        updateOne: {
          filter: { _id: followerId },
          update: { $pull: { blockedBy: new mongoose.Types.ObjectId(userId) } }
        }
      }
    ]);
  }
}

export const blockUserService: BlockUserService = new BlockUserService();
