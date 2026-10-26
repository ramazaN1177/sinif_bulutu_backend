import mongoose, { Schema, Document } from 'mongoose';

export interface IMembership extends Document {
  classId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  status: 'pending' | 'active' | 'removed' | 'left';
  joinedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const membershipSchema = new Schema<IMembership>(
  {
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['pending', 'active', 'removed', 'left'], default: 'active' },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

membershipSchema.index({ classId: 1, studentId: 1 }, { unique: true });

export const Membership = mongoose.model<IMembership>('Membership', membershipSchema);
