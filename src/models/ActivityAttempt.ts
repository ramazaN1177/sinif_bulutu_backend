import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityAttempt extends Document {
  activityId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  score: number;
  maxScore: number;
  timeSpentSeconds: number;
  answers: Array<{ itemId: string; givenAnswer: unknown; isCorrect: boolean }>;
  completedAt: Date;
  createdAt: Date;
}

const activityAttemptSchema = new Schema<IActivityAttempt>(
  {
    activityId: { type: Schema.Types.ObjectId, ref: 'Activity', required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    score: { type: Number, required: true },
    maxScore: { type: Number, required: true },
    timeSpentSeconds: { type: Number, required: true },
    answers: [
      {
        itemId: String,
        givenAnswer: Schema.Types.Mixed,
        isCorrect: Boolean,
      },
    ],
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const ActivityAttempt = mongoose.model<IActivityAttempt>(
  'ActivityAttempt',
  activityAttemptSchema
);
