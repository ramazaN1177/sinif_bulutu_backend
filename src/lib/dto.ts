import { IUser } from '../models/User';
import { IClass } from '../models/Class';
import { IAssignment } from '../models/Assignment';
import { ISubmission } from '../models/Submission';

export function toUserDTO(user: IUser) {
  return {
    id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    profileCompleted: user.profileCompleted,
    avatarUrl: user.avatarUrl,
    school: user.school,
    branch: user.branch,
    gradeLevel: user.gradeLevel,
    birthYear: user.birthYear,
    emailVerified: user.emailVerified,
  };
}

export function toClassDTO(cls: IClass, extra?: { studentCount?: number; activeAssignmentCount?: number; ungradedSubmissionCount?: number; teacherName?: string }) {
  return {
    id: cls._id.toString(),
    teacherId: cls.teacherId.toString(),
    name: cls.name,
    subject: cls.subject,
    description: cls.description,
    color: cls.color,
    term: cls.term,
    joinCode: cls.joinCode,
    joinMode: cls.joinMode,
    joiningOpen: cls.joiningOpen,
    allowLate: cls.allowLate,
    archived: cls.archived,
    createdAt: cls.createdAt,
    ...extra,
  };
}

export function toAssignmentDTO(assignment: IAssignment, extra?: { className?: string; classColor?: string; totalSubmissions?: number; gradedCount?: number; mySubmission?: unknown }) {
  return {
    id: assignment._id.toString(),
    classId: assignment.classId.toString(),
    teacherId: assignment.teacherId.toString(),
    title: assignment.title,
    description: assignment.description,
    attachments: assignment.attachments,
    dueAt: assignment.dueAt,
    maxPoints: assignment.maxPoints,
    submissionTypes: assignment.submissionTypes,
    allowLate: assignment.allowLate,
    status: assignment.status,
    createdAt: assignment.createdAt,
    ...extra,
  };
}

export function toSubmissionDTO(sub: ISubmission, studentName?: string) {
  return {
    id: sub._id.toString(),
    assignmentId: sub.assignmentId.toString(),
    classId: sub.classId.toString(),
    studentId: sub.studentId.toString(),
    studentName,
    textAnswer: sub.textAnswer,
    files: sub.files,
    fileCount: sub.files?.length || 0,
    status: sub.status,
    submittedAt: sub.submittedAt,
    points: sub.points,
    feedback: sub.feedback,
    gradedAt: sub.gradedAt,
  };
}

export function toActivityDTO(activity: any, extra?: { className?: string; playCount?: number; myBestScore?: number }) {
  return {
    id: activity._id.toString(),
    classId: activity.classId.toString(),
    teacherId: activity.teacherId.toString(),
    title: activity.title,
    description: activity.description,
    templateType: activity.templateType,
    items: activity.items,
    categories: activity.categories,
    boxColors: activity.boxColors,
    boxImages: activity.boxImages,
    subject: activity.subject,
    gradeLevel: activity.gradeLevel,
    timeLimitSeconds: activity.timeLimitSeconds,
    maxScore: activity.maxScore,
    status: activity.status,
    dueAt: activity.dueAt,
    createdAt: activity.createdAt,
    ...extra,
  };
}

