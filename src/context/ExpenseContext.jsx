import { createContext, useContext, useState, useCallback } from 'react';
import { addExpense, updateExpense, deleteExpense, getExpensesByMonth, getAllExpenses } from '../db/database';

const ExpenseContext = createContext(null);

const now = new Date();

export const ExpenseProvider = ({ children }) => {
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchExpenses = useCallback(async (year, month) => {
        setLoading(true);
        try {
            const data = await getExpensesByMonth(year, month);
            setExpenses(data);
        } finally {
            setLoading(false);
        }
    }, []);

    const addNewExpense = async (expense) => {
        await addExpense(expense);
        await fetchExpenses(selectedYear, selectedMonth);
    };

    const editExpense = async (id, expense) => {
        await updateExpense(id, expense);
        await fetchExpenses(selectedYear, selectedMonth);
    };

    const removeExpense = async (id) => {
        await deleteExpense(id);
        await fetchExpenses(selectedYear, selectedMonth);
    };

    return (
        <ExpenseContext.Provider value={{
            expenses,
            loading,
            selectedMonth,
            selectedYear,
            setSelectedMonth,
            setSelectedYear,
            fetchExpenses,
            addNewExpense,
            editExpense,
            removeExpense,
            getAllExpenses,
        }}>
            {children}
        </ExpenseContext.Provider>
    );
};

export const useExpenses = () => {
    const ctx = useContext(ExpenseContext);
    if (!ctx) throw new Error('useExpenses must be used inside ExpenseProvider');
    return ctx;
};
