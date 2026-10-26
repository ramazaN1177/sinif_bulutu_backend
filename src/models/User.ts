import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash?: string;
  googleId?: string;
  emailVerified: boolean;
  role: 'teacher' | 'student' | null;
  profileCompleted: boolean;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  school?: string;
  branch?: string;     // Teacher
  gradeLevel?: string; // Student
  birthYear?: number;
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, select: false },
    googleId: { type: String, unique: true, sparse: true },
    emailVerified: { type: Boolean, default: true }, // Auto verified for dev ease
    role: { type: String, enum: ['teacher', 'student'], default: null },
    profileCompleted: { type: Boolean, default: false },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    avatarUrl: String,
    school: String,
    branch: String,
    gradeLevel: String,
    birthYear: Number,
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);
