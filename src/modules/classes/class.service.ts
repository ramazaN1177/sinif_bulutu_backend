import { ClassModel, IClass } from '../../models/Class';
import { Membership } from '../../models/Membership';
import { Assignment } from '../../models/Assignment';
import { Submission } from '../../models/Submission';
import { User } from '../../models/User';
import { generateJoinCode } from '../../lib/joinCode';
import { AppError } from '../../lib/errors';
import { toClassDTO } from '../../lib/dto';
import mongoose from 'mongoose';

export class ClassService {
  static async createClass(teacherId: string, data: Partial<IClass>) {
    // Generate unique 6-char code with retries
    let joinCode = '';
    for (let i = 0; i < 5; i++) {
      const code = generateJoinCode();
      const existing = await ClassModel.findOne({ joinCode: code });
      if (!existing) {
        joinCode = code;
        break;
      }
    }

    if (!joinCode) {
      throw new AppError('code_generation_failed', 500, 'Sınıf kodu üretilemedi.');
    }

    const cls = await ClassModel.create({
      ...data,
      teacherId,
      joinCode,
    });

    return toClassDTO(cls, {
      studentCount: 0,
      activeAssignmentCount: 0,
      ungradedSubmissionCount: 0,
    });
  }

  static async getMyClasses(userId: string, role: 'teacher' | 'student') {
    if (role === 'teacher') {
      const classes = await ClassModel.find({ teacherId: userId, archived: false }).sort({ createdAt: -1 });

      const results = await Promise.all(
        classes.map(async (cls) => {
          const studentCount = await Membership.countDocuments({ classId: cls._id, status: 'active' });
          const activeAssignmentCount = await Assignment.countDocuments({
            classId: cls._id,
            status: 'published',
            dueAt: { $gte: new Date() },
          });

          // Count submissions awaiting grading in this class
          const ungradedSubmissionCount = await Submission.countDocuments({
            classId: cls._id,
            status: { $in: ['submitted', 'late'] },
          });

          return toClassDTO(cls, {
            studentCount,
            activeAssignmentCount,
            ungradedSubmissionCount,
          });
        })
      );

      return results;
    } else {
      // Student memberships
      const memberships = await Membership.find({ studentId: userId, status: { $in: ['active', 'pending'] } });
      const classIds = memberships.map((m) => m.classId);

      const classes = await ClassModel.find({ _id: { $in: classIds }, archived: false }).populate('teacherId', 'firstName lastName');

      const results = await Promise.all(
        classes.map(async (cls) => {
          const teacher = cls.teacherId as any;
          const teacherName = teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Öğretmen';

          const activeAssignmentCount = await Assignment.countDocuments({
            classId: cls._id,
            status: 'published',
            dueAt: { $gte: new Date() },
          });

          return toClassDTO(cls, {
            activeAssignmentCount,
            teacherName,
          });
        })
      );

      return results;
    }
  }

  static async getClassDetail(classId: string, userId: string, role: 'teacher' | 'student') {
    const cls = await ClassModel.findById(classId);
    if (!cls) throw new AppError('not_found', 404, 'Sınıf bulunamadı.');

    if (role === 'teacher' && cls.teacherId.toString() !== userId) {
      throw new AppError('forbidden', 403, 'Bu sınıfa erişim yetkiniz yok.');
    }

    if (role === 'student') {
      const isMember = await Membership.findOne({ classId, studentId: userId, status: 'active' });
      if (!isMember) throw new AppError('forbidden', 403, 'Bu sınıfa kayıtlı değilsiniz.');
    }

    const studentCount = await Membership.countDocuments({ classId: cls._id, status: 'active' });
    const activeAssignmentCount = await Assignment.countDocuments({
      classId: cls._id,
      status: 'published',
      dueAt: { $gte: new Date() },
    });

    return toClassDTO(cls, { studentCount, activeAssignmentCount });
  }

  static async joinClass(studentId: string, rawCode: string) {
    const code = rawCode.trim().toUpperCase();
    const cls = await ClassModel.findOne({ joinCode: code, archived: false });

    if (!cls) throw new AppError('class_not_found', 404, 'Bu kodla bir sınıf bulunamadı.');
    if (!cls.joiningOpen) throw new AppError('joining_closed', 403, 'Bu sınıf yeni katılıma kapalı.');

    const existing = await Membership.findOne({ classId: cls._id, studentId });
    if (existing && ['active', 'pending'].includes(existing.status)) {
      throw new AppError('already_member', 409, 'Bu sınıfa zaten katıldınız.');
    }

    const status = cls.joinMode === 'auto' ? 'active' : 'pending';
    const membership = await Membership.findOneAndUpdate(
      { classId: cls._id, studentId },
      { $set: { status, joinedAt: status === 'active' ? new Date() : undefined } },
      { upsert: true, new: true }
    );

    return {
      classId: cls._id.toString(),
      className: cls.name,
      status: membership.status,
    };
  }

  static async getMembers(classId: string) {
    const memberships = await Membership.find({ classId, status: 'active' }).populate('studentId', 'firstName lastName email avatarUrl');

    const totalClassAssignments = await Assignment.countDocuments({ classId, status: 'published' });

    const students = await Promise.all(
      memberships.map(async (m) => {
        const student = m.studentId as any;
        if (!student) return null;

        // Count student submissions in this class
        const submittedCount = await Submission.countDocuments({
          classId,
          studentId: student._id,
          status: { $in: ['submitted', 'late', 'graded'] },
        });

        // Compute average score of graded submissions
        const gradedSubmissions = await Submission.find({
          classId,
          studentId: student._id,
          status: 'graded',
          points: { $exists: true },
        });

        const avgScore =
          gradedSubmissions.length > 0
            ? Math.round(gradedSubmissions.reduce((acc, s) => acc + (s.points || 0), 0) / gradedSubmissions.length)
            : 85;

        return {
          id: student._id.toString(),
          classId,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          avatarUrl: student.avatarUrl,
          submissionRate: `${submittedCount}/${Math.max(totalClassAssignments, 1)}`,
          averageScore: avgScore,
          joinedAt: m.joinedAt,
        };
      })
    );

    return students.filter(Boolean);
  }
}
