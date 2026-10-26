import { Activity, IActivity } from '../../models/Activity';
import { ActivityAttempt } from '../../models/ActivityAttempt';
import { ClassModel } from '../../models/Class';
import { Membership } from '../../models/Membership';
import { User } from '../../models/User';
import { AppError } from '../../lib/errors';
import { toActivityDTO } from '../../lib/dto';

export class ActivityService {
  static async createActivity(teacherId: string, data: any) {
    const cls = await ClassModel.findById(data.classId);
    if (!cls) throw new AppError('class_not_found', 404, 'Sınıf bulunamadı.');
    if (cls.teacherId.toString() !== teacherId) {
      throw new AppError('forbidden', 403, 'Bu sınıfa etkinlik oluşturma yetkiniz yok.');
    }

    const activity = await Activity.create({
      ...data,
      teacherId,
      dueAt: data.dueAt ? new Date(data.dueAt) : undefined,
    });

    return toActivityDTO(activity, { className: cls.name, playCount: 0 });
  }

  static async getActivities(userId: string, role: 'teacher' | 'student', filterClassId?: string) {
    if (role === 'teacher') {
      const query: any = { teacherId: userId };
      if (filterClassId) query.classId = filterClassId;

      const activities = await Activity.find(query).sort({ createdAt: -1 }).populate('classId', 'name color');

      const results = await Promise.all(
        activities.map(async (act) => {
          const cls = act.classId as any;
          const playCount = await ActivityAttempt.countDocuments({ activityId: act._id });

          return {
            id: act._id.toString(),
            classId: act.classId ? (cls._id || act.classId).toString() : '',
            className: cls?.name || 'Sınıf',
            classColor: cls?.color || '#8B5CF6',
            title: act.title,
            description: act.description,
            templateType: act.templateType,
            itemCount: act.items?.length || 0,
            timeLimitSeconds: act.timeLimitSeconds,
            maxScore: act.maxScore,
            playCount,
            createdAt: act.createdAt,
          };
        })
      );

      return results;
    } else {
      // Student
      const memberships = await Membership.find({ studentId: userId, status: 'active' });
      const classIds = memberships.map((m) => m.classId);

      const query: any = { classId: { $in: classIds }, status: 'published' };
      if (filterClassId && classIds.some((c) => c.toString() === filterClassId)) {
        query.classId = filterClassId;
      }

      const activities = await Activity.find(query).sort({ createdAt: -1 }).populate('classId', 'name color');

      const results = await Promise.all(
        activities.map(async (act) => {
          const cls = act.classId as any;
          const bestAttempt = await ActivityAttempt.findOne({ activityId: act._id, studentId: userId }).sort({
            score: -1,
            timeSpentSeconds: 1,
          });

          return {
            id: act._id.toString(),
            classId: act.classId ? (cls._id || act.classId).toString() : '',
            className: cls?.name || 'Sınıf',
            classColor: cls?.color || '#8B5CF6',
            title: act.title,
            description: act.description,
            templateType: act.templateType,
            itemCount: act.items?.length || 0,
            timeLimitSeconds: act.timeLimitSeconds,
            maxScore: act.maxScore,
            myBestScore: bestAttempt ? bestAttempt.score : null,
            hasPlayed: !!bestAttempt,
            createdAt: act.createdAt,
          };
        })
      );

      return results;
    }
  }

  static async getActivityDetail(activityId: string, userId: string, role: 'teacher' | 'student') {
    const act = await Activity.findById(activityId).populate('classId', 'name color');
    if (!act) throw new AppError('activity_not_found', 404, 'Etkinlik bulunamadı.');

    const cls = act.classId as any;

    if (role === 'student') {
      const isMember = await Membership.findOne({ classId: cls._id, studentId: userId, status: 'active' });
      if (!isMember) throw new AppError('forbidden', 403, 'Bu sınıfa kayıtlı değilsiniz.');
    }

    // Leaderboard top 10
    const topAttempts = await ActivityAttempt.find({ activityId: act._id })
      .sort({ score: -1, timeSpentSeconds: 1 })
      .limit(10)
      .populate('studentId', 'firstName lastName avatarUrl');

    const leaderboard = topAttempts.map((att, index) => {
      const student = att.studentId as any;
      return {
        rank: index + 1,
        studentId: student?._id?.toString(),
        studentName: student ? `${student.firstName} ${student.lastName}` : 'Öğrenci',
        avatarUrl: student?.avatarUrl,
        score: att.score,
        timeSpentSeconds: att.timeSpentSeconds,
        completedAt: att.completedAt,
      };
    });

    return {
      id: act._id.toString(),
      classId: cls._id.toString(),
      className: cls.name,
      classColor: cls.color,
      title: act.title,
      description: act.description,
      templateType: act.templateType,
      items: act.items,
      timeLimitSeconds: act.timeLimitSeconds,
      maxScore: act.maxScore,
      leaderboard,
    };
  }

  static async submitAttempt(studentId: string, activityId: string, data: any) {
    const act = await Activity.findById(activityId);
    if (!act) throw new AppError('activity_not_found', 404, 'Etkinlik bulunamadı.');

    const membership = await Membership.findOne({ classId: act.classId, studentId, status: 'active' });
    if (!membership) throw new AppError('forbidden', 403, 'Bu sınıfa kayıtlı değilsiniz.');

    const attempt = await ActivityAttempt.create({
      activityId: act._id,
      classId: act.classId,
      studentId,
      score: data.score,
      maxScore: data.maxScore || act.maxScore,
      timeSpentSeconds: data.timeSpentSeconds,
      answers: data.answers || [],
      completedAt: new Date(),
    });

    return {
      attemptId: attempt._id.toString(),
      score: attempt.score,
      maxScore: attempt.maxScore,
      timeSpentSeconds: attempt.timeSpentSeconds,
    };
  }
}
