import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from 'drizzle-orm';

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Loan Applications table
export const loanApplications = pgTable("loan_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Personal Information
  fullName: varchar("full_name").notNull(),
  panNumber: varchar("pan_number").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  gender: varchar("gender").notNull(),
  address: text("address").notNull(),
  city: varchar("city").notNull(),
  state: varchar("state").notNull(),
  pincode: varchar("pincode").notNull(),
  
  // Employment Information
  companyName: varchar("company_name").notNull(),
  jobTitle: varchar("job_title").notNull(),
  experience: integer("experience").notNull(),
  employmentType: varchar("employment_type").notNull(),
  currentSalary: decimal("current_salary", { precision: 10, scale: 2 }).notNull(),
  previousSalary: decimal("previous_salary", { precision: 10, scale: 2 }),
  lastHikeDate: date("last_hike_date"),
  nextHikeDate: date("next_hike_date"),
  
  // Banking Information
  bankName: varchar("bank_name").notNull(),
  accountType: varchar("account_type").notNull(),
  existingEmis: decimal("existing_emis", { precision: 10, scale: 2 }).default('0'),
  creditCardDebt: decimal("credit_card_debt", { precision: 10, scale: 2 }).default('0'),
  
  // Lifestyle Information
  ownsHouse: varchar("owns_house").notNull(),
  rentAmount: decimal("rent_amount", { precision: 10, scale: 2 }),
  groceryExpense: decimal("grocery_expense", { precision: 10, scale: 2 }).notNull(),
  transportationMode: varchar("transportation_mode").notNull(),
  mallVisits: integer("mall_visits").default(0),
  mallSpending: decimal("mall_spending", { precision: 10, scale: 2 }).default('0'),
  diningFrequency: varchar("dining_frequency").notNull(),
  entertainmentBudget: decimal("entertainment_budget", { precision: 10, scale: 2 }).default('0'),
  investmentHabit: varchar("investment_habit").notNull(),
  monthlySavings: decimal("monthly_savings", { precision: 10, scale: 2 }).default('0'),
  
  // Loan Details
  loanPurpose: varchar("loan_purpose").notNull(),
  desiredAmount: decimal("desired_amount", { precision: 10, scale: 2 }).notNull(),
  
  // Application Status
  status: varchar("status").default('pending'), // pending, approved, rejected, disbursed
  applicationDate: timestamp("application_date").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Loan Assessments table
export const loanAssessments = pgTable("loan_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  applicationId: varchar("application_id").notNull().references(() => loanApplications.id),
  
  // AI Assessment Results
  isEligible: boolean("is_eligible").notNull(),
  approvedAmount: decimal("approved_amount", { precision: 10, scale: 2 }),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }),
  tenure: integer("tenure"), // in months
  monthlyEmi: decimal("monthly_emi", { precision: 10, scale: 2 }),
  
  // Risk Scoring
  overallRiskScore: integer("overall_risk_score").notNull(), // 0-100
  incomeStabilityScore: integer("income_stability_score").notNull(),
  repaymentCapacityScore: integer("repayment_capacity_score").notNull(),
  spendingPatternScore: integer("spending_pattern_score").notNull(),
  employmentScore: integer("employment_score").notNull(),
  
  // Algorithm Analysis
  debtToIncomeRatio: decimal("debt_to_income_ratio", { precision: 5, scale: 2 }),
  disposableIncome: decimal("disposable_income", { precision: 10, scale: 2 }),
  lifestyleRiskFactor: decimal("lifestyle_risk_factor", { precision: 5, scale: 2 }),
  
  // Assessment Details
  positiveFactors: jsonb("positive_factors"),
  negativeFactors: jsonb("negative_factors"),
  recommendations: jsonb("recommendations"),
  
  assessmentDate: timestamp("assessment_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Active Loans table
export const activeLoans = pgTable("active_loans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  applicationId: varchar("application_id").notNull().references(() => loanApplications.id),
  assessmentId: varchar("assessment_id").notNull().references(() => loanAssessments.id),
  
  loanNumber: varchar("loan_number").notNull().unique(),
  principalAmount: decimal("principal_amount", { precision: 10, scale: 2 }).notNull(),
  outstandingAmount: decimal("outstanding_amount", { precision: 10, scale: 2 }).notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).notNull(),
  tenure: integer("tenure").notNull(),
  monthlyEmi: decimal("monthly_emi", { precision: 10, scale: 2 }).notNull(),
  nextDueDate: date("next_due_date").notNull(),
  
  status: varchar("status").default('active'), // active, closed, defaulted
  disbursalDate: timestamp("disbursal_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Loan Payments table
export const loanPayments = pgTable("loan_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  loanId: varchar("loan_id").notNull().references(() => activeLoans.id),
  
  paymentAmount: decimal("payment_amount", { precision: 10, scale: 2 }).notNull(),
  principalAmount: decimal("principal_amount", { precision: 10, scale: 2 }).notNull(),
  interestAmount: decimal("interest_amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date").notNull(),
  dueDate: date("due_date").notNull(),
  status: varchar("status").notNull(), // paid, pending, late, missed
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  loanApplications: many(loanApplications),
  activeLoans: many(activeLoans),
}));

export const loanApplicationsRelations = relations(loanApplications, ({ one, many }) => ({
  user: one(users, {
    fields: [loanApplications.userId],
    references: [users.id],
  }),
  assessment: one(loanAssessments, {
    fields: [loanApplications.id],
    references: [loanAssessments.applicationId],
  }),
  activeLoan: one(activeLoans, {
    fields: [loanApplications.id],
    references: [activeLoans.applicationId],
  }),
}));

export const loanAssessmentsRelations = relations(loanAssessments, ({ one }) => ({
  application: one(loanApplications, {
    fields: [loanAssessments.applicationId],
    references: [loanApplications.id],
  }),
}));

export const activeLoansRelations = relations(activeLoans, ({ one, many }) => ({
  user: one(users, {
    fields: [activeLoans.userId],
    references: [users.id],
  }),
  application: one(loanApplications, {
    fields: [activeLoans.applicationId],
    references: [loanApplications.id],
  }),
  assessment: one(loanAssessments, {
    fields: [activeLoans.assessmentId],
    references: [loanAssessments.id],
  }),
  payments: many(loanPayments),
}));

export const loanPaymentsRelations = relations(loanPayments, ({ one }) => ({
  loan: one(activeLoans, {
    fields: [loanPayments.loanId],
    references: [activeLoans.id],
  }),
}));

// Insert schemas
export const insertLoanApplicationSchema = createInsertSchema(loanApplications).omit({
  id: true,
  userId: true,
  status: true,
  applicationDate: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLoanAssessmentSchema = createInsertSchema(loanAssessments).omit({
  id: true,
  assessmentDate: true,
  createdAt: true,
});

export const insertActiveLoanSchema = createInsertSchema(activeLoans).omit({
  id: true,
  loanNumber: true,
  status: true,
  disbursalDate: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLoanPaymentSchema = createInsertSchema(loanPayments).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertLoanApplication = z.infer<typeof insertLoanApplicationSchema>;
export type LoanApplication = typeof loanApplications.$inferSelect;
export type InsertLoanAssessment = z.infer<typeof insertLoanAssessmentSchema>;
export type LoanAssessment = typeof loanAssessments.$inferSelect;
export type InsertActiveLoan = z.infer<typeof insertActiveLoanSchema>;
export type ActiveLoan = typeof activeLoans.$inferSelect;
export type InsertLoanPayment = z.infer<typeof insertLoanPaymentSchema>;
export type LoanPayment = typeof loanPayments.$inferSelect;
