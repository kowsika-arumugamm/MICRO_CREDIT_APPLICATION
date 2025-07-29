import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Shield, AlertTriangle } from "lucide-react";

interface RiskAssessmentProps {
  assessment: {
    overallRiskScore: number;
    incomeStabilityScore: number;
    repaymentCapacityScore: number;
    spendingPatternScore: number;
    employmentScore: number;
    debtToIncomeRatio: string;
    disposableIncome: string;
    lifestyleRiskFactor: string;
  };
}

export function RiskAssessment({ assessment }: RiskAssessmentProps) {
  const getRiskLevel = (score: number) => {
    if (score >= 80) return { level: "Low", color: "text-secondary", bgColor: "bg-secondary" };
    if (score >= 60) return { level: "Moderate", color: "text-warning", bgColor: "bg-warning" };
    return { level: "High", color: "text-destructive", bgColor: "bg-destructive" };
  };

  const overallRisk = getRiskLevel(assessment.overallRiskScore);

  const scoreItems = [
    { label: "Income Stability", score: assessment.incomeStabilityScore },
    { label: "Repayment Capacity", score: assessment.repaymentCapacityScore },
    { label: "Spending Pattern", score: assessment.spendingPatternScore },
    { label: "Employment", score: assessment.employmentScore },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="w-5 h-5 mr-2 text-primary" />
          Risk Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Risk Score */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className={`w-5 h-5 mr-2 ${overallRisk.color}`} />
            <span className="text-sm font-medium text-muted-foreground">Overall Risk Score</span>
          </div>
          <div className={`text-3xl font-bold ${overallRisk.color}`}>
            {assessment.overallRiskScore}/100
          </div>
          <Badge 
            variant="outline" 
            className={`mt-2 ${overallRisk.color} border-current`}
          >
            {overallRisk.level} Risk
          </Badge>
        </div>

        {/* Progress Bar */}
        <div>
          <Progress 
            value={assessment.overallRiskScore} 
            className="h-3"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>High Risk</span>
            <span>Low Risk</span>
          </div>
        </div>

        {/* Individual Scores */}
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground">Score Breakdown</h4>
          <div className="grid grid-cols-2 gap-4">
            {scoreItems.map((item, index) => {
              const risk = getRiskLevel(item.score);
              return (
                <div key={index} className="text-center">
                  <div className={`text-lg font-bold ${risk.color}`}>
                    {item.score}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="border-t pt-4 space-y-3">
          <h4 className="font-semibold text-foreground">Key Metrics</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Debt-to-Income Ratio</span>
              <span className="font-medium">{assessment.debtToIncomeRatio}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Disposable Income</span>
              <span className="font-medium">₹{parseFloat(assessment.disposableIncome).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lifestyle Risk Factor</span>
              <span className="font-medium">{(parseFloat(assessment.lifestyleRiskFactor) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Risk Indicator */}
        <div className={`p-3 rounded-lg border ${
          assessment.overallRiskScore >= 70 
            ? 'bg-secondary/10 border-secondary text-secondary' 
            : assessment.overallRiskScore >= 50
            ? 'bg-warning/10 border-warning text-warning'
            : 'bg-destructive/10 border-destructive text-destructive'
        }`}>
          <div className="flex items-center text-sm">
            {assessment.overallRiskScore >= 70 ? (
              <Shield className="w-4 h-4 mr-2" />
            ) : (
              <AlertTriangle className="w-4 h-4 mr-2" />
            )}
            <span className="font-medium">
              {assessment.overallRiskScore >= 70 
                ? 'Good risk profile for loan approval' 
                : assessment.overallRiskScore >= 50
                ? 'Moderate risk - requires careful consideration'
                : 'High risk - improvement needed for approval'
              }
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
