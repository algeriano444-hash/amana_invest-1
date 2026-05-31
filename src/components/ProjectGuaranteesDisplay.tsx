import {
  Guarantee,
  GuaranteeType,
  GUARANTEE_TYPE_LABELS,
  GUARANTEE_ICONS,
  getGuaranteesByType,
  getTotalGuaranteeValue,
} from "@/lib/projects";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, FileCheck, Zap } from "lucide-react";

export interface ProjectGuaranteesDisplayProps {
  guarantees?: Guarantee[];
  title?: string;
  showSummary?: boolean;
}

export function ProjectGuaranteesDisplay({
  guarantees = [],
  title = "نظام الضمانات",
  showSummary = true,
}: ProjectGuaranteesDisplayProps) {
  if (!guarantees || guarantees.length === 0) {
    return (
      <Card className="border border-dashed border-border p-6 text-center">
        <Shield className="mx-auto mb-2 h-8 w-8 text-muted-foreground opacity-50" />
        <p className="text-sm text-muted-foreground">لا توجد ضمانات مسجلة حالياً.</p>
      </Card>
    );
  }

  const guaranteeTypes: GuaranteeType[] = ["Personal", "Financial", "Commercial", "Technical"];
  const totalValue = getTotalGuaranteeValue(guarantees);

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <h3 className="font-display text-lg font-bold">{title}</h3>
      </div>

      {/* Summary */}
      {showSummary && (
        <div className="grid gap-3 md:grid-cols-4">
          <Card className="bg-gradient-card p-4">
            <div className="text-xs text-muted-foreground">إجمالي الضمانات</div>
            <div className="mt-2 font-display text-lg font-bold">{guarantees.length}</div>
          </Card>
          <Card className="bg-gradient-card p-4">
            <div className="text-xs text-muted-foreground">القيمة المالية</div>
            <div className="mt-2 font-display text-lg font-bold">
              {new Intl.NumberFormat("ar-DZ").format(totalValue)} دج
            </div>
          </Card>
          {guaranteeTypes.map((type) => {
            const count = getGuaranteesByType(guarantees, type).length;
            return (
              <Card key={type} className="bg-gradient-card p-4">
                <div className="text-xs text-muted-foreground">{GUARANTEE_TYPE_LABELS[type]}</div>
                <div className="mt-2 font-display text-lg font-bold">{count}</div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Guarantees by Type */}
      <div className="space-y-4">
        {guaranteeTypes.map((guaranteeType) => {
          const typeGuarantees = getGuaranteesByType(guarantees, guaranteeType);
          if (typeGuarantees.length === 0) return null;

          return (
            <Card key={guaranteeType} className="border border-border/50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-2xl">{GUARANTEE_ICONS[guaranteeType]}</span>
                <div>
                  <h4 className="font-semibold text-foreground">{GUARANTEE_TYPE_LABELS[guaranteeType]}</h4>
                  <p className="text-xs text-muted-foreground">{typeGuarantees.length} ضمان</p>
                </div>
              </div>

              <div className="space-y-2">
                {typeGuarantees.map((guarantee) => (
                  <GuaranteeCard key={guarantee.id} guarantee={guarantee} />
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function GuaranteeCard({ guarantee }: { guarantee: Guarantee }) {
  const renderDetails = () => {
    const { details } = guarantee;
    
    switch (guarantee.type) {
      case "Personal":
        if ("guarantor" in details) {
          return (
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">النوع:</span>
                <span className="font-semibold">{details.type === "legal_pledge" ? "تعهد قانوني" : "ضامن شخصي"}</span>
              </div>
              {details.guarantor && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الضامن:</span>
                  <span className="font-semibold">{details.guarantor}</span>
                </div>
              )}
            </div>
          );
        }
        break;

      case "Financial":
        if ("value" in details) {
          return (
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">النوع:</span>
                <span className="font-semibold">
                  {details.type === "escrow" ? "حساب ضمان" : "رهن معدات"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">القيمة:</span>
                <span className="font-semibold">{new Intl.NumberFormat("ar-DZ").format(details.value)} دج</span>
              </div>
              {details.institution && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المؤسسة:</span>
                  <span className="font-semibold">{details.institution}</span>
                </div>
              )}
            </div>
          );
        }
        break;

      case "Commercial":
        if ("value" in details) {
          return (
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">النوع:</span>
                <span className="font-semibold">
                  {details.type === "customer_contracts" ? "عقود العملاء" : "أوامر الشراء"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">القيمة:</span>
                <span className="font-semibold">{new Intl.NumberFormat("ar-DZ").format(details.value)} دج</span>
              </div>
              {details.counterparty && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الطرف الآخر:</span>
                  <span className="font-semibold">{details.counterparty}</span>
                </div>
              )}
            </div>
          );
        }
        break;

      case "Technical":
        return (
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">النوع:</span>
              <span className="font-semibold">
                {details.type === "ip_ownership" ? "ملكية الملكية الفكرية" : "حقوق الكود المصدري"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">التفاصيل:</span>
              <span className="font-semibold">{details.value}</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex items-start justify-between rounded-lg border border-border/40 bg-background/50 p-3">
      <div className="flex-1">
        {renderDetails()}
      </div>
      {guarantee.documentUrl && (
        <Badge variant="outline" className="ml-2 shrink-0">
          <FileCheck className="mr-1 h-3 w-3" />
          موثق
        </Badge>
      )}
    </div>
  );
}
