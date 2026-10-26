import { Assignment, IAssignment } from '../../models/Assignment';
import { ClassModel } from '../../models/Class';
import { Membership } from '../../models/Membership';
import { Submission } from '../../models/Submission';
import { User } from '../../models/User';
import { AppError } from '../../lib/errors';
import { toAssignmentDTO } from '../../lib/dto';
import mongoose from 'mongoose';

export class AssignmentService {
  static async createAssignment(teacherId: string, data: any) {
    const cls = await ClassModel.findById(data.classId);
    if (!cls) throw new AppError('class_not_found', 404, 'Sınıf bulunamadı.');
    if (cls.teacherId.toString() !== teacherId) {
      throw new AppError('forbidden', 403, 'Bu sınıfa ödev ekleme yetkiniz yok.');
    }

    const assignment = await Assignment.create({
      ...data,
      teacherId,
      dueAt: new Date(data.dueAt),
    });

    return toAssignmentDTO(assignment, {
      className: cls.name,
      classColor: cls.color,
      totalSubmissions: 0,
      gradedCount: 0,
    });
  }

  static async getAssignments(userId: string, role: 'teacher' | 'student', filterClassId?: string) {
    if (role === 'teacher') {
      const query: any = { teacherId: userId };
      if (filterClassId) query.classId = filterClassId;

      const assignments = await Assignment.find(query).sort({ dueAt: 1 }).populate('classId', 'name color');

      const results = await Promise.all(
        assignments.map(async (a) => {
          const cls = a.classId as any;
          const totalStudents = await Membership.countDocuments({ classId: a.classId, status: 'active' });
          const submissions = await Submission.find({ assignmentId: a._id });
          const submittedCount = submissions.filter((s) => ['submitted', 'late', 'graded'].includes(s.status)).length;
          const gradedCount = submissions.filter((s) => s.status === 'graded').length;

          return {
            id: a._id.toString(),
            classId: a.classId ? (cls._id || a.classId).toString() : '',
            className: cls?.name || 'Sınıf',
            classColor: cls?.color || '#2563EB',
            title: a.title,
            description: a.description,
            dueAt: a.dueAt,
            maxPoints: a.maxPoints,
            status: a.status,
            totalStudents,
            submittedCount,
            notSubmittedCount: Math.max(0, totalStudents - submittedCount),
            gradedCount,
            submissionRate: `${submittedCount}/${totalStudents}`,
            createdAt: a.createdAt,
          };
        })
      );

      return results;
    } else {
      // Student view
      // Find classes student is enrolled in
      const memberships = await Membership.find({ studentId: userId, status: 'active' });
      const classIds = memberships.map((m) => m.classId);

      const query: any = { classId: { $in: classIds }, status: 'published' };
      if (filterClassId && classIds.some((c) => c.toString() === filterClassId)) {
        query.classId = filterClassId;
      }

      const assignments = await Assignment.find(query).sort({ dueAt: 1 }).populate('classId', 'name color');

      const results = await Promise.all(
        assignments.map(async (a) => {
          const cls = a.classId as any;
          const sub = await Submission.findOne({ assignmentId: a._id, studentId: userId });

          let studentStatus: 'not_submitted' | 'submitted' | 'late' | 'graded' = 'not_submitted';
          if (sub) {
            studentStatus = sub.status as any;
          }

          return {
            id: a._id.toString(),
            classId: a.classId ? (cls._id || a.classId).toString() : '',
            className: cls?.name || 'Sınıf',
            classColor: cls?.color || '#2563EB',
            title: a.title,
            description: a.description,
            dueAt: a.dueAt,
            maxPoints: a.maxPoints,
            studentStatus,
            points: sub?.points,
            feedback: sub?.feedback,
            submittedAt: sub?.submittedAt,
            submissionId: sub?._id?.toString(),
            createdAt: a.createdAt,
          };
        })
      );

      return results;
    }
  }

  static async getAssignmentDetail(assignmentId: string, userId: string, role: 'teacher' | 'student') {
    const assignment = await Assignment.findById(assignmentId).populate('classId', 'name color');
    if (!assignment) throw new AppError('assignment_not_found', 404, 'Ödev bulunamadı.');

    const cls = assignment.classId as any;

    if (role === 'teacher') {
      if (assignment.teacherId.toString() !== userId) {
        throw new AppError('forbidden', 403, 'Bu ödeve erişim yetkiniz yok.');
      }

      // Get all active students of the class
      const memberships = await Membership.find({ classId: cls._id, status: 'active' }).populate(
        'studentId',
        'firstName lastName avatarUrl email'
      );
      const submissions = await Submission.find({ assignmentId: assignment._id }).populate(
        'studentId',
        'firstName lastName avatarUrl email'
      );

      const submissionMap = new Map();
      submissions.forEach((s) => {
        submissionMap.set(s.studentId._id.toString(), s);
      });

      const submittedList: any[] = [];
      const notSubmittedList: any[] = [];

      memberships.forEach((m) => {
        const student = m.studentId as any;
        if (!student) return;
        const sub = submissionMap.get(student._id.toString());

        if (sub && ['submitted', 'late', 'graded'].includes(sub.status)) {
          submittedList.push({
            id: sub._id.toString(),
            studentId: student._id.toString(),
            studentName: `${student.firstName} ${student.lastName}`,
            avatarUrl: student.avatarUrl,
            status: sub.status,
            submittedAt: sub.submittedAt,
            points: sub.points,
            feedback: sub.feedback,
            files: sub.files,
            textAnswer: sub.textAnswer,
          });
        } else {
          notSubmittedList.push({
            id: student._id.toString(),
            studentName: `${student.firstName} ${student.lastName}`,
            avatarUrl: student.avatarUrl,
            email: student.email,
          });
        }
      });

      return {
        id: assignment._id.toString(),
        classId: cls._id.toString(),
        className: cls.name,
        classColor: cls.color,
        title: assignment.title,
        description: assignment.description,
        attachments: assignment.attachments,
        dueAt: assignment.dueAt,
        maxPoints: assignment.maxPoints,
        submissionTypes: assignment.submissionTypes,
        allowLate: assignment.allowLate,
        status: assignment.status,
        stats: {
          total: memberships.length,
          submitted: submittedList.length,
          notSubmitted: notSubmittedList.length,
          graded: submittedList.filter((s) => s.status === 'graded').length,
        },
        submittedList,
        notSubmittedList,
      };
    } else {
      // Student
      const isMember = await Membership.findOne({ classId: cls._id, studentId: userId, status: 'active' });
      if (!isMember) throw new AppError('forbidden', 403, 'Bu sınıfa kayıtlı değilsiniz.');

      const mySubmission = await Submission.findOne({ assignmentId: assignment._id, studentId: userId });

      return {
        id: assignment._id.toString(),
        classId: cls._id.toString(),
        className: cls.name,
        classColor: cls.color,
        title: assignment.title,
        description: assignment.description,
        attachments: assignment.attachments,
        dueAt: assignment.dueAt,
        maxPoints: assignment.maxPoints,
        submissionTypes: assignment.submissionTypes,
        allowLate: assignment.allowLate,
        mySubmission: mySubmission
          ? {
              id: mySubmission._id.toString(),
              status: mySubmission.status,
              submittedAt: mySubmission.submittedAt,
              points: mySubmission.points,
              feedback: mySubmission.feedback,
              files: mySubmission.files,
              textAnswer: mySubmission.textAnswer,
            }
          : null,
      };
    }
  }
}
