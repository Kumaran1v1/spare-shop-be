import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { sendError } from '../utils/response';
import { User } from '../models/User';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload & { _id: string };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'Access denied. No authentication token provided.', 401);
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.userId).lean();
    if (!user || !user.isActive) {
      sendError(res, 'User session is invalid or user account is inactive.', 401);
      return;
    }

    req.user = {
      ...decoded,
      _id: decoded.userId,
    };

    next();
  } catch (error: any) {
    sendError(res, 'Invalid or expired token.', 401);
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      sendError(res, 'Forbidden: You do not have permission to access this resource.', 403);
      return;
    }
    next();
  };
};
