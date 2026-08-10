import { User, IUser } from '../models/User';
import { comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { LoginInput } from '../validators/authValidator';

export class AuthService {
  static async login(input: LoginInput) {
    const { email, password } = input;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      throw { statusCode: 401, message: 'Invalid email or password' };
    }

    if (!user.isActive) {
      throw { statusCode: 401, message: 'Account is deactivated. Contact admin.' };
    }

    const isMatch = await comparePassword(password, user.password!);
    if (!isMatch) {
      throw { statusCode: 401, message: 'Invalid email or password' };
    }

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const userObj = user.toObject();
    delete userObj.password;

    return {
      token,
      user: userObj,
    };
  }

  static async getCurrentUser(userId: string) {
    const user = await User.findById(userId).lean();
    if (!user) {
      throw { statusCode: 44, message: 'User not found' };
    }
    return user;
  }
}
