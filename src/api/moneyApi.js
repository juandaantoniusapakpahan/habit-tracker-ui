import { getAuthHeaders } from "./token";
const TRANS_URL = "http://localhost:8080/api/finance-transaction";
const CATEG_URL = "http://localhost:8080/api/financial-category";

export const fetchFinanceTotal = async (startDate, endDate) => {
  try {
    const response = await fetch(`${TRANS_URL}/getTotal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      headers: getAuthHeaders(),
      body: JSON.stringify({ start: startDate, end: endDate }),
    });
    const result = await response.json();
    if (result.status === "success") {
      return {
        in: result.data.totalIncome || 0,
        out: result.data.totalExpense || 0
      };
    }
    return { in: 0, out: 0 };
  } catch (error) {
    console.error("API Error:", error);
    return { in: 0, out: 0 };
  }
};

export const getApiDateRanges = () => {
  const now = new Date();
  const formatDate = (date) => date.toISOString().split('T')[0];

  // Minggu Ini (Start dari hari Minggu)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());

  // Bulan Lalu
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // 6 Bulan Lalu
  const startOfSixMonths = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  return {
    today: formatDate(new Date()),
    weekStart: formatDate(startOfWeek),
    monthStart: formatDate(new Date(now.getFullYear(), now.getMonth(), 1)),
    lastMonthStart: formatDate(startOfLastMonth),
    lastMonthEnd: formatDate(endOfLastMonth),
    sixMonthsStart: formatDate(startOfSixMonths),
    yearStart: formatDate(new Date(now.getFullYear(), 0, 1)),
  };
};
 
export async function fetchCurrentMonthTransactions() {
    try {
        const response = await fetch(`${TRANS_URL}/getCurrentMonth`, {
            method: "POST",
            headers: getAuthHeaders()
        });
        const result = await response.json();
        if (result.status === "success") {
            return {
                transactions: result.data.financeTransactions,
                total: result.data.total
            };
        }
        return { transactions: [], total: { totalExpense: 0, totalIncome: 0 } };
    } catch (error) {
        console.error("Error fetching current month:", error);
        return { transactions: [], total: { totalExpense: 0, totalIncome: 0 } };
    }
}

export async function fetchFilteredTransactions(filter) {
    try {
        const response = await fetch(`${TRANS_URL}/getAllType`, {
            method: "POST", 
            headers: getAuthHeaders(),
            body: JSON.stringify({
                start: filter.start,
                end: filter.end,
                income: filter.income,
                expense: filter.expense
            })
        });
        const result = await response.json();
        if (result.status === "success") {
            return result.data.financeTransactions;
        }
        return [];
    } catch (error) {
        console.error("Error filtering transactions:", error);
        return [];
    }
}

export async function fetchAllCategories() {
    try {
        const response = await fetch(`${CATEG_URL}/getAll`, {
            method: "POST",
            headers: getAuthHeaders()
        });
        const result = await response.json();
        if (result.status === "success") {
            return result.data; // Mengembalikan array kategori
        }
        return [];
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

// Tambah Kategori Baru
export async function registerCategory(name) {
  const response = await fetch(`${CATEG_URL}/register`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ name })
  });
  return await response.json();
}

// Update Kategori
export async function updateCategory(id, name) {
  const response = await fetch(`${CATEG_URL}/update`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ id, name })
  });
  return await response.json();
}

// Inactive Kategori (Delete)
export async function inActiveCategory(id) {
  const response = await fetch(`${CATEG_URL}/inActive/${id}`, {
    method: "POST",
    headers: getAuthHeaders()
  });
  return await response.json();
}


export async function createTransaction(data) {
  try {
    const response = await fetch(`${TRANS_URL}/create`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        description: data.description,
        categoryId: data.categoryId,
        transactionDate: data.transactionDate,
        transactionType: data.transactionType,
        amount: data.amount
      })
    });
    return await response.json();
  } catch (error) {
    console.error("Error Create Transaction:", error);
    return null;
  }
}

// 2. Update Transaksi
export async function updateTransaction(id, data) {
  try {
    const response = await fetch(`${TRANS_URL}/update/${id}`, {
      method: "POST", 
      headers: getAuthHeaders(),
      body: JSON.stringify({
        description: data.description,
        categoryId: data.categoryId,
        transactionDate: data.transactionDate,
        transactionType: data.transactionType,
        amount: data.amount
      })
    });
    return await response.json();
  } catch (error) {
    console.error("Error Update Transaction:", error);
    return null;
  }
}

// 3. Delete Transaksi
export async function deleteTransaction(id) {
  try {
    const response = await fetch(`${TRANS_URL}/delete/${id}`, {
      method: "POST",
      headers: getAuthHeaders()
    });
    return await response.json();
  } catch (error) {
    console.error("Error Delete Transaction:", error);
    return null;
  }
}

export async function fetchMonthlyStats(year) {
  try {
    const response = await fetch(`${TRANS_URL}/getMonthlyIncomeExpense?year=${year}`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return await response.json();
  } catch (error) {
    console.error("Error Monthly Stats:", error);
    return null;
  }
}