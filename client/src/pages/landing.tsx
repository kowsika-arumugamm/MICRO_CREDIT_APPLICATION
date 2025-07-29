import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Coins, 
  Bot, 
  Zap, 
  UserCheck, 
  TrendingUp, 
  Shield, 
  Headphones,
  CheckCircle,
  Clock,
  ShieldCheck,
  Percent
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI-Powered Decisions",
    description: "Our advanced machine learning algorithm analyzes your financial profile for instant, accurate loan approvals.",
    color: "text-primary"
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Get loan approval in under 5 minutes with our streamlined digital process and real-time verification.",
    color: "text-secondary"
  },
  {
    icon: UserCheck,
    title: "For Salaried Professionals",
    description: "Specifically designed for salaried individuals with tailored loan products and competitive interest rates.",
    color: "text-purple-600"
  },
  {
    icon: TrendingUp,
    title: "Smart Risk Assessment",
    description: "Advanced algorithms consider spending patterns, employment stability, and lifestyle factors for accurate risk scoring.",
    color: "text-orange-600"
  },
  {
    icon: Shield,
    title: "Secure & Compliant",
    description: "Bank-level security with end-to-end encryption and full regulatory compliance for your peace of mind.",
    color: "text-red-600"
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Round-the-clock customer support with dedicated relationship managers for all your loan needs.",
    color: "text-indigo-600"
  }
];

const steps = [
  {
    number: 1,
    title: "Register",
    description: "Create your account with basic details and verify your identity securely.",
    color: "bg-primary"
  },
  {
    number: 2,
    title: "Complete Profile",
    description: "Fill in your financial details, employment info, and lifestyle patterns.",
    color: "bg-secondary"
  },
  {
    number: 3,
    title: "AI Analysis",
    description: "Our AI analyzes your profile and determines loan eligibility instantly.",
    color: "bg-purple-600"
  },
  {
    number: 4,
    title: "Get Approved",
    description: "Receive your loan decision with personalized terms and instant disbursal.",
    color: "bg-orange-600"
  }
];

const stats = [
  { value: "25,000+", label: "Loans Approved" },
  { value: "₹500Cr+", label: "Amount Disbursed" },
  { value: "98.5%", label: "Approval Accuracy" },
  { value: "4.8/5", label: "Customer Rating" }
];

export default function Landing() {
  const handleGetStarted = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-border sticky top-0 z-50">
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
                <a href="#" className="nav-link active">Home</a>
                <a href="#how-it-works" className="nav-link">How it Works</a>
                <a href="#features" className="nav-link">Features</a>
                <a href="#stats" className="nav-link">About</a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = "/api/login"}
                className="text-muted-foreground hover:text-primary"
              >
                Login
              </Button>
              <Button onClick={handleGetStarted} className="bg-primary hover:bg-primary/90">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative hero-gradient text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Smart Micro Loans<br />
                <span className="text-blue-200">Powered by AI</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Get instant loan approval with our AI-powered platform. Quick decisions, competitive rates, and transparent terms for salaried professionals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={handleGetStarted}
                  className="bg-secondary hover:bg-secondary/90 text-white transform hover:scale-105 transition-all"
                >
                  Apply Now
                  <CheckCircle className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-primary"
                >
                  Calculate EMI
                </Button>
              </div>
              <div className="flex items-center mt-8 space-x-6">
                <div className="flex items-center">
                  <Clock className="text-blue-200 mr-2 h-5 w-5" />
                  <span className="text-sm">5-minute approval</span>
                </div>
                <div className="flex items-center">
                  <ShieldCheck className="text-blue-200 mr-2 h-5 w-5" />
                  <span className="text-sm">Bank-level security</span>
                </div>
                <div className="flex items-center">
                  <Percent className="text-blue-200 mr-2 h-5 w-5" />
                  <span className="text-sm">Competitive rates</span>
                </div>
              </div>
            </div>
            <div className="lg:block hidden">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                  alt="Financial dashboard interface" 
                  className="rounded-xl shadow-2xl w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Choose QuickLoan AI?</h2>
            <p className="text-xl text-muted-foreground">Advanced AI technology meets personalized financial solutions</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="card-hover">
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 bg-opacity-10 rounded-lg flex items-center justify-center mb-6 ${feature.color.replace('text-', 'bg-')}/10`}>
                      <IconComponent className={`${feature.color} text-2xl h-8 w-8`} />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-4">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-muted py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">Simple, transparent, and fast loan process</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className={`w-20 h-20 ${step.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
                  <span className="text-white text-2xl font-bold">{step.number}</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-financial text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Your Loan Approved?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of satisfied customers who have received instant loan approvals through our AI-powered platform.
          </p>
          <Button 
            size="lg" 
            onClick={handleGetStarted}
            className="bg-white text-primary hover:bg-gray-100 transform hover:scale-105 transition-all"
          >
            Start Your Application
            <CheckCircle className="ml-2 h-5 w-5" />
          </Button>
          <div className="mt-8 flex justify-center items-center space-x-8 text-sm opacity-90">
            <Badge variant="secondary" className="bg-white/20 text-white">
              No Hidden Fees
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white">
              Instant Approval
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white">
              Secure Process
            </Badge>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Coins className="text-primary text-2xl mr-3" />
                <span className="text-lg font-bold text-foreground">QuickLoan AI</span>
              </div>
              <p className="text-muted-foreground text-sm">
                AI-powered micro loans for salaried professionals. Fast, secure, and transparent.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Products</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Personal Loans</a></li>
                <li><a href="#" className="hover:text-primary">EMI Calculator</a></li>
                <li><a href="#" className="hover:text-primary">Credit Score</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">About Us</a></li>
                <li><a href="#" className="hover:text-primary">Careers</a></li>
                <li><a href="#" className="hover:text-primary">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Help Center</a></li>
                <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 QuickLoan AI. All rights reserved. | Licensed NBFC | AI-powered lending platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
