import mongoose, { Schema, Document } from 'mongoose';

export interface ISubmission extends Document {
  assignmentId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  textAnswer?: string;
  files: Array<{ key?: string; name: string; size: number; url?: string; mime?: string; order?: number }>;
  status: 'draft' | 'submitted' | 'late' | 'graded' | 'returned';
  submittedAt?: Date;
  points?: number;
  feedback?: string;
  gradedAt?: Date;
  returnNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const submissionSchema = new Schema<ISubmission>(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    textAnswer: { type: String, maxlength: 10000 },
    files: [
      {
        key: String,
        name: String,
        size: Number,
        url: String,
        mime: String,
        order: Number,
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'submitted', 'late', 'graded', 'returned'],
      default: 'draft',
    },
    submittedAt: Date,
    points: { type: Number, min: 0 },
    feedback: String,
    gradedAt: Date,
    returnNote: String,
  },
  { timestamps: true }
);

submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

export const Submission = mongoose.model<ISubmission>('Submission', submissionSchema);
