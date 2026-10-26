import { Submission } from '../../models/Submission';
import { Assignment } from '../../models/Assignment';
import { Membership } from '../../models/Membership';
import { ClassModel } from '../../models/Class';
import { AppError } from '../../lib/errors';
import { toSubmissionDTO } from '../../lib/dto';

export class SubmissionService {
  static async submitAssignment(studentId: string, data: { assignmentId: string; textAnswer?: string; files?: any[] }) {
    const assignment = await Assignment.findById(data.assignmentId);
    if (!assignment) throw new AppError('assignment_not_found', 404, 'Ödev bulunamadı.');

    // Check membership
    const membership = await Membership.findOne({ classId: assignment.classId, studentId, status: 'active' });
    if (!membership) throw new AppError('forbidden', 403, 'Bu sınıfa kayıtlı değilsiniz.');

    const now = new Date();
    const isLate = now > assignment.dueAt;

    if (isLate && !assignment.allowLate) {
      throw new AppError('late_submissions_closed', 400, 'Bu ödev için teslim süresi dolmuştur ve geç teslime izin verilmemektedir.');
    }

    const status = isLate ? 'late' : 'submitted';

    const submission = await Submission.findOneAndUpdate(
      { assignmentId: assignment._id, studentId },
      {
        $set: {
          classId: assignment.classId,
          textAnswer: data.textAnswer,
          files: data.files || [],
          status,
          submittedAt: now,
        },
      },
      { upsert: true, new: true }
    );

    return toSubmissionDTO(submission);
  }

  static async gradeSubmission(teacherId: string, submissionId: string, data: { points: number; feedback?: string }) {
    const submission = await Submission.findById(submissionId);
    if (!submission) throw new AppError('submission_not_found', 404, 'Teslim bulunamadı.');

    const assignment = await Assignment.findById(submission.assignmentId);
    if (!assignment) throw new AppError('assignment_not_found', 404, 'Ödev bulunamadı.');

    if (assignment.teacherId.toString() !== teacherId) {
      throw new AppError('forbidden', 403, 'Bu ödevi notlandırma yetkiniz yok.');
    }

    if (data.points > assignment.maxPoints) {
      throw new AppError('invalid_points', 400, `Not maksimum ${assignment.maxPoints} olabilir.`);
    }

    submission.points = data.points;
    submission.feedback = data.feedback;
    submission.status = 'graded';
    submission.gradedAt = new Date();
    await submission.save();

    return toSubmissionDTO(submission);
  }

  static async getSubmission(submissionId: string, userId: string, role: 'teacher' | 'student') {
    const submission = await Submission.findById(submissionId).populate('studentId', 'firstName lastName avatarUrl email');
    if (!submission) throw new AppError('submission_not_found', 404, 'Teslim bulunamadı.');

    const student = submission.studentId as any;

    if (role === 'student' && student._id.toString() !== userId) {
      throw new AppError('forbidden', 403, 'Bu teslime erişim yetkiniz yok.');
    }

    return toSubmissionDTO(submission, `${student.firstName} ${student.lastName}`);
  }
}
