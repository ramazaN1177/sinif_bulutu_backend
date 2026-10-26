import crypto from 'crypto';
import { User, IUser } from '../../models/User';
import { RefreshToken } from '../../models/RefreshToken';
import { hashPassword, comparePassword } from '../../lib/password';
import { generateAccessToken, generateRefreshToken, hashToken } from '../../lib/jwt';
import { AppError } from '../../lib/errors';
import { toUserDTO } from '../../lib/dto';

export class AuthService {
  static async register(data: { email: string; password: string; firstName: string; lastName: string; role?: 'teacher' | 'student' }) {
    const existing = await User.findOne({ email: data.email });
    if (existing) {
      throw new AppError('email_taken', 409, 'Bu e-posta adresi zaten kullanımda.');
    }

    const passwordHash = await hashPassword(data.password);
    const user = await User.create({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role || null,
      emailVerified: true,
      tokenVersion: 0,
    });


    const accessToken = generateAccessToken({ sub: user.id, role: user.role, tv: user.tokenVersion });
    const { token: refreshToken, hash: refreshHash } = generateRefreshToken();

    const familyId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await RefreshToken.create({
      userId: user._id,
      familyId,
      tokenHash: refreshHash,
      expiresAt,
    });

    return {
      user: toUserDTO(user),
      accessToken,
      refreshToken,
    };
  }

  static async login(data: { email: string; password: string }) {
    const user = await User.findOne({ email: data.email }).select('+passwordHash');
    if (!user || !user.passwordHash) {
      throw new AppError('invalid_credentials', 401, 'E-posta veya şifre hatalı.');
    }

    const isMatch = await comparePassword(data.password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('invalid_credentials', 401, 'E-posta veya şifre hatalı.');
    }

    const accessToken = generateAccessToken({ sub: user.id, role: user.role, tv: user.tokenVersion });
    const { token: refreshToken, hash: refreshHash } = generateRefreshToken();

    const familyId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await RefreshToken.create({
      userId: user._id,
      familyId,
      tokenHash: refreshHash,
      expiresAt,
    });

    return {
      user: toUserDTO(user),
      accessToken,
      refreshToken,
    };
  }

  static async googleAuth(data: {
    email: string;
    firstName: string;
    lastName?: string;
    avatarUrl?: string;
    googleId: string;
    role?: 'teacher' | 'student';
  }) {
    let user = await User.findOne({
      $or: [{ googleId: data.googleId }, { email: data.email }],
    });

    if (user) {
      if (!user.googleId) {
        user.googleId = data.googleId;
      }
      if (!user.role && data.role) {
        user.role = data.role;
      }
      if (data.avatarUrl && !user.avatarUrl) {
        user.avatarUrl = data.avatarUrl;
      }
      user.emailVerified = true;
      await user.save();
    } else {
      user = await User.create({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName || 'Kullanıcı',
        googleId: data.googleId,
        avatarUrl: data.avatarUrl,
        role: data.role || null,
        emailVerified: true,
        tokenVersion: 0,
      });
    }

    const accessToken = generateAccessToken({
      sub: user.id,
      role: user.role,
      tv: user.tokenVersion,
    });
    const { token: refreshToken, hash: refreshHash } = generateRefreshToken();

    const familyId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await RefreshToken.create({
      userId: user._id,
      familyId,
      tokenHash: refreshHash,
      expiresAt,
    });

    return {
      user: toUserDTO(user),
      accessToken,
      refreshToken,
    };
  }

  static async refresh(token: string) {
    const tokenHash = hashToken(token);
    const currentToken = await RefreshToken.findOne({ tokenHash });

    if (!currentToken) {
      throw new AppError('refresh_invalid', 401, 'Geçersiz oturum anahtarı.');
    }

    // Reuse detection
    if (currentToken.revokedAt) {
      await RefreshToken.updateMany({ familyId: currentToken.familyId }, { $set: { revokedAt: new Date() } });
      throw new AppError('refresh_invalid', 401, 'Güvenlik ihlali tespit edildi. Lütfen tekrar giriş yapınız.');
    }

    const user = await User.findById(currentToken.userId);
    if (!user) {
      throw new AppError('refresh_invalid', 401, 'Kullanıcı bulunamadı.');
    }

    // Revoke old token
    currentToken.revokedAt = new Date();
    await currentToken.save();

    // Issue new token in same family
    const accessToken = generateAccessToken({ sub: user.id, role: user.role, tv: user.tokenVersion });
    const { token: newRefreshToken, hash: newRefreshHash } = generateRefreshToken();

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({
      userId: user._id,
      familyId: currentToken.familyId,
      tokenHash: newRefreshHash,
      expiresAt,
    });

    return {
      user: toUserDTO(user),
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async setRole(userId: string, role: 'teacher' | 'student') {
    const user = await User.findById(userId);
    if (!user) throw new AppError('not_found', 404, 'Kullanıcı bulunamadı.');
    if (user.role) throw new AppError('role_already_set', 409, 'Rol daha önce seçilmiş ve değiştirilemez.');

    user.role = role;
    await user.save();

    const accessToken = generateAccessToken({ sub: user.id, role: user.role, tv: user.tokenVersion });
    return { user: toUserDTO(user), accessToken };
  }

  static async updateProfile(userId: string, data: Partial<IUser>) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('not_found', 404, 'Kullanıcı bulunamadı.');

    if (data.school !== undefined) user.school = data.school;
    if (data.branch !== undefined) user.branch = data.branch;
    if (data.gradeLevel !== undefined) user.gradeLevel = data.gradeLevel;
    if (data.birthYear !== undefined) user.birthYear = data.birthYear;
    if (data.avatarUrl !== undefined) user.avatarUrl = data.avatarUrl;

    user.profileCompleted = true;
    await user.save();

    return toUserDTO(user);
  }
}
