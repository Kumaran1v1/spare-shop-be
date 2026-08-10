import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class UserController {
  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await UserService.getAllUsers(req.user!._id);
      sendSuccess(res, 'Users list retrieved successfully', users);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UserService.createUser(req.body);
      sendSuccess(res, 'New user account created successfully', user, 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UserService.updateUser(req.params.id, req.body);
      sendSuccess(res, 'User updated successfully', user);
    } catch (error) {
      next(error);
    }
  }

  static async toggleStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UserService.toggleUserStatus(req.params.id);
      sendSuccess(res, `User ${user.isActive ? 'activated' : 'deactivated'} successfully`, user);
    } catch (error) {
      next(error);
    }
  }
}
