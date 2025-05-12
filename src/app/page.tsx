"use client";
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
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { animated, useSpring } from "@react-spring/web";
import { AnimatePresence, motion } from "framer-motion";
import Lottie from "lottie-react";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Coins,
  PiggyBank,
  Plus,
  Settings,
  Trash2,
  TrendingDown,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import moneyAnimation from "./money-animation.json";
import savingsAnimation from "./savings-animation.json";

// 型定義
interface Expense {
  id: string;
  description: string;
  amount: number;
  endMonth: number;
}

interface NewExpense {
  description: string;
  amount: number;
  endMonth: number;
}

interface RepaymentPlanItem {
  month: number;
  debtAmount: number;
  payment: number;
  expenses: number;
  income: number;
  availableForDebt: number;
}

// メインコンポーネント
const DebtRepaymentApp: React.FC = () => {
  // スタイル定義
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

  // 状態管理
  const [debtAmount, setDebtAmount] = useState<number>(1000000);
  const [remainingMonths, setRemainingMonths] = useState<number>(24);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(300000);
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: "1", description: "家賃", amount: 80000, endMonth: 12 },
    { id: "2", description: "サブスク", amount: 5000, endMonth: 6 },
  ]);
  const [newExpense, setNewExpense] = useState<NewExpense>({
    description: "",
    amount: 0,
    endMonth: 1,
  });
  const [repaymentPlan, setRepaymentPlan] = useState<RepaymentPlanItem[]>([]);
  const [isCalculated, setIsCalculated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("input");

  // スプリングアニメーション
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

  // 返済計画の計算
  const calculateRepaymentPlan = useCallback((): void => {
    let remainingDebt = debtAmount;
    const plan: RepaymentPlanItem[] = [];

    for (let month = 1; month <= remainingMonths; month++) {
      // 各月の支出を計算（その月まで有効な支出を合計）
      const currentExpenses = expenses.reduce((total, expense) => {
        // 支出の終了月を確認
        return total + (month <= expense.endMonth ? expense.amount : 0);
      }, 0);

      const availableForDebt = monthlyIncome - currentExpenses;

      if (availableForDebt <= 0) {
        // 返済に回せるお金がない場合
        plan.push({
          month,
          debtAmount: remainingDebt,
          payment: 0,
          expenses: currentExpenses,
          income: monthlyIncome,
          availableForDebt,
        });
      } else if (remainingDebt <= availableForDebt) {
        // 最終返済月
        plan.push({
          month,
          debtAmount: 0,
          payment: remainingDebt,
          expenses: currentExpenses,
          income: monthlyIncome,
          availableForDebt,
        });
        remainingDebt = 0;
        break;
      } else {
        // 通常の返済月
        remainingDebt -= availableForDebt;
        plan.push({
          month,
          debtAmount: remainingDebt,
          payment: availableForDebt,
          expenses: currentExpenses,
          income: monthlyIncome,
          availableForDebt,
        });
      }
    }

    setRepaymentPlan(plan);
  }, [debtAmount, remainingMonths, monthlyIncome, expenses]);

  useEffect(() => {
    if (isCalculated) {
      calculateRepaymentPlan();
    }
  }, [isCalculated, calculateRepaymentPlan]);

  const handleCalculate = (): void => {
    setIsCalculated(true);
    calculateRepaymentPlan();
    setActiveTab("chart");
  };

  // 支出の追加処理
  const handleAddExpense = (): void => {
    if (newExpense.description.trim() && newExpense.amount > 0) {
      setExpenses([
        ...expenses,
        {
          id: Date.now().toString(),
          description: newExpense.description,
          amount: Number(newExpense.amount),
          endMonth: Number(newExpense.endMonth),
        },
      ]);
      setNewExpense({ description: "", amount: 0, endMonth: 1 });
    }
  };

  // 支出の削除処理
  const handleRemoveExpense = (id: string): void => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
  };

  // 支出の合計を計算
  const getTotalExpenses = (): number => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  // フォーマット関数
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(value);
  };

  const formatTooltip = (value: number, name: string): [string, string] => {
    const labels: Record<string, string> = {
      debtAmount: "残債",
      payment: "返済額",
      expenses: "支出",
      income: "収入",
      availableForDebt: "返済可能額",
    };
    return [formatCurrency(value), labels[name] || name];
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
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text mb-2">
            借金返済ビジュアライザー
          </h1>
          <p className="text-gray-500">
            あなたの借金返済計画をグラフィカルに可視化します
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

          <TabsContent value="input">
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card style={cardStyle} className="overflow-hidden border-0">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Coins className="h-6 w-6" />
                    借金情報
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    あなたの現在の借金状況を入力してください
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
                          htmlFor="remainingMonths"
                          className="text-gray-700 font-medium"
                        >
                          返済までの残りヶ月
                        </Label>
                        <span className="text-sm font-medium text-blue-600">
                          {remainingMonths}ヶ月
                        </span>
                      </div>
                      <div className="flex gap-4 items-center">
                        <Calendar className="text-blue-600 h-5 w-5" />
                        <Input
                          id="remainingMonths"
                          type="number"
                          value={remainingMonths}
                          onChange={(e) =>
                            setRemainingMonths(Number(e.target.value))
                          }
                          className="flex-1"
                          style={inputStyle}
                        />
                      </div>
                      <Slider
                        value={[remainingMonths]}
                        min={1}
                        max={60}
                        step={1}
                        onValueChange={(value) => setRemainingMonths(value[0])}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card style={cardStyle} className="overflow-hidden border-0">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
                  <CardTitle className="flex items-center gap-2 text-emerald-700">
                    <PiggyBank className="h-6 w-6" />
                    収入情報
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    毎月の収入を入力してください
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label
                          htmlFor="monthlyIncome"
                          className="text-gray-700 font-medium"
                        >
                          毎月の収入
                        </Label>
                        <span className="text-sm font-medium text-emerald-600">
                          {formatCurrency(monthlyIncome)}
                        </span>
                      </div>
                      <div className="flex gap-4 items-center">
                        <span className="text-emerald-600 font-bold text-lg">
                          ¥
                        </span>
                        <Input
                          id="monthlyIncome"
                          type="number"
                          value={monthlyIncome}
                          onChange={(e) =>
                            setMonthlyIncome(Number(e.target.value))
                          }
                          className="flex-1"
                          style={inputStyle}
                        />
                      </div>
                      <Slider
                        value={[monthlyIncome]}
                        min={0}
                        max={1000000}
                        step={10000}
                        onValueChange={(value) => setMonthlyIncome(value[0])}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card style={cardStyle} className="overflow-hidden border-0">
                <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 border-b">
                  <CardTitle className="flex items-center gap-2 text-pink-700">
                    <TrendingDown className="h-6 w-6" />
                    固定支出リスト
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    毎月の固定支出を追加してください（それぞれに終了月を設定可能）
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {/* 現在の支出リスト */}
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
                              <span>{formatCurrency(expense.amount)}</span>
                              <span>・</span>
                              <span>{expense.endMonth}ヶ月目まで</span>
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

                  {/* 総支出額 */}
                  {expenses.length > 0 && (
                    <div className="mb-6 p-4 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">
                          総支出額：
                        </span>
                        <span className="text-rose-600 font-bold">
                          {formatCurrency(getTotalExpenses())}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 新しい支出を追加 */}
                  <div className="space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h3 className="text-blue-800 font-semibold">
                      新しい支出を追加
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <div>
                        <Label
                          htmlFor="expenseEndMonth"
                          className="text-gray-700 font-medium mb-2 block"
                        >
                          終了月
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="expenseEndMonth"
                            type="number"
                            value={newExpense.endMonth}
                            onChange={(e) =>
                              setNewExpense({
                                ...newExpense,
                                endMonth: Math.min(
                                  Math.max(1, Number(e.target.value)),
                                  remainingMonths
                                ),
                              })
                            }
                            min={1}
                            max={remainingMonths}
                            className="bg-white"
                            style={inputStyle}
                          />
                          <span className="text-gray-700">ヶ月目</span>
                        </div>
                      </div>
                    </div>
                    <motion.div
                      className="flex justify-end mt-4"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={handleAddExpense}
                        className="bg-blue-600 hover:bg-blue-700 text-white border-none flex items-center gap-2"
                      >
                        <Plus size={18} />
                        支出を追加
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              className="mt-6 flex justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
            >
              <div style={{ display: "inline-block" }}>
                <div>
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
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="chart">
            <AnimatePresence>
              {isCalculated && (
                <div>
                  <div>
                    <animated.div
                      style={{
                        opacity: fadeIn.opacity,
                        transform: fadeIn.transform,
                      }}
                    />
                    <motion.div
                      className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    >
                      <Card
                        style={cardStyle}
                        className="lg:col-span-3 border-0"
                      >
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
                                data={repaymentPlan}
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
                                <XAxis
                                  dataKey="month"
                                  label={{
                                    value: "月",
                                    position: "insideBottomRight",
                                    offset: -5,
                                  }}
                                  stroke="#64748b"
                                />
                                <YAxis
                                  tickFormatter={(value) =>
                                    new Intl.NumberFormat("ja-JP", {
                                      notation: "compact",
                                      compactDisplay: "short",
                                    }).format(value)
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
                                <Area
                                  type="monotone"
                                  dataKey="debtAmount"
                                  stackId="1"
                                  name="残債"
                                  stroke="#3b82f6"
                                  fill="url(#colorDebt)"
                                  activeDot={{ r: 8 }}
                                />
                                <Area
                                  type="monotone"
                                  dataKey="payment"
                                  stackId="2"
                                  name="返済額"
                                  stroke="#8b5cf6"
                                  fill="url(#colorPayment)"
                                />
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
                                </defs>
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>

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
                              <Lottie
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
                                  毎月の収入:
                                </span>
                                <span className="font-bold text-emerald-600">
                                  {formatCurrency(monthlyIncome)}
                                </span>
                              </motion.li>
                              <motion.li
                                className="flex justify-between"
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
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
                                transition={{ delay: 0.4 }}
                              >
                                <span className="font-medium text-gray-600">
                                  毎月の返済可能額:
                                </span>
                                <span className="font-bold text-indigo-600">
                                  {formatCurrency(
                                    monthlyIncome - getTotalExpenses()
                                  )}
                                </span>
                              </motion.li>
                            </ul>
                          </div>
                        </CardContent>
                      </Card>

                      <Card style={cardStyle} className="border-0">
                        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
                          <CardTitle className="text-emerald-700 flex items-center">
                            <Calendar className="mr-2 h-5 w-5" />
                            返済期間
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="text-center py-6">
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
                                  {repaymentPlan.length % 12}
                                  ヶ月で完済できます！
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

                      <Card style={cardStyle} className="border-0">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
                          <CardTitle className="text-purple-700 flex items-center">
                            <PiggyBank className="mr-2 h-5 w-5" />
                            節約ポイント
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
                              <Lottie
                                animationData={savingsAnimation}
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
                                  <ArrowRight
                                    size={14}
                                    className="text-purple-700"
                                  />
                                </div>
                                <div className="text-gray-600">
                                  毎月の支出を
                                  <span className="font-bold text-purple-600">
                                    1万円削減
                                  </span>
                                  すると、返済期間が短縮できます。
                                </div>
                              </motion.li>
                              <motion.li
                                className="flex items-start gap-2"
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                              >
                                <div className="rounded-full bg-purple-100 p-1 mt-1">
                                  <ArrowRight
                                    size={14}
                                    className="text-purple-700"
                                  />
                                </div>
                                <div className="text-gray-600">
                                  終了時期が近い支出を
                                  <span className="font-bold text-purple-600">
                                    見直す
                                  </span>
                                  ことで早期返済が可能です。
                                </div>
                              </motion.li>
                              <motion.li
                                className="flex items-start gap-2"
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                              >
                                <div className="rounded-full bg-purple-100 p-1 mt-1">
                                  <ArrowRight
                                    size={14}
                                    className="text-purple-700"
                                  />
                                </div>
                                <div className="text-gray-600">
                                  副収入を増やすことで
                                  <span className="font-bold text-purple-600">
                                    返済スピード
                                  </span>
                                  が加速します。
                                </div>
                              </motion.li>
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.6 }}
                    >
                      <Card style={cardStyle} className="border-0">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                          <CardTitle className="text-blue-700">
                            月別返済詳細
                          </CardTitle>
                          <CardDescription className="text-gray-600">
                            毎月の返済額とその効果の詳細
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart
                                data={repaymentPlan}
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
                                <XAxis
                                  dataKey="month"
                                  label={{
                                    value: "月",
                                    position: "insideBottomRight",
                                    offset: -5,
                                  }}
                                  stroke="#64748b"
                                />
                                <YAxis
                                  yAxisId="left"
                                  tickFormatter={(value) =>
                                    new Intl.NumberFormat("ja-JP", {
                                      notation: "compact",
                                      compactDisplay: "short",
                                    }).format(value)
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
                                    }).format(value)
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
                                <Line
                                  yAxisId="left"
                                  type="monotone"
                                  dataKey="debtAmount"
                                  name="残債"
                                  stroke="#3b82f6"
                                  strokeWidth={3}
                                  dot={{
                                    stroke: "#3b82f6",
                                    strokeWidth: 2,
                                    r: 4,
                                  }}
                                  activeDot={{ r: 8 }}
                                />
                                <Line
                                  yAxisId="right"
                                  type="monotone"
                                  dataKey="payment"
                                  name="返済額"
                                  stroke="#8b5cf6"
                                  strokeWidth={3}
                                  dot={{
                                    stroke: "#8b5cf6",
                                    strokeWidth: 2,
                                    r: 4,
                                  }}
                                />
                                <Line
                                  yAxisId="right"
                                  type="monotone"
                                  dataKey="expenses"
                                  name="支出"
                                  stroke="#f43f5e"
                                  strokeWidth={3}
                                  strokeDasharray="5 5"
                                  dot={{
                                    stroke: "#f43f5e",
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
                </div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
};

export default DebtRepaymentApp;
