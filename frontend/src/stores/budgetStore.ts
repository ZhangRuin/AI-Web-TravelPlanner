import { defineStore } from 'pinia';
import { budgetApi } from '../services/apiService';

export interface Expense {
  id: string;
  planId: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  receiptUrl?: string;
}

export interface BudgetAnalysis {
  planId: string;
  totalBudget: number;
  spent: number;
  remaining: number;
  breakdown: {
    accommodation: number;
    transportation: number;
    food: number;
    attractions: number;
    shopping: number;
    other: number;
  };
  dailyAverage: number;
  alerts?: string[];
}

export const useBudgetStore = defineStore('budget', {
  state: () => ({
    expenses: [] as Expense[],
    currentAnalysis: null as BudgetAnalysis | null,
    loading: false,
    error: null as string | null,
  }),
  
  getters: {
    // 获取指定行程的所有费用
    getExpensesByPlanId: (state) => (planId: string) => {
      return state.expenses.filter(expense => expense.planId === planId);
    },
    
    // 获取总支出
    getTotalSpent: (state) => (planId: string) => {
      return state.expenses
        .filter(expense => expense.planId === planId)
        .reduce((total, expense) => total + expense.amount, 0);
    },
    
    // 按类别分组的费用
    getExpensesByCategory: (state) => (planId: string) => {
      const grouped: Record<string, Expense[]> = {};
      state.expenses
        .filter(expense => expense.planId === planId)
        .forEach(expense => {
          const category = expense.category;
          if (!grouped[category]) {
            grouped[category] = [];
          }
          // 确保TypeScript知道这是一个数组
          const categoryArray = grouped[category];
          categoryArray.push(expense);
        });
      return grouped;
    },
    
    // 按类别汇总的费用
    getCategoryTotals: (state) => (planId: string) => {
      const totals: Record<string, number> = {};
      state.expenses
        .filter(expense => expense.planId === planId)
        .forEach(expense => {
          totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
        });
      return totals;
    },
  },
  
  actions: {
    // 获取预算分析
    async analyzeBudget(planData: any) {
      this.loading = true;
      this.error = null;
      try {
        const response = await budgetApi.analyzeBudget(planData);
        const analysis = response?.data || null;
        this.currentAnalysis = analysis;
        return analysis;
      } catch (error: any) {
        this.error = error.response?.data?.message || '预算分析失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 获取指定行程的费用记录
    async fetchExpenses(planId: string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await budgetApi.getExpenses(planId);
        const backendExpenses = response?.data || [];
        
        // 转换后端数据，将expense_date映射到date字段
        const expenses = backendExpenses.map((expense: any) => ({
          id: expense.id?.toString() || '',
          planId: expense.planId?.toString() || '',
          category: expense.category || '',
          amount: Number(expense.amount) || 0,
          // 关键：将expense_date映射到date字段
          date: expense.expense_date || '',
          description: expense.remark || '',
          receiptUrl: expense.receiptUrl
        }));
        
        console.log('转换后的费用数据:', expenses);
        
        // 只更新这个planId的费用，保留其他计划的费用
        this.expenses = this.expenses.filter(e => e.planId !== planId).concat(expenses);
        return expenses;
      } catch (error: any) {
        this.error = error.response?.data?.message || '获取费用记录失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 添加费用记录
    async addExpense(expenseData: {
      planId: string;
      category: string;
      amount: number;
      description: string;
      date?: string;
      expense_date?: string;
    }) {
      this.loading = true;
      this.error = null;
      try {
        // 准备传给后端的数据，确保使用正确的字段名和日期格式
        let formattedDate: string;
        
        // 优先使用expense_date，如果没有则使用date字段
        if (expenseData.expense_date) {
          formattedDate = expenseData.expense_date;
        } else if (expenseData.date) {
          // 确保date字段可以正确转换为日期
          const dateObj = new Date(expenseData.date);
          // 检查日期是否有效
          if (isNaN(dateObj.getTime())) {
            throw new Error('无效的日期格式');
          }
          // 格式化为YYYY-MM-DD
          formattedDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
        } else {
          // 如果都没有提供，使用当前日期
          const now = new Date();
          formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        }
        
        console.log('格式化后的日期:', formattedDate);
        
        const backendData = {
          planId: Number(expenseData.planId), // 转换为数字类型，匹配后端Long类型
          category: expenseData.category,
          amount: expenseData.amount,
          remark: expenseData.description,
          expense_date: formattedDate // 使用expense_date字段名，直接匹配后端期望的字段名
        };
        const response = await budgetApi.addExpense(backendData);
        const backendNewExpense = response?.data || {};
        
        // 转换新添加的费用记录，优先使用后端返回的数据，如果没有则使用前端提交的数据作为备用
        const newExpense = {
          id: backendNewExpense.id?.toString() || '',
          planId: backendNewExpense.planId?.toString() || expenseData.planId,
          category: backendNewExpense.category || expenseData.category,
          amount: Number(backendNewExpense.amount) || expenseData.amount,
          // 关键：将expense_date映射到date字段，优先使用后端数据，没有则使用前端提交的日期
          date: backendNewExpense.expense_date || formattedDate,
          description: backendNewExpense.remark || expenseData.description,
          receiptUrl: backendNewExpense.receiptUrl
        };
        
        // 使用展开运算符创建新数组，确保响应式更新
        this.expenses = [...this.expenses, newExpense];
        return newExpense;
      } catch (error: any) {
        this.error = error.response?.data?.message || '添加费用记录失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 更新功能已移除 - 后端未提供更新预算的接口

    
    // 删除费用记录
    async deleteExpense(expenseId: string) {
      this.loading = true;
      this.error = null;
      try {
        await budgetApi.deleteExpense(expenseId);
        this.expenses = this.expenses.filter(e => e.id !== expenseId);
      } catch (error: any) {
        this.error = error.response?.data?.message || '删除费用记录失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 清除当前分析
    clearCurrentAnalysis() {
      this.currentAnalysis = null;
    },
    
    // 清除错误
    clearError() {
      this.error = null;
    },
  },
});