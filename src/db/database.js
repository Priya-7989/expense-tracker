import Dexie from 'dexie';

export const db = new Dexie('HouseholdExpenseDB');

db.version(1).stores({
    expenses: '++id, date, category, paymentMethod, amount, particulars, createdAt',
});

// Helper functions
export const addExpense = async (expense) => {
    return await db.expenses.add({
        ...expense,
        amount: parseFloat(expense.amount),
        createdAt: new Date().toISOString(),
    });
};

export const updateExpense = async (id, expense) => {
    return await db.expenses.update(id, {
        ...expense,
        amount: parseFloat(expense.amount),
    });
};

export const deleteExpense = async (id) => {
    return await db.expenses.delete(id);
};

export const getExpensesByMonth = async (year, month) => {
    const start = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const end = new Date(year, month, 0).toISOString().split('T')[0];
    return await db.expenses
        .where('date')
        .between(start, end, true, true)
        .toArray();
};

export const getAllExpenses = async () => {
    return await db.expenses.orderBy('date').reverse().toArray();
};
