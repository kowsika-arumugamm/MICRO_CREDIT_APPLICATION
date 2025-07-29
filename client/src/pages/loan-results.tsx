import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RiskAssessment } from "@/components/loan/risk-assessment";
import { 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  Calendar, 
  Percent, 
  TrendingUp,
  FileText,
  MessageSquare,
  Download,
  ArrowLeft,
  Coins
} from "lucide-react";

interface LoanApplicationResult {
  application: {
    id: string;
    fullName: string;
    desiredAmount: string;
    loanPurpose: string;
    status: string;
  };
  assessment: {
    isEligible: boolean;
    approvedAmount?: string;
    interestRate?: string;
    tenure?: number;
    monthlyEmi?: string;
    overallRiskScore: number;
    incomeStabilityScore: number;
    repaymentCapacityScore: number;
    spendingPatternScore: number;
    employmentScore: number;
    debtToIncomeRatio: string;
    disposableIncome: string;
    lifestyleRiskFactor: string;
    positiveFactors: string[];
    negativeFactors: string[];
    recommendations: string[];
  };
}

export default function LoanResults() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const applicationId = params.id;

  // Check authentication
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, authLoading, toast]);

  const { data: result, isLoading, error } = useQuery<LoanApplicationResult>({
    queryKey: ["/api/loan-applications", applicationId],
    enabled: !!applicationId && !!user,
    retry: false,
  });

  useEffect(() => {
    if (error && isUnauthorizedError(error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [error, toast]);

  const handleViewDashboard = () => {
    setLocation("/dashboard");
  };

  const handleAcceptOffer = () => {
    toast({
      title: "Offer Accepted",
      description: "Your loan offer has been accepted. Processing disbursal...",
    });
  };

  const handleNegotiateTerms = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Term negotiation feature will be available soon.",
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Processing your loan application...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Results</h2>
            <p className="text-muted-foreground mb-4">
              We couldn't load your loan application results. Please try again.
            </p>
            <Button onClick={() => setLocation("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Application Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The loan application you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => setLocation("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { application, assessment } = result;
  const isApproved = assessment.isEligible;

  // Calculate total amount payable
  const calculateTotalAmount = () => {
    if (!assessment.monthlyEmi || !assessment.tenure) return 0;
    return parseFloat(assessment.monthlyEmi) * assessment.tenure;
  };

  const calculateTotalInterest = () => {
    if (!assessment.approvedAmount || !assessment.monthlyEmi || !assessment.tenure) return 0;
    const totalAmount = calculateTotalAmount();
    return totalAmount - parseFloat(assessment.approvedAmount);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Coins className="text-primary text-2xl mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Loan Application Results</h1>
                <p className="text-muted-foreground">Application ID: {application.id}</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setLocation("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Header */}
        <div className="text-center mb-8">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isApproved ? 'bg-secondary text-white' : 'bg-destructive text-white'
          }`}>
            {isApproved ? (
              <CheckCircle className="w-10 h-10" />
            ) : (
              <XCircle className="w-10 h-10" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isApproved ? 'Loan Application Approved!' : 'Loan Application Not Approved'}
          </h1>
          <p className="text-muted-foreground">
            {isApproved 
              ? 'Congratulations! Your loan has been pre-approved based on our AI analysis.'
              : 'Your application has been reviewed but does not meet our current criteria.'
            }
          </p>
        </div>

        {isApproved ? (
          <>
            {/* Loan Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="text-primary text-2xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Approved Amount</h3>
                  <div className="financial-metric text-primary">₹{assessment.approvedAmount}</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Out of ₹{application.desiredAmount} requested
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Calendar className="text-secondary text-2xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Tenure</h3>
                  <div className="financial-metric text-secondary">{assessment.tenure} months</div>
                  <p className="text-sm text-muted-foreground mt-2">Recommended period</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Percent className="text-orange-600 text-2xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Interest Rate</h3>
                  <div className="financial-metric text-orange-600">{assessment.interestRate}% p.a.</div>
                  <p className="text-sm text-muted-foreground mt-2">Competitive rate</p>
                </CardContent>
              </Card>
            </div>

            {/* EMI Details and Risk Assessment */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>EMI Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg">
                    <span className="text-foreground">Monthly EMI</span>
                    <span className="financial-metric text-primary">₹{assessment.monthlyEmi}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Principal Amount</span>
                      <span className="font-semibold">₹{assessment.approvedAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Interest</span>
                      <span className="font-semibold">₹{calculateTotalInterest().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-muted-foreground">Total Amount Payable</span>
                      <span className="font-bold text-lg">₹{calculateTotalAmount().toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <RiskAssessment assessment={assessment} />
            </div>

            {/* AI Analysis Summary */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                  AI Analysis Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-secondary mb-3">Positive Factors</h4>
                    <ul className="space-y-2">
                      {assessment.positiveFactors.map((factor, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <CheckCircle className="w-4 h-4 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-orange-600 mb-3">Areas of Attention</h4>
                    <ul className="space-y-2">
                      {assessment.negativeFactors.map((factor, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <XCircle className="w-4 h-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="text-center space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  onClick={handleAcceptOffer}
                  className="bg-secondary hover:bg-secondary/90"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Accept Loan Offer
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={handleNegotiateTerms}
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Negotiate Terms
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={handleViewDashboard}
                >
                  <TrendingUp className="w-5 h-5 mr-2" />
                  View Dashboard
                </Button>
              </div>
              <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                <span>This offer is valid for 7 days.</span>
                <Button variant="link" size="sm" className="p-0 h-auto">
                  <Download className="w-4 h-4 mr-1" />
                  Download offer letter
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Rejection Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <RiskAssessment assessment={assessment} />
              
              <Card>
                <CardHeader>
                  <CardTitle>Reasons for Rejection</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {assessment.negativeFactors.map((factor, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <XCircle className="w-4 h-4 text-destructive mr-2 mt-0.5 flex-shrink-0" />
                        {factor}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Recommendations */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Recommendations to Improve Eligibility</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {assessment.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <TrendingUp className="w-4 h-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-4">What's Next?</h3>
              <p className="text-muted-foreground mb-6">
                You can reapply after addressing the factors mentioned above. Our AI will reassess your profile.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={handleViewDashboard}>
                  <TrendingUp className="w-5 h-5 mr-2" />
                  View Dashboard
                </Button>
                <Button variant="outline" onClick={() => setLocation("/apply")}>
                  Apply Again
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
