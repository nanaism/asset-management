"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { animated, useSpring } from "@react-spring/web";
import {
  addMonths,
  differenceInMonths,
  format,
  isSameMonth,
  isValid,
  parseISO,
  startOfMonth,
} from "date-fns";
import { ja } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CalendarDays,
  Coins,
  DollarSign,
  Gift,
  HelpCircle,
  Info,
  Lightbulb,
  Medal,
  Percent,
  Plus,
  Settings,
  Trash2,
  TrendingDown,
  Zap,
} from "lucide-react";
import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
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
import rocketAnimation from "./rocket-animation.json";
import savingsAnimation from "./savings-animation.json";
import successAnimation from "./success-animation.json";

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

const COLORS = ["#3b82f6", "#8b5cf6", "#f43f5e", "#10b981", "#f59e0b"];

const DebtRepaymentApp: React.FC = () => {
  const cardStyle = {
    borderRadius: "12px",
    overflow: "hidden" as const,
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
  };

  const inputStyle = {
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    backgroundColor: "#f8fafc",
    padding: "10px 15px",
    transition: "all 0.2s ease-in-out",
  };

  // State
  const [debtAmount, setDebtAmount] = useState<number>(1000000);
  const [interestRate, setInterestRate] = useState<number>(3.5); // 年利3.5%
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [targetEndDate, setTargetEndDate] = useState<Date>(
    addMonths(new Date(), 24)
  );
  const [autoPayment, setAutoPayment] = useState<boolean>(true); // 自動的に可能な額を全て返済に回すか
  const [minPayment, setMinPayment] = useState<number>(10000); // 最低返済額

  const [monthlyIncome, setMonthlyIncome] = useState<number>(300000);
  const [incomes, setIncomes] = useState<Income[]>([
    {
      id: "1",
      description: "給料",
      amount: 300000,
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

  const [repaymentPlan, setRepaymentPlan] = useState<RepaymentPlanItem[]>([]);
  const [isCalculated, setIsCalculated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("input");
  const [activeInputSection, setActiveInputSection] = useState<string>("debt");
  const [isClient, setIsClient] = useState(false);

  // Animation hooks
  const fadeIn = useSpring({
    opacity: isCalculated ? 1 : 0,
    transform: isCalculated ? "translateY(0)" : "translateY(20px)",
    config: { tension: 120, friction: 14 },
  });

  const pulseAnimation = useSpring({
    from: { scale: 1 },
    to: async (next) => {
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

  useEffect(() => {
    if (isCalculated) {
      calculateRepaymentPlan();
    }
  }, [isCalculated]);

  // Calculate total months between start and target end date
  const totalMonths = differenceInMonths(targetEndDate, startDate) || 24;

  // Calculate monthly payment to reach target with interest
  const calculateMonthlyPayment = (): number => {
    const monthlyInterestRate = interestRate / 100 / 12;

    if (monthlyInterestRate === 0) {
      return debtAmount / totalMonths;
    }

    // Monthly payment formula for a loan with interest: P = (PV * r * (1 + r)^n) / ((1 + r)^n - 1)
    // Where: PV = Present Value (loan amount), r = monthly interest rate, n = number of payments
    const payment =
      (debtAmount *
        monthlyInterestRate *
        Math.pow(1 + monthlyInterestRate, totalMonths)) /
      (Math.pow(1 + monthlyInterestRate, totalMonths) - 1);

    return Math.ceil(payment);
  };

  // Helper function to check if an event occurs in a given month
  const eventOccursInMonth = (
    date: Date,
    currentDate: Date,
    frequency: "monthly" | "yearly" | "once"
  ): boolean => {
    const eventDate = new Date(date);

    switch (frequency) {
      case "monthly":
        return isSameMonth(
          addMonths(eventDate, differenceInMonths(currentDate, eventDate)),
          currentDate
        );
      case "yearly":
        const monthDiff = differenceInMonths(currentDate, eventDate) % 12;
        return monthDiff === 0;
      case "once":
        return isSameMonth(eventDate, currentDate);
      default:
        return false;
    }
  };

  // Calculate repayment plan with interest
  const calculateRepaymentPlan = useCallback(() => {
    let remainingDebt = debtAmount;
    const monthlyInterestRate = interestRate / 100 / 12;
    const plan: RepaymentPlanItem[] = [];
    const idealMonthlyPayment = calculateMonthlyPayment();

    let currentDate = startOfMonth(startDate);
    let month = 1;

    // Continue until debt is fully paid or target date is reached
    while (remainingDebt > 0 && month <= totalMonths + 12) {
      // Allow extra time if needed
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
        // Check if the bonus occurs in the current month/year
        const bonusDate = new Date(bonus.date);
        if (
          bonusDate.getMonth() === currentDate.getMonth() &&
          (bonusDate.getFullYear() === currentDate.getFullYear() ||
            bonusDate.getFullYear() < currentDate.getFullYear())
        ) {
          return total + (bonus.amount * bonus.allocation) / 100;
        }
        return total;
      }, 0);

      // Calculate interest for the month
      const monthlyInterest = remainingDebt * monthlyInterestRate;

      // Calculate available amount for debt repayment
      let availableForDebt = currentIncome - currentExpenses + currentBonus;

      // Determine payment amount
      let payment = 0;
      let principalPayment = 0;
      let interestPayment = 0;

      if (availableForDebt <= 0) {
        // No money available for repayment this month
        payment = 0;
        principalPayment = 0;
        interestPayment = 0;
        remainingDebt += monthlyInterest; // Add unpaid interest to the debt
      } else if (autoPayment) {
        // Pay as much as possible, but at least the minimum payment
        payment = Math.max(
          Math.min(availableForDebt, remainingDebt + monthlyInterest),
          minPayment
        );
        interestPayment = Math.min(monthlyInterest, payment);
        principalPayment = payment - interestPayment;
        remainingDebt = Math.max(0, remainingDebt - principalPayment);
      } else {
        // Fixed monthly payment approach
        payment = Math.min(
          idealMonthlyPayment,
          remainingDebt + monthlyInterest
        );
        interestPayment = Math.min(monthlyInterest, payment);
        principalPayment = payment - interestPayment;
        remainingDebt = Math.max(0, remainingDebt - principalPayment);
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
  }, [
    debtAmount,
    interestRate,
    startDate,
    totalMonths,
    expenses,
    incomes,
    bonuses,
    autoPayment,
    minPayment,
  ]);

  // UI Handlers
  const handleCalculate = () => {
    setIsCalculated(true);
    calculateRepaymentPlan();
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

  // Helper functions
  const getTotalExpenses = (): number => {
    return expenses.reduce((total, expense) => {
      if (expense.isRecurring && expense.frequency === "monthly") {
        return total + expense.amount;
      }
      return total;
    }, 0);
  };

  const getTotalIncome = (): number => {
    return incomes.reduce((total, income) => {
      if (income.isRecurring && income.frequency === "monthly") {
        return total + income.amount;
      }
      return total;
    }, 0);
  };

  const getTotalInterestPaid = (): number => {
    return repaymentPlan.reduce(
      (total, item) => total + item.interestPayment,
      0
    );
  };

  const getTotalMonthlyBonus = (): number => {
    return bonuses.reduce((total, bonus) => {
      // Calculate monthly equivalent of bonus allocation
      return total + (bonus.amount * bonus.allocation) / 100 / 12;
    }, 0);
  };

  const getPayoffDate = (): Date | null => {
    if (repaymentPlan.length === 0) return null;
    return repaymentPlan[repaymentPlan.length - 1].date;
  };

  const formatCurrency = (value: number): string => {
    if (typeof value !== "number") {
      return "¥NaN";
    }
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(value);
  };

  const formatDate = (date: Date): string => {
    return format(date, "yyyy年MM月dd日", { locale: ja });
  };

  const formatMonthYear = (date: Date): string => {
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

    return [
      { name: "元金", value: totalPrincipal },
      { name: "利息", value: totalInterest },
    ];
  };

  // Prepare monthly breakdown data for stacked bar chart
  const getMonthlyBreakdownData = () => {
    return repaymentPlan.map((item) => ({
      month: format(item.date, "yyyy/MM"),
      元金返済: item.principalPayment,
      利息支払: item.interestPayment,
      その他支出: item.expenses,
    }));
  };

  return (
    <motion.div
      className="min-h-screen p-4 md:p-8 bg-gray-50"
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
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2">
            <span className="inline-block relative">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 text-transparent bg-clip-text animate-gradient-x">
                借金返済
              </span>
              <span className="bg-gradient-to-r from-emerald-500 via-blue-600 to-indigo-600 text-transparent bg-clip-text animate-pulse">
                くん
              </span>
              <span className="absolute -bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
            </span>
            <motion.span
              className="ml-2"
              animate={{ rotate: [0, -5, 0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <span className="text-yellow-500">✨</span>
            </motion.span>
          </h1>
          <p className="text-gray-500">
            日付と利息も考慮した詳細な借金返済計画ツール
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            style={{ marginBottom: "20px" }}
          >
            <TabsList className="w-full flex justify-between mb-6 bg-white shadow-sm rounded-lg">
              <TabsTrigger
                value="input"
                className="flex-1 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-lg transition-all"
              >
                <motion.div
                  className="flex items-center gap-2 py-2"
                  whileHover={{ y: -1 }}
                >
                  <Settings size={18} />
                  <span>入力</span>
                </motion.div>
              </TabsTrigger>
              <TabsTrigger
                value="chart"
                className="flex-1 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-lg transition-all"
                disabled={!isCalculated}
              >
                <motion.div
                  className="flex items-center gap-2 py-2"
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
              <TabsList className="w-full flex justify-between mb-6 bg-white shadow-sm rounded-lg">
                <TabsTrigger
                  value="debt"
                  className="flex-1 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-lg transition-all"
                >
                  <motion.div
                    className="flex items-center gap-2 py-2"
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
                    className="flex items-center gap-2 py-2"
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
                    className="flex items-center gap-2 py-2"
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
                    className="flex items-center gap-2 py-2"
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
                  <Card style={cardStyle} className="overflow-hidden border-0">
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
                          <DynamicLottie
                            animationData={calculatorAnimation}
                            style={{ width: 50, height: 50 }}
                          />
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
                                setDebtAmount(Number(e.target.value))
                              }
                              className="flex-1"
                              style={inputStyle}
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
                                setInterestRate(Number(e.target.value))
                              }
                              className="flex-1"
                              style={inputStyle}
                            />
                          </div>
                          <Slider
                            value={[interestRate]}
                            min={0}
                            max={20}
                            step={0.1}
                            onValueChange={(value) => setInterestRate(value[0])}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card style={cardStyle} className="overflow-hidden border-0">
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
                          <DynamicLottie
                            animationData={calendarAnimation}
                            style={{ width: 50, height: 50 }}
                          />
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
                          <div className="flex gap-4 items-center">
                            <Calendar className="text-indigo-600 h-5 w-5" />
                            <DatePicker
                              id="startDate"
                              date={startDate}
                              setDate={setStartDate}
                              className="flex-1"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="endDate"
                            className="text-gray-700 font-medium"
                          >
                            目標完済日
                          </Label>
                          <div className="flex gap-4 items-center">
                            <Calendar className="text-indigo-600 h-5 w-5" />
                            <DatePicker
                              id="endDate"
                              date={targetEndDate}
                              setDate={setTargetEndDate}
                              className="flex-1"
                            />
                          </div>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
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
                              {totalMonths}ヶ月間
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
                                      <p className="w-80">
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

                            {!autoPayment && (
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <Label
                                    htmlFor="minPayment"
                                    className="text-gray-700 font-medium"
                                  >
                                    最低返済額
                                  </Label>
                                  <span className="text-sm font-medium text-blue-600">
                                    {formatCurrency(minPayment)}
                                  </span>
                                </div>
                                <div className="flex gap-4 items-center">
                                  <span className="text-blue-600 font-bold text-lg">
                                    ¥
                                  </span>
                                  <Input
                                    id="minPayment"
                                    type="number"
                                    value={minPayment}
                                    onChange={(e) =>
                                      setMinPayment(Number(e.target.value))
                                    }
                                    className="flex-1"
                                    style={inputStyle}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
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
                  <Card style={cardStyle} className="overflow-hidden border-0">
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
                          <DynamicLottie
                            animationData={moneyAnimation}
                            style={{ width: 50, height: 50 }}
                          />
                        </motion.div>
                      </div>
                      <CardDescription className="text-gray-600">
                        毎月の収入を追加してください
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-3 mb-6">
                        {incomes.length === 0 ? (
                          <p className="text-gray-400 text-center py-4 bg-gray-50 rounded-lg">
                            収入が登録されていません
                          </p>
                        ) : (
                          incomes.map((income) => (
                            <motion.div
                              key={income.id}
                              className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ duration: 0.3 }}
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
                          ))
                        )}
                      </div>

                      {incomes.length > 0 && (
                        <div className="mb-6 p-4 rounded-lg bg-gray-50 border border-gray-100">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-medium">
                              毎月の総収入：
                            </span>
                            <span className="text-emerald-600 font-bold">
                              {formatCurrency(getTotalIncome())}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4 bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                        <h3 className="text-emerald-800 font-semibold">
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
                                    amount: Number(e.target.value),
                                  })
                                }
                                placeholder="300000"
                                className="bg-white"
                                style={inputStyle}
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
                                <input
                                  type="checkbox"
                                  id="incomeRecurring"
                                  checked={newIncome.isRecurring}
                                  onChange={(e) =>
                                    setNewIncome({
                                      ...newIncome,
                                      isRecurring: e.target.checked,
                                    })
                                  }
                                  className="rounded"
                                />
                                <Label htmlFor="incomeRecurring">
                                  繰り返し
                                </Label>
                              </div>

                              {newIncome.isRecurring && (
                                <Select
                                  value={newIncome.frequency}
                                  onValueChange={(value: any) =>
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
                                    <SelectItem value="once">
                                      一度限り
                                    </SelectItem>
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
                              日付
                            </Label>
                            <DatePicker
                              id="incomeDate"
                              date={newIncome.date}
                              setDate={(date) =>
                                setNewIncome({
                                  ...newIncome,
                                  date,
                                })
                              }
                            />
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
                  <Card style={cardStyle} className="overflow-hidden border-0">
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
                      <div className="space-y-3 mb-6">
                        {expenses.length === 0 ? (
                          <p className="text-gray-400 text-center py-4 bg-gray-50 rounded-lg">
                            支出が登録されていません
                          </p>
                        ) : (
                          expenses.map((expense) => (
                            <motion.div
                              key={expense.id}
                              className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ duration: 0.3 }}
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
                          ))
                        )}
                      </div>

                      {expenses.length > 0 && (
                        <div className="mb-6 p-4 rounded-lg bg-gray-50 border border-gray-100">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-medium">
                              毎月の総支出：
                            </span>
                            <span className="text-rose-600 font-bold">
                              {formatCurrency(getTotalExpenses())}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4 bg-rose-50 p-4 rounded-lg border border-rose-100">
                        <h3 className="text-rose-800 font-semibold">
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
                                    amount: Number(e.target.value),
                                  })
                                }
                                placeholder="50000"
                                className="bg-white"
                                style={inputStyle}
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
                                <input
                                  type="checkbox"
                                  id="expenseRecurring"
                                  checked={newExpense.isRecurring}
                                  onChange={(e) =>
                                    setNewExpense({
                                      ...newExpense,
                                      isRecurring: e.target.checked,
                                    })
                                  }
                                  className="rounded"
                                />
                                <Label htmlFor="expenseRecurring">
                                  繰り返し
                                </Label>
                              </div>

                              {newExpense.isRecurring && (
                                <Select
                                  value={newExpense.frequency}
                                  onValueChange={(value: any) =>
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
                                    <SelectItem value="once">
                                      一度限り
                                    </SelectItem>
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
                              日付
                            </Label>
                            <DatePicker
                              id="expenseDate"
                              date={newExpense.date}
                              setDate={(date) =>
                                setNewExpense({
                                  ...newExpense,
                                  date,
                                })
                              }
                            />
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
                  <Card style={cardStyle} className="overflow-hidden border-0">
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
                          <DynamicLottie
                            animationData={savingsAnimation}
                            style={{ width: 50, height: 50 }}
                          />
                        </motion.div>
                      </div>
                      <CardDescription className="text-gray-600">
                        臨時ボーナスの情報と返済への充当率を設定
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-3 mb-6">
                        {bonuses.length === 0 ? (
                          <p className="text-gray-400 text-center py-4 bg-gray-50 rounded-lg">
                            ボーナスが登録されていません
                          </p>
                        ) : (
                          bonuses.map((bonus) => (
                            <motion.div
                              key={bonus.id}
                              className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ duration: 0.3 }}
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
                          ))
                        )}
                      </div>

                      <div className="space-y-4 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                        <h3 className="text-yellow-800 font-semibold">
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
                                    amount: Number(e.target.value),
                                  })
                                }
                                placeholder="500000"
                                className="bg-white"
                                style={inputStyle}
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
                            <DatePicker
                              id="bonusDate"
                              date={newBonus.date}
                              setDate={(date) =>
                                setNewBonus({
                                  ...newBonus,
                                  date,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label
                              htmlFor="bonusAllocation"
                              className="text-gray-700 font-medium mb-2 block"
                            >
                              返済への充当率 (%)
                            </Label>
                            <div className="flex flex-col gap-2">
                              <Input
                                id="bonusAllocation"
                                type="number"
                                value={newBonus.allocation}
                                onChange={(e) =>
                                  setNewBonus({
                                    ...newBonus,
                                    allocation: Math.min(
                                      100,
                                      Math.max(0, Number(e.target.value))
                                    ),
                                  })
                                }
                                min={0}
                                max={100}
                                className="bg-white"
                                style={inputStyle}
                              />
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

            <motion.div
              className="mt-6 flex justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
            >
              <div style={{ display: "inline-block" }}>
                <animated.div
                  style={{
                    transform: pulseAnimation.scale.to((s) => `scale(${s})`),
                  }}
                />
                <Button
                  onClick={handleCalculate}
                  className="text-lg px-8 py-6 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                  style={{
                    boxShadow: "0 4px 14px rgba(59, 130, 246, 0.4)",
                  }}
                >
                  <span className="mr-2">計算する</span>
                  <ArrowRight />
                </Button>
              </div>
            </motion.div>
          </TabsContent>

          {/* Chart Tab Content */}
          <TabsContent value="chart">
            {isClient && (
              <AnimatePresence>
                {isCalculated && (
                  <div>
                    <animated.div
                      style={{
                        opacity: fadeIn.opacity,
                        transform: fadeIn.transform,
                      }}
                    />

                    {/* Summary Cards */}
                    <motion.div
                      className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      {/* 返済概要 Card */}
                      <Card style={cardStyle} className="border-0">
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
                              <DynamicLottie
                                animationData={moneyAnimation}
                                style={{ width: 120, height: 120 }}
                              />
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
                                  総支払利息:
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
                                  毎月の支出:
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
                                  毎月の収入:
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
                                  ボーナス平均:
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
                      <Card style={cardStyle} className="border-0">
                        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
                          <CardTitle className="text-emerald-700 flex items-center">
                            <Calendar className="mr-2 h-5 w-5" />
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
                              <DynamicLottie
                                animationData={successAnimation}
                                style={{ width: 80, height: 80 }}
                              />
                            </motion.div>

                            {repaymentPlan.length > 0 &&
                            repaymentPlan[repaymentPlan.length - 1]
                              .debtAmount <= 0 ? (
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
                                  {repaymentPlan.length % 12}ヶ月で完済できます
                                </div>
                                <div className="mt-4 text-emerald-700 font-medium">
                                  完済予定日:{" "}
                                  {getPayoffDate()
                                    ? formatDate(getPayoffDate()!)
                                    : "未定"}
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
                                  要調整
                                </div>
                                <div className="text-gray-600">
                                  設定期間内での返済が難しいようです。収入を増やすか、支出を減らすかしましょう。
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* 節約ポイント Card */}
                      <Card style={cardStyle} className="border-0">
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
                              <DynamicLottie
                                animationData={rocketAnimation}
                                style={{ width: 120, height: 120 }}
                              />
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
                                  {interestRate > 0 ? (
                                    <>
                                      年利
                                      <span className="font-bold text-purple-600">
                                        {interestRate}%
                                      </span>
                                      を低金利に借り換えると{" "}
                                      <span className="font-bold text-purple-600">
                                        {formatCurrency(
                                          Math.round(
                                            getTotalInterestPaid() * 0.25
                                          )
                                        )}
                                      </span>
                                      の利息が節約できます
                                    </>
                                  ) : (
                                    <>
                                      毎月の支出を
                                      <span className="font-bold text-purple-600">
                                        {formatCurrency(10000)}
                                      </span>
                                      削減すると、返済期間が短縮できます
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
                                  <Zap size={14} className="text-purple-700" />
                                </div>
                                <div className="text-gray-600">
                                  ボーナスの返済充当率を
                                  <span className="font-bold text-purple-600">
                                    {bonuses.length > 0
                                      ? Math.min(
                                          100,
                                          bonuses[0].allocation + 20
                                        )
                                      : 70}
                                    %
                                  </span>
                                  に上げると、さらに早く返済できます
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
                                  副収入を増やすことで
                                  <span className="font-bold text-purple-600">
                                    返済スピード
                                  </span>
                                  が加速します
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
                      <Card style={cardStyle} className="border-0">
                        <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b">
                          <CardTitle className="text-indigo-700">
                            元金vs利息の内訳
                          </CardTitle>
                          <CardDescription className="text-gray-600">
                            総返済額における元金と利息の割合
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
                                  label={({ name, percent }) =>
                                    `${name}: ${(percent * 100).toFixed(0)}%`
                                  }
                                >
                                  {getPrincipalVsInterestData().map(
                                    (entry, index) => (
                                      <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                      />
                                    )
                                  )}
                                </Pie>
                                <Tooltip
                                  formatter={(value) =>
                                    formatCurrency(Number(value))
                                  }
                                />
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="text-sm text-gray-600">
                              <p className="mb-2">
                                <span className="font-bold text-indigo-700">
                                  総返済額:{" "}
                                </span>
                                {formatCurrency(
                                  debtAmount + getTotalInterestPaid()
                                )}
                              </p>
                              <p>
                                <span className="font-bold text-rose-600">
                                  利息の割合:{" "}
                                </span>
                                {Math.round(
                                  (getTotalInterestPaid() /
                                    (debtAmount + getTotalInterestPaid())) *
                                    100
                                )}
                                %
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Monthly breakdown chart */}
                      <Card style={cardStyle} className="border-0">
                        <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b">
                          <CardTitle className="text-teal-700">
                            月別支出内訳
                          </CardTitle>
                          <CardDescription className="text-gray-600">
                            月ごとの元金返済、利息、その他支出の内訳
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                          <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={getMonthlyBreakdownData().slice(0, 12)} // 最初の12ヶ月だけ表示
                                margin={{
                                  top: 20,
                                  right: 30,
                                  left: 20,
                                  bottom: 5,
                                }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis
                                  tickFormatter={(value) =>
                                    new Intl.NumberFormat("ja-JP", {
                                      notation: "compact",
                                      compactDisplay: "short",
                                    }).format(value)
                                  }
                                />
                                <Tooltip
                                  formatter={(value) =>
                                    formatCurrency(Number(value))
                                  }
                                />
                                <Legend />
                                <Bar
                                  dataKey="元金返済"
                                  stackId="a"
                                  fill="#3b82f6"
                                />
                                <Bar
                                  dataKey="利息支払"
                                  stackId="a"
                                  fill="#8b5cf6"
                                />
                                <Bar
                                  dataKey="その他支出"
                                  stackId="a"
                                  fill="#f43f5e"
                                />
                              </BarChart>
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
                      <Card style={cardStyle} className="border-0">
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
                                  date: formatMonthYear(item.date),
                                }))}
                                margin={{
                                  top: 20,
                                  right: 30,
                                  left: 20,
                                  bottom: 5,
                                }}
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke="#e2e8f0"
                                />
                                <XAxis dataKey="date" stroke="#64748b" />
                                <YAxis
                                  tickFormatter={(value) =>
                                    new Intl.NumberFormat("ja-JP", {
                                      notation: "compact",
                                      compactDisplay: "short",
                                    }).format(value as number)
                                  }
                                  stroke="#64748b"
                                />
                                <Tooltip
                                  formatter={formatTooltip}
                                  contentStyle={{
                                    backgroundColor:
                                      "rgba(255, 255, 255, 0.95)",
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                    border: "1px solid #e2e8f0",
                                    color: "#1e293b",
                                  }}
                                />
                                <Legend />
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
                                      stopColor="#3b82f6"
                                      stopOpacity={0.8}
                                    />
                                    <stop
                                      offset="95%"
                                      stopColor="#3b82f6"
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
                                      stopColor="#8b5cf6"
                                      stopOpacity={0.8}
                                    />
                                    <stop
                                      offset="95%"
                                      stopColor="#8b5cf6"
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
                                      stopColor="#10b981"
                                      stopOpacity={0.8}
                                    />
                                    <stop
                                      offset="95%"
                                      stopColor="#10b981"
                                      stopOpacity={0.1}
                                    />
                                  </linearGradient>
                                  <linearGradient
                                    id="colorInterest"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                  >
                                    <stop
                                      offset="5%"
                                      stopColor="#f43f5e"
                                      stopOpacity={0.8}
                                    />
                                    <stop
                                      offset="95%"
                                      stopColor="#f43f5e"
                                      stopOpacity={0.1}
                                    />
                                  </linearGradient>
                                </defs>
                                <Area
                                  type="monotone"
                                  dataKey="debtAmount"
                                  name="残債"
                                  stroke="#3b82f6"
                                  fill="url(#colorDebt)"
                                  activeDot={{ r: 8 }}
                                />
                                <Area
                                  type="monotone"
                                  dataKey="payment"
                                  name="返済額"
                                  stroke="#8b5cf6"
                                  fill="url(#colorPayment)"
                                />
                                <Area
                                  type="monotone"
                                  dataKey="principalPayment"
                                  name="元金返済"
                                  stroke="#10b981"
                                  fill="url(#colorPrincipal)"
                                />
                                <Area
                                  type="monotone"
                                  dataKey="interestPayment"
                                  name="利息返済"
                                  stroke="#f43f5e"
                                  fill="url(#colorInterest)"
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
                      <Card style={cardStyle} className="border-0">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                          <CardTitle className="text-blue-700">
                            月別収支詳細
                          </CardTitle>
                          <CardDescription className="text-gray-600">
                            毎月の収入、支出、ボーナスの詳細
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart
                                data={repaymentPlan.map((item) => ({
                                  ...item,
                                  date: formatMonthYear(item.date),
                                }))}
                                margin={{
                                  top: 20,
                                  right: 30,
                                  left: 20,
                                  bottom: 5,
                                }}
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke="#e2e8f0"
                                />
                                <XAxis dataKey="date" stroke="#64748b" />
                                <YAxis
                                  yAxisId="left"
                                  tickFormatter={(value) =>
                                    new Intl.NumberFormat("ja-JP", {
                                      notation: "compact",
                                      compactDisplay: "short",
                                    }).format(value as number)
                                  }
                                  stroke="#64748b"
                                />
                                <YAxis
                                  yAxisId="right"
                                  orientation="right"
                                  tickFormatter={(value) =>
                                    new Intl.NumberFormat("ja-JP", {
                                      notation: "compact",
                                      compactDisplay: "short",
                                    }).format(value as number)
                                  }
                                  stroke="#64748b"
                                />
                                <Tooltip
                                  formatter={formatTooltip}
                                  contentStyle={{
                                    backgroundColor:
                                      "rgba(255, 255, 255, 0.95)",
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                    border: "1px solid #e2e8f0",
                                    color: "#1e293b",
                                  }}
                                />
                                <Legend />
                                <Line
                                  yAxisId="left"
                                  type="monotone"
                                  dataKey="income"
                                  name="収入"
                                  stroke="#10b981"
                                  strokeWidth={3}
                                  dot={{
                                    stroke: "#10b981",
                                    strokeWidth: 2,
                                    r: 4,
                                  }}
                                  activeDot={{ r: 8 }}
                                />
                                <Line
                                  yAxisId="right"
                                  type="monotone"
                                  dataKey="expenses"
                                  name="支出"
                                  stroke="#f43f5e"
                                  strokeWidth={3}
                                  dot={{
                                    stroke: "#f43f5e",
                                    strokeWidth: 2,
                                    r: 4,
                                  }}
                                />
                                <Line
                                  yAxisId="right"
                                  type="monotone"
                                  dataKey="bonus"
                                  name="ボーナス"
                                  stroke="#f59e0b"
                                  strokeWidth={3}
                                  strokeDasharray="5 5"
                                  dot={{
                                    stroke: "#f59e0b",
                                    strokeWidth: 2,
                                    r: 4,
                                  }}
                                />
                                <Line
                                  yAxisId="left"
                                  type="monotone"
                                  dataKey="availableForDebt"
                                  name="返済可能額"
                                  stroke="#8b5cf6"
                                  strokeWidth={3}
                                  dot={{
                                    stroke: "#8b5cf6",
                                    strokeWidth: 2,
                                    r: 4,
                                  }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      className="mt-6 flex justify-center"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.8 }}
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
                  </div>
                )}
              </AnimatePresence>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
};

// DatePickerコンポーネント
interface DatePickerProps {
  id?: string;
  date: Date;
  setDate: (date: Date) => void;
  className?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  id,
  date,
  setDate,
  className,
}) => {
  const [dateString, setDateString] = useState<string>("");

  useEffect(() => {
    if (date && isValid(date)) {
      setDateString(format(date, "yyyy-MM-dd"));
    }
  }, [date]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDateString = e.target.value;
    setDateString(newDateString);

    const parsedDate = parseISO(newDateString);
    if (isValid(parsedDate)) {
      setDate(parsedDate);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Input
        id={id}
        type="date"
        value={dateString}
        onChange={handleDateChange}
        className="w-full bg-white"
        style={{
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
          backgroundColor: "#f8fafc",
          padding: "10px 15px",
          transition: "all 0.2s ease-in-out",
        }}
      />
    </div>
  );
};

export default DebtRepaymentApp;
