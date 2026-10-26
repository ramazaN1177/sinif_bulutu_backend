import mongoose, { Schema, Document } from 'mongoose';

export interface IClass extends Document {
  teacherId: mongoose.Types.ObjectId;
  name: string;
  subject: string;
  description?: string;
  color: string;
  term?: string;
  joinCode: string;
  joinMode: 'auto' | 'approval';
  joiningOpen: boolean;
  allowLate: boolean;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const classSchema = new Schema<IClass>(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, maxlength: 80, trim: true },
    subject: { type: String, required: true, maxlength: 60, trim: true },
    description: { type: String, maxlength: 500, trim: true },
    color: { type: String, default: '#2563EB' },
    term: String,
    joinCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    joinMode: { type: String, enum: ['auto', 'approval'], default: 'auto' },
    joiningOpen: { type: Boolean, default: true },
    allowLate: { type: Boolean, default: false },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ClassModel = mongoose.model<IClass>('Class', classSchema);
