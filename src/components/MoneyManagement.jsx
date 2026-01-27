import React, { useState, useMemo, useEffect } from "react";
import "./css/MoneyManagement.css";
import {
  fetchFinanceTotal,
  getApiDateRanges,
  fetchCurrentMonthTransactions,
  fetchAllCategories,
  fetchFilteredTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  registerCategory,
  updateCategory,
  inActiveCategory,
  fetchMonthlyStats
} from "../api/moneyApi";

const MoneyManagement = () => {
  // --- STATE DATA ---
  const [transactions, setTransactions] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [monthlyAnalysis, setMonthlyAnalysis] = useState([]);
  const [loading, setLoading] = useState(true);

  const [apiSummary, setApiSummary] = useState({
    week: { in: 0, out: 0 }, month: { in: 0, out: 0 },
    lastMonth: { in: 0, out: 0 }, sixMonth: { in: 0, out: 0 }, year: { in: 0, out: 0 }
  });
  const [currentMonthTotal, setCurrentMonthTotal] = useState({ in: 0, out: 0 });

  // --- STATE UI & FILTER ---
  const [editingId, setEditingId] = useState(null);
  const [editingCatId, setEditingCatId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState({ show: false, id: null, type: 'trans' });
  const [filterType, setFilterType] = useState({ income: true, expense: true });
  const [filterDate, setFilterDate] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const [selectedYearAnalysis, setSelectedYearAnalysis] = useState(new Date().getFullYear().toString());

  // --- MEMOS ---
  const lastFiveYears = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => (current - i).toString());
  }, []);

  const getCategoryName = (id) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : "Tanpa Kategori";
  };

  // --- LOAD DATA ---
  const loadAllInitialData = async () => {
    setLoading(true);
    try {
      const dates = getApiDateRanges();
      const [summaryResults, catData, monthData] = await Promise.all([
        Promise.all([
          fetchFinanceTotal(dates.weekStart, dates.today),
          fetchFinanceTotal(dates.monthStart, dates.today),
          fetchFinanceTotal(dates.lastMonthStart, dates.lastMonthEnd),
          fetchFinanceTotal(dates.sixMonthsStart, dates.today),
          fetchFinanceTotal(dates.yearStart, dates.today)
        ]),
        fetchAllCategories(),
        fetchCurrentMonthTransactions()
      ]);

      setApiSummary({
        week: summaryResults[0], month: summaryResults[1], lastMonth: summaryResults[2],
        sixMonth: summaryResults[3], year: summaryResults[4]
      });
      setCategories(catData || []);
      if (monthData) {
        setTransactions(monthData.transactions || monthData.financeTransactions || []);
        setCurrentMonthTotal({ in: monthData.total?.totalIncome || 0, out: monthData.total?.totalExpense || 0 });
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const loadAnalysis = async (year) => {
    const res = await fetchMonthlyStats(year);
    if (res && res.status === "success") {
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const formatted = months.map(m => {
        const data = res.data.transactionMonthly.filter(t => t.monthName === m);
        const inc = data.find(d => d.type === "INCOME")?.totalAmount || 0;
        const exp = data.find(d => d.type === "EXPENSE")?.totalAmount || 0;
        return { month: m, income: inc, expense: exp, diff: inc - exp };
      });
      setMonthlyAnalysis(formatted);
    }
  };

  useEffect(() => { loadAllInitialData(); }, []);
  useEffect(() => { loadAnalysis(selectedYearAnalysis); }, [selectedYearAnalysis]);

  useEffect(() => {
    const getFiltered = async () => {
      const data = await fetchFilteredTransactions({
        start: filterDate.start,
        end: filterDate.end,
        income: filterType.income,
        expense: filterType.expense
      });
      setHistoryData(data || []);
    };
    getFiltered();
  }, [filterDate, filterType]);

  // --- ACTIONS ---
  const updateLocalTotals = (data, action, oldData = null) => {
    setCurrentMonthTotal(prev => {
      let nIn = prev.in, nOut = prev.out;
      if (action === 'add') {
        data.transactionType === 'INCOME' ? nIn += data.amount : nOut += data.amount;
      } else if (action === 'delete') {
        data.transactionType === 'INCOME' ? nIn -= data.amount : nOut -= data.amount;
      } else if (action === 'update') {
        oldData.transactionType === 'INCOME' ? nIn -= oldData.amount : nOut -= oldData.amount;
        data.transactionType === 'INCOME' ? nIn += data.amount : nOut += data.amount;
      }
      return { in: nIn, out: nOut };
    });

    setApiSummary(prev => {
      const updated = { ...prev };
      const keysToUpdate = ['week', 'month', 'sixMonth', 'year'];
      keysToUpdate.forEach(key => {
        let nIn = updated[key].in;
        let nOut = updated[key].out;
        if (action === 'add') {
          data.transactionType === 'INCOME' ? nIn += data.amount : nOut += data.amount;
        } else if (action === 'delete') {
          data.transactionType === 'INCOME' ? nIn -= data.amount : nOut -= data.amount;
        } else if (action === 'update') {
          oldData.transactionType === 'INCOME' ? nIn -= oldData.amount : nOut -= oldData.amount;
          data.transactionType === 'INCOME' ? nIn += data.amount : nOut += data.amount;
        }
        updated[key] = { in: nIn, out: nOut };
      });
      return updated;
    });
    loadAnalysis(selectedYearAnalysis);
  };

  const handleSaveTransaction = async (id, formData) => {
    const target = transactions.find(t => t.id === id);
    const payload = { ...formData, categoryId: Number(formData.categoryId), amount: parseFloat(formData.amount) };
    const res = target.isNew ? await createTransaction(payload) : await updateTransaction(id, payload);
    if (res?.status === "success") {
      setTransactions(prev => prev.map(t => t.id === id ? res.data : t));
      updateLocalTotals(res.data, target.isNew ? 'add' : 'update', target);
      setEditingId(null);
    }
  };

  const handleDelete = async () => {
    const { id, type } = showDeleteModal;
    if (type === 'trans') {
      const target = transactions.find(t => t.id === id);
      const res = await deleteTransaction(id);
      if (res?.status === "success") {
        setTransactions(prev => prev.filter(t => t.id !== id));
        updateLocalTotals(target, 'delete');
      }
    }
    setShowDeleteModal({ show: false, id: null, type: 'trans' });
  };

  if (loading) return <div className="loading-screen">Memuat Data Keuangan...</div>;

  return (
    <div className="money-container">
      {/* 1. CARDS SUMMARY */}
      <div className="summary-grid">
        <StatCard label="Minggu Ini" data={apiSummary.week} color="#3498db" />
        <StatCard label="Bulan Ini" data={apiSummary.month} color="#2ecc71" />
        <StatCard label="Bulan Lalu" data={apiSummary.lastMonth} color="#f39c12" />
        <StatCard label="6 Bulan" data={apiSummary.sixMonth} color="#9b59b6" />
        <StatCard label="Tahun Ini" data={apiSummary.year} color="#e74c3c" />
      </div>

      {/* 2. TRANSAKSI BULAN INI (DENGAN SCROLL) */}
      <div className="card-panel">
        <div className="panel-header">
          <h3>Transaksi Bulan Ini</h3>
          <button className="btn-primary" onClick={() => {
            const newRow = { id: Date.now(), transactionDate: new Date().toISOString().split('T')[0], categoryId: categories[0]?.id, transactionType: "EXPENSE", amount: 0, description: "", isNew: true };
            setTransactions([newRow, ...transactions]);
            setEditingId(newRow.id);
          }}>+ Baris Baru</button>
        </div>
        
        <div className="table-scroll-container">
          <table className="data-table">
            <thead>
              <tr><th>Tanggal</th><th>Kategori</th><th>Deskripsi</th><th>Tipe</th><th>Nominal</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <EditableRow
                  key={t.id} data={{ ...t, categoryName: getCategoryName(t.categoryId) }} categories={categories}
                  isEditing={editingId === t.id} onSave={handleSaveTransaction}
                  onCancel={() => { if (t.isNew) setTransactions(prev => prev.filter(x => x.id !== t.id)); setEditingId(null); }}
                  onEdit={() => setEditingId(t.id)} onDelete={() => setShowDeleteModal({ show: true, id: t.id, type: 'trans' })}
                />
              ))}
            </tbody>
            <tfoot>
              <tr className="footer-total">
                <td colSpan="4">TOTAL BULAN INI</td>
                <td className="txt-income">In: {currentMonthTotal.in.toLocaleString()}</td>
                <td className="txt-expense">Out: {currentMonthTotal.out.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 3. RIWAYAT & FILTER */}
      <div className="card-panel">
        <h3>Riwayat & Filter</h3>
        <div className="filter-bar">
          <div className="filter-group">
            <input type="date" value={filterDate.start} onChange={e => setFilterDate({ ...filterDate, start: e.target.value })} />
            <span>s/d</span>
            <input type="date" value={filterDate.end} onChange={e => setFilterDate({ ...filterDate, end: e.target.value })} />
          </div>
          <div className="filter-group">
            <label className="chk-label">
              <input type="checkbox" checked={filterType.income} onChange={() => setFilterType({ ...filterType, income: !filterType.income })} /> Pemasukan
            </label>
            <label className="chk-label">
              <input type="checkbox" checked={filterType.expense} onChange={() => setFilterType({ ...filterType, expense: !filterType.expense })} /> Pengeluaran
            </label>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>Tanggal</th><th>Kategori</th><th>Deskripsi</th><th>Tipe</th><th>Nominal</th></tr>
          </thead>
          <tbody>
            {historyData.length > 0 ? historyData.map(t => (
              <tr key={t.id}>
                <td>{t.transactionDate}</td><td>{getCategoryName(t.categoryId)}</td><td>{t.description || "-"}</td>
                <td><span className={`badge ${t.transactionType.toLowerCase()}`}>{t.transactionType}</span></td>
                <td>Rp {Number(t.amount).toLocaleString()}</td>
              </tr>
            )) : <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Data tidak ditemukan</td></tr>}
          </tbody>
        </table>
      </div>

      {/* 4. ANALISIS TAHUNAN */}
      <div className="card-panel">
        <div className="panel-header">
          <h3>Analisis Keuangan Tahunan</h3>
          <div className="chart-controls">
            <select value={selectedYearAnalysis} onChange={e => setSelectedYearAnalysis(e.target.value)}>
              {lastFiveYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <div className="charts-grid">
          <div className="chart-box">
            <h4 style={{ textAlign: 'center', color: '#666' }}>Grafik Selisih Bulanan (Net)</h4>
            <div className="bar-chart-container">
              {monthlyAnalysis.map((d, i) => {
                const maxVal = Math.max(...monthlyAnalysis.map(m => Math.abs(m.diff)), 1);
                const height = (Math.abs(d.diff) / maxVal) * 100;
                return (
                  <div key={i} className="bar-wrapper">
                    <div className="bar-item" style={{ height: `${height}%`, background: d.diff >= 0 ? '#2ecc71' : '#e74c3c' }}>
                      <div className="bar-tooltip">
                        <strong>{d.month}</strong><br />
                        In: {d.income.toLocaleString()}<br />
                        Out: {d.expense.toLocaleString()}<br />
                        <hr style={{ margin: '5px 0', borderColor: '#555' }} />
                        Net: {d.diff.toLocaleString()}
                      </div>
                    </div>
                    <span className="month-label">{d.month.substring(0, 3)}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="chart-box">
            <h4 style={{ textAlign: 'center', color: '#666', marginBottom: '15px' }}>Tabel Rangkuman</h4>
            <table className="data-table" style={{ fontSize: '12px' }}>
              <thead>
                <tr><th>Bulan</th><th>Pemasukan</th><th>Pengeluaran</th><th>Selisih</th></tr>
              </thead>
              <tbody>
                {monthlyAnalysis.map((d, i) => (
                  <tr key={i}>
                    <td>{d.month}</td>
                    <td className="txt-income">{d.income.toLocaleString()}</td>
                    <td className="txt-expense">{d.expense.toLocaleString()}</td>
                    <td style={{ fontWeight: 'bold', color: d.diff >= 0 ? '#2ecc71' : '#e74c3c' }}>{d.diff.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. MASTER KATEGORI */}
      <div className="card-panel">
        <div className="panel-header">
          <h3>Master Kategori</h3>
          <button className="btn-primary" onClick={() => {
            const newCat = { id: Date.now(), name: "", active: true, createdAt: new Date().toISOString(), isNew: true };
            setCategories([...categories, newCat]); setEditingCatId(newCat.id);
          }}>+ Tambah Kategori</button>
        </div>
        <table className="data-table small-table">
          <thead>
            <tr><th>ID</th><th>Nama Kategori</th><th>Status</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {categories.map(c => (
              <CategoryRow
                key={c.id} data={c} isEditing={editingCatId === c.id}
                onSave={(id, name) => {
                  const cat = categories.find(x => x.id === id);
                  const act = cat.isNew ? registerCategory(name) : updateCategory(id, name);
                  act.then(res => { if (res?.status === "success") { setCategories(prev => prev.map(x => x.id === id ? res.data : x)); setEditingCatId(null); } });
                }}
                onCancel={() => { if (c.isNew) setCategories(prev => prev.filter(x => x.id !== c.id)); setEditingCatId(null); }}
                onEdit={() => setEditingCatId(c.id)} onDelete={() => setShowDeleteModal({ show: true, id: c.id, type: 'cat' })}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DELETE */}
      {showDeleteModal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h4>Konfirmasi</h4>
            <p>Hapus atau nonaktifkan data ini?</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowDeleteModal({ show: false, id: null, type: 'trans' })}>Batal</button>
              <button className="btn-confirm" onClick={handleDelete}>Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- SUB COMPONENTS ---
const StatCard = ({ label, data, color }) => (
  <div className="stat-card" style={{ borderTop: `5px solid ${color}` }}>
    <p className="stat-title">{label}</p>
    <div className="stat-row">
      <span className="txt-income">▲ {data.in.toLocaleString()}</span>
      <span className="txt-expense">▼ {data.out.toLocaleString()}</span>
    </div>
  </div>
);

const EditableRow = ({ data, categories, isEditing, onSave, onCancel, onEdit, onDelete }) => {
  const [form, setForm] = useState(data);
  if (isEditing) return (
    <tr className="editing-row">
      <td><input type="date" value={form.transactionDate} onChange={e => setForm({ ...form, transactionDate: e.target.value })} /></td>
      <td>
        <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </td>
      <td><input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></td>
      <td>
        <select value={form.transactionType} onChange={e => setForm({ ...form, transactionType: e.target.value })}>
          <option value="INCOME">INCOME</option><option value="EXPENSE">EXPENSE</option>
        </select>
      </td>
      <td><input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></td>
      <td><div className="action-btns-inline">
        <button className="btn-save" onClick={() => onSave(data.id, form)}>OK</button>
        <button className="btn-cancel-inline" onClick={onCancel}>✕</button>
      </div></td>
    </tr>
  );
  return (
    <tr>
      <td>{data.transactionDate}</td><td>{data.categoryName}</td><td>{data.description || "-"}</td>
      <td><span className={`badge ${data.transactionType.toLowerCase()}`}>{data.transactionType}</span></td>
      <td>Rp {Number(data.amount).toLocaleString()}</td>
      <td><button className="btn-icon edit" onClick={onEdit}>✎</button><button className="btn-icon del" onClick={onDelete}>🗑</button></td>
    </tr>
  );
};

const CategoryRow = ({ data, isEditing, onSave, onCancel, onEdit, onDelete }) => {
  const [name, setName] = useState(data.name);
  if (isEditing) return (
    <tr className="editing-row">
      <td>{data.isNew ? "New" : data.id}</td>
      <td><input type="text" value={name} onChange={e => setName(e.target.value)} autoFocus /></td>
      <td>{data.active ? "AKTIF" : "NON-AKTIF"}</td>
      <td><div className="action-btns-inline">
        <button className="btn-save" onClick={() => onSave(data.id, name)}>OK</button>
        <button className="btn-cancel-inline" onClick={onCancel}>✕</button>
      </div></td>
    </tr>
  );
  return (
    <tr>
      <td>{data.id}</td><td style={{ fontWeight: '500' }}>{data.name}</td>
      <td><span className={`badge ${data.active ? 'income' : 'expense'}`}>{data.active ? 'AKTIF' : 'NON-AKTIF'}</span></td>
      <td><button className="btn-icon edit" onClick={onEdit}>✎</button><button className="btn-icon del" onClick={onDelete} disabled={!data.active}>🗑</button></td>
    </tr>
  );
};

export default MoneyManagement;