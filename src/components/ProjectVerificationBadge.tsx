import { ProjectVerification, getVerificationStatusLabel, getVerificationBadgeColor, getProjectVerificationProgress } from "@/lib/projects";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, XCircle, Clock } from "lucide-react";

export interface ProjectVerificationBadgeProps {
  verification?: ProjectVerification;
  showProgress?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ProjectVerificationBadge({ verification, showProgress = true, size = "md" }: ProjectVerificationBadgeProps) {
  if (!verification) return null;

  const label = getVerificationStatusLabel(verification.status);
  const badgeColor = getVerificationBadgeColor(verification.status);
  const progress = getProjectVerificationProgress(verification);

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const getIcon = () => {
    switch (verification.status) {
      case "Verified/Approved":
        return <CheckCircle className="h-4 w-4" />;
      case "Under Review":
        return <Clock className="h-4 w-4" />;
      case "Missing Documents":
        return <AlertCircle className="h-4 w-4" />;
      case "Rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <div className={`inline-flex items-center gap-2 rounded-lg border ${badgeColor} ${sizeClasses[size]} font-semibold`}>
        {getIcon()}
        <span>{label}</span>
      </div>

      {showProgress && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">تقدم التحقق</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {verification.verifiedBy && (
        <div className="text-xs text-muted-foreground">
          تم التحقق بواسطة: <span className="font-semibold">{verification.verifiedBy}</span>
        </div>
      )}

      {verification.notes && (
        <div className="rounded-md bg-background/50 p-2 text-xs text-muted-foreground">
          {verification.notes}
        </div>
      )}
    </div>
  );
}
