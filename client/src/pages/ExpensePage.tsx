import React, { useEffect, useState } from 'react';
import {
  Wallet,
  Plus,
  TrendingDown,
  AlertTriangle,
  PieChart,
  Trash2,
  DollarSign,
  Coffee,
  Book,
  Car,
  Home,
  Film,
  MoreHorizontal,
  X
} from 'lucide-react';
import { ExpenseItem } from '../types';
import { api } from '../services/api';

export const ExpensePage: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(8000);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [remainingBudget, setRemainingBudget] = useState<number>(0);
  const [isOverBudget, setIsOverBudget] = useState<boolean>(false);
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Expense Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<'food' | 'books' | 'transport' | 'hostel' | 'entertainment' | 'other'>('food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState('UPI');

  // Budget Modal
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [newBudget, setNewBudget] = useState('');

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/expenses');
      if (res.success && res.data) {
        setExpenses(res.data.expenses || []);
        setMonthlyBudget(res.data.monthlyBudget || 8000);
        setTotalSpent(res.data.totalSpentThisMonth || 0);
        setRemainingBudget(res.data.remainingBudget || 0);
        setIsOverBudget(res.data.isOverBudget || false);
        setCategoryBreakdown(res.data.categoryBreakdown || []);
      }
    } catch (e) {
      console.error('Failed to load expenses:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    try {
      await api.post('/expenses', {
        amount: Number(amount),
        category,
        description,
        date,
        paymentMode
      });

      setIsModalOpen(false);
      setAmount('');
      setDescription('');
      fetchExpenses();
    } catch (e) {
      alert('Failed to log expense');
    }
  };

  const handleSetBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudget) return;

    try {
      await api.post('/expenses/budget', { budgetAmount: Number(newBudget) });
      setIsBudgetModalOpen(false);
      fetchExpenses();
    } catch (e) {
      alert('Failed to set budget');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/expenses/${id}`);
      fetchExpenses();
    } catch (e) {
      alert('Failed to delete expense');
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'food':
        return <Coffee size={16} className="text-amber-500" />;
      case 'books':
        return <Book size={16} className="text-indigo-500" />;
      case 'transport':
        return <Car size={16} className="text-cyan-500" />;
      case 'hostel':
        return <Home size={16} className="text-rose-500" />;
      case 'entertainment':
        return <Film size={16} className="text-violet-500" />;
      default:
        return <MoreHorizontal size={16} className="text-slate-500" />;
    }
  };

  const budgetPct = monthlyBudget > 0 ? Math.min(100, Math.round((totalSpent / monthlyBudget) * 100)) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Student Expense Tracker
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-950/80 dark:text-teal-300">
              Campus Budgeting
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Keep track of mess food, books, semester stationery, and manage your monthly allowance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setNewBudget(monthlyBudget.toString());
              setIsBudgetModalOpen(true);
            }}
            className="px-3.5 py-2.5 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            Set Monthly Budget
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition flex items-center gap-2 active:scale-95"
          >
            <Plus size={16} />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* Monthly Budget Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Monthly Budget Progress
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                ₹{totalSpent}
              </span>
              <span className="text-sm font-semibold text-slate-400">
                / ₹{monthlyBudget} Budgeted
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {isOverBudget ? 'Budget Exceeded By' : 'Remaining Balance'}
            </span>
            <div className={`text-2xl font-extrabold ${isOverBudget ? 'text-rose-600' : 'text-emerald-600'}`}>
              ₹{isOverBudget ? totalSpent - monthlyBudget : remainingBudget}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isOverBudget ? 'bg-rose-500' : budgetPct > 80 ? 'bg-amber-500' : 'bg-teal-500'
            }`}
            style={{ width: `${budgetPct}%` }}
          />
        </div>

        {isOverBudget && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2 font-medium">
            <AlertTriangle size={16} />
            <span>You have exceeded your planned monthly allowance for this month.</span>
          </div>
        )}
      </div>

      {/* Grid: Category Breakdown & Expense History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Category Breakdown */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <PieChart size={18} className="text-indigo-600" />
            <span>Category Spending</span>
          </h3>

          {categoryBreakdown.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No expenses recorded this month.</div>
          ) : (
            <div className="space-y-3">
              {categoryBreakdown.map((cat) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold capitalize text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      {getCategoryIcon(cat.category)}
                      {cat.category}
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      ₹{cat.amount} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (2 Cols): Transactions Table */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Recent Transactions</h3>

          {isLoading ? (
            <div className="py-8 text-center text-slate-400 text-xs">Loading transactions...</div>
          ) : expenses.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No transactions recorded. Click "Record Expense" to add your first expense!</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {expenses.map((item) => (
                <div
                  key={item.id}
                  className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-xl transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {item.description}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="capitalize">{item.category}</span>
                        <span>•</span>
                        <span>{item.date}</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-500">{item.payment_mode}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                        ₹{item.amount}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 text-slate-300 hover:text-rose-500 transition"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Record Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Record Expense</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 150"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cafeteria lunch & coffee"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="food">Food & Mess</option>
                    <option value="books">Books & Stationery</option>
                    <option value="transport">Transport & Travel</option>
                    <option value="hostel">Hostel & Utilities</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="other">Other Expenses</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="UPI">UPI (GPay / PhonePe)</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Debit / Credit Card</option>
                    <option value="NetBanking">Net Banking</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-md"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Set Monthly Budget Modal */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-3">Set Monthly Budget</h3>
            <form onSubmit={handleSetBudget} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Budget for this Month (₹)
                </label>
                <input
                  type="number"
                  required
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBudgetModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Update Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
