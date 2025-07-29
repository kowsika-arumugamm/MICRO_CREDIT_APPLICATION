import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoanCharts } from "@/components/charts/loan-charts";
import { 
  Plus, 
  FileText, 
  Coins, 
  Calendar, 
  TrendingUp,
  CreditCard,
  User,
  LogOut,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

interface DashboardStats {
  activeLoansCount: number;
  totalOutstanding: string;
  nextEmiAmount: string;
  nextDueDate: string | null;
}

interface ActiveLoan {
  id: string;
  loanNumber: string;
  principalAmount: string;
  outstandingAmount: string;
  monthlyEmi: string;
  nextDueDate: string;
  status: string;
  application: {
    loanPurpose: string;
  };
}

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

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

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    enabled: !!user,
    retry: false,
  });

  const { data: activeLoans, isLoading: loansLoading } = useQuery<ActiveLoan[]>({
    queryKey: ["/api/active-loans"],
    enabled: !!user,
    retry: false,
  });

  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ["/api/loan-applications"],
    enabled: !!user,
    retry: false,
  });

  // Handle API errors
  useEffect(() => {
    const queries = [stats, activeLoans, applications];
    // Note: In a real implementation, you'd need access to query errors
    // This is simplified for the example
  }, [stats, activeLoans, applications]);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handleApplyLoan = () => {
    setLocation("/apply");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-secondary">Active</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDaysUntilDue = (dueDateString: string) => {
    const dueDate = new Date(dueDateString);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Navigation */}
      <div className="bg-white shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Coins className="text-primary text-2xl mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Welcome back, {user?.firstName || user?.email?.split('@')[0] || 'User'}! 👋
                </h1>
                <p className="text-muted-foreground">Manage your loans and financial profile</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={handleApplyLoan} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Apply for New Loan
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  {user?.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-primary" />
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Loans</p>
                  <div className="financial-metric text-foreground">
                    {statsLoading ? '...' : stats?.activeLoansCount || 0}
                  </div>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileText className="text-primary text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Outstanding</p>
                  <div className="financial-metric text-foreground">
                    ₹{statsLoading ? '...' : parseInt(stats?.totalOutstanding || '0').toLocaleString()}
                  </div>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Coins className="text-orange-600 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Next EMI</p>
                  <div className="financial-metric text-foreground">
                    ₹{statsLoading ? '...' : parseInt(stats?.nextEmiAmount || '0').toLocaleString()}
                  </div>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Calendar className="text-red-600 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Credit Score</p>
                  <div className="financial-metric text-secondary">742</div>
                </div>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-secondary text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <LoanCharts 
          activeLoans={activeLoans || []} 
          isLoading={loansLoading}
        />

        {/* Active Loans Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Active Loans
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loansLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : !activeLoans || activeLoans.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Active Loans</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any active loans at the moment.
                </p>
                <Button onClick={handleApplyLoan}>
                  <Plus className="w-4 h-4 mr-2" />
                  Apply for Your First Loan
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Loan ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Purpose</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Principal</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Outstanding</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">EMI</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Next Due</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeLoans.map((loan) => {
                      const daysUntilDue = getDaysUntilDue(loan.nextDueDate);
                      const isDueSoon = daysUntilDue <= 7 && daysUntilDue > 0;
                      const isOverdue = daysUntilDue < 0;
                      
                      return (
                        <tr key={loan.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4 font-medium">{loan.loanNumber}</td>
                          <td className="py-3 px-4 capitalize">{loan.application?.loanPurpose || 'Personal'}</td>
                          <td className="py-3 px-4">₹{parseInt(loan.principalAmount).toLocaleString()}</td>
                          <td className="py-3 px-4">₹{parseInt(loan.outstandingAmount).toLocaleString()}</td>
                          <td className="py-3 px-4">₹{parseInt(loan.monthlyEmi).toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              {isOverdue && <AlertCircle className="w-4 h-4 text-destructive mr-1" />}
                              {isDueSoon && <Clock className="w-4 h-4 text-warning mr-1" />}
                              {formatDate(loan.nextDueDate)}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(isOverdue ? 'overdue' : isDueSoon ? 'due-soon' : loan.status)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {applicationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : !applications || !Array.isArray(applications) || applications.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Recent Activity</h3>
                <p className="text-muted-foreground">
                  Your loan activities will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {(applications || []).slice(0, 5).map((application: any, index: number) => (
                  <div key={application.id || index} className="flex items-center p-4 border border-border rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                      {application.status === 'approved' ? (
                        <CheckCircle className="w-5 h-5 text-secondary" />
                      ) : application.status === 'pending' ? (
                        <Clock className="w-5 h-5 text-warning" />
                      ) : (
                        <FileText className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {application.status === 'approved' ? 'Loan Approved' : 
                         application.status === 'pending' ? 'Application Under Review' : 
                         'New Application Submitted'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ₹{parseInt(application.desiredAmount || '0').toLocaleString()} for {application.loanPurpose || 'personal use'}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(application.applicationDate || application.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
