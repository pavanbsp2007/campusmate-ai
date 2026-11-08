const { v4: uuidv4 } = require('uuid');
const db = require('../db');

exports.getExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentMonth = new Date().toISOString().substring(0, 7); // '2026-11'

    const expenses = await db.query(
      `SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC, created_at DESC`,
      [userId]
    );

    // Get current month budget
    const budgets = await db.query(
      'SELECT budget_amount FROM monthly_budgets WHERE user_id = ? AND month_year = ?',
      [userId, currentMonth]
    );
    const monthlyBudget = budgets.length > 0 ? Number(budgets[0].budget_amount) : 8000;

    // Filter current month expenses
    const currentMonthExpenses = expenses.filter((e) => e.date.startsWith(currentMonth));
    const totalSpentThisMonth = currentMonthExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const remainingBudget = Math.max(0, monthlyBudget - totalSpentThisMonth);

    // Category breakdown
    const categoryTotals = {};
    currentMonthExpenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + Number(e.amount);
    });

    const categoryBreakdown = Object.keys(categoryTotals).map((cat) => ({
      category: cat,
      amount: Math.round(categoryTotals[cat] * 100) / 100,
      percentage: totalSpentThisMonth > 0 ? Math.round((categoryTotals[cat] / totalSpentThisMonth) * 100) : 0
    }));

    return res.json({
      success: true,
      data: {
        expenses,
        currentMonth,
        monthlyBudget,
        totalSpentThisMonth: Math.round(totalSpentThisMonth * 100) / 100,
        remainingBudget: Math.round(remainingBudget * 100) / 100,
        isOverBudget: totalSpentThisMonth > monthlyBudget,
        categoryBreakdown
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch expenses.', error: error.message });
  }
};

exports.addExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, category, description, date, paymentMode } = req.body;

    if (!amount || !description) {
      return res.status(400).json({ success: false, message: 'Amount and description are required.' });
    }

    const id = 'exp_' + uuidv4().substring(0, 8);
    const expenseDate = date || new Date().toISOString().split('T')[0];

    await db.query(
      `INSERT INTO expenses (id, user_id, amount, category, description, date, payment_mode)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, Number(amount), category || 'other', description.trim(), expenseDate, paymentMode || 'UPI']
    );

    return res.status(201).json({ success: true, message: 'Expense recorded!', id });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to record expense.', error: error.message });
  }
};

exports.setBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const { monthYear, budgetAmount } = req.body;
    const targetMonth = monthYear || new Date().toISOString().substring(0, 7);

    const existing = await db.query(
      'SELECT id FROM monthly_budgets WHERE user_id = ? AND month_year = ?',
      [userId, targetMonth]
    );

    if (existing && existing.length > 0) {
      await db.query('UPDATE monthly_budgets SET budget_amount = ? WHERE user_id = ? AND month_year = ?', [
        Number(budgetAmount),
        userId,
        targetMonth
      ]);
    } else {
      await db.query(
        'INSERT INTO monthly_budgets (id, user_id, month_year, budget_amount) VALUES (?, ?, ?, ?)',
        ['mb_' + uuidv4().substring(0, 8), userId, targetMonth, Number(budgetAmount)]
      );
    }

    return res.json({ success: true, message: `Monthly budget updated for ${targetMonth}!` });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to set budget.', error: error.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await db.query('DELETE FROM expenses WHERE id = ? AND user_id = ?', [id, userId]);
    return res.json({ success: true, message: 'Expense deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete expense.', error: error.message });
  }
};
