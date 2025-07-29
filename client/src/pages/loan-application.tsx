import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertLoanApplicationSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Coins, ArrowLeft, ArrowRight, Send, CheckCircle, User, Briefcase, Heart, FileText } from "lucide-react";
import { useEffect } from "react";
import { z } from "zod";

const steps = [
  { id: 1, title: "Personal Details", icon: User, description: "Basic information and identity" },
  { id: 2, title: "Financial Info", icon: Briefcase, description: "Employment and banking details" },
  { id: 3, title: "Lifestyle", icon: Heart, description: "Spending patterns and habits" },
  { id: 4, title: "Review", icon: FileText, description: "Confirm and submit" }
];

export default function LoanApplication() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isLoading } = useAuth();

  const form = useForm({
    resolver: zodResolver(insertLoanApplicationSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      panNumber: "",
      dateOfBirth: "",
      gender: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      companyName: "",
      jobTitle: "",
      experience: 0,
      employmentType: "",
      currentSalary: "0",
      previousSalary: "0",
      lastHikeDate: "",
      nextHikeDate: "",
      bankName: "",
      accountType: "",
      existingEmis: "0",
      creditCardDebt: "0",
      ownsHouse: "",
      rentAmount: "0",
      groceryExpense: "0",
      transportationMode: "",
      mallVisits: 0,
      mallSpending: "0",
      diningFrequency: "",
      entertainmentBudget: "0",
      investmentHabit: "",
      monthlySavings: "0",
      loanPurpose: "",
      desiredAmount: "0"
    }
  });

  // Check authentication
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

  const submitApplication = useMutation({
    mutationFn: async (data: z.infer<typeof insertLoanApplicationSchema>) => {
      const response = await apiRequest("POST", "/api/loan-applications", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Application Submitted!",
        description: "Your loan application has been processed successfully.",
      });
      setLocation(`/results/${data.application.id}`);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Application Failed",
        description: "There was an error processing your application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof insertLoanApplicationSchema>) => {
    submitApplication.mutate(data);
  };

  const nextStep = () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    form.trigger(fieldsToValidate).then((isValid) => {
      if (isValid) {
        setCurrentStep(Math.min(4, currentStep + 1));
      }
    });
  };

  const prevStep = () => {
    setCurrentStep(Math.max(1, currentStep - 1));
  };

  const getFieldsForStep = (step: number): (keyof z.infer<typeof insertLoanApplicationSchema>)[] => {
    switch (step) {
      case 1:
        return ["fullName", "panNumber", "dateOfBirth", "gender", "address", "city", "state", "pincode"];
      case 2:
        return ["companyName", "jobTitle", "experience", "employmentType", "currentSalary", "bankName", "accountType"];
      case 3:
        return ["ownsHouse", "groceryExpense", "transportationMode", "diningFrequency", "investmentHabit", "loanPurpose", "desiredAmount"];
      case 4:
        return [];
      default:
        return [];
    }
  };

  const progressPercentage = (currentStep / 4) * 100;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Coins className="text-primary text-2xl mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Loan Application</h1>
                <p className="text-muted-foreground">Complete your profile for instant AI-powered approval</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setLocation("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Indicator */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-6">
              {steps.map((step, index) => {
                const IconComponent = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className={`
                      flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                      ${isActive ? 'border-primary bg-primary text-white' : 
                        isCompleted ? 'border-secondary bg-secondary text-white' : 
                        'border-muted-foreground/30 bg-background text-muted-foreground'}
                    `}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <IconComponent className="w-5 h-5" />
                      )}
                    </div>
                    <div className="ml-3 hidden sm:block">
                      <p className={`text-sm font-medium ${isActive ? 'text-primary' : isCompleted ? 'text-secondary' : 'text-muted-foreground'}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`
                        hidden sm:block w-16 h-0.5 mx-4 transition-all
                        ${isCompleted ? 'bg-secondary' : 'bg-muted-foreground/30'}
                      `} />
                    )}
                  </div>
                );
              })}
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Step 1: Personal Details */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2 text-primary" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="As per PAN card" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="panNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PAN Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="ABCDE1234F" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complete Address *</FormLabel>
                        <FormControl>
                          <Textarea placeholder="House number, street, city, state, pincode" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pincode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pincode *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Financial Information */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Briefcase className="w-5 h-5 mr-2 text-primary" />
                    Employment & Financial Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Your current employer" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="jobTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title *</FormLabel>
                          <FormControl>
                            <Input placeholder="Your designation" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years of Experience *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Total work experience" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="employmentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employment Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="permanent">Permanent</SelectItem>
                              <SelectItem value="contract">Contract</SelectItem>
                              <SelectItem value="probation">Probation</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="currentSalary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Monthly Salary (₹) *</FormLabel>
                          <FormControl>
                            <Input placeholder="Net take-home salary" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="previousSalary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Previous Salary (₹)</FormLabel>
                          <FormControl>
                            <Input placeholder="Before last increment" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastHikeDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Last Hike</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nextHikeDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expected Next Hike Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Banking Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="bankName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bank Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Primary bank name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="accountType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Type *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="savings">Savings Account</SelectItem>
                                <SelectItem value="current">Current Account</SelectItem>
                                <SelectItem value="salary">Salary Account</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="existingEmis"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Monthly EMIs (₹)</FormLabel>
                            <FormControl>
                              <Input placeholder="Total existing EMIs" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="creditCardDebt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Credit Card Debt (₹)</FormLabel>
                            <FormControl>
                              <Input placeholder="Outstanding amount" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Lifestyle Information */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="w-5 h-5 mr-2 text-primary" />
                    Lifestyle & Spending Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="ownsHouse"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Do you own a house? *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select option" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="yes">Yes, I own</SelectItem>
                              <SelectItem value="no">No, I rent</SelectItem>
                              <SelectItem value="family">Living with family</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {form.watch("ownsHouse") === "no" && (
                      <FormField
                        control={form.control}
                        name="rentAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Monthly Rent (₹)</FormLabel>
                            <FormControl>
                              <Input placeholder="Monthly rent amount" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    <FormField
                      control={form.control}
                      name="groceryExpense"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Grocery Expense (₹) *</FormLabel>
                          <FormControl>
                            <Input placeholder="Average monthly groceries" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="transportationMode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transportation Mode *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select mode" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="own-vehicle">Own Vehicle</SelectItem>
                              <SelectItem value="public-transport">Public Transport</SelectItem>
                              <SelectItem value="cab-services">Cab Services</SelectItem>
                              <SelectItem value="company-transport">Company Transport</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="mallVisits"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mall Visits per Month</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="How often do you visit malls?" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="mallSpending"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Average Mall Spending (₹)</FormLabel>
                          <FormControl>
                            <Input placeholder="Per visit spending" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="diningFrequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dining Out Frequency *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">2-3 times a week</SelectItem>
                              <SelectItem value="biweekly">Once a week</SelectItem>
                              <SelectItem value="monthly">Few times a month</SelectItem>
                              <SelectItem value="rarely">Rarely</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="entertainmentBudget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Entertainment Budget (₹)</FormLabel>
                          <FormControl>
                            <Input placeholder="Movies, events, subscriptions" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="investmentHabit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Investment Habit *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select habit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="aggressive">Aggressive investor</SelectItem>
                              <SelectItem value="moderate">Moderate investor</SelectItem>
                              <SelectItem value="conservative">Conservative investor</SelectItem>
                              <SelectItem value="minimal">Minimal investment</SelectItem>
                              <SelectItem value="none">No investments</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="monthlySavings"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Savings (₹)</FormLabel>
                          <FormControl>
                            <Input placeholder="Amount saved monthly" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="loanPurpose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loan Purpose *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select purpose" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="personal">Personal expenses</SelectItem>
                            <SelectItem value="medical">Medical emergency</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="home-improvement">Home improvement</SelectItem>
                            <SelectItem value="travel">Travel</SelectItem>
                            <SelectItem value="debt-consolidation">Debt consolidation</SelectItem>
                            <SelectItem value="business">Business needs</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="desiredAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Desired Loan Amount (₹) *</FormLabel>
                        <FormControl>
                          <Input placeholder="Amount you want to borrow" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-primary" />
                    Review Your Application
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-muted/50">
                      <CardHeader>
                        <CardTitle className="text-lg">Personal Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div><span className="font-medium">Name:</span> {form.getValues("fullName")}</div>
                        <div><span className="font-medium">PAN:</span> {form.getValues("panNumber")}</div>
                        <div><span className="font-medium">Address:</span> {form.getValues("city")}, {form.getValues("state")} {form.getValues("pincode")}</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-muted/50">
                      <CardHeader>
                        <CardTitle className="text-lg">Employment Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div><span className="font-medium">Company:</span> {form.getValues("companyName")}</div>
                        <div><span className="font-medium">Salary:</span> ₹{form.getValues("currentSalary")}/month</div>
                        <div><span className="font-medium">Experience:</span> {form.getValues("experience")} years</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-muted/50">
                      <CardHeader>
                        <CardTitle className="text-lg">Financial Profile</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div><span className="font-medium">Existing EMIs:</span> ₹{form.getValues("existingEmis")}/month</div>
                        <div><span className="font-medium">Monthly Savings:</span> ₹{form.getValues("monthlySavings")}</div>
                        <div><span className="font-medium">Bank:</span> {form.getValues("bankName")}</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-muted/50">
                      <CardHeader>
                        <CardTitle className="text-lg">Loan Request</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div><span className="font-medium">Purpose:</span> {form.getValues("loanPurpose")}</div>
                        <div><span className="font-medium">Amount:</span> ₹{form.getValues("desiredAmount")}</div>
                        <div><span className="font-medium">Housing:</span> {form.getValues("ownsHouse") === "yes" ? "Owned" : form.getValues("ownsHouse") === "no" ? `Rented (₹${form.getValues("rentAmount")}/month)` : "Living with family"}</div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="border-t pt-6 space-y-4">
                    <div className="flex items-start space-x-3">
                      <input type="checkbox" className="mt-1" required />
                      <label className="text-sm text-muted-foreground">
                        I confirm that all the information provided is true and accurate to the best of my knowledge.
                      </label>
                    </div>
                    <div className="flex items-start space-x-3">
                      <input type="checkbox" className="mt-1" required />
                      <label className="text-sm text-muted-foreground">
                        I authorize QuickLoan AI to verify my information and perform credit checks as necessary.
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}
              <div className="ml-auto">
                {currentStep < 4 ? (
                  <Button type="button" onClick={nextStep}>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={submitApplication.isPending}
                    className="bg-secondary hover:bg-secondary/90"
                  >
                    {submitApplication.isPending ? (
                      "Processing..."
                    ) : (
                      <>
                        Submit Application
                        <Send className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
