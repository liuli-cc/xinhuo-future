import { canManageAccounts, canReviewEvidence, ensurePlatformSchema, getUserBySessionToken, isStaffRole, type CurrentUser } from "../db/platform";
import { readSessionToken } from "./auth";

export async function currentUser(request: Request) {
  await ensurePlatformSchema();
  return getUserBySessionToken(readSessionToken(request));
}

export function unauthorized(message = "请先登录") {
  return Response.json({ error: message }, { status: 401 });
}

export function forbidden(message = "当前账号没有此操作权限") {
  return Response.json({ error: message }, { status: 403 });
}

export function publicUser(user: CurrentUser) {
  return {
    id: user.id,
    studentId: user.studentId,
    name: user.name,
    email: user.email,
    role: user.role,
    accountStatus: user.accountStatus,
    accountReviewNote: user.accountReviewNote,
    forcePasswordChange: user.forcePasswordChange,
    college: user.college,
    major: user.major,
    className: user.className,
    grade: user.grade,
    phone: user.phone,
    bio: user.bio,
    targetRole: user.targetRole,
    developmentTrack: user.developmentTrack,
    interests: user.interests,
    consentAt: user.consentAt,
  };
}

export { canManageAccounts, canReviewEvidence, isStaffRole };
