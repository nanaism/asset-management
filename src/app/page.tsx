"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatePicker as UICalendar } from "@/components/ui/calendar"; // Renamed to avoid conflict
import {
  Card,
  CardContent,
  CardDescription,
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
  ArrowUpRight,
  BarChart3,
  Calculator,
  CalculatorIcon,
  CalendarDays,
  Calendar as CalendarIcon,
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
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie, // Renamed to avoid conflict
  PieChart,
  RadialBar,
  RadialBarChart,
  BarChart as RechartsBarChart,
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
import rocketAnimation from "./rocket-animation.json";
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

const DebtRepaymentApp: React.FC = () => {
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
  const [activeTab, setActiveTab] = useState<string>("input");
  const [activeInputSection, setActiveInputSection] = useState<string>("debt");
  const [isClient, setIsClient] = useState(false);
  const [isReverseCalcMode, setIsReverseCalcMode] = useState<boolean>(false);
  const [reverseCalcResult, setReverseCalcResult] =
    useState<ReverseCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

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
  }, [debtAmount, interestRate, startDate, targetEndDate]); // totalMonths is derived from startDate, targetEndDate

  // Helper function to check if an event occurs in a given month
  const eventOccursInMonth = useCallback(
    (
      date: Date,
      currentDate: Date,
      frequency: "monthly" | "yearly" | "once"
    ): boolean => {
      if (!date || !currentDate || !isValid(date) || !isValid(currentDate))
        return false;

      const eventDate = startOfMonth(new Date(date)); // Compare start of month for consistency
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
        const bonusDate = new Date(bonus.date);
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
    targetEndDate, // Added as totalMonths depends on it
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
    // This calculates average monthly expenses based on recurring monthly items.
    // For a more accurate "current" or "next month" expense, it would need more context.
    return expenses.reduce((total, expense) => {
      if (expense.isRecurring && expense.frequency === "monthly") {
        return total + expense.amount;
      }
      // For yearly, divide by 12. For 'once', it's tricky for an "average monthly".
      // This function is used in reverse calculation, so monthly average is likely intended.
      // if (expense.isRecurring && expense.frequency === "yearly") {
      //   return total + expense.amount / 12;
      // }
      return total;
    }, 0);
  }, [expenses]);

  const getTotalIncome = useCallback((): number => {
    return incomes.reduce((total, income) => {
      if (income.isRecurring && income.frequency === "monthly") {
        return total + income.amount;
      }
      // Similar to expenses, for yearly or once-off incomes for an "average monthly".
      // if (income.isRecurring && income.frequency === "yearly") {
      //   return total + income.amount / 12;
      // }
      return total;
    }, 0);
  }, [incomes]);

  const formatCurrency = useCallback((value: number): string => {
    if (typeof value !== "number" || isNaN(value)) {
      return "¥0"; // Or "¥NaN" or some other indicator
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
    // Simplified average monthly bonus for this calculation
    const avgMonthlyBonus = bonuses.reduce(
      (sum, bonus) => sum + (bonus.amount * bonus.allocation) / 100 / 12,
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
    setIsReverseCalcMode(true); // Set mode before calculating plan
    setIsCalculating(false); // Finish this calculation step

    // Trigger recalculation of the plan with this new payment
    // calculateRepaymentPlan(); // This will be triggered by useEffect due to isReverseCalcMode/reverseCalcResult change if calculateRepaymentPlan depends on them
    setIsCalculated(true); // This will trigger the useEffect to call calculateRepaymentPlan
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
    setIsCalculated(true); // This will trigger useEffect -> calculateRepaymentPlan
    // calculateRepaymentPlan(); // Direct call can be redundant if useEffect handles it
    setActiveTab("chart");
  };

  const handleReverseCalculate = () => {
    calculateReversePayment(); // This sets isReverseCalcMode and reverseCalcResult, then setIsCalculated(true)
    setActiveTab("chart");
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
    // Or, if cumulativeInterest is always the total up to that point:
    // return repaymentPlan[repaymentPlan.length - 1].cumulativeInterest;
  };

  const getTotalMonthlyBonus = (): number => {
    // This calculates an average monthly bonus based on all listed bonuses.
    // It might not be accurate if bonuses are very irregular.
    if (bonuses.length === 0) return 0;
    const totalBonusAmount = bonuses.reduce((total, bonus) => {
      return total + (bonus.amount * bonus.allocation) / 100;
    }, 0);
    // Assuming bonuses are spread over the repayment period for averaging.
    // If totalMonths is 0 or undefined, this could be an issue.
    const monthsForAverage =
      totalMonths > 0 ? totalMonths : DEFAULT_VALUES.targetMonths;
    return totalBonusAmount / monthsForAverage;
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
    // Total principal paid is initial debt - remaining debt. If fully paid, it's initial debt.
    // For this chart, it's usually about the composition of total money spent if the loan is paid off.
    // So, if the loan is paid off, principal is debtAmount.
    // If not paid off, it's (debtAmount - finalDebtBalance).
    // Let's assume it's about the total amount if paid off according to plan.
    const totalPrincipal = debtAmount;

    if (totalPrincipal === 0 && totalInterest === 0) {
      return [{ name: "データなし", value: 1 }]; // Placeholder for empty chart
    }

    return [
      { name: "元金", value: totalPrincipal },
      { name: "利息", value: totalInterest },
    ];
  };

  // Prepare monthly breakdown data for stacked bar chart
  const getMonthlyBreakdownData = () => {
    return repaymentPlan.map((item) => ({
      month: formatMonthYear(item.date),
      元金返済: item.principalPayment,
      利息支払: item.interestPayment,
      その他支出: item.expenses, // This is total expenses, not just debt related
    }));
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
            } // Example: disable dates more than 10 years in future
          />
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <motion.div
      className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-gray-50 to-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="mb-8 text-center"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3 relative">
            <span className="inline-block relative">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 text-transparent bg-clip-text animate-gradient-x">
                借金返済
              </span>
              <span className="bg-gradient-to-r from-emerald-500 via-blue-600 to-indigo-600 text-transparent bg-clip-text animate-pulse">
                くん
              </span>
              <span className="absolute -bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transform origin-left scale-x-100 transition-transform"></span>
            </span>
            <motion.span
              className="ml-2 inline-block"
              animate={{ rotate: [0, -5, 0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <span className="text-yellow-500">✨</span>
            </motion.span>
            <motion.div
              className="absolute -right-12 -top-12 opacity-70 hidden md:block"
              animate={{
                y: [0, -5, 0, 5, 0],
                scale: [1, 1.05, 1, 0.95, 1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {isClient && (
                <DynamicLottie
                  animationData={moneyAnimation}
                  style={{ width: 100, height: 100 }}
                />
              )}
            </motion.div>
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            利息計算・日付別収支管理・ゴール逆算まで対応した
            <Badge
              variant="outline"
              className="ml-2 bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 animate-pulse"
            >
              次世代型
            </Badge>
            借金返済シミュレーター
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            style={{ marginBottom: "20px" }}
          >
            <TabsList className="w-full grid grid-cols-2 mb-6 bg-white shadow-sm rounded-xl border border-gray-100">
              <TabsTrigger
                value="input"
                className="flex-1 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-lg transition-all"
              >
                <motion.div
                  className="flex items-center justify-center gap-2 py-2"
                  whileHover={{ y: -1 }}
                >
                  <Settings size={18} />
                  <span>入力</span>
                </motion.div>
              </TabsTrigger>
              <TabsTrigger
                value="chart"
                className="flex-1 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-lg transition-all"
                disabled={!isCalculated || repaymentPlan.length === 0}
              >
                <motion.div
                  className="flex items-center justify-center gap-2 py-2"
                  whileHover={{ y: -1 }}
                >
                  <BarChart3 size={18} />
                  <span>グラフ</span>
                </motion.div>
              </TabsTrigger>
            </TabsList>
          </motion.div>

          {/* Input Tab Content */}
          <TabsContent value="input">
            <Tabs
              value={activeInputSection}
              onValueChange={setActiveInputSection}
              className="w-full"
            >
              <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 mb-6 bg-white shadow-sm rounded-xl border border-gray-100">
                <TabsTrigger
                  value="debt"
                  className="flex-1 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-lg transition-all"
                >
                  <motion.div
                    className="flex items-center justify-center gap-2 py-2"
                    whileHover={{ y: -1 }}
                  >
                    <Coins size={18} />
                    <span>借金・利息</span>
                  </motion.div>
                </TabsTrigger>
                <TabsTrigger
                  value="income"
                  className="flex-1 data-[state=active]:bg-green-50 data-[state=active]:text-green-700 rounded-lg transition-all"
                >
                  <motion.div
                    className="flex items-center justify-center gap-2 py-2"
                    whileHover={{ y: -1 }}
                  >
                    <DollarSign size={18} />
                    <span>収入</span>
                  </motion.div>
                </TabsTrigger>
                <TabsTrigger
                  value="expenses"
                  className="flex-1 data-[state=active]:bg-rose-50 data-[state=active]:text-rose-700 rounded-lg transition-all"
                >
                  <motion.div
                    className="flex items-center justify-center gap-2 py-2"
                    whileHover={{ y: -1 }}
                  >
                    <TrendingDown size={18} />
                    <span>支出</span>
                  </motion.div>
                </TabsTrigger>
                <TabsTrigger
                  value="bonus"
                  className="flex-1 data-[state=active]:bg-yellow-50 data-[state=active]:text-yellow-700 rounded-lg transition-all"
                >
                  <motion.div
                    className="flex items-center justify-center gap-2 py-2"
                    whileHover={{ y: -1 }}
                  >
                    <Gift size={18} />
                    <span>ボーナス</span>
                  </motion.div>
                </TabsTrigger>
              </TabsList>

              {/* Debt & Interest Section */}
              <TabsContent value="debt">
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
                            <span className="text-blue-600 font-bold text-lg">
                              ¥
                            </span>
                            <Input
                              id="debtAmount"
                              type="number"
                              value={debtAmount}
                              onChange={(e) =>
                                setDebtAmount(
                                  Math.max(0, Number(e.target.value))
                                )
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
                                setInterestRate(
                                  Math.max(0, Number(e.target.value))
                                )
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
                          <Label
                            htmlFor="endDate"
                            className="text-gray-700 font-medium"
                          >
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
                              <span className="font-medium text-blue-800">
                                返済設定
                              </span>
                            </div>
                            <Badge
                              variant="outline"
                              className="bg-blue-100 text-blue-800"
                            >
                              {totalMonths > 0
                                ? `${totalMonths}ヶ月間`
                                : "期間未定"}
                            </Badge>
                          </div>

                          <div className="space-y-3 mt-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Label
                                  htmlFor="autoPayment"
                                  className="cursor-pointer"
                                >
                                  自動返済最適化
                                </Label>
                                <TooltipProvider>
                                  <UITooltip>
                                    <TooltipTrigger>
                                      <HelpCircle
                                        size={14}
                                        className="text-gray-400"
                                      />
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
                              {" "}
                              {/* Always show minPayment, disable if autoPayment is ON */}
                              <div className="flex justify-between">
                                <Label
                                  htmlFor="minPayment"
                                  className={cn(
                                    "text-gray-700 font-medium",
                                    autoPayment && "text-gray-400"
                                  )}
                                >
                                  {autoPayment
                                    ? "最低返済額 (参考)"
                                    : "毎月の返済額"}
                                </Label>
                                <span
                                  className={cn(
                                    "text-sm font-medium",
                                    autoPayment
                                      ? "text-gray-400"
                                      : "text-blue-600"
                                  )}
                                >
                                  {formatCurrency(minPayment)}
                                </span>
                              </div>
                              <div className="flex gap-4 items-center">
                                <span
                                  className={cn(
                                    "font-bold text-lg",
                                    autoPayment
                                      ? "text-gray-400"
                                      : "text-blue-600"
                                  )}
                                >
                                  ¥
                                </span>
                                <Input
                                  id="minPayment"
                                  type="number"
                                  value={minPayment}
                                  onChange={(e) =>
                                    setMinPayment(
                                      Math.max(0, Number(e.target.value))
                                    )
                                  }
                                  className="flex-1"
                                  style={inputStyle}
                                  min="0"
                                  disabled={autoPayment && false} // Keep enabled to set a floor for autoPayment
                                />
                              </div>
                              <Slider
                                value={[minPayment]}
                                min={0} // Allow 0 for min payment
                                max={Math.max(100000, debtAmount / 12)} // Dynamic max based on debt
                                step={1000}
                                onValueChange={(value) =>
                                  setMinPayment(value[0])
                                }
                                className="mt-2"
                                disabled={autoPayment && false} // Keep enabled
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
              </TabsContent>

              {/* Income Section */}
              <TabsContent value="income">
                <motion.div
                  className="mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
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
                                          : "一度限り"
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
                                      // if not recurring, set frequency to 'once'
                                      frequency: checked
                                        ? newIncome.frequency
                                        : "once",
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
                                    value: "monthly" | "yearly" | "once" // Ensure type safety
                                  ) =>
                                    setNewIncome({
                                      ...newIncome,
                                      frequency: value,
                                    })
                                  }
                                >
                                  <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="頻度を選択" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="monthly">
                                      毎月
                                    </SelectItem>
                                    <SelectItem value="yearly">毎年</SelectItem>
                                    {/* <SelectItem value="once">一度限り</SelectItem> // 'once' is for non-recurring */}
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
                              {newIncome.isRecurring &&
                              newIncome.frequency !== "once"
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
                              !newIncome.description.trim() ||
                              newIncome.amount <= 0
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
              </TabsContent>

              {/* Expenses Section */}
              <TabsContent value="expenses">
                <motion.div
                  className="mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
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
                                  onClick={() =>
                                    handleRemoveExpense(expense.id)
                                  }
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
                                      frequency: checked
                                        ? newExpense.frequency
                                        : "once",
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
                                  onValueChange={(
                                    value: "monthly" | "yearly" | "once"
                                  ) =>
                                    setNewExpense({
                                      ...newExpense,
                                      frequency: value,
                                    })
                                  }
                                >
                                  <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="頻度を選択" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="monthly">
                                      毎月
                                    </SelectItem>
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
                              {newExpense.isRecurring &&
                              newExpense.frequency !== "once"
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
                              !newExpense.description.trim() ||
                              newExpense.amount <= 0
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
              </TabsContent>

              {/* Bonus Section */}
              <TabsContent value="bonus">
                <motion.div
                  className="mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
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
                              !newBonus.description.trim() ||
                              newBonus.amount <= 0
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
              </TabsContent>
            </Tabs>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
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
                {/* pulseAnimation is already used, maybe a different one or remove if not needed for this button */}
                <div style={{ display: "inline-block" }}>
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
          </TabsContent>

          {/* Chart Tab Content */}
          <TabsContent value="chart">
            {isClient && (
              <AnimatePresence>
                {isCalculated &&
                  repaymentPlan.length > 0 && ( // Ensure repaymentPlan has data
                    <animated.div
                      style={{
                        opacity: fadeIn.opacity,
                        transform: fadeIn.transform,
                      }}
                    >
                      {isReverseCalcMode && reverseCalcResult && (
                        <motion.div
                          className="mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 shadow-lg"
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, type: "spring" }}
                        >
                          <div className="flex flex-col md:flex-row items-center gap-4">
                            <div className="flex-shrink-0">
                              <motion.div
                                animate={{
                                  rotate: [0, 5, 0, -5, 0],
                                  scale: [1, 1.05, 1, 1.05, 1],
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                <SparkleIcon
                                  size={32}
                                  className="text-purple-500"
                                />
                              </motion.div>
                            </div>
                            <div className="flex-grow">
                              <h3 className="text-xl font-bold text-purple-800 mb-2 flex items-center">
                                目標日までの返済プラン
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "ml-2",
                                    reverseCalcResult.isPossible
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-rose-100 text-rose-800"
                                  )}
                                >
                                  {reverseCalcResult.isPossible
                                    ? "達成可能"
                                    : "要調整"}
                                </Badge>
                              </h3>
                              <p className="text-gray-700">
                                {reverseCalcResult.message}
                              </p>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                <div className="bg-white rounded-lg p-3 shadow-sm">
                                  <div className="text-sm text-gray-500">
                                    必要月額返済額
                                  </div>
                                  <div className="text-lg font-bold text-purple-700">
                                    {formatCurrency(
                                      reverseCalcResult.monthlyPayment
                                    )}
                                  </div>
                                </div>

                                <div className="bg-white rounded-lg p-3 shadow-sm">
                                  <div className="text-sm text-gray-500">
                                    目標完済日
                                  </div>
                                  <div className="text-lg font-bold text-purple-700">
                                    {formatDate(reverseCalcResult.payoffDate)}
                                  </div>
                                </div>

                                {!reverseCalcResult.isPossible && (
                                  <div className="bg-white rounded-lg p-3 shadow-sm">
                                    <div className="text-sm text-gray-500">
                                      必要追加資金/月
                                    </div>
                                    <div className="text-lg font-bold text-rose-600">
                                      {formatCurrency(
                                        reverseCalcResult.requiredExtraSavings
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Debt Payoff Progress */}
                      <motion.div
                        className="mb-8 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 shadow"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <div className="flex flex-col md:flex-row items-center md:justify-between gap-4">
                          <div className="w-full md:w-auto">
                            <h3 className="text-lg font-bold text-blue-800 mb-2">
                              返済進捗状況
                            </h3>

                            <div className="h-4 w-full md:w-64 bg-gray-200 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                                initial={{ width: "0%" }}
                                animate={{
                                  width: `${getPaymentProgressPercentage()}%`,
                                }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                              ></motion.div>
                            </div>

                            <div className="mt-2 flex justify-between text-sm">
                              <span className="text-gray-600">開始</span>
                              <span className="text-blue-700 font-medium">
                                {Math.round(getPaymentProgressPercentage())}%
                                完了
                              </span>
                              <span className="text-gray-600">完了</span>
                            </div>
                          </div>

                          <div className="flex gap-4 flex-wrap justify-center">
                            <div className="bg-white rounded-lg p-3 shadow-sm min-w-[150px] text-center md:text-left">
                              <div className="text-sm text-gray-500">
                                元本残高
                              </div>
                              <div className="text-lg font-bold text-blue-700">
                                {repaymentPlan.length > 0
                                  ? formatCurrency(
                                      repaymentPlan[repaymentPlan.length - 1]
                                        .debtAmount
                                    )
                                  : formatCurrency(debtAmount)}
                              </div>
                            </div>

                            <div className="bg-white rounded-lg p-3 shadow-sm min-w-[150px] text-center md:text-left">
                              <div className="text-sm text-gray-500">
                                累計支払利息
                              </div>
                              <div className="text-lg font-bold text-rose-600">
                                {formatCurrency(getTotalInterestPaid())}
                              </div>
                            </div>

                            <div className="bg-white rounded-lg p-3 shadow-sm min-w-[150px] text-center md:text-left">
                              <div className="text-sm text-gray-500">
                                予想完済日
                              </div>
                              <div className="text-lg font-bold text-emerald-700">
                                {getPayoffDate()
                                  ? formatDate(getPayoffDate()!)
                                  : repaymentPlan.length > 0 &&
                                    repaymentPlan[repaymentPlan.length - 1]
                                      .debtAmount > 0
                                  ? "期間内未達"
                                  : "未計算"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Summary Cards */}
                      <motion.div
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                      >
                        {/* 返済概要 Card */}
                        <Card style={cardStyle}>
                          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                            <CardTitle className="text-blue-700 flex items-center">
                              <span className="mr-2 h-5 w-5 font-bold">¥</span>
                              返済概要
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div className="relative">
                              <motion.div
                                className="absolute -top-12 -right-12 opacity-70 z-0"
                                initial={{ rotate: 0 }}
                                animate={{ rotate: 360 }}
                                transition={{
                                  duration: 20,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                              >
                                {isClient && (
                                  <DynamicLottie
                                    animationData={moneyAnimation}
                                    style={{ width: 120, height: 120 }}
                                  />
                                )}
                              </motion.div>
                              <ul className="space-y-4 relative z-10">
                                <motion.li
                                  className="flex justify-between"
                                  initial={{ x: -20, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: 0.1 }}
                                >
                                  <span className="font-medium text-gray-600">
                                    初期借金額:
                                  </span>
                                  <span className="font-bold text-blue-600">
                                    {formatCurrency(debtAmount)}
                                  </span>
                                </motion.li>
                                <motion.li
                                  className="flex justify-between"
                                  initial={{ x: -20, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: 0.2 }}
                                >
                                  <span className="font-medium text-gray-600">
                                    年間利率:
                                  </span>
                                  <span className="font-bold text-blue-600">
                                    {interestRate}%
                                  </span>
                                </motion.li>
                                <motion.li
                                  className="flex justify-between"
                                  initial={{ x: -20, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: 0.3 }}
                                >
                                  <span className="font-medium text-gray-600">
                                    総支払利息(予定):
                                  </span>
                                  <span className="font-bold text-rose-600">
                                    {formatCurrency(getTotalInterestPaid())}
                                  </span>
                                </motion.li>
                                <motion.li
                                  className="flex justify-between"
                                  initial={{ x: -20, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: 0.4 }}
                                >
                                  <span className="font-medium text-gray-600">
                                    毎月の定期支出:
                                  </span>
                                  <span className="font-bold text-rose-600">
                                    {formatCurrency(getTotalExpenses())}
                                  </span>
                                </motion.li>
                                <motion.li
                                  className="flex justify-between"
                                  initial={{ x: -20, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: 0.5 }}
                                >
                                  <span className="font-medium text-gray-600">
                                    毎月の定期収入:
                                  </span>
                                  <span className="font-bold text-emerald-600">
                                    {formatCurrency(getTotalIncome())}
                                  </span>
                                </motion.li>
                                <motion.li
                                  className="flex justify-between"
                                  initial={{ x: -20, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: 0.6 }}
                                >
                                  <span className="font-medium text-gray-600">
                                    月平均ボーナス(返済用):
                                  </span>
                                  <span className="font-bold text-yellow-600">
                                    {formatCurrency(getTotalMonthlyBonus())}
                                  </span>
                                </motion.li>
                              </ul>
                            </div>
                          </CardContent>
                        </Card>

                        {/* 返済期間 Card */}
                        <Card style={cardStyle}>
                          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
                            <CardTitle className="text-emerald-700 flex items-center">
                              <CalendarIcon className="mr-2 h-5 w-5" />
                              返済期間
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div className="text-center py-6 relative">
                              <motion.div
                                className="absolute top-0 right-0 opacity-80"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                  delay: 0.3,
                                  type: "spring",
                                  stiffness: 260,
                                  damping: 20,
                                }}
                              >
                                {isClient && (
                                  <DynamicLottie
                                    animationData={successAnimation}
                                    style={{ width: 80, height: 80 }}
                                  />
                                )}
                              </motion.div>

                              {getPayoffDate() ? (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 260,
                                    damping: 20,
                                    delay: 0.5,
                                  }}
                                >
                                  <div className="text-5xl font-bold text-emerald-600 mb-2">
                                    {repaymentPlan.length}ヶ月
                                  </div>
                                  <div className="text-gray-600">
                                    約{Math.floor(repaymentPlan.length / 12)}年
                                    {repaymentPlan.length % 12 > 0
                                      ? `${repaymentPlan.length % 12}ヶ月`
                                      : ""}
                                    で完済予定
                                  </div>
                                  <div className="mt-4 text-emerald-700 font-medium">
                                    完済予定日: {formatDate(getPayoffDate()!)}
                                  </div>
                                </motion.div>
                              ) : (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 260,
                                    damping: 20,
                                    delay: 0.5,
                                  }}
                                >
                                  <div className="text-5xl font-bold text-rose-600 mb-2">
                                    {repaymentPlan.length > 0
                                      ? "期間内未達"
                                      : "未計算"}
                                  </div>
                                  <div className="text-gray-600">
                                    {repaymentPlan.length > 0
                                      ? "設定期間内での完済が難しい状況です。条件を見直してください。"
                                      : "計算結果がありません。"}
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        {/* 節約ポイント Card */}
                        <Card style={cardStyle}>
                          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
                            <CardTitle className="text-purple-700 flex items-center">
                              <Lightbulb className="mr-2 h-5 w-5" />
                              返済加速のヒント
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div className="relative">
                              <motion.div
                                className="absolute -top-16 -right-16 opacity-80 z-0"
                                animate={{
                                  y: [0, -5, 0, 5, 0],
                                  scale: [1, 1.02, 1, 0.98, 1],
                                }}
                                transition={{
                                  duration: 4,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                }}
                              >
                                {isClient && (
                                  <DynamicLottie
                                    animationData={rocketAnimation}
                                    style={{ width: 120, height: 120 }}
                                  />
                                )}
                              </motion.div>
                              <ul className="space-y-3 relative z-10">
                                <motion.li
                                  className="flex items-start gap-2"
                                  initial={{ x: -20, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: 0.1 }}
                                >
                                  <div className="rounded-full bg-purple-100 p-1 mt-1">
                                    <ArrowUpRight
                                      size={14}
                                      className="text-purple-700"
                                    />
                                  </div>
                                  <div className="text-gray-600">
                                    {interestRate > 1 ? ( // Only suggest if interest is somewhat significant
                                      <>
                                        年利
                                        <span className="font-bold text-purple-600">
                                          {interestRate}%
                                        </span>
                                        をより低い金利 (
                                        <span className="font-bold text-purple-600">
                                          {Math.max(
                                            0.5,
                                            interestRate - 1
                                          ).toFixed(1)}
                                          %等
                                        </span>
                                        ) に借り換えると利息を節約できます。
                                      </>
                                    ) : (
                                      <>
                                        毎月の支出を
                                        <span className="font-bold text-purple-600">
                                          {formatCurrency(
                                            Math.max(
                                              5000,
                                              Math.round(
                                                getTotalExpenses() * 0.05
                                              )
                                            )
                                          )}{" "}
                                          (5%目安)
                                        </span>
                                        削減すると、返済期間が短縮できます。
                                      </>
                                    )}
                                  </div>
                                </motion.li>
                                <motion.li
                                  className="flex items-start gap-2"
                                  initial={{ x: -20, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: 0.2 }}
                                >
                                  <div className="rounded-full bg-purple-100 p-1 mt-1">
                                    <Zap
                                      size={14}
                                      className="text-purple-700"
                                    />
                                  </div>
                                  <div className="text-gray-600">
                                    ボーナスの返済充当率を
                                    <span className="font-bold text-purple-600">
                                      {bonuses.length > 0 &&
                                      bonuses[0].allocation < 100
                                        ? Math.min(
                                            100,
                                            bonuses[0].allocation + 10
                                          )
                                        : 80}
                                      % (+10%目安)
                                    </span>
                                    に上げると、より早く返済できます。
                                  </div>
                                </motion.li>
                                <motion.li
                                  className="flex items-start gap-2"
                                  initial={{ x: -20, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: 0.3 }}
                                >
                                  <div className="rounded-full bg-purple-100 p-1 mt-1">
                                    <Medal
                                      size={14}
                                      className="text-purple-700"
                                    />
                                  </div>
                                  <div className="text-gray-600">
                                    毎月
                                    <span className="font-bold text-purple-600">
                                      {formatCurrency(
                                        Math.max(
                                          10000,
                                          Math.round(
                                            DEFAULT_VALUES.minPayment * 0.5
                                          )
                                        )
                                      )}{" "}
                                      (現在の返済額の+α)
                                    </span>
                                    の追加返済で期間を大幅短縮。
                                  </div>
                                </motion.li>
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      {/* Principal vs Interest Pie Chart */}
                      <motion.div
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                      >
                        {/* Pie Chart */}
                        <Card style={cardStyle}>
                          <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b">
                            <CardTitle className="text-indigo-700">
                              元金vs利息の内訳 (総支払ベース)
                            </CardTitle>
                            <CardDescription className="text-gray-600">
                              完済時の総支払額における元金と利息の割合
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-6">
                            <div className="h-72">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={getPrincipalVsInterestData()}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent, value }) =>
                                      `${name}: ${formatCurrency(
                                        Number(value)
                                      )} (${(percent * 100).toFixed(0)}%)`
                                    }
                                  >
                                    {getPrincipalVsInterestData().map(
                                      (entry, index) => (
                                        <Cell
                                          key={`cell-${index}`}
                                          fill={
                                            CHART_COLORS[
                                              index % CHART_COLORS.length
                                            ]
                                          }
                                        />
                                      )
                                    )}
                                  </Pie>
                                  <Tooltip
                                    formatter={(value, name, props) => [
                                      formatCurrency(Number(value)),
                                      props.payload.name,
                                    ]}
                                  />
                                  {/* <Legend /> */}
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                              <div className="text-sm text-gray-600">
                                <p className="mb-2">
                                  <span className="font-bold text-indigo-700">
                                    総支払額(予定):{" "}
                                  </span>
                                  {formatCurrency(
                                    debtAmount + getTotalInterestPaid()
                                  )}
                                </p>
                                <p>
                                  <span className="font-bold text-rose-600">
                                    利息の割合:{" "}
                                  </span>
                                  {debtAmount + getTotalInterestPaid() > 0
                                    ? `${Math.round(
                                        (getTotalInterestPaid() /
                                          (debtAmount +
                                            getTotalInterestPaid())) *
                                          100
                                      )}%`
                                    : "0%"}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Monthly breakdown chart */}
                        <Card style={cardStyle}>
                          <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b">
                            <CardTitle className="text-teal-700">
                              月別支出内訳 (最初の12ヶ月)
                            </CardTitle>
                            <CardDescription className="text-gray-600">
                              月ごとの元金返済、利息、その他支出の内訳
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-6">
                            <div className="h-72">
                              <ResponsiveContainer width="100%" height="100%">
                                <RechartsBarChart
                                  data={getMonthlyBreakdownData().slice(0, 12)}
                                  margin={{
                                    top: 5,
                                    right: 0,
                                    left: -20,
                                    bottom: 5,
                                  }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="month" fontSize={10} />
                                  <YAxis
                                    fontSize={10}
                                    tickFormatter={(value) =>
                                      new Intl.NumberFormat("ja-JP", {
                                        notation: "compact",
                                        compactDisplay: "short",
                                      }).format(value as number)
                                    }
                                  />
                                  <Tooltip
                                    formatter={(value, name) => [
                                      formatCurrency(Number(value)),
                                      name as string,
                                    ]}
                                  />
                                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                                  <Bar
                                    dataKey="元金返済"
                                    stackId="a"
                                    fill={THEME.colors.primary.default}
                                  />
                                  <Bar
                                    dataKey="利息支払"
                                    stackId="a"
                                    fill={THEME.colors.secondary.default}
                                  />
                                  <Bar
                                    dataKey="その他支出"
                                    stackId="a"
                                    fill={THEME.colors.danger.default}
                                  />
                                </RechartsBarChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      {/* Debt Repayment Timeline */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                      >
                        <Card style={cardStyle}>
                          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                            <CardTitle className="text-blue-700">
                              借金返済の推移
                            </CardTitle>
                            <CardDescription className="text-gray-600">
                              毎月の借金残高と返済額の推移グラフ
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-6">
                            <div className="h-80">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                  data={repaymentPlan.map((item) => ({
                                    ...item,
                                    dateLabel: formatMonthYear(item.date), // Use a different key for label if 'date' is used for sorting
                                  }))}
                                  margin={{
                                    top: 5,
                                    right: 10,
                                    left: -20,
                                    bottom: 5,
                                  }}
                                >
                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#e2e8f0"
                                  />
                                  <XAxis
                                    dataKey="dateLabel"
                                    stroke="#64748b"
                                    fontSize={10}
                                  />
                                  <YAxis
                                    tickFormatter={(value) =>
                                      new Intl.NumberFormat("ja-JP", {
                                        notation: "compact",
                                        compactDisplay: "short",
                                      }).format(value as number)
                                    }
                                    stroke="#64748b"
                                    fontSize={10}
                                  />
                                  <Tooltip
                                    formatter={formatTooltip}
                                    contentStyle={{
                                      backgroundColor:
                                        "rgba(255, 255, 255, 0.95)",
                                      borderRadius: "8px",
                                      boxShadow:
                                        "0 4px 12px rgba(0, 0, 0, 0.1)",
                                      border: "1px solid #e2e8f0",
                                      color: "#1e293b",
                                      fontSize: "12px",
                                    }}
                                  />
                                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                                  <defs>
                                    <linearGradient
                                      id="colorDebt"
                                      x1="0"
                                      y1="0"
                                      x2="0"
                                      y2="1"
                                    >
                                      <stop
                                        offset="5%"
                                        stopColor={THEME.colors.primary.default}
                                        stopOpacity={0.8}
                                      />
                                      <stop
                                        offset="95%"
                                        stopColor={THEME.colors.primary.default}
                                        stopOpacity={0.1}
                                      />
                                    </linearGradient>
                                    <linearGradient
                                      id="colorPayment"
                                      x1="0"
                                      y1="0"
                                      x2="0"
                                      y2="1"
                                    >
                                      <stop
                                        offset="5%"
                                        stopColor={
                                          THEME.colors.secondary.default
                                        }
                                        stopOpacity={0.8}
                                      />
                                      <stop
                                        offset="95%"
                                        stopColor={
                                          THEME.colors.secondary.default
                                        }
                                        stopOpacity={0.1}
                                      />
                                    </linearGradient>
                                    <linearGradient
                                      id="colorPrincipal"
                                      x1="0"
                                      y1="0"
                                      x2="0"
                                      y2="1"
                                    >
                                      <stop
                                        offset="5%"
                                        stopColor={THEME.colors.success.default}
                                        stopOpacity={0.8}
                                      />
                                      <stop
                                        offset="95%"
                                        stopColor={THEME.colors.success.default}
                                        stopOpacity={0.1}
                                      />
                                    </linearGradient>
                                    <linearGradient
                                      id="colorInterestChart"
                                      x1="0"
                                      y1="0"
                                      x2="0"
                                      y2="1"
                                    >
                                      <stop
                                        offset="5%"
                                        stopColor={THEME.colors.danger.default}
                                        stopOpacity={0.8}
                                      />
                                      <stop
                                        offset="95%"
                                        stopColor={THEME.colors.danger.default}
                                        stopOpacity={0.1}
                                      />
                                    </linearGradient>
                                  </defs>
                                  <Area
                                    type="monotone"
                                    dataKey="debtAmount"
                                    name="残債"
                                    stroke={THEME.colors.primary.default}
                                    fill="url(#colorDebt)"
                                    activeDot={{ r: 6 }}
                                    strokeWidth={2}
                                  />
                                  <Area
                                    type="monotone"
                                    dataKey="payment"
                                    name="返済額"
                                    stroke={THEME.colors.secondary.default}
                                    fill="url(#colorPayment)"
                                    strokeWidth={2}
                                  />
                                  <Area
                                    type="monotone"
                                    dataKey="principalPayment"
                                    name="元金返済"
                                    stroke={THEME.colors.success.default}
                                    fill="url(#colorPrincipal)"
                                    strokeWidth={2}
                                  />
                                  <Area
                                    type="monotone"
                                    dataKey="interestPayment"
                                    name="利息返済"
                                    stroke={THEME.colors.danger.default}
                                    fill="url(#colorInterestChart)"
                                    strokeWidth={2}
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      {/* Income vs Expenses */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.6 }}
                        className="mt-6"
                      >
                        <Card style={cardStyle}>
                          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                            <CardTitle className="text-blue-700">
                              月別収支詳細
                            </CardTitle>
                            <CardDescription className="text-gray-600">
                              毎月の収入、支出、ボーナス、返済可能額の推移
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-6">
                            <div className="h-80">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                  data={repaymentPlan.map((item) => ({
                                    ...item,
                                    dateLabel: formatMonthYear(item.date),
                                  }))}
                                  margin={{
                                    top: 5,
                                    right: 10,
                                    left: -20,
                                    bottom: 5,
                                  }}
                                >
                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#e2e8f0"
                                  />
                                  <XAxis
                                    dataKey="dateLabel"
                                    stroke="#64748b"
                                    fontSize={10}
                                  />
                                  <YAxis
                                    yAxisId="left"
                                    tickFormatter={(value) =>
                                      new Intl.NumberFormat("ja-JP", {
                                        notation: "compact",
                                        compactDisplay: "short",
                                      }).format(value as number)
                                    }
                                    stroke="#64748b"
                                    fontSize={10}
                                  />
                                  {/* Removed second YAxis for simplicity unless explicitly needed and scaled */}
                                  <Tooltip
                                    formatter={formatTooltip}
                                    contentStyle={{
                                      backgroundColor:
                                        "rgba(255, 255, 255, 0.95)",
                                      borderRadius: "8px",
                                      boxShadow:
                                        "0 4px 12px rgba(0, 0, 0, 0.1)",
                                      border: "1px solid #e2e8f0",
                                      color: "#1e293b",
                                      fontSize: "12px",
                                    }}
                                  />
                                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                                  <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="income"
                                    name="収入"
                                    stroke={THEME.colors.success.default}
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                    activeDot={{ r: 6 }}
                                  />
                                  <Line
                                    yAxisId="left" // Use same axis for easier comparison
                                    type="monotone"
                                    dataKey="expenses"
                                    name="支出"
                                    stroke={THEME.colors.danger.default}
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                  />
                                  <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="bonus"
                                    name="ボーナス(返済用)"
                                    stroke={THEME.colors.warning.default}
                                    strokeWidth={2}
                                    strokeDasharray="3 3"
                                    dot={{ r: 3 }}
                                  />
                                  <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="availableForDebt"
                                    name="返済可能額"
                                    stroke={THEME.colors.secondary.default}
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      {/* Radial Bar Chart for Debt Reduction */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.8 }}
                        className="mt-6"
                      >
                        <Card style={cardStyle}>
                          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-purple-700">
                                返済速度メーター
                              </CardTitle>
                              <motion.div
                                animate={{
                                  scale: [1, 1.1, 1],
                                  rotate: [0, 5, -5, 0],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  repeatType: "loop",
                                }}
                              >
                                <PartyPopper className="h-6 w-6 text-purple-600" />
                              </motion.div>
                            </div>
                            <CardDescription className="text-gray-600">
                              返済進捗と効率の視覚化
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-6">
                            <div className="flex flex-col md:flex-row gap-4 items-center">
                              <div className="flex-1 h-80 w-full md:w-1/2">
                                <ResponsiveContainer width="100%" height="100%">
                                  <RadialBarChart
                                    cx="50%"
                                    cy="50%"
                                    innerRadius="25%"
                                    outerRadius="90%"
                                    barSize={15}
                                    data={[
                                      {
                                        name: "元金進捗",
                                        value: getPaymentProgressPercentage(),
                                        fill: THEME.colors.primary.default,
                                      },
                                      {
                                        name: "利息負担割合", // Total interest / (Total principal + Total interest)
                                        value:
                                          debtAmount + getTotalInterestPaid() >
                                          0
                                            ? Math.min(
                                                100,
                                                (getTotalInterestPaid() /
                                                  (debtAmount +
                                                    getTotalInterestPaid())) *
                                                  100
                                              )
                                            : 0,
                                        fill: THEME.colors.danger.default,
                                      },
                                      {
                                        name: "返済余力", // (Monthly Income - Monthly Expense) / Ideal Monthly Payment
                                        value:
                                          calculateMonthlyPayment() > 0
                                            ? Math.min(
                                                100,
                                                Math.max(
                                                  0,
                                                  ((getTotalIncome() -
                                                    getTotalExpenses()) /
                                                    calculateMonthlyPayment()) *
                                                    100
                                                )
                                              )
                                            : 0,
                                        fill: THEME.colors.success.default,
                                      },
                                    ]}
                                    startAngle={180}
                                    endAngle={0}
                                  >
                                    <RadialBar
                                      background
                                      dataKey="value"
                                      // label={{ position: 'insideStart', fill: THEME.colors.neutral[600], fontSize: '10px' }}
                                    />
                                    <Legend
                                      iconSize={10}
                                      layout="vertical"
                                      verticalAlign="middle"
                                      align="right"
                                      wrapperStyle={{ fontSize: "12px" }}
                                    />
                                    <Tooltip
                                      formatter={(value) =>
                                        `${Math.round(Number(value))}%`
                                      }
                                      contentStyle={{
                                        backgroundColor:
                                          "rgba(255, 255, 255, 0.95)",
                                        borderRadius: "8px",
                                        boxShadow:
                                          "0 4px 12px rgba(0, 0, 0, 0.1)",
                                        fontSize: "12px",
                                      }}
                                    />
                                  </RadialBarChart>
                                </ResponsiveContainer>
                              </div>
                              <div className="flex-1 w-full md:w-1/2 p-4">
                                <h3 className="text-xl font-bold text-purple-800 mb-4">
                                  返済効率分析
                                </h3>
                                <ul className="space-y-4">
                                  <li className="flex items-start gap-3">
                                    <div
                                      className="mt-1 h-3 w-3 rounded-full"
                                      style={{
                                        backgroundColor:
                                          THEME.colors.primary.default,
                                      }}
                                    ></div>
                                    <div>
                                      <div className="text-sm text-gray-700">
                                        元金返済進捗
                                      </div>
                                      <div
                                        className="text-lg font-bold"
                                        style={{
                                          color: THEME.colors.primary.dark,
                                        }}
                                      >
                                        {Math.round(
                                          getPaymentProgressPercentage()
                                        )}
                                        %
                                      </div>
                                      <p className="text-xs text-gray-500">
                                        目標の元金に対してどれだけ返済が進んでいるかを示します。
                                      </p>
                                    </div>
                                  </li>
                                  <li className="flex items-start gap-3">
                                    <div
                                      className="mt-1 h-3 w-3 rounded-full"
                                      style={{
                                        backgroundColor:
                                          THEME.colors.danger.default,
                                      }}
                                    ></div>
                                    <div>
                                      <div className="text-sm text-gray-700">
                                        総支払利息の割合
                                      </div>
                                      <div
                                        className="text-lg font-bold"
                                        style={{
                                          color: THEME.colors.danger.dark,
                                        }}
                                      >
                                        {debtAmount + getTotalInterestPaid() > 0
                                          ? `${Math.round(
                                              (getTotalInterestPaid() /
                                                (debtAmount +
                                                  getTotalInterestPaid())) *
                                                100
                                            )}%`
                                          : "0%"}
                                      </div>
                                      <p className="text-xs text-gray-500">
                                        総支払額のうち、利息が占める割合。低いほど効率的。
                                      </p>
                                    </div>
                                  </li>
                                  <li className="flex items-start gap-3">
                                    <div
                                      className="mt-1 h-3 w-3 rounded-full"
                                      style={{
                                        backgroundColor:
                                          THEME.colors.success.default,
                                      }}
                                    ></div>
                                    <div>
                                      <div className="text-sm text-gray-700">
                                        月次返済余力指数
                                      </div>
                                      <div
                                        className="text-lg font-bold"
                                        style={{
                                          color: THEME.colors.success.dark,
                                        }}
                                      >
                                        {calculateMonthlyPayment() > 0
                                          ? `${Math.round(
                                              Math.max(
                                                0,
                                                ((getTotalIncome() -
                                                  getTotalExpenses()) /
                                                  calculateMonthlyPayment()) *
                                                  100
                                              )
                                            )}%`
                                          : "N/A"}
                                      </div>
                                      <p className="text-xs text-gray-500">
                                        毎月の余剰資金が、目標達成に必要な返済額に対してどの程度かを示します。100%以上が望ましい。
                                      </p>
                                    </div>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div
                        className="mt-6 flex justify-center gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 1 }}
                      >
                        <Button
                          onClick={() => setActiveTab("input")}
                          className="text-lg px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white"
                          style={{
                            boxShadow: "0 4px 14px rgba(124, 58, 237, 0.4)",
                          }}
                        >
                          <Settings size={20} className="mr-2" />
                          <span>設定を変更する</span>
                        </Button>
                      </motion.div>
                    </animated.div>
                  )}
              </AnimatePresence>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
};

export default DebtRepaymentApp;
