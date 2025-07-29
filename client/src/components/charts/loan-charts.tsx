import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, PieChart } from "lucide-react";

interface ActiveLoan {
  id: string;
  loanNumber: string;
  principalAmount: string;
  outstandingAmount: string;
  monthlyEmi: string;
  nextDueDate: string;
  status: string;
  application?: {
    loanPurpose: string;
  };
}

interface LoanChartsProps {
  activeLoans: ActiveLoan[];
  isLoading: boolean;
}

export function LoanCharts({ activeLoans, isLoading }: LoanChartsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Loan Portfolio</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Payment Timeline</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!activeLoans || activeLoans.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Loan Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <PieChart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No active loans to display</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Payment Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No payment history available</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate portfolio data
  const portfolioData = activeLoans.reduce((acc, loan) => {
    const purpose = loan.application?.loanPurpose || 'Personal';
    const amount = parseFloat(loan.outstandingAmount);
    acc[purpose] = (acc[purpose] || 0) + amount;
    return acc;
  }, {} as Record<string, number>);

  const totalOutstanding = Object.values(portfolioData).reduce((sum, amount) => sum + amount, 0);

  // Generate colors for different loan purposes
  const colors = ['#2563EB', '#059669', '#DC2626', '#7C3AED', '#EA580C'];
  const portfolioItems = Object.entries(portfolioData).map(([purpose, amount], index) => ({
    purpose,
    amount,
    percentage: (amount / totalOutstanding) * 100,
    color: colors[index % colors.length],
  }));

  // Simulate payment history data
  const paymentHistory = [
    { month: 'Jan', amount: 18547 },
    { month: 'Feb', amount: 18547 },
    { month: 'Mar', amount: 18547 },
    { month: 'Apr', amount: 18547 },
    { month: 'May', amount: 18547 },
    { month: 'Jun', amount: 18547 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Portfolio Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PieChart className="w-5 h-5 mr-2" />
            Loan Portfolio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Simple visual representation */}
            <div className="relative h-48 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  ₹{totalOutstanding.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Outstanding</div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="space-y-2">
              {portfolioItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-foreground capitalize">{item.purpose}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">₹{item.amount.toLocaleString()}</span>
                    <span className="text-muted-foreground ml-2">({item.percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment History Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Payment Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Simple bar chart representation */}
            <div className="h-48 flex items-end justify-between space-x-2">
              {paymentHistory.map((payment, index) => {
                const height = (payment.amount / Math.max(...paymentHistory.map(p => p.amount))) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="text-xs text-muted-foreground mb-1">
                      ₹{(payment.amount / 1000).toFixed(0)}k
                    </div>
                    <div 
                      className="w-full bg-primary rounded-t"
                      style={{ height: `${height}%`, minHeight: '20px' }}
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {payment.month}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Summary */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Average EMI</span>
                <span className="font-medium">₹{paymentHistory[0]?.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Paid (6 months)</span>
                <span className="font-medium">₹{(paymentHistory[0]?.amount * 6).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Status</span>
                <span className="font-medium text-secondary">On Time</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
