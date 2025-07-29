import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { setupLocalAuth, isLocalAuthenticated } from "./localAuth";
import { insertLoanApplicationSchema } from "@shared/schema";
import { loanAssessmentAlgorithm } from "./services/loanAlgorithm";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Check if we're running locally
  const isLocal = process.env.DATABASE_URL?.includes('localhost') || process.env.LOCAL_AUTH === 'true';
  
  // Auth middleware
  if (isLocal) {
    await setupLocalAuth(app);
  } else {
    await setupAuth(app);
  }
  
  const authMiddleware = isLocal ? isLocalAuthenticated : isAuthenticated;

  // Auth routes
  app.get('/api/auth/user', authMiddleware, async (req: any, res) => {
    try {
      const userId = isLocal ? req.user.id : req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Loan Application routes
  app.post('/api/loan-applications', authMiddleware, async (req: any, res) => {
    try {
      const userId = isLocal ? req.user.id : req.user.claims.sub;
      const validatedData = insertLoanApplicationSchema.parse(req.body);
      
      // Create loan application
      const application = await storage.createLoanApplication(userId, validatedData);
      
      // Run AI assessment
      const assessment = await loanAssessmentAlgorithm(application);
      const createdAssessment = await storage.createLoanAssessment({
        applicationId: application.id,
        ...assessment,
      });
      
      // Update application status based on assessment
      const status = assessment.isEligible ? 'approved' : 'rejected';
      await storage.updateLoanApplicationStatus(application.id, status);
      
      // If approved, create active loan
      if (assessment.isEligible && assessment.approvedAmount && assessment.monthlyEmi && assessment.tenure) {
        const nextDueDate = new Date();
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        
        await storage.createActiveLoan({
          userId,
          applicationId: application.id,
          assessmentId: createdAssessment.id,
          principalAmount: assessment.approvedAmount,
          outstandingAmount: assessment.approvedAmount,
          interestRate: assessment.interestRate || '12.5',
          tenure: assessment.tenure,
          monthlyEmi: assessment.monthlyEmi,
          nextDueDate: nextDueDate.toISOString().split('T')[0],
        });
      }
      
      res.json({
        application,
        assessment: createdAssessment,
      });
    } catch (error) {
      console.error("Error creating loan application:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid application data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to process loan application" });
      }
    }
  });

  app.get('/api/loan-applications', authMiddleware, async (req: any, res) => {
    try {
      const userId = isLocal ? req.user.id : req.user.claims.sub;
      const applications = await storage.getUserLoanApplications(userId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching loan applications:", error);
      res.status(500).json({ message: "Failed to fetch loan applications" });
    }
  });

  app.get('/api/loan-applications/:id', authMiddleware, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = isLocal ? req.user.id : req.user.claims.sub;
      const application = await storage.getLoanApplication(id);
      
      if (!application) {
        return res.status(404).json({ message: "Loan application not found" });
      }
      
      // Check if user owns this application
      if (application.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const assessment = await storage.getLoanAssessment(id);
      
      res.json({
        application,
        assessment,
      });
    } catch (error) {
      console.error("Error fetching loan application:", error);
      res.status(500).json({ message: "Failed to fetch loan application" });
    }
  });

  // Active Loans routes
  app.get('/api/active-loans', authMiddleware, async (req: any, res) => {
    try {
      const userId = isLocal ? req.user.id : req.user.claims.sub;
      const loans = await storage.getUserActiveLoans(userId);
      res.json(loans);
    } catch (error) {
      console.error("Error fetching active loans:", error);
      res.status(500).json({ message: "Failed to fetch active loans" });
    }
  });

  app.get('/api/active-loans/:id/payments', authMiddleware, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = isLocal ? req.user.id : req.user.claims.sub;
      const loan = await storage.getActiveLoan(id);
      
      if (!loan) {
        return res.status(404).json({ message: "Loan not found" });
      }
      
      // Check if user owns this loan
      if (loan.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const payments = await storage.getLoanPayments(id);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching loan payments:", error);
      res.status(500).json({ message: "Failed to fetch loan payments" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/stats', authMiddleware, async (req: any, res) => {
    try {
      const userId = isLocal ? req.user.id : req.user.claims.sub;
      const stats = await storage.getUserDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // EMI Calculator route
  app.post('/api/calculate-emi', async (req, res) => {
    try {
      const { principal, rate, tenure } = req.body;
      
      if (!principal || !rate || !tenure) {
        return res.status(400).json({ message: "Principal, rate, and tenure are required" });
      }
      
      const P = parseFloat(principal);
      const R = parseFloat(rate) / (12 * 100); // Monthly interest rate
      const N = parseInt(tenure); // Number of months
      
      // EMI calculation: EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)
      const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
      const totalAmount = emi * N;
      const totalInterest = totalAmount - P;
      
      res.json({
        emi: Math.round(emi),
        totalAmount: Math.round(totalAmount),
        totalInterest: Math.round(totalInterest),
        principal: P,
      });
    } catch (error) {
      console.error("Error calculating EMI:", error);
      res.status(500).json({ message: "Failed to calculate EMI" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
