import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Coins, 
  Plus, 
  Calculator, 
  TrendingUp, 
  Clock, 
  Shield,
  User,
  LogOut,
  FileText,
  CreditCard,
  BarChart3
} from "lucide-react";

export default function Home() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !user) {
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
  }, [user, isLoading, toast]);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handleApplyLoan = () => {
    setLocation("/apply");
  };

  const handleViewDashboard = () => {
    setLocation("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Coins className="text-primary text-2xl mr-3" />
                <span className="text-xl font-bold text-foreground">QuickLoan AI</span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <button className="nav-link active">Home</button>
                <button onClick={handleViewDashboard} className="nav-link">Dashboard</button>
                <button className="nav-link">Loans</button>
                <button className="nav-link">Support</button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
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
                <span className="text-sm font-medium text-foreground">
                  {user?.firstName || user?.email?.split('@')[0] || 'User'}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="text-muted-foreground"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-gradient text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Welcome back, {user?.firstName || 'there'}! 👋
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Ready to apply for your next loan? Our AI-powered system makes it quick and easy to get the funds you need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={handleApplyLoan}
                className="bg-secondary hover:bg-secondary/90 text-white transform hover:scale-105 transition-all"
              >
                <Plus className="mr-2 h-5 w-5" />
                Apply for New Loan
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={handleViewDashboard}
                className="border-white text-white hover:bg-white hover:text-primary"
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                View Dashboard
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-8">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="card-hover cursor-pointer" onClick={handleApplyLoan}>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Apply for Loan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Start a new loan application with our AI-powered quick approval system.
                </p>
                <Badge className="mt-4">5-min process</Badge>
              </CardContent>
            </Card>

            <Card className="card-hover cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Calculator className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>EMI Calculator</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Calculate your monthly EMI and plan your finances effectively.
                </p>
                <Badge variant="secondary" className="mt-4">Free tool</Badge>
              </CardContent>
            </Card>

            <Card className="card-hover cursor-pointer" onClick={handleViewDashboard}>
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>My Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Track the status of your loan applications and manage existing loans.
                </p>
                <Badge variant="outline" className="mt-4">Track status</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Loan Benefits */}
      <section className="bg-muted py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Our Loans Are Different</h2>
            <p className="text-xl text-muted-foreground">AI-powered decisions, personalized for you</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Instant Approval</h3>
              <p className="text-sm text-muted-foreground">Get decisions in under 5 minutes with our AI algorithm</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Competitive Rates</h3>
              <p className="text-sm text-muted-foreground">Starting from 11.5% p.a. based on your risk profile</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Flexible EMIs</h3>
              <p className="text-sm text-muted-foreground">Choose tenure from 12 to 60 months that suits you</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Secure Process</h3>
              <p className="text-sm text-muted-foreground">Bank-level security and complete data protection</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">What Our Customers Say</h2>
            <p className="text-xl text-muted-foreground">Real experiences from real people</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Priya Sharma</h4>
                    <p className="text-sm text-muted-foreground">Software Engineer</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">
                  "Got my loan approved in just 3 minutes! The AI system understood my profile perfectly and offered great terms."
                </p>
                <div className="flex text-yellow-400 mt-3">
                  ⭐⭐⭐⭐⭐
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center mr-3">
                    <User className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Rajesh Kumar</h4>
                    <p className="text-sm text-muted-foreground">Marketing Manager</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">
                  "Transparent process with no hidden charges. The EMI fit perfectly within my budget based on their smart analysis."
                </p>
                <div className="flex text-yellow-400 mt-3">
                  ⭐⭐⭐⭐⭐
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <User className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Anita Patel</h4>
                    <p className="text-sm text-muted-foreground">Business Analyst</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">
                  "The risk assessment was spot-on. They understood my financial habits and gave me a loan amount I could comfortably repay."
                </p>
                <div className="flex text-yellow-400 mt-3">
                  ⭐⭐⭐⭐⭐
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-financial text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-6">Ready to Apply for Your Loan?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Our AI will analyze your profile and give you an instant decision with personalized terms.
          </p>
          <Button 
            size="lg" 
            onClick={handleApplyLoan}
            className="bg-white text-primary hover:bg-gray-100 transform hover:scale-105 transition-all"
          >
            <Plus className="mr-2 h-5 w-5" />
            Start Application Now
          </Button>
          <p className="text-sm text-blue-200 mt-4">
            No impact on your credit score during application
          </p>
        </div>
      </section>
    </div>
  );
}
