/**
 * Audit Logging Service
 *
 * Tracks sensitive administrative actions for security and debug purposes.
 * Currently logs to server console (standard for Docker/Cloud Logging).
 */

type AuditAction =
  | "VERIFY_PAYMENT"
  | "UPLOAD_PAYMENT_PROOF"
  | "VERIFY_DOCUMENT"
  | "ASSIGN_EXAM"
  | "PUBLISH_ANNOUNCEMENT"
  | "FORCE_UNLOCK_FORM"
  | "BROADCAST_WA"
  | "SOFT_DELETE_PENDAFTAR"
  | "RESTORE_PENDAFTAR"
  | "UPDATE_PHONE_NUMBER"
  | "PROMOTE_CADANGAN_TO_DITERIMA";

interface AuditLogParams {
  action: AuditAction;
  adminId: string;
  adminName: string;
  targetId: string;
  targetName?: string;
  details?: any;
}

export function logAdminAction({
  action,
  adminId,
  adminName,
  targetId,
  targetName,
  details,
}: AuditLogParams) {
  const timestamp = new Date().toISOString();

  const logEntry = {
    timestamp,
    level: "AUDIT",
    action,
    admin: { id: adminId, name: adminName },
    target: { id: targetId, name: targetName },
    details,
  };

  // Structured logging to console
  console.log(`[AUDIT-LOG] ${JSON.stringify(logEntry)}`);

  // Future expansion: Save to Database table 'audit_logs'
}
