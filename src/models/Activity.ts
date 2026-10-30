import mongoose, { Schema, Document } from 'mongoose';

export type ActivityTemplateType =
  | 'quiz'
  | 'match_up'
  | 'spin_wheel'
  | 'open_box'
  | 'anagram'
  | 'categorize'
  | 'cardsort'
  | 'memory'
  | 'wheel'
  | 'box'
  | 'truefalse'
  | 'whack'
  | 'airplane'
  | 'balloon'
  | 'timeline'
  | 'dragword'
  | 'wordsearch'
  | 'race'
  | 'tower';

export interface IActivityItem {
  id: string;
  question?: string;
  answer?: string;
  options?: string[];
  correctAnswer?: string | number;
  image?: string;
  answerImage?: string;
  category?: string;
  term?: string;
  definition?: string;
  label?: string;
  points?: number;
}

export interface IActivity extends Document {
  classId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  templateType: ActivityTemplateType | string;
  items: IActivityItem[];
  categories?: string[];
  boxColors?: Record<string, number>;
  boxImages?: Record<string, string>;
  subject?: string;
  gradeLevel?: string;
  timeLimitSeconds?: number;
  maxScore: number;
  status: 'draft' | 'published';
  dueAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, maxlength: 100, trim: true },
    description: { type: String, maxlength: 1000, trim: true },
    templateType: {
      type: String,
      required: true,
    },
    items: [
      {
        id: { type: String, required: true },
        question: String,
        answer: String,
        options: [String],
        correctAnswer: Schema.Types.Mixed,
        image: String,
        answerImage: String,
        category: String,
        term: String,
        definition: String,
        label: String,
        points: { type: Number, default: 10 },
      },
    ],
    categories: [String],
    boxColors: { type: Schema.Types.Mixed, default: {} },
    boxImages: { type: Schema.Types.Mixed, default: {} },
    subject: String,
    gradeLevel: String,
    timeLimitSeconds: { type: Number, default: 60 },
    maxScore: { type: Number, default: 100 },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
    dueAt: Date,
  },
  { timestamps: true }
);

export const Activity = mongoose.model<IActivity>('Activity', activitySchema);
