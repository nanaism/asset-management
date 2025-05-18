"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatePicker as UICalendar } from "@/components/ui/calendar"; // Renamed to avoid conflict
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Tooltip as UITooltip,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { animated, useSpring } from "@react-spring/web";
import {
  addMonths,
  differenceInMonths,
  format,
  isBefore,
  isFuture,
  isSameMonth,
  isValid,
  startOfMonth,
} from "date-fns";
import { ja } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Calculator,
  CalculatorIcon,
  CalendarDays,
  Calendar as CalendarIcon,
  Check,
  ChevronLeft,
  Coins,
  DollarSign,
  Gift,
  HelpCircle,
  Info,
  Lightbulb,
  Loader2,
  Medal,
  PartyPopper,
  Percent,
  Plus,
  Settings,
  SparkleIcon,
  Trash2,
  TrendingDown,
  Zap,
} from "lucide-react";
import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart, // Use BarChart directly
  CartesianGrid,
  Cell,
  Legend,
  Pie, // Use Pie directly
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

// Dynamically import Lottie animations
const DynamicLottie = dynamic(() => import("lottie-react"), { ssr: false });

// Import Lottie animations
import calculatorAnimation from "./calculator-animation.json";
import calendarAnimation from "./calendar-animation.json";
import moneyAnimation from "./money-animation.json";
import savingsAnimation from "./savings-animation.json";
import successAnimation from "./success-animation.json";

// Constants
const THEME = {
  colors: {
    primary: {
      light: "#e0f2fe",
      default: "#3b82f6",
      dark: "#1d4ed8",
      gradient: "from-blue-600 via-indigo-500 to-purple-600",
    },
    secondary: {
      light: "#f3e8ff",
      default: "#8b5cf6",
      dark: "#6d28d9",
      gradient: "from-purple-500 to-indigo-600",
    },
    success: {
      light: "#d1fae5",
      default: "#10b981",
      dark: "#047857",
      gradient: "from-emerald-500 to-teal-500",
    },
    warning: {
      light: "#fef3c7",
      default: "#f59e0b",
      dark: "#d97706",
      gradient: "from-yellow-500 to-amber-500",
    },
    danger: {
      light: "#fee2e2",
      default: "#f43f5e",
      dark: "#be123c",
      gradient: "from-rose-500 to-pink-600",
    },
    neutral: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
    },
  },
  borderRadius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    xxl: "24px",
  },
  shadows: {
    sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px rgba(0, 0, 0, 0.05), 0 4px 6px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px rgba(0, 0, 0, 0.05), 0 10px 10px rgba(0, 0, 0, 0.04)",
    highlight: "0 0 0 3px rgba(59, 130, 246, 0.45)",
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)",
  },
  transitions: {
    fast: "all 0.15s ease",
    normal: "all 0.25s ease",
    slow: "all 0.35s ease",
  },
  spacing: {
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    5: "20px",
    6: "24px",
    8: "32px",
    10: "40px",
    12: "48px",
    16: "64px",
    20: "80px",
  },
};

const CHART_COLORS = [
  "#3b82f6", // blue-500
  "#8b5cf6", // violet-500
  "#10b981", // emerald-500
  "#f43f5e", // rose-500
  "#f59e0b", // amber-500
  "#6366f1", // indigo-500
  "#ec4899", // pink-500
  "#14b8a6", // teal-500
];

const DEFAULT_VALUES = {
  debtAmount: 1000000,
  interestRate: 3.5,
  targetMonths: 24,
  income: 300000,
  minPayment: 10000,
};

// Types
interface Expense {
  id: string;
  description: string;
  amount: number;
  date: Date;
  isRecurring: boolean;
  frequency: "monthly" | "yearly" | "once";
}

interface Income {
  id: string;
  description: string;
  amount: number;
  date: Date;
  isRecurring: boolean;
  frequency: "monthly" | "yearly" | "once";
}

interface Bonus {
  id: string;
  description: string;
  amount: number;
  date: Date;
  allocation: number; // Percentage allocated to debt repayment (0-100)
}

interface RepaymentPlanItem {
  date: Date;
  month: number;
  debtAmount: number;
  payment: number;
  principalPayment: number;
  interestPayment: number;
  expenses: number;
  income: number;
  bonus: number;
  availableForDebt: number;
  cumulativeInterest: number;
}

interface NewExpense {
  description: string;
  amount: number;
  date: Date;
  isRecurring: boolean;
  frequency: "monthly" | "yearly" | "once";
}

interface NewIncome {
  description: string;
  amount: number;
  date: Date;
  isRecurring: boolean;
  frequency: "monthly" | "yearly" | "once";
}

interface NewBonus {
  description: string;
  amount: number;
  date: Date;
  allocation: number;
}

interface ReverseCalculationResult {
  monthlyPayment: number;
  requiredExtraSavings: number;
  payoffDate: Date;
  isPossible: boolean;
  message: string;
}

// Step type for our wizard
type Step = "debt" | "income" | "expenses" | "bonus" | "confirm";

const getStepNumber = (step: Step): number => {
  switch (step) {
    case "debt":
      return 1;
    case "income":
      return 2;
    case "expenses":
      return 3;
    case "bonus":
      return 4;
    case "confirm":
      return 5;
    default:
      return 0;
  }
};

const DebtRepaymentApp: React.FC = () => {
  // Base styles
  const cardStyle = {
    borderRadius: THEME.borderRadius.lg,
    overflow: "hidden" as const,
    backgroundColor: "#ffffff",
    boxShadow: THEME.shadows.md,
    border: "0", // Explicitly set border to 0 as some styles might add it
  };

  const inputStyle = {
    borderRadius: THEME.borderRadius.md,
    border: `1px solid ${THEME.colors.neutral[200]}`,
    backgroundColor: THEME.colors.neutral[50],
    padding: "10px 15px",
    transition: THEME.transitions.normal,
  };

  // Wizard state
  const [currentStep, setCurrentStep] = useState<Step>("debt");
  const [wizardCompleted, setWizardCompleted] = useState<boolean>(false);

  // State for debt settings
  const [debtAmount, setDebtAmount] = useState<number>(
    DEFAULT_VALUES.debtAmount
  );
  const [interestRate, setInterestRate] = useState<number>(
    DEFAULT_VALUES.interestRate
  );
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [targetEndDate, setTargetEndDate] = useState<Date | undefined>(
    addMonths(new Date(), DEFAULT_VALUES.targetMonths)
  );
  const [autoPayment, setAutoPayment] = useState<boolean>(true);
  const [minPayment, setMinPayment] = useState<number>(
    DEFAULT_VALUES.minPayment
  );

  // Calculate total months between start and target end date
  const totalMonths = useMemo(() => {
    if (
      !startDate ||
      !targetEndDate ||
      !isValid(startDate) ||
      !isValid(targetEndDate) ||
      isBefore(targetEndDate, startDate)
    ) {
      return DEFAULT_VALUES.targetMonths;
    }
    return Math.max(1, differenceInMonths(targetEndDate, startDate));
  }, [startDate, targetEndDate]);

  // State for income and expenses
  const [incomes, setIncomes] = useState<Income[]>([
    {
      id: "1",
      description: "給料",
      amount: DEFAULT_VALUES.income,
      date: new Date(),
      isRecurring: true,
      frequency: "monthly",
    },
  ]);

  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: "1",
      description: "家賃",
      amount: 80000,
      date: new Date(),
      isRecurring: true,
      frequency: "monthly",
    },
    {
      id: "2",
      description: "サブスク",
      amount: 5000,
      date: new Date(),
      isRecurring: true,
      frequency: "monthly",
    },
  ]);

  const [bonuses, setBonuses] = useState<Bonus[]>([
    {
      id: "1",
      description: "夏ボーナス",
      amount: 500000,
      date: new Date(new Date().getFullYear(), 5, 15), // 6月15日
      allocation: 50, // 50%を借金返済に
    },
    {
      id: "2",
      description: "冬ボーナス",
      amount: 500000,
      date: new Date(new Date().getFullYear(), 11, 15), // 12月15日
      allocation: 50, // 50%を借金返済に
    },
  ]);

  // Form state
  const [newExpense, setNewExpense] = useState<NewExpense>({
    description: "",
    amount: 0,
    date: new Date(),
    isRecurring: true,
    frequency: "monthly",
  });

  const [newIncome, setNewIncome] = useState<NewIncome>({
    description: "",
    amount: 0,
    date: new Date(),
    isRecurring: true,
    frequency: "monthly",
  });

  const [newBonus, setNewBonus] = useState<NewBonus>({
    description: "",
    amount: 0,
    date: new Date(),
    allocation: 50,
  });

  // Application state
  const [repaymentPlan, setRepaymentPlan] = useState<RepaymentPlanItem[]>([]);
  const [isCalculated, setIsCalculated] = useState<boolean>(false);
  const [isClient, setIsClient] = useState(false);
  const [isReverseCalcMode, setIsReverseCalcMode] = useState<boolean>(false);
  const [reverseCalcResult, setReverseCalcResult] =
    useState<ReverseCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<"wizard" | "results">(
    "wizard"
  );

  // Animation hooks
  const fadeIn = useSpring({
    opacity: isCalculated ? 1 : 0,
    transform: isCalculated ? "translateY(0)" : "translateY(20px)",
    config: { tension: 120, friction: 14 },
  });

  const pulseAnimation = useSpring({
    from: { scale: 1 },
    to: async (next: (props: { scale: number }) => Promise<void>) => {
      while (true) {
        await next({ scale: 1.05 });
        await next({ scale: 1 });
      }
    },
    config: { tension: 300, friction: 10 },
  });

  // Effects
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Calculate monthly payment to reach target with interest
  const calculateMonthlyPayment = useCallback((): number => {
    if (
      !startDate ||
      !targetEndDate ||
      !isValid(startDate) ||
      !isValid(targetEndDate) ||
      isBefore(targetEndDate, startDate)
    ) {
      return DEFAULT_VALUES.minPayment;
    }

    const calculatedMonths = Math.max(
      1,
      differenceInMonths(targetEndDate, startDate)
    );
    const monthlyInterestRate = interestRate / 100 / 12;

    if (monthlyInterestRate === 0) {
      return debtAmount / calculatedMonths;
    }

    // Monthly payment formula for a loan with interest: P = (PV * r * (1 + r)^n) / ((1 + r)^n - 1)
    // Where: PV = Present Value (loan amount), r = monthly interest rate, n = number of payments
    const payment =
      (debtAmount *
        monthlyInterestRate *
        Math.pow(1 + monthlyInterestRate, calculatedMonths)) /
      (Math.pow(1 + monthlyInterestRate, calculatedMonths) - 1);

    return Math.ceil(payment);
  }, [debtAmount, interestRate, startDate, targetEndDate]);

  // Helper function to check if an event occurs in a given month
  const eventOccursInMonth = useCallback(
    (
      date: Date,
      currentDate: Date,
      frequency: "monthly" | "yearly" | "once"
    ): boolean => {
      if (!date || !currentDate || !isValid(date) || !isValid(currentDate))
        return false;

      const eventDate = startOfMonth(date); // Compare start of month for consistency
      const currentMonthStart = startOfMonth(currentDate);

      switch (frequency) {
        case "monthly":
          // Recurring monthly means it occurs every month after the initial eventDate
          return !isBefore(currentMonthStart, eventDate);
        case "yearly":
          // Occurs if current month is same as event month, and it's on or after the event year
          return (
            currentMonthStart.getMonth() === eventDate.getMonth() &&
            !isBefore(currentMonthStart, eventDate)
          );
        case "once":
          return isSameMonth(eventDate, currentMonthStart);
        default:
          return false;
      }
    },
    []
  );

  // Calculate repayment plan with interest
  const calculateRepaymentPlan = useCallback(() => {
    if (!startDate || !isValid(startDate)) return;

    setIsCalculating(true);

    let remainingDebt = debtAmount;
    const monthlyInterestRate = interestRate / 100 / 12;
    const plan: RepaymentPlanItem[] = [];
    const idealMonthlyPayment = calculateMonthlyPayment();

    let currentDate = startOfMonth(startDate);
    let month = 1;
    let cumulativeInterest = 0;

    // Use totalMonths for the loop condition, or a safety net
    const loopMonths =
      targetEndDate &&
      isValid(targetEndDate) &&
      !isBefore(targetEndDate, startDate)
        ? Math.max(1, differenceInMonths(targetEndDate, startDate)) + 24 // Allow 2 years buffer
        : DEFAULT_VALUES.targetMonths + 24;

    while (remainingDebt > 0 && month <= loopMonths) {
      // Calculate expenses for the month
      const currentExpenses = expenses.reduce((total, expense) => {
        if (eventOccursInMonth(expense.date, currentDate, expense.frequency)) {
          return total + expense.amount;
        }
        return total;
      }, 0);

      // Calculate income for the month
      const currentIncome = incomes.reduce((total, income) => {
        if (eventOccursInMonth(income.date, currentDate, income.frequency)) {
          return total + income.amount;
        }
        return total;
      }, 0);

      // Calculate bonuses for the month and amount allocated to debt repayment
      const currentBonus = bonuses.reduce((total, bonus) => {
        const bonusDate = bonus.date; // bonus.date is already a Date object
        if (isValid(bonusDate) && isSameMonth(bonusDate, currentDate)) {
          return total + (bonus.amount * bonus.allocation) / 100;
        }
        return total;
      }, 0);

      // Calculate interest for the month
      const monthlyInterest = remainingDebt * monthlyInterestRate;
      cumulativeInterest += monthlyInterest;

      // Calculate available amount for debt repayment
      const availableForDebt = currentIncome - currentExpenses + currentBonus;

      // Determine payment amount
      let payment = 0;
      let principalPayment = 0;
      let interestPayment = 0;

      if (availableForDebt <= 0 && !autoPayment && minPayment <= 0) {
        // if no money and not auto paying a minimum
        // No money available for repayment this month, and no minimum payment set
        payment = 0;
        principalPayment = 0;
        interestPayment = 0; // Interest is still accrued
        remainingDebt += monthlyInterest; // Add unpaid interest to the debt
      } else {
        interestPayment = Math.min(
          monthlyInterest,
          Math.max(0, remainingDebt * monthlyInterestRate)
        ); // ensure interest is not negative

        if (isReverseCalcMode && reverseCalcResult) {
          payment = Math.min(
            reverseCalcResult.monthlyPayment,
            remainingDebt + interestPayment
          );
        } else if (autoPayment) {
          payment = Math.max(
            minPayment,
            Math.min(availableForDebt, remainingDebt + interestPayment)
          );
        } else {
          payment = Math.min(
            idealMonthlyPayment,
            remainingDebt + interestPayment
          );
          payment = Math.max(payment, minPayment); // Ensure at least minPayment if not auto
        }

        // Ensure payment covers at least the interest if possible, unless debt is very low
        if (payment < interestPayment && remainingDebt > payment) {
          // If payment doesn't cover interest, all payment goes to interest
          principalPayment = 0;
          interestPayment = payment; // Interest paid is limited by the payment
          remainingDebt += monthlyInterest - interestPayment; // Unpaid interest is added
        } else {
          principalPayment = payment - interestPayment;
          remainingDebt = Math.max(0, remainingDebt - principalPayment);
        }
      }

      // Add to repayment plan
      plan.push({
        date: new Date(currentDate),
        month,
        debtAmount: remainingDebt,
        payment,
        principalPayment,
        interestPayment,
        expenses: currentExpenses,
        income: currentIncome,
        bonus: currentBonus,
        availableForDebt,
        cumulativeInterest,
      });

      // If debt is fully paid, break
      if (remainingDebt <= 0) {
        break;
      }

      // Move to next month
      currentDate = addMonths(currentDate, 1);
      month++;
    }

    setRepaymentPlan(plan);
    setIsCalculating(false);
  }, [
    debtAmount,
    interestRate,
    startDate,
    targetEndDate,
    expenses,
    incomes,
    bonuses,
    autoPayment,
    minPayment,
    calculateMonthlyPayment,
    eventOccursInMonth,
    isReverseCalcMode,
    reverseCalcResult,
  ]);

  useEffect(() => {
    if (isCalculated) {
      calculateRepaymentPlan();
    }
  }, [isCalculated, calculateRepaymentPlan]);

  // Helper functions
  const getTotalExpenses = useCallback((): number => {
    return expenses.reduce((total, expense) => {
      if (expense.isRecurring && expense.frequency === "monthly") {
        return total + expense.amount;
      }
      return total;
    }, 0);
  }, [expenses]);

  const getTotalIncome = useCallback((): number => {
    return incomes.reduce((total, income) => {
      if (income.isRecurring && income.frequency === "monthly") {
        return total + income.amount;
      }
      return total;
    }, 0);
  }, [incomes]);

  const formatCurrency = useCallback((value: number): string => {
    if (typeof value !== "number" || isNaN(value)) {
      return "¥0";
    }
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(value);
  }, []);

  // Reverse calculation - calculate required monthly payment to pay off by target date
  const calculateReversePayment = useCallback(() => {
    if (
      !startDate ||
      !targetEndDate ||
      !isValid(startDate) ||
      !isValid(targetEndDate) ||
      isBefore(targetEndDate, startDate)
    )
      return;

    setIsCalculating(true);

    const monthlyInterestRate = interestRate / 100 / 12;
    const calculatedMonths = Math.max(
      1,
      differenceInMonths(targetEndDate, startDate)
    );

    const avgMonthlyExpenses = getTotalExpenses();
    const avgMonthlyIncome = getTotalIncome();

    const avgMonthlyBonus = bonuses.reduce(
      (sum, bonus) => sum + (bonus.amount * bonus.allocation) / 100 / 12, // Simplified average
      0
    );
    const monthlyAvailable =
      avgMonthlyIncome + avgMonthlyBonus - avgMonthlyExpenses;

    let requiredMonthlyPayment: number;

    if (monthlyInterestRate === 0) {
      requiredMonthlyPayment = debtAmount / calculatedMonths;
    } else {
      requiredMonthlyPayment =
        (debtAmount *
          monthlyInterestRate *
          Math.pow(1 + monthlyInterestRate, calculatedMonths)) /
        (Math.pow(1 + monthlyInterestRate, calculatedMonths) - 1);
    }

    requiredMonthlyPayment = Math.ceil(requiredMonthlyPayment / 1000) * 1000;

    const isPossible = monthlyAvailable >= requiredMonthlyPayment;
    const requiredExtraSavings = isPossible
      ? 0
      : requiredMonthlyPayment - monthlyAvailable;

    let message: string;
    if (isPossible) {
      message = `現在の平均的な収支で返済可能です。毎月約${formatCurrency(
        requiredMonthlyPayment
      )}の返済で目標日までに完済できます。`;
    } else {
      message = `目標日までに完済するには、毎月約${formatCurrency(
        requiredExtraSavings
      )}の追加資金が必要です（現在の平均収支に基づく）。支出削減や収入増加を検討してください。`;
    }

    const result: ReverseCalculationResult = {
      monthlyPayment: requiredMonthlyPayment,
      requiredExtraSavings,
      payoffDate: targetEndDate,
      isPossible,
      message,
    };

    setReverseCalcResult(result);
    setIsReverseCalcMode(true);
    setIsCalculating(false);
    setIsCalculated(true);
  }, [
    debtAmount,
    interestRate,
    startDate,
    targetEndDate,
    getTotalExpenses,
    getTotalIncome,
    bonuses,
    formatCurrency,
  ]);

  // UI Handlers
  const handleCalculate = () => {
    setIsReverseCalcMode(false);
    setReverseCalcResult(null);
    setIsCalculated(true);
    setCurrentView("results");
  };

  const handleReverseCalculate = () => {
    calculateReversePayment();
    setCurrentView("results");
  };

  const handleAddExpense = () => {
    if (newExpense.description.trim() && newExpense.amount > 0) {
      setExpenses([
        ...expenses,
        {
          id: Date.now().toString(),
          description: newExpense.description,
          amount: Number(newExpense.amount),
          date: newExpense.date,
          isRecurring: newExpense.isRecurring,
          frequency: newExpense.frequency,
        },
      ]);
      setNewExpense({
        description: "",
        amount: 0,
        date: new Date(),
        isRecurring: true,
        frequency: "monthly",
      });
    }
  };

  const handleAddIncome = () => {
    if (newIncome.description.trim() && newIncome.amount > 0) {
      setIncomes([
        ...incomes,
        {
          id: Date.now().toString(),
          description: newIncome.description,
          amount: Number(newIncome.amount),
          date: newIncome.date,
          isRecurring: newIncome.isRecurring,
          frequency: newIncome.frequency,
        },
      ]);
      setNewIncome({
        description: "",
        amount: 0,
        date: new Date(),
        isRecurring: true,
        frequency: "monthly",
      });
    }
  };

  const handleAddBonus = () => {
    if (newBonus.description.trim() && newBonus.amount > 0) {
      setBonuses([
        ...bonuses,
        {
          id: Date.now().toString(),
          description: newBonus.description,
          amount: Number(newBonus.amount),
          date: newBonus.date,
          allocation: Number(newBonus.allocation),
        },
      ]);
      setNewBonus({
        description: "",
        amount: 0,
        date: new Date(),
        allocation: 50,
      });
    }
  };

  const handleRemoveExpense = (id: string) => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
  };

  const handleRemoveIncome = (id: string) => {
    setIncomes(incomes.filter((income) => income.id !== id));
  };

  const handleRemoveBonus = (id: string) => {
    setBonuses(bonuses.filter((bonus) => bonus.id !== id));
  };

  const getTotalInterestPaid = (): number => {
    if (repaymentPlan.length === 0) return 0;
    return repaymentPlan.reduce((acc, item) => acc + item.interestPayment, 0);
  };

  const getTotalMonthlyBonus = (): number => {
    if (bonuses.length === 0) return 0;
    const totalBonusAmount = bonuses.reduce((total, bonus) => {
      return total + (bonus.amount * bonus.allocation) / 100;
    }, 0);
    // totalMonths is guaranteed to be at least 1 by its useMemo definition.
    return totalBonusAmount / totalMonths;
  };

  const getPayoffDate = (): Date | null => {
    if (
      repaymentPlan.length === 0 ||
      repaymentPlan[repaymentPlan.length - 1].debtAmount > 0
    )
      return null;
    return repaymentPlan[repaymentPlan.length - 1].date;
  };

  const getPaymentProgressPercentage = (): number => {
    if (repaymentPlan.length === 0 || debtAmount === 0) return 0;
    const lastPlan = repaymentPlan[repaymentPlan.length - 1];
    const paidAmount = debtAmount - lastPlan.debtAmount;
    return Math.min(100, Math.max(0, (paidAmount / debtAmount) * 100));
  };

  const formatDate = (date: Date | undefined): string => {
    if (!date || !isValid(date)) return "日付未設定";
    return format(date, "yyyy年MM月dd日", { locale: ja });
  };

  const formatMonthYear = (date: Date): string => {
    if (!date || !isValid(date)) return "年月未設定";
    return format(date, "yyyy年MM月", { locale: ja });
  };

  // Tooltip formatter for charts
  const formatTooltip = (
    value: ValueType,
    name: NameType
  ): [string, string] => {
    const labels: Record<string, string> = {
      debtAmount: "残債",
      payment: "返済額",
      principalPayment: "元金返済",
      interestPayment: "利息返済",
      expenses: "支出",
      income: "収入",
      bonus: "ボーナス",
      availableForDebt: "返済可能額",
      cumulativeInterest: "累計利息",
    };

    let displayValue: string;

    if (typeof value === "number") {
      displayValue = formatCurrency(value);
    } else if (typeof value === "string") {
      const num = parseFloat(value);
      displayValue = !isNaN(num) ? formatCurrency(num) : value;
    } else {
      displayValue = "-";
    }

    return [displayValue, labels[name as string] || String(name)];
  };

  // Prepare pie chart data
  const getPrincipalVsInterestData = () => {
    const totalInterest = getTotalInterestPaid();
    const totalPrincipal = debtAmount;

    if (totalPrincipal === 0 && totalInterest === 0) {
      return [
        { name: "データなし", value: 1, fill: THEME.colors.neutral[300] },
      ];
    }

    return [
      { name: "元金", value: totalPrincipal, fill: CHART_COLORS[0] },
      { name: "利息", value: totalInterest, fill: CHART_COLORS[1] },
    ];
  };

  // Date Picker Component
  const DatePickerWithPresets = ({
    date,
    setDate,
  }: {
    date: Date | undefined;
    setDate: (date: Date | undefined) => void;
  }) => {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              (!date || !isValid(date)) && "text-muted-foreground",
              "bg-white"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date && isValid(date) ? (
              format(date, "yyyy年MM月dd日", { locale: ja })
            ) : (
              <span>日付を選択</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <UICalendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
            locale={ja}
            className="rounded-md border"
            disabled={(d) =>
              isFuture(d) && differenceInMonths(d, new Date()) > 12 * 10
            }
          />
        </PopoverContent>
      </Popover>
    );
  };

  // Wizard navigation functions
  const nextStep = () => {
    switch (currentStep) {
      case "debt":
        setCurrentStep("income");
        break;
      case "income":
        setCurrentStep("expenses");
        break;
      case "expenses":
        setCurrentStep("bonus");
        break;
      case "bonus":
        setCurrentStep("confirm");
        break;
      case "confirm":
        setWizardCompleted(true);
        handleCalculate();
        break;
    }
  };

  const prevStep = () => {
    switch (currentStep) {
      case "income":
        setCurrentStep("debt");
        break;
      case "expenses":
        setCurrentStep("income");
        break;
      case "bonus":
        setCurrentStep("expenses");
        break;
      case "confirm":
        setCurrentStep("bonus");
        break;
    }
  };

  // Get progress percentage for wizard
  const getProgressPercentage = (): number => {
    switch (currentStep) {
      case "debt":
        return 20;
      case "income":
        return 40;
      case "expenses":
        return 60;
      case "bonus":
        return 80;
      case "confirm":
        return 100;
    }
  };

  // Get step title and icon
  const getStepInfo = () => {
    switch (currentStep) {
      case "debt":
        return {
          title: "借金情報の入力",
          description: "現在の借金額と利息などの基本情報を入力してください",
          icon: <Coins className="h-6 w-6 text-blue-600" />,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
        };
      case "income":
        return {
          title: "収入情報の入力",
          description: "毎月の収入情報を登録してください",
          icon: <DollarSign className="h-6 w-6 text-green-600" />,
          color: "text-green-600",
          bgColor: "bg-green-50",
        };
      case "expenses":
        return {
          title: "支出情報の入力",
          description: "毎月の支出情報を登録してください",
          icon: <TrendingDown className="h-6 w-6 text-rose-600" />,
          color: "text-rose-600",
          bgColor: "bg-rose-50",
        };
      case "bonus":
        return {
          title: "ボーナス情報の入力",
          description: "ボーナスなどの一時的な収入を登録してください",
          icon: <Gift className="h-6 w-6 text-yellow-600" />,
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
        };
      case "confirm":
        return {
          title: "入力内容の確認",
          description: "入力した情報を確認し、計算を実行してください",
          icon: <Check className="h-6 w-6 text-purple-600" />,
          color: "text-purple-600",
          bgColor: "bg-purple-50",
        };
    }
  };

  // Render the wizard step content
  const renderStepContent = () => {
    switch (currentStep) {
      case "debt":
        return renderDebtStep();
      case "income":
        return renderIncomeStep();
      case "expenses":
        return renderExpensesStep();
      case "bonus":
        return renderBonusStep();
      case "confirm":
        return renderConfirmStep();
    }
  };

  // Debt Step Content
  const renderDebtStep = () => {
    return (
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card style={cardStyle}>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Coins className="h-6 w-6" />
                借金情報
              </CardTitle>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                {isClient && (
                  <DynamicLottie
                    animationData={calculatorAnimation}
                    style={{ width: 50, height: 50 }}
                  />
                )}
              </motion.div>
            </div>
            <CardDescription className="text-gray-600">
              あなたの現在の借金状況と利息を入力してください
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label
                    htmlFor="debtAmount"
                    className="text-gray-700 font-medium"
                  >
                    現在の借金額
                  </Label>
                  <span className="text-sm font-medium text-blue-600">
                    {formatCurrency(debtAmount)}
                  </span>
                </div>
                <div className="flex gap-4 items-center">
                  <span className="text-blue-600 font-bold text-lg">¥</span>
                  <Input
                    id="debtAmount"
                    type="number"
                    value={debtAmount}
                    onChange={(e) =>
                      setDebtAmount(Math.max(0, Number(e.target.value)))
                    }
                    className="flex-1"
                    style={inputStyle}
                    min="0"
                  />
                </div>
                <Slider
                  value={[debtAmount]}
                  min={0}
                  max={5000000}
                  step={10000}
                  onValueChange={(value) => setDebtAmount(value[0])}
                  className="mt-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label
                    htmlFor="interestRate"
                    className="text-gray-700 font-medium"
                  >
                    年間利率
                  </Label>
                  <span className="text-sm font-medium text-blue-600">
                    {interestRate}%
                  </span>
                </div>
                <div className="flex gap-4 items-center">
                  <Percent className="text-blue-600 h-5 w-5" />
                  <Input
                    id="interestRate"
                    type="number"
                    value={interestRate}
                    onChange={(e) =>
                      setInterestRate(Math.max(0, Number(e.target.value)))
                    }
                    className="flex-1"
                    style={inputStyle}
                    min="0"
                    step="0.1"
                  />
                </div>
                <Slider
                  value={[interestRate]}
                  min={0}
                  max={15}
                  step={0.1}
                  onValueChange={(value) => setInterestRate(value[0])}
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={cardStyle}>
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2 text-indigo-700">
                <CalendarDays className="h-6 w-6" />
                返済期間
              </CardTitle>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
              >
                {isClient && (
                  <DynamicLottie
                    animationData={calendarAnimation}
                    style={{ width: 50, height: 50 }}
                  />
                )}
              </motion.div>
            </div>
            <CardDescription className="text-gray-600">
              返済開始日と目標完済日を設定してください
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="startDate"
                  className="text-gray-700 font-medium"
                >
                  返済開始日
                </Label>
                {isClient && (
                  <DatePickerWithPresets
                    date={startDate}
                    setDate={setStartDate}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-gray-700 font-medium">
                  目標完済日
                </Label>
                {isClient && (
                  <DatePickerWithPresets
                    date={targetEndDate}
                    setDate={setTargetEndDate}
                  />
                )}
              </div>

              <motion.div
                className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Info size={16} className="text-blue-600" />
                    <span className="font-medium text-blue-800">返済設定</span>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-blue-100 text-blue-800"
                  >
                    {totalMonths > 0 ? `${totalMonths}ヶ月間` : "期間未定"}
                  </Badge>
                </div>

                <div className="space-y-3 mt-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="autoPayment" className="cursor-pointer">
                        自動返済最適化
                      </Label>
                      <TooltipProvider>
                        <UITooltip>
                          <TooltipTrigger>
                            <HelpCircle size={14} className="text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-72">
                              ONにすると、毎月の余剰資金をすべて返済に充てます。OFFにすると、毎月一定額を返済します。
                            </p>
                          </TooltipContent>
                        </UITooltip>
                      </TooltipProvider>
                    </div>
                    <Switch
                      id="autoPayment"
                      checked={autoPayment}
                      onCheckedChange={setAutoPayment}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label
                        htmlFor="minPayment"
                        className={cn(
                          "text-gray-700 font-medium",
                          autoPayment && "text-gray-400"
                        )}
                      >
                        {autoPayment ? "最低返済額 (参考)" : "毎月の返済額"}
                      </Label>
                      <span
                        className={cn(
                          "text-sm font-medium",
                          autoPayment ? "text-gray-400" : "text-blue-600"
                        )}
                      >
                        {formatCurrency(minPayment)}
                      </span>
                    </div>
                    <div className="flex gap-4 items-center">
                      <span
                        className={cn(
                          "font-bold text-lg",
                          autoPayment ? "text-gray-400" : "text-blue-600"
                        )}
                      >
                        ¥
                      </span>
                      <Input
                        id="minPayment"
                        type="number"
                        value={minPayment}
                        onChange={(e) =>
                          setMinPayment(Math.max(0, Number(e.target.value)))
                        }
                        className="flex-1"
                        style={inputStyle}
                        min="0"
                        disabled={autoPayment && false}
                      />
                    </div>
                    <Slider
                      value={[minPayment]}
                      min={0}
                      max={Math.max(
                        100000,
                        debtAmount > 0 ? debtAmount / 12 : 100000
                      )} // Ensure max is reasonable
                      step={1000}
                      onValueChange={(value) => setMinPayment(value[0])}
                      className="mt-2"
                      disabled={autoPayment && false}
                    />
                    {autoPayment && (
                      <p className="text-xs text-gray-500 mt-1">
                        自動最適化ONの場合、この金額が下限となります。
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Income Step Content
  const renderIncomeStep = () => {
    return (
      <motion.div
        className="mt-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card style={cardStyle}>
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2 text-emerald-700">
                <DollarSign className="h-6 w-6" />
                収入情報
              </CardTitle>
              <motion.div
                animate={{
                  y: [0, -5, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                {isClient && (
                  <DynamicLottie
                    animationData={moneyAnimation}
                    style={{ width: 50, height: 50 }}
                  />
                )}
              </motion.div>
            </div>
            <CardDescription className="text-gray-600">
              毎月の収入を追加してください
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <AnimatePresence>
              {incomes.length === 0 ? (
                <motion.p
                  className="text-gray-400 text-center py-4 bg-gray-50 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  収入が登録されていません
                </motion.p>
              ) : (
                <div className="space-y-3 mb-6">
                  {incomes.map((income) => (
                    <motion.div
                      key={income.id}
                      layout
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{
                        opacity: 0,
                        x: 20,
                        height: 0,
                        marginBottom: 0,
                        paddingTop: 0,
                        paddingBottom: 0,
                      }}
                      transition={{ duration: 0.3 }}
                      whileHover={{
                        scale: 1.01,
                        backgroundColor: "#f7fcf9",
                      }}
                    >
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium">
                          {income.description}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="font-medium text-emerald-600">
                            {formatCurrency(income.amount)}
                          </span>
                          <span>・</span>
                          <span>
                            {income.isRecurring
                              ? income.frequency === "monthly"
                                ? "毎月"
                                : income.frequency === "yearly"
                                ? "毎年"
                                : "一度限り" // Should not happen with current UI for recurring
                              : formatDate(income.date)}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                        onClick={() => handleRemoveIncome(income.id)}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>

            {incomes.length > 0 && (
              <motion.div
                className="mb-6 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-emerald-50 border border-emerald-100"
                whileHover={{ scale: 1.01 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 10,
                }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">
                    毎月の定期収入合計：
                  </span>
                  <span className="text-emerald-600 font-bold">
                    {formatCurrency(getTotalIncome())}
                  </span>
                </div>
              </motion.div>
            )}

            <div className="space-y-4 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-lg border border-emerald-100">
              <h3 className="text-emerald-800 font-semibold flex items-center gap-2">
                <Plus size={16} className="text-emerald-600" />
                新しい収入を追加
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="incomeDescription"
                    className="text-gray-700 font-medium mb-2 block"
                  >
                    内容
                  </Label>
                  <Input
                    id="incomeDescription"
                    value={newIncome.description}
                    onChange={(e) =>
                      setNewIncome({
                        ...newIncome,
                        description: e.target.value,
                      })
                    }
                    placeholder="給料、副業等"
                    className="bg-white"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <Label
                    htmlFor="incomeAmount"
                    className="text-gray-700 font-medium mb-2 block"
                  >
                    金額
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 font-bold">¥</span>
                    <Input
                      id="incomeAmount"
                      type="number"
                      value={newIncome.amount}
                      onChange={(e) =>
                        setNewIncome({
                          ...newIncome,
                          amount: Math.max(0, Number(e.target.value)),
                        })
                      }
                      placeholder="300000"
                      className="bg-white"
                      style={inputStyle}
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="incomeFrequency"
                    className="text-gray-700 font-medium mb-2 block"
                  >
                    頻度
                  </Label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="incomeRecurring"
                        checked={newIncome.isRecurring}
                        onCheckedChange={(checked) =>
                          setNewIncome({
                            ...newIncome,
                            isRecurring: checked,
                            frequency: checked ? newIncome.frequency : "once",
                          })
                        }
                      />
                      <Label
                        htmlFor="incomeRecurring"
                        className="cursor-pointer"
                      >
                        繰り返し
                      </Label>
                    </div>

                    {newIncome.isRecurring && (
                      <Select
                        value={newIncome.frequency}
                        onValueChange={(
                          value // Type is "monthly" | "yearly" | "once"
                        ) =>
                          setNewIncome({
                            ...newIncome,
                            frequency: value as "monthly" | "yearly" | "once",
                          })
                        }
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="頻度を選択" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">毎月</SelectItem>
                          <SelectItem value="yearly">毎年</SelectItem>
                          {/* <SelectItem value="once">一度限り</SelectItem> // Removed as "once" is for non-recurring */}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
                <div>
                  <Label
                    htmlFor="incomeDate"
                    className="text-gray-700 font-medium mb-2 block"
                  >
                    {newIncome.isRecurring && newIncome.frequency !== "once"
                      ? "初回日付"
                      : "日付"}
                  </Label>
                  {isClient && (
                    <DatePickerWithPresets
                      date={newIncome.date}
                      setDate={(date) =>
                        date && setNewIncome({ ...newIncome, date })
                      }
                    />
                  )}
                </div>
              </div>

              <motion.div
                className="flex justify-end mt-4"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleAddIncome}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white border-none flex items-center gap-2"
                  disabled={
                    !newIncome.description.trim() || newIncome.amount <= 0
                  }
                >
                  <Plus size={18} />
                  収入を追加
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Expenses Step Content
  const renderExpensesStep = () => {
    return (
      <motion.div
        className="mt-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card style={cardStyle}>
          <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2 text-pink-700">
                <TrendingDown className="h-6 w-6" />
                固定支出リスト
              </CardTitle>
              <motion.div
                animate={{ rotate: [0, 5, 0, -5, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                <Coins className="h-6 w-6 text-pink-600" />
              </motion.div>
            </div>
            <CardDescription className="text-gray-600">
              毎月の固定支出を追加してください（頻度と日付を設定可能）
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <AnimatePresence>
              {expenses.length === 0 ? (
                <motion.p
                  className="text-gray-400 text-center py-4 bg-gray-50 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  支出が登録されていません
                </motion.p>
              ) : (
                <div className="space-y-3 mb-6">
                  {expenses.map((expense) => (
                    <motion.div
                      key={expense.id}
                      layout
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{
                        opacity: 0,
                        x: 20,
                        height: 0,
                        marginBottom: 0,
                        paddingTop: 0,
                        paddingBottom: 0,
                      }}
                      transition={{ duration: 0.3 }}
                      whileHover={{
                        scale: 1.01,
                        backgroundColor: "#fef2f2",
                      }}
                    >
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium">
                          {expense.description}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="font-medium text-rose-600">
                            {formatCurrency(expense.amount)}
                          </span>
                          <span>・</span>
                          <span>
                            {expense.isRecurring
                              ? expense.frequency === "monthly"
                                ? "毎月"
                                : expense.frequency === "yearly"
                                ? "毎年"
                                : "一度限り"
                              : formatDate(expense.date)}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                        onClick={() => handleRemoveExpense(expense.id)}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>

            {expenses.length > 0 && (
              <motion.div
                className="mb-6 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-rose-50 border border-rose-100"
                whileHover={{ scale: 1.01 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 10,
                }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">
                    毎月の定期支出合計：
                  </span>
                  <span className="text-rose-600 font-bold">
                    {formatCurrency(getTotalExpenses())}
                  </span>
                </div>
              </motion.div>
            )}

            <div className="space-y-4 bg-gradient-to-r from-rose-50 to-pink-50 p-4 rounded-lg border border-rose-100">
              <h3 className="text-rose-800 font-semibold flex items-center gap-2">
                <Plus size={16} className="text-rose-600" />
                新しい支出を追加
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="expenseDescription"
                    className="text-gray-700 font-medium mb-2 block"
                  >
                    内容
                  </Label>
                  <Input
                    id="expenseDescription"
                    value={newExpense.description}
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        description: e.target.value,
                      })
                    }
                    placeholder="家賃、サブスク等"
                    className="bg-white"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <Label
                    htmlFor="expenseAmount"
                    className="text-gray-700 font-medium mb-2 block"
                  >
                    金額
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 font-bold">¥</span>
                    <Input
                      id="expenseAmount"
                      type="number"
                      value={newExpense.amount}
                      onChange={(e) =>
                        setNewExpense({
                          ...newExpense,
                          amount: Math.max(0, Number(e.target.value)),
                        })
                      }
                      placeholder="50000"
                      className="bg-white"
                      style={inputStyle}
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="expenseFrequency"
                    className="text-gray-700 font-medium mb-2 block"
                  >
                    頻度
                  </Label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="expenseRecurring"
                        checked={newExpense.isRecurring}
                        onCheckedChange={(checked) =>
                          setNewExpense({
                            ...newExpense,
                            isRecurring: checked,
                            frequency: checked ? newExpense.frequency : "once",
                          })
                        }
                      />
                      <Label
                        htmlFor="expenseRecurring"
                        className="cursor-pointer"
                      >
                        繰り返し
                      </Label>
                    </div>

                    {newExpense.isRecurring && (
                      <Select
                        value={newExpense.frequency}
                        onValueChange={(value) =>
                          setNewExpense({
                            ...newExpense,
                            frequency: value as "monthly" | "yearly" | "once",
                          })
                        }
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="頻度を選択" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">毎月</SelectItem>
                          <SelectItem value="yearly">毎年</SelectItem>
                          {/* <SelectItem value="once">一度限り</SelectItem> */}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
                <div>
                  <Label
                    htmlFor="expenseDate"
                    className="text-gray-700 font-medium mb-2 block"
                  >
                    {newExpense.isRecurring && newExpense.frequency !== "once"
                      ? "初回日付"
                      : "日付"}
                  </Label>
                  {isClient && (
                    <DatePickerWithPresets
                      date={newExpense.date}
                      setDate={(date) =>
                        date && setNewExpense({ ...newExpense, date })
                      }
                    />
                  )}
                </div>
              </div>

              <motion.div
                className="flex justify-end mt-4"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleAddExpense}
                  className="bg-rose-600 hover:bg-rose-700 text-white border-none flex items-center gap-2"
                  disabled={
                    !newExpense.description.trim() || newExpense.amount <= 0
                  }
                >
                  <Plus size={18} />
                  支出を追加
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Bonus Step Content
  const renderBonusStep = () => {
    return (
      <motion.div
        className="mt-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card style={cardStyle}>
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2 text-yellow-700">
                <Gift className="h-6 w-6" />
                ボーナス情報
              </CardTitle>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{
                  duration: 1,
                  type: "spring",
                  bounce: 0.5,
                }}
              >
                {isClient && (
                  <DynamicLottie
                    animationData={savingsAnimation}
                    style={{ width: 50, height: 50 }}
                  />
                )}
              </motion.div>
            </div>
            <CardDescription className="text-gray-600">
              臨時ボーナスの情報と返済への充当率を設定
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <AnimatePresence>
              {bonuses.length === 0 ? (
                <motion.p
                  className="text-gray-400 text-center py-4 bg-gray-50 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  ボーナスが登録されていません
                </motion.p>
              ) : (
                <div className="space-y-3 mb-6">
                  {bonuses.map((bonus) => (
                    <motion.div
                      key={bonus.id}
                      layout
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{
                        opacity: 0,
                        x: 20,
                        height: 0,
                        marginBottom: 0,
                        paddingTop: 0,
                        paddingBottom: 0,
                      }}
                      transition={{ duration: 0.3 }}
                      whileHover={{
                        scale: 1.01,
                        backgroundColor: "#fffbeb",
                      }}
                    >
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium">
                          {bonus.description}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="font-medium text-yellow-600">
                            {formatCurrency(bonus.amount)}
                          </span>
                          <span>・</span>
                          <span>{formatDate(bonus.date)}</span>
                          <span>・</span>
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">
                            返済充当: {bonus.allocation}%
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                        onClick={() => handleRemoveBonus(bonus.id)}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>

            <div className="space-y-4 bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-lg border border-yellow-100">
              <h3 className="text-yellow-800 font-semibold flex items-center gap-2">
                <Plus size={16} className="text-yellow-600" />
                新しいボーナスを追加
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="bonusDescription"
                    className="text-gray-700 font-medium mb-2 block"
                  >
                    内容
                  </Label>
                  <Input
                    id="bonusDescription"
                    value={newBonus.description}
                    onChange={(e) =>
                      setNewBonus({
                        ...newBonus,
                        description: e.target.value,
                      })
                    }
                    placeholder="夏ボーナス、臨時収入等"
                    className="bg-white"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <Label
                    htmlFor="bonusAmount"
                    className="text-gray-700 font-medium mb-2 block"
                  >
                    金額
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 font-bold">¥</span>
                    <Input
                      id="bonusAmount"
                      type="number"
                      value={newBonus.amount}
                      onChange={(e) =>
                        setNewBonus({
                          ...newBonus,
                          amount: Math.max(0, Number(e.target.value)),
                        })
                      }
                      placeholder="500000"
                      className="bg-white"
                      style={inputStyle}
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="bonusDate"
                    className="text-gray-700 font-medium mb-2 block"
                  >
                    受取日
                  </Label>
                  {isClient && (
                    <DatePickerWithPresets
                      date={newBonus.date}
                      setDate={(date) =>
                        date && setNewBonus({ ...newBonus, date })
                      }
                    />
                  )}
                </div>
                <div>
                  <Label
                    htmlFor="bonusAllocation"
                    className="text-gray-700 font-medium mb-2 block"
                  >
                    返済への充当率 (%){" "}
                    <span className="text-yellow-700">
                      {newBonus.allocation}%
                    </span>
                  </Label>
                  <div className="flex flex-col gap-2">
                    <Slider
                      value={[newBonus.allocation]}
                      min={0}
                      max={100}
                      step={5}
                      onValueChange={(value) =>
                        setNewBonus({
                          ...newBonus,
                          allocation: value[0],
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <motion.div
                className="flex justify-end mt-4"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleAddBonus}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white border-none flex items-center gap-2"
                  disabled={
                    !newBonus.description.trim() || newBonus.amount <= 0
                  }
                >
                  <Plus size={18} />
                  ボーナスを追加
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Confirmation Step Content
  const renderConfirmStep = () => {
    return (
      <motion.div
        className="mt-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card style={cardStyle}>
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Check className="h-6 w-6" />
                入力内容の確認
              </CardTitle>
              <motion.div
                animate={{
                  rotate: [0, 10, 0, -10, 0],
                  scale: [1, 1.1, 1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
              >
                {isClient && (
                  <DynamicLottie
                    animationData={successAnimation}
                    style={{ width: 50, height: 50 }}
                  />
                )}
              </motion.div>
            </div>
            <CardDescription className="text-gray-600">
              入力された情報を確認し、計算方法を選択してください
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Debt Summary */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="text-lg font-semibold text-blue-700 mb-3 flex items-center">
                  <Coins className="mr-2 h-5 w-5" />
                  借金情報
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between items-center p-2 bg-white rounded-md">
                    <span className="text-gray-600">借金総額</span>
                    <span className="font-bold text-blue-600">
                      {formatCurrency(debtAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded-md">
                    <span className="text-gray-600">年間利率</span>
                    <span className="font-bold text-blue-600">
                      {interestRate}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded-md">
                    <span className="text-gray-600">返済開始日</span>
                    <span className="font-bold text-blue-600">
                      {formatDate(startDate)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded-md">
                    <span className="text-gray-600">目標完済日</span>
                    <span className="font-bold text-blue-600">
                      {formatDate(targetEndDate)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded-md">
                    <span className="text-gray-600">返済期間</span>
                    <span className="font-bold text-blue-600">
                      {totalMonths}ヶ月
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded-md">
                    <span className="text-gray-600">
                      {autoPayment ? "最低返済額" : "毎月の返済額"}
                    </span>
                    <span className="font-bold text-blue-600">
                      {formatCurrency(minPayment)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Income & Expense Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                  <h3 className="text-lg font-semibold text-emerald-700 mb-3 flex items-center">
                    <DollarSign className="mr-2 h-5 w-5" />
                    収入情報
                  </h3>
                  <div className="flex justify-between items-center p-2 bg-white rounded-md mb-2">
                    <span className="text-gray-600">毎月の定期収入</span>
                    <span className="font-bold text-emerald-600">
                      {formatCurrency(getTotalIncome())}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-3">
                    {incomes.length === 0 ? (
                      <p className="text-center text-gray-400 italic">
                        収入が登録されていません
                      </p>
                    ) : (
                      <ul className="list-disc pl-5 space-y-1">
                        {incomes.slice(0, 3).map((income) => (
                          <li key={income.id}>
                            {income.description}:{" "}
                            <span className="font-medium text-emerald-600">
                              {formatCurrency(income.amount)}
                            </span>{" "}
                            ({income.isRecurring ? "定期" : "一回"})
                          </li>
                        ))}
                        {incomes.length > 3 && (
                          <li className="text-gray-400">
                            他 {incomes.length - 3}件...
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-rose-50 rounded-lg border border-rose-100">
                  <h3 className="text-lg font-semibold text-rose-700 mb-3 flex items-center">
                    <TrendingDown className="mr-2 h-5 w-5" />
                    支出情報
                  </h3>
                  <div className="flex justify-between items-center p-2 bg-white rounded-md mb-2">
                    <span className="text-gray-600">毎月の定期支出</span>
                    <span className="font-bold text-rose-600">
                      {formatCurrency(getTotalExpenses())}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-3">
                    {expenses.length === 0 ? (
                      <p className="text-center text-gray-400 italic">
                        支出が登録されていません
                      </p>
                    ) : (
                      <ul className="list-disc pl-5 space-y-1">
                        {expenses.slice(0, 3).map((expense) => (
                          <li key={expense.id}>
                            {expense.description}:{" "}
                            <span className="font-medium text-rose-600">
                              {formatCurrency(expense.amount)}
                            </span>{" "}
                            ({expense.isRecurring ? "定期" : "一回"})
                          </li>
                        ))}
                        {expenses.length > 3 && (
                          <li className="text-gray-400">
                            他 {expenses.length - 3}件...
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* Bonus Summary */}
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                <h3 className="text-lg font-semibold text-yellow-700 mb-3 flex items-center">
                  <Gift className="mr-2 h-5 w-5" />
                  ボーナス情報
                </h3>
                {bonuses.length === 0 ? (
                  <p className="text-center text-gray-400 italic p-2 bg-white rounded-md">
                    ボーナスが登録されていません
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {bonuses.map((bonus) => (
                      <div
                        key={bonus.id}
                        className="flex justify-between items-center p-2 bg-white rounded-md"
                      >
                        <div>
                          <span className="text-gray-700">
                            {bonus.description}
                          </span>
                          <div className="text-sm text-gray-500">
                            {formatDate(bonus.date)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-yellow-600">
                            {formatCurrency(bonus.amount)}
                          </div>
                          <div className="text-sm text-gray-500">
                            返済充当: {bonus.allocation}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cash Flow Summary */}
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                <h3 className="text-lg font-semibold text-purple-700 mb-3 flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  収支サマリー
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between items-center p-2 bg-white rounded-md">
                    <span className="text-gray-600">月間収入</span>
                    <span className="font-bold text-emerald-600">
                      {formatCurrency(getTotalIncome())}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded-md">
                    <span className="text-gray-600">月間支出</span>
                    <span className="font-bold text-rose-600">
                      {formatCurrency(getTotalExpenses())}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded-md">
                    <span className="text-gray-600">月間平均ボーナス</span>
                    <span className="font-bold text-yellow-600">
                      {formatCurrency(getTotalMonthlyBonus())}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded-md">
                    <span className="text-gray-600">月間余剰資金</span>
                    <span
                      className={
                        getTotalIncome() - getTotalExpenses() > 0
                          ? "font-bold text-emerald-600"
                          : "font-bold text-rose-600"
                      }
                    >
                      {formatCurrency(getTotalIncome() - getTotalExpenses())}
                    </span>
                  </div>
                </div>
              </div>

              {/* Calculation Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <motion.div
                  className="flex justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <animated.div
                    style={{
                      display: "inline-block",
                      transform: pulseAnimation.scale.to((s) => `scale(${s})`),
                    }}
                    className="w-full"
                  >
                    <Button
                      onClick={handleCalculate}
                      className="text-lg w-full px-8 py-6 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                      disabled={isCalculating}
                      style={{
                        boxShadow: "0 4px 14px rgba(59, 130, 246, 0.4)",
                      }}
                    >
                      {isCalculating && !isReverseCalcMode ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <Calculator size={20} className="mr-2" />
                          <span>通常計算</span>
                        </>
                      )}
                    </Button>
                  </animated.div>
                </motion.div>

                <motion.div
                  className="flex justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div style={{ display: "inline-block" }} className="w-full">
                    <Button
                      onClick={handleReverseCalculate}
                      className="text-lg w-full px-8 py-6 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white"
                      disabled={isCalculating}
                      style={{
                        boxShadow: "0 4px 14px rgba(168, 85, 247, 0.4)",
                      }}
                    >
                      {isCalculating && isReverseCalcMode ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <CalculatorIcon size={20} className="mr-2" />
                          <span>目標日から逆算</span>
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Main layout for wizard or results
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-100 via-slate-50 to-stone-100 p-4 md:p-8">
      <header className="mb-8 text-center">
        <motion.h1
          className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 mb-2"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <span className="inline-block relative">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 text-transparent bg-clip-text animate-gradient-x">
              借金返済
            </span>
            <span className="bg-gradient-to-r from-emerald-500 via-blue-600 to-indigo-600 text-transparent bg-clip-text animate-pulse">
              くん
            </span>
            <span className="absolute -bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
          </span>
          <SparkleIcon className="inline-block ml-2 mb-2 h-8 w-8 text-yellow-400" />
        </motion.h1>
        <motion.p
          className="text-neutral-600 text-lg"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        >
          借金返済計画のすべて
        </motion.p>
      </header>

      {currentView === "wizard" && !wizardCompleted && (
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Card
            className="mb-8 shadow-xl overflow-hidden"
            style={{ ...cardStyle, border: "none" }}
          >
            <CardHeader
              className={`p-4 ${
                getStepInfo().bgColor
              } border-b border-opacity-50`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    key={currentStep + "icon"} // Ensure re-render on step change
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  >
                    {getStepInfo().icon}
                  </motion.div>
                  <div>
                    <CardTitle className={`text-xl ${getStepInfo().color}`}>
                      {getStepInfo().title}
                    </CardTitle>
                    <CardDescription className="text-sm text-neutral-600">
                      {getStepInfo().description}
                    </CardDescription>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`${getStepInfo().bgColor} ${
                    getStepInfo().color
                  } border-current`}
                >
                  ステップ {getStepNumber(currentStep)} / 5
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 bg-white">
              <Progress value={getProgressPercentage()} className="mb-6 h-2" />
              {renderStepContent()}
            </CardContent>
            <CardFooter className="flex justify-between p-6 bg-neutral-50 border-t">
              <Button
                onClick={prevStep}
                variant="outline"
                disabled={currentStep === "debt"}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                戻る
              </Button>
              <Button
                onClick={nextStep}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex items-center gap-2"
              >
                {currentStep === "confirm" ? "計算実行" : "次へ"}
                {currentStep !== "confirm" && <ArrowRight size={16} />}
                {currentStep === "confirm" && <CalculatorIcon size={16} />}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}

      {currentView === "results" && isCalculated && (
        <animated.div style={fadeIn} className="mt-8">
          {isCalculating && (
            <motion.div
              className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                <p className="text-lg font-medium text-neutral-700">
                  計算中です...
                </p>
              </div>
            </motion.div>
          )}

          {!isCalculating && repaymentPlan.length > 0 && (
            <>
              {isReverseCalcMode && reverseCalcResult && (
                <motion.div
                  className={`mb-8 p-6 rounded-xl shadow-lg border-l-4 ${
                    reverseCalcResult.isPossible
                      ? "bg-emerald-50 border-emerald-500"
                      : "bg-amber-50 border-amber-500"
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-start gap-4">
                    {reverseCalcResult.isPossible ? (
                      <PartyPopper className="h-8 w-8 text-emerald-600 mt-1" />
                    ) : (
                      <Lightbulb className="h-8 w-8 text-amber-600 mt-1" />
                    )}
                    <div>
                      <h3
                        className={`text-xl font-semibold mb-2 ${
                          reverseCalcResult.isPossible
                            ? "text-emerald-700"
                            : "text-amber-700"
                        }`}
                      >
                        {reverseCalcResult.isPossible
                          ? "目標達成可能です！"
                          : "目標達成には工夫が必要です"}
                      </h3>
                      <p className="text-neutral-700">
                        {reverseCalcResult.message}
                      </p>
                      {!reverseCalcResult.isPossible && (
                        <p className="mt-2 text-sm text-amber-600">
                          現在の計画では、毎月
                          <span className="font-bold">
                            {formatCurrency(reverseCalcResult.monthlyPayment)}
                          </span>
                          の返済が必要です。現在の収支では
                          <span className="font-bold">
                            {formatCurrency(
                              reverseCalcResult.requiredExtraSavings
                            )}
                          </span>
                          不足しています。
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <Card
                  style={cardStyle}
                  className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                >
                  <CardHeader>
                    <CardTitle className="text-2xl font-semibold flex items-center gap-2">
                      <CalendarDays size={24} />
                      完済予定日
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold">
                      {getPayoffDate()
                        ? format(getPayoffDate()!, "yyyy年MM月", {
                            locale: ja,
                          })
                        : "計算中..."}
                    </p>
                    <p className="text-blue-100 mt-1">
                      {getPayoffDate()
                        ? `${
                            differenceInMonths(getPayoffDate()!, startDate!) + 1
                          }ヶ月で完済`
                        : "目標期間内に完済不可"}
                    </p>
                  </CardContent>
                </Card>
                <Card
                  style={cardStyle}
                  className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white"
                >
                  <CardHeader>
                    <CardTitle className="text-2xl font-semibold flex items-center gap-2">
                      <Percent size={24} />
                      総支払利息
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold">
                      {formatCurrency(getTotalInterestPaid())}
                    </p>
                    <p className="text-emerald-100 mt-1">
                      元金 {formatCurrency(debtAmount)} に対して
                    </p>
                  </CardContent>
                </Card>
                <Card
                  style={cardStyle}
                  className="bg-gradient-to-br from-purple-500 to-pink-500 text-white"
                >
                  <CardHeader>
                    <CardTitle className="text-2xl font-semibold flex items-center gap-2">
                      <Medal size={24} />
                      進捗状況
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold">
                      {getPaymentProgressPercentage().toFixed(1)}%
                    </p>
                    <Progress
                      value={getPaymentProgressPercentage()}
                      className="mt-2 h-3 bg-white/30 [&>div]:bg-white"
                    />
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="summary" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4 bg-neutral-200/70">
                  <TabsTrigger value="summary">概要</TabsTrigger>
                  <TabsTrigger value="plan">返済計画</TabsTrigger>
                  <TabsTrigger value="charts">チャート</TabsTrigger>
                  <TabsTrigger value="advice">アドバイス</TabsTrigger>
                </TabsList>

                <TabsContent value="summary">
                  <Card style={cardStyle}>
                    <CardHeader>
                      <CardTitle className="text-2xl text-neutral-800 flex items-center gap-2">
                        <BarChart3 />
                        返済サマリー
                      </CardTitle>
                      <CardDescription>
                        あなたの返済計画の全体像です。
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoItem
                          label="当初借入額"
                          value={formatCurrency(debtAmount)}
                        />
                        <InfoItem label="年間利率" value={`${interestRate}%`} />
                        <InfoItem
                          label="返済開始日"
                          value={formatDate(startDate)}
                        />
                        <InfoItem
                          label="目標完済日"
                          value={formatDate(targetEndDate)}
                        />
                        <InfoItem
                          label="計画上の完済日"
                          value={
                            getPayoffDate() !== null
                              ? formatDate(getPayoffDate() || undefined)
                              : "目標期間内完済不可"
                          }
                          highlight={!getPayoffDate()}
                        />
                        <InfoItem
                          label="総返済期間"
                          value={
                            getPayoffDate()
                              ? `${
                                  differenceInMonths(
                                    getPayoffDate()!,
                                    startDate!
                                  ) + 1
                                }ヶ月`
                              : "-"
                          }
                        />
                        <InfoItem
                          label="総支払額"
                          value={formatCurrency(
                            debtAmount + getTotalInterestPaid()
                          )}
                        />
                        <InfoItem
                          label="総支払利息"
                          value={formatCurrency(getTotalInterestPaid())}
                          className="text-rose-600 font-semibold"
                        />
                      </div>
                      {repaymentPlan.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="text-lg font-semibold mb-2 text-neutral-700">
                            初月の返済内訳:
                          </h4>
                          <InfoItem
                            label="支払額"
                            value={formatCurrency(repaymentPlan[0].payment)}
                          />
                          <InfoItem
                            label="元金充当"
                            value={formatCurrency(
                              repaymentPlan[0].principalPayment
                            )}
                          />
                          <InfoItem
                            label="利息充当"
                            value={formatCurrency(
                              repaymentPlan[0].interestPayment
                            )}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="plan">
                  <Card style={cardStyle}>
                    <CardHeader>
                      <CardTitle className="text-2xl text-neutral-800 flex items-center gap-2">
                        <CalendarIcon />
                        月別返済計画
                      </CardTitle>
                      <CardDescription>
                        詳細な月ごとの返済スケジュールです。
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto rounded-lg border">
                        <table className="min-w-full divide-y divide-neutral-200">
                          <thead className="bg-neutral-50">
                            <tr>
                              {[
                                "月",
                                "残債",
                                "返済額",
                                "元金",
                                "利息",
                                "累計利息",
                              ].map((header) => (
                                <th
                                  key={header}
                                  scope="col"
                                  className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                                >
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-neutral-200">
                            {repaymentPlan.map((item, index) => (
                              <motion.tr
                                key={index}
                                className={cn(
                                  index % 2 === 0
                                    ? "bg-white"
                                    : "bg-neutral-50/50",
                                  "hover:bg-blue-50/50 transition-colors"
                                )}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.02 }}
                              >
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-700">
                                  {formatMonthYear(item.date)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-600">
                                  {formatCurrency(item.debtAmount)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-emerald-600 font-medium">
                                  {formatCurrency(item.payment)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-600">
                                  {formatCurrency(item.principalPayment)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-rose-600">
                                  {formatCurrency(item.interestPayment)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-600">
                                  {formatCurrency(item.cumulativeInterest)}
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="charts">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card style={cardStyle}>
                      <CardHeader>
                        <CardTitle className="text-xl text-neutral-800">
                          残債推移
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="h-[350px] md:h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={repaymentPlan}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="month"
                              tickFormatter={(tick) =>
                                repaymentPlan.length > 12 &&
                                repaymentPlan.indexOf(
                                  repaymentPlan.find(
                                    (item) => item.month === tick
                                  )!
                                ) %
                                  Math.floor(repaymentPlan.length / 6) !==
                                  0
                                  ? "" // Show fewer ticks for many months
                                  : format(
                                      new Date(
                                        repaymentPlan.find(
                                          (item) => item.month === tick
                                        )!.date
                                      ),
                                      "yy/MM"
                                    )
                              }
                              angle={repaymentPlan.length > 24 ? -30 : 0}
                              textAnchor={
                                repaymentPlan.length > 24 ? "end" : "middle"
                              }
                              height={repaymentPlan.length > 24 ? 50 : 30}
                            />
                            <YAxis
                              tickFormatter={(tick) => `¥${tick / 10000}万`}
                            />
                            <Tooltip formatter={formatTooltip} />
                            <Legend />
                            <Area
                              type="monotone"
                              dataKey="debtAmount"
                              name="残債"
                              stroke={CHART_COLORS[0]}
                              fillOpacity={0.3}
                              fill={CHART_COLORS[0]}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                    <Card style={cardStyle}>
                      <CardHeader>
                        <CardTitle className="text-xl text-neutral-800">
                          元金 vs 利息
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="h-[350px] md:h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={getPrincipalVsInterestData()}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={"80%"}
                              dataKey="value"
                              nameKey="name"
                              label={({
                                cx,
                                cy,
                                midAngle,
                                innerRadius,
                                outerRadius,
                                percent,
                                name,
                              }) => {
                                const RADIAN = Math.PI / 180;
                                const radius =
                                  innerRadius +
                                  (outerRadius - innerRadius) * 0.5;
                                const x =
                                  cx + radius * Math.cos(-midAngle * RADIAN);
                                const y =
                                  cy + radius * Math.sin(-midAngle * RADIAN);
                                return (
                                  <text
                                    x={x}
                                    y={y}
                                    fill="white"
                                    textAnchor={x > cx ? "start" : "end"}
                                    dominantBaseline="central"
                                    className="text-xs font-medium"
                                  >
                                    {`${name} (${(percent * 100).toFixed(0)}%)`}
                                  </text>
                                );
                              }}
                            >
                              {getPrincipalVsInterestData().map(
                                (entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={
                                      entry.fill ||
                                      CHART_COLORS[index % CHART_COLORS.length]
                                    }
                                  />
                                )
                              )}
                            </Pie>
                            <Tooltip formatter={formatTooltip} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                    <Card style={cardStyle} className="lg:col-span-2">
                      <CardHeader>
                        <CardTitle className="text-xl text-neutral-800">
                          月次支払内訳 (元金/利息)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="h-[350px] md:h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={repaymentPlan}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="month"
                              tickFormatter={(tick) =>
                                repaymentPlan.length > 12 &&
                                repaymentPlan.indexOf(
                                  repaymentPlan.find(
                                    (item) => item.month === tick
                                  )!
                                ) %
                                  Math.floor(repaymentPlan.length / 6) !==
                                  0
                                  ? ""
                                  : format(
                                      new Date(
                                        repaymentPlan.find(
                                          (item) => item.month === tick
                                        )!.date
                                      ),
                                      "yy/MM"
                                    )
                              }
                              angle={repaymentPlan.length > 24 ? -30 : 0}
                              textAnchor={
                                repaymentPlan.length > 24 ? "end" : "middle"
                              }
                              height={repaymentPlan.length > 24 ? 50 : 30}
                            />
                            <YAxis
                              tickFormatter={(tick) => `¥${tick / 1000}k`}
                            />
                            <Tooltip formatter={formatTooltip} />
                            <Legend />
                            <Bar
                              dataKey="principalPayment"
                              name="元金返済"
                              stackId="a"
                              fill={CHART_COLORS[2]}
                            />
                            <Bar
                              dataKey="interestPayment"
                              name="利息支払"
                              stackId="a"
                              fill={CHART_COLORS[3]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="advice">
                  <Card style={cardStyle}>
                    <CardHeader>
                      <CardTitle className="text-2xl text-neutral-800 flex items-center gap-2">
                        <Lightbulb />
                        返済アドバイス
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <AdviceItem
                        title="繰り上げ返済を検討"
                        description="余裕資金ができた場合は、繰り上げ返済を行うことで利息負担を軽減し、完済を早めることができます。特に金利が高い借金から優先的に行いましょう。"
                        icon={<Zap className="text-yellow-500" />}
                      />
                      <AdviceItem
                        title="支出の見直し"
                        description="毎月の支出を見直し、削減できる項目がないか確認しましょう。固定費（家賃、通信費など）の削減は特に効果が大きいです。"
                        icon={<Settings className="text-blue-500" />}
                      />
                      <AdviceItem
                        title="収入アップの機会を探す"
                        description="副業やスキルアップによる昇給など、収入を増やす方法も検討してみましょう。増えた収入を返済に充てることで、計画を大幅に短縮できます。"
                        icon={<ArrowUpRight className="text-emerald-500" />}
                      />
                      <AdviceItem
                        title="金利交渉または借り換え"
                        description="現在の金利が高い場合、金融機関に金利交渉を試みるか、より低金利のローンへの借り換えを検討する価値があります。信用情報が良い状態であれば可能性が高まります。"
                        icon={<Coins className="text-purple-500" />}
                      />
                      {getTotalInterestPaid() > debtAmount * 0.1 && (
                        <AdviceItem
                          title="利息負担が大きい場合の対策"
                          description={`総支払利息が ${formatCurrency(
                            getTotalInterestPaid()
                          )} となっています。これは元金の ${(
                            (getTotalInterestPaid() / debtAmount) *
                            100
                          ).toFixed(
                            1
                          )}% に相当します。利息負担を減らすため、上記のアドバイス（特に繰り上げ返済や借り換え）を積極的に検討してください。`}
                          icon={<TrendingDown className="text-rose-500" />}
                          className="bg-rose-50 border-l-rose-400"
                        />
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              <div className="mt-8 text-center">
                <Button
                  onClick={() => {
                    setCurrentView("wizard");
                    setWizardCompleted(false); // Allow re-entering wizard
                    setIsCalculated(false);
                    setRepaymentPlan([]);
                  }}
                  variant="outline"
                  className="px-6 py-3 text-lg"
                >
                  <ChevronLeft className="mr-2 h-5 w-5" />
                  設定に戻る
                </Button>
              </div>
            </>
          )}
          {!isCalculating && repaymentPlan.length === 0 && isCalculated && (
            <Card style={cardStyle}>
              <CardHeader>
                <CardTitle className="text-2xl text-neutral-800">
                  計算結果なし
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600">
                  入力された条件では返済計画を計算できませんでした。
                  これは、収入に対して支出や借金額が大きすぎる場合や、返済期間の設定に無理がある場合などに発生します。
                  入力内容を見直して再度計算してください。
                </p>
                <div className="mt-6 text-center">
                  <Button
                    onClick={() => {
                      setCurrentView("wizard");
                      setWizardCompleted(false);
                      setIsCalculated(false);
                    }}
                    variant="outline"
                    className="px-6 py-3 text-lg"
                  >
                    <ChevronLeft className="mr-2 h-5 w-5" />
                    設定に戻る
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </animated.div>
      )}
    </div>
  );
};

// Helper component for summary items
const InfoItem: React.FC<{
  label: string;
  value: string;
  className?: string;
  highlight?: boolean;
}> = ({ label, value, className, highlight }) => (
  <div
    className={cn(
      "p-3 rounded-md",
      highlight
        ? "bg-amber-50 border border-amber-200"
        : "bg-neutral-50 border border-neutral-100",
      className
    )}
  >
    <p className="text-sm text-neutral-500">{label}</p>
    <p
      className={cn(
        "text-lg font-semibold",
        highlight ? "text-amber-700" : "text-neutral-800"
      )}
    >
      {value}
    </p>
  </div>
);

// Helper component for advice items
const AdviceItem: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
}> = ({ title, description, icon, className }) => (
  <div
    className={cn(
      "p-4 rounded-lg border-l-4 border-blue-500 bg-blue-50/50 shadow-sm",
      className
    )}
  >
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-1">{icon}</div>
      <div>
        <h4 className="text-md font-semibold text-neutral-800">{title}</h4>
        <p className="text-sm text-neutral-600">{description}</p>
      </div>
    </div>
  </div>
);

export default DebtRepaymentApp;
