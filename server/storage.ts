import {
  users,
  loanApplications,
  loanAssessments,
  activeLoans,
  loanPayments,
  type User,
  type UpsertUser,
  type LoanApplication,
  type InsertLoanApplication,
  type LoanAssessment,
  type InsertLoanAssessment,
  type ActiveLoan,
  type InsertActiveLoan,
  type LoanPayment,
  type InsertLoanPayment,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Loan Application operations
  createLoanApplication(userId: string, application: InsertLoanApplication): Promise<LoanApplication>;
  getLoanApplication(id: string): Promise<LoanApplication | undefined>;
  getUserLoanApplications(userId: string): Promise<LoanApplication[]>;
  updateLoanApplicationStatus(id: string, status: string): Promise<void>;
  
  // Loan Assessment operations
  createLoanAssessment(assessment: InsertLoanAssessment): Promise<LoanAssessment>;
  getLoanAssessment(applicationId: string): Promise<LoanAssessment | undefined>;
  
  // Active Loan operations
  createActiveLoan(loan: InsertActiveLoan): Promise<ActiveLoan>;
  getUserActiveLoans(userId: string): Promise<ActiveLoan[]>;
  getActiveLoan(id: string): Promise<ActiveLoan | undefined>;
  updateLoanOutstanding(loanId: string, amount: string): Promise<void>;
  
  // Payment operations
  createLoanPayment(payment: InsertLoanPayment): Promise<LoanPayment>;
  getLoanPayments(loanId: string): Promise<LoanPayment[]>;
  
  // Dashboard operations
  getUserDashboardStats(userId: string): Promise<{
    activeLoansCount: number;
    totalOutstanding: string;
    nextEmiAmount: string;
    nextDueDate: string | null;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Loan Application operations
  async createLoanApplication(userId: string, application: InsertLoanApplication): Promise<LoanApplication> {
    const [newApplication] = await db
      .insert(loanApplications)
      .values({
        ...application,
        userId,
      })
      .returning();
    return newApplication;
  }

  async getLoanApplication(id: string): Promise<LoanApplication | undefined> {
    const [application] = await db
      .select()
      .from(loanApplications)
      .where(eq(loanApplications.id, id));
    return application;
  }

  async getUserLoanApplications(userId: string): Promise<LoanApplication[]> {
    return await db
      .select()
      .from(loanApplications)
      .where(eq(loanApplications.userId, userId))
      .orderBy(desc(loanApplications.createdAt));
  }

  async updateLoanApplicationStatus(id: string, status: string): Promise<void> {
    await db
      .update(loanApplications)
      .set({ status, updatedAt: new Date() })
      .where(eq(loanApplications.id, id));
  }

  // Loan Assessment operations
  async createLoanAssessment(assessment: InsertLoanAssessment): Promise<LoanAssessment> {
    const [newAssessment] = await db
      .insert(loanAssessments)
      .values(assessment)
      .returning();
    return newAssessment;
  }

  async getLoanAssessment(applicationId: string): Promise<LoanAssessment | undefined> {
    const [assessment] = await db
      .select()
      .from(loanAssessments)
      .where(eq(loanAssessments.applicationId, applicationId));
    return assessment;
  }

  // Active Loan operations
  async createActiveLoan(loan: InsertActiveLoan): Promise<ActiveLoan> {
    // Generate loan number
    const loanNumber = `QL${new Date().getFullYear()}${String(Date.now()).slice(-6)}`;
    
    const [newLoan] = await db
      .insert(activeLoans)
      .values({
        ...loan,
        loanNumber,
      })
      .returning();
    return newLoan;
  }

  async getUserActiveLoans(userId: string): Promise<ActiveLoan[]> {
    return await db
      .select()
      .from(activeLoans)
      .where(and(
        eq(activeLoans.userId, userId),
        eq(activeLoans.status, 'active')
      ))
      .orderBy(desc(activeLoans.createdAt));
  }

  async getActiveLoan(id: string): Promise<ActiveLoan | undefined> {
    const [loan] = await db
      .select()
      .from(activeLoans)
      .where(eq(activeLoans.id, id));
    return loan;
  }

  async updateLoanOutstanding(loanId: string, amount: string): Promise<void> {
    await db
      .update(activeLoans)
      .set({ outstandingAmount: amount, updatedAt: new Date() })
      .where(eq(activeLoans.id, loanId));
  }

  // Payment operations
  async createLoanPayment(payment: InsertLoanPayment): Promise<LoanPayment> {
    const [newPayment] = await db
      .insert(loanPayments)
      .values(payment)
      .returning();
    return newPayment;
  }

  async getLoanPayments(loanId: string): Promise<LoanPayment[]> {
    return await db
      .select()
      .from(loanPayments)
      .where(eq(loanPayments.loanId, loanId))
      .orderBy(desc(loanPayments.paymentDate));
  }

  // Dashboard operations
  async getUserDashboardStats(userId: string): Promise<{
    activeLoansCount: number;
    totalOutstanding: string;
    nextEmiAmount: string;
    nextDueDate: string | null;
  }> {
    // Get active loans count and total outstanding
    const loansResult = await db
      .select({
        count: sql<number>`count(*)::int`,
        totalOutstanding: sql<string>`COALESCE(SUM(${activeLoans.outstandingAmount}), 0)::text`,
      })
      .from(activeLoans)
      .where(and(
        eq(activeLoans.userId, userId),
        eq(activeLoans.status, 'active')
      ));

    // Get next EMI details
    const nextEmiResult = await db
      .select({
        monthlyEmi: activeLoans.monthlyEmi,
        nextDueDate: activeLoans.nextDueDate,
      })
      .from(activeLoans)
      .where(and(
        eq(activeLoans.userId, userId),
        eq(activeLoans.status, 'active')
      ))
      .orderBy(activeLoans.nextDueDate)
      .limit(1);

    const stats = loansResult[0];
    const nextEmi = nextEmiResult[0];

    return {
      activeLoansCount: stats?.count || 0,
      totalOutstanding: stats?.totalOutstanding || '0',
      nextEmiAmount: nextEmi?.monthlyEmi || '0',
      nextDueDate: nextEmi?.nextDueDate || null,
    };
  }
}

export const storage = new DatabaseStorage();
