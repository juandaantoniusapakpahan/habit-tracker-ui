import { useEffect, useState } from "react";
import "./css/MoneyManagement.css";

export default function MoneyManagement() {
  const [data, setData] = useState([]);

  // generate random dummy data
  useEffect(() => {
    const categories = ["Salary", "Groceries", "Entertainment", "Transport", "Investment"];
    const newData = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      date: `2026-01-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
      category: categories[Math.floor(Math.random() * categories.length)],
      type: Math.random() > 0.5 ? "Income" : "Expense",
      amount: Math.floor(Math.random() * 1000000),
    }));
    setData(newData);
  }, []);

  // calculate total balance
  const total = data.reduce(
    (acc, item) => (item.type === "Income" ? acc + item.amount : acc - item.amount),
    0
  );

  return (
    <div className="money-container">
      <h2>Money Management</h2>
      <div className="balance">Total Balance: Rp {total.toLocaleString()}</div>

      <table className="money-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Type</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className={item.type === "Expense" ? "expense" : "income"}>
              <td>{item.date}</td>
              <td>{item.category}</td>
              <td>{item.type}</td>
              <td>Rp {item.amount.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
