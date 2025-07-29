import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MultiStepFormProps {
  steps: Step[];
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onSubmit?: () => void;
  children: ReactNode;
  isSubmitting?: boolean;
  canProceed?: boolean;
}

export function MultiStepForm({
  steps,
  currentStep,
  onNext,
  onPrev,
  onSubmit,
  children,
  isSubmitting = false,
  canProceed = true,
}: MultiStepFormProps) {
  const progressPercentage = (currentStep / steps.length) * 100;
  const isLastStep = currentStep === steps.length;
  const isFirstStep = currentStep === 1;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Header */}
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
                    ${isActive ? 'step-active border-primary' : 
                      isCompleted ? 'step-completed border-secondary' : 
                      'step-inactive border-muted-foreground/30'}
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <IconComponent className="w-5 h-5" />
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm font-medium transition-colors ${
                      isActive ? 'text-primary' : 
                      isCompleted ? 'text-secondary' : 
                      'text-muted-foreground'
                    }`}>
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

      {/* Form Content */}
      <div className="mb-8">
        {children}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        {!isFirstStep && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onPrev}
            disabled={isSubmitting}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
        )}
        <div className="ml-auto">
          {isLastStep ? (
            <Button 
              type="submit" 
              onClick={onSubmit}
              disabled={isSubmitting || !canProceed}
              className="bg-secondary hover:bg-secondary/90"
            >
              {isSubmitting ? (
                "Processing..."
              ) : (
                <>
                  Submit Application
                  <CheckCircle className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Button 
              type="button" 
              onClick={onNext}
              disabled={!canProceed}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
