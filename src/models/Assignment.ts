import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignment extends Document {
  classId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  attachments: Array<{ key?: string; name: string; size: number; url?: string; mime?: string }>;
  dueAt: Date;
  maxPoints: number;
  submissionTypes: Array<'photo' | 'file' | 'text'>;
  allowLate: boolean;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

const assignmentSchema = new Schema<IAssignment>(
  {
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, maxlength: 100, trim: true },
    description: { type: String, maxlength: 2000, trim: true },
    attachments: [
      {
        key: String,
        name: String,
        size: Number,
        url: String,
        mime: String,
      },
    ],
    dueAt: { type: Date, required: true },
    maxPoints: { type: Number, default: 100, min: 1 },
    submissionTypes: [{ type: String, enum: ['photo', 'file', 'text'] }],
    allowLate: { type: Boolean, default: false },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignment>('Assignment', assignmentSchema);
