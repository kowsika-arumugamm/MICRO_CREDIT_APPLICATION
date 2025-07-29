import type { LoanApplication, InsertLoanAssessment } from "@shared/schema";

interface RiskFactors {
  incomeStability: number;
  repaymentCapacity: number;
  spendingPattern: number;
  employment: number;
}

interface AlgorithmResult {
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
}

export async function loanAssessmentAlgorithm(application: LoanApplication): Promise<AlgorithmResult> {
  // Convert string values to numbers for calculations
  const currentSalary = parseFloat(application.currentSalary);
  const previousSalary = parseFloat(application.previousSalary || '0');
  const existingEmis = parseFloat(application.existingEmis || '0');
  const creditCardDebt = parseFloat(application.creditCardDebt || '0');
  const rentAmount = parseFloat(application.rentAmount || '0');
  const groceryExpense = parseFloat(application.groceryExpense);
  const mallSpending = parseFloat(application.mallSpending || '0');
  const entertainmentBudget = parseFloat(application.entertainmentBudget || '0');
  const monthlySavings = parseFloat(application.monthlySavings || '0');
  const desiredAmount = parseFloat(application.desiredAmount);

  // Initialize tracking arrays
  const positiveFactors: string[] = [];
  const negativeFactors: string[] = [];
  const recommendations: string[] = [];

  // 1. INCOME STABILITY ANALYSIS (0-100)
  let incomeStabilityScore = 50; // Base score
  
  // Salary growth analysis
  if (previousSalary > 0) {
    const salaryGrowth = ((currentSalary - previousSalary) / previousSalary) * 100;
    if (salaryGrowth > 10) {
      incomeStabilityScore += 20;
      positiveFactors.push(`Strong salary growth of ${salaryGrowth.toFixed(1)}%`);
    } else if (salaryGrowth > 0) {
      incomeStabilityScore += 10;
      positiveFactors.push("Positive salary growth trend");
    } else {
      incomeStabilityScore -= 10;
      negativeFactors.push("No recent salary increase");
    }
  }
  
  // Employment type and experience
  if (application.employmentType === 'permanent') {
    incomeStabilityScore += 15;
    positiveFactors.push("Permanent employment status");
  } else if (application.employmentType === 'contract') {
    incomeStabilityScore -= 10;
    negativeFactors.push("Contract employment (higher risk)");
  }
  
  // Experience factor
  if (application.experience >= 5) {
    incomeStabilityScore += 15;
    positiveFactors.push(`${application.experience}+ years of experience`);
  } else if (application.experience >= 2) {
    incomeStabilityScore += 5;
  } else {
    incomeStabilityScore -= 10;
    negativeFactors.push("Limited work experience");
  }
  
  incomeStabilityScore = Math.min(100, Math.max(0, incomeStabilityScore));

  // 2. REPAYMENT CAPACITY ANALYSIS (0-100)
  const totalExistingDebt = existingEmis + (creditCardDebt * 0.05); // Assume 5% minimum payment for credit card
  const debtToIncomeRatio = (totalExistingDebt / currentSalary) * 100;
  
  let repaymentCapacityScore = 100;
  
  if (debtToIncomeRatio > 50) {
    repaymentCapacityScore -= 40;
    negativeFactors.push(`High debt-to-income ratio (${debtToIncomeRatio.toFixed(1)}%)`);
  } else if (debtToIncomeRatio > 30) {
    repaymentCapacityScore -= 20;
    negativeFactors.push(`Moderate debt burden (${debtToIncomeRatio.toFixed(1)}%)`);
  } else if (debtToIncomeRatio < 20) {
    positiveFactors.push(`Low debt-to-income ratio (${debtToIncomeRatio.toFixed(1)}%)`);
  }
  
  // Savings pattern analysis
  const savingsRatio = (monthlySavings / currentSalary) * 100;
  if (savingsRatio > 20) {
    repaymentCapacityScore += 10;
    positiveFactors.push(`Excellent savings habit (${savingsRatio.toFixed(1)}% of income)`);
  } else if (savingsRatio > 10) {
    repaymentCapacityScore += 5;
    positiveFactors.push("Good savings pattern");
  } else if (savingsRatio < 5) {
    repaymentCapacityScore -= 15;
    negativeFactors.push("Low savings rate indicates financial stress");
  }
  
  repaymentCapacityScore = Math.min(100, Math.max(0, repaymentCapacityScore));

  // 3. SPENDING PATTERN ANALYSIS (0-100)
  let spendingPatternScore = 70; // Neutral base
  
  // Housing cost analysis
  let housingCost = 0;
  if (application.ownsHouse === 'yes') {
    spendingPatternScore += 20;
    positiveFactors.push("Homeowner (asset and stability)");
  } else if (application.ownsHouse === 'no') {
    housingCost = rentAmount;
    const rentRatio = (rentAmount / currentSalary) * 100;
    if (rentRatio > 40) {
      spendingPatternScore -= 20;
      negativeFactors.push(`High rental expense (${rentRatio.toFixed(1)}% of income)`);
    } else if (rentRatio > 30) {
      spendingPatternScore -= 10;
      negativeFactors.push("Moderate rental burden");
    }
  } else {
    spendingPatternScore += 10;
    positiveFactors.push("Living with family (reduced expenses)");
  }
  
  // Lifestyle spending analysis
  const monthlyLifestyleSpending = ((application.mallVisits || 0) * mallSpending) + entertainmentBudget;
  const lifestyleRatio = (monthlyLifestyleSpending / currentSalary) * 100;
  
  if (lifestyleRatio > 15) {
    spendingPatternScore -= 20;
    negativeFactors.push(`High discretionary spending (${lifestyleRatio.toFixed(1)}% of income)`);
  } else if (lifestyleRatio > 10) {
    spendingPatternScore -= 10;
    negativeFactors.push("Moderate lifestyle spending");
  } else if (lifestyleRatio < 5) {
    spendingPatternScore += 10;
    positiveFactors.push("Conservative spending habits");
  }
  
  // Grocery expense reasonableness
  const groceryRatio = (groceryExpense / currentSalary) * 100;
  if (groceryRatio > 15) {
    spendingPatternScore -= 10;
    negativeFactors.push("High grocery expenses");
  }
  
  spendingPatternScore = Math.min(100, Math.max(0, spendingPatternScore));

  // 4. EMPLOYMENT SCORE (0-100)
  let employmentScore = 60; // Base score
  
  // Company stability (inferred from employment type and duration)
  if (application.employmentType === 'permanent' && application.experience >= 3) {
    employmentScore += 25;
    positiveFactors.push("Stable employment with good tenure");
  }
  
  // Investment habits indicate financial maturity
  if (['aggressive', 'moderate'].includes(application.investmentHabit)) {
    employmentScore += 15;
    positiveFactors.push("Active investment portfolio");
  } else if (application.investmentHabit === 'conservative') {
    employmentScore += 10;
    positiveFactors.push("Conservative investment approach");
  } else if (application.investmentHabit === 'none') {
    employmentScore -= 10;
    negativeFactors.push("No investment habit");
  }
  
  employmentScore = Math.min(100, Math.max(0, employmentScore));

  // 5. CALCULATE OVERALL RISK SCORE (weighted average)
  const weights = {
    incomeStability: 0.30,
    repaymentCapacity: 0.35,
    spendingPattern: 0.20,
    employment: 0.15,
  };
  
  const overallRiskScore = Math.round(
    (incomeStabilityScore * weights.incomeStability) +
    (repaymentCapacityScore * weights.repaymentCapacity) +
    (spendingPatternScore * weights.spendingPattern) +
    (employmentScore * weights.employment)
  );

  // 6. ELIGIBILITY DETERMINATION
  const isEligible = overallRiskScore >= 60 && debtToIncomeRatio <= 50;
  
  if (!isEligible) {
    if (overallRiskScore < 60) {
      negativeFactors.push("Overall risk score below minimum threshold");
    }
    if (debtToIncomeRatio > 50) {
      negativeFactors.push("Debt-to-income ratio exceeds maximum limit");
    }
  }

  // 7. LOAN AMOUNT AND TERMS CALCULATION
  let approvedAmount = 0;
  let interestRate = 12.5; // Base rate
  let tenure = 24; // Default 24 months
  let monthlyEmi = 0;
  
  if (isEligible) {
    // Calculate maximum loan amount based on repayment capacity
    const maxEmiCapacity = currentSalary * 0.4 - totalExistingDebt; // 40% of income minus existing obligations
    
    // Adjust loan amount based on risk score
    let loanMultiplier = 1.0;
    if (overallRiskScore > 80) {
      loanMultiplier = 1.0;
      interestRate = 11.5;
    } else if (overallRiskScore > 70) {
      loanMultiplier = 0.9;
      interestRate = 12.0;
    } else {
      loanMultiplier = 0.8;
      interestRate = 13.0;
    }
    
    // Calculate approved amount (min of desired amount or capacity-based amount)
    const capacityBasedAmount = Math.min(desiredAmount, currentSalary * 4 * loanMultiplier); // Max 4x salary
    approvedAmount = Math.min(desiredAmount * 0.9, capacityBasedAmount); // 90% of desired or capacity-based
    
    // Ensure EMI is within capacity
    const R = interestRate / (12 * 100);
    const calculatedEmi = (approvedAmount * R * Math.pow(1 + R, tenure)) / (Math.pow(1 + R, tenure) - 1);
    
    if (calculatedEmi > maxEmiCapacity) {
      // Reduce loan amount to fit EMI capacity
      approvedAmount = (maxEmiCapacity * (Math.pow(1 + R, tenure) - 1)) / (R * Math.pow(1 + R, tenure));
    }
    
    // Recalculate EMI with final approved amount
    monthlyEmi = (approvedAmount * R * Math.pow(1 + R, tenure)) / (Math.pow(1 + R, tenure) - 1);
  }

  // 8. GENERATE RECOMMENDATIONS
  if (debtToIncomeRatio > 30) {
    recommendations.push("Consider consolidating existing debts to reduce EMI burden");
  }
  if (savingsRatio < 10) {
    recommendations.push("Increase monthly savings to 15-20% of income for better financial health");
  }
  if (lifestyleRatio > 10) {
    recommendations.push("Reduce discretionary spending to improve loan repayment capacity");
  }
  if (application.investmentHabit === 'none') {
    recommendations.push("Start investing in mutual funds or SIPs for long-term wealth creation");
  }
  if (application.ownsHouse === 'no' && (rentAmount / currentSalary) > 0.3) {
    recommendations.push("Consider home ownership to reduce long-term housing costs");
  }

  // Calculate additional metrics
  const totalMonthlyExpenses = housingCost + groceryExpense + totalExistingDebt + monthlyLifestyleSpending;
  const disposableIncome = currentSalary - totalMonthlyExpenses;
  const lifestyleRiskFactor = lifestyleRatio / 100;

  return {
    isEligible,
    approvedAmount: approvedAmount > 0 ? approvedAmount.toFixed(2) : undefined,
    interestRate: isEligible ? interestRate.toFixed(2) : undefined,
    tenure: isEligible ? tenure : undefined,
    monthlyEmi: monthlyEmi > 0 ? monthlyEmi.toFixed(2) : undefined,
    overallRiskScore,
    incomeStabilityScore,
    repaymentCapacityScore,
    spendingPatternScore,
    employmentScore,
    debtToIncomeRatio: debtToIncomeRatio.toFixed(2),
    disposableIncome: disposableIncome.toFixed(2),
    lifestyleRiskFactor: lifestyleRiskFactor.toFixed(3),
    positiveFactors,
    negativeFactors,
    recommendations,
  };
}
