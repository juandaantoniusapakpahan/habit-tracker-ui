import React, { useState, useMemo } from "react";
import "./css/MoneyManagement.css";

const MoneyManagement = () => {
  // --- STATE UTAMA ---
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([
    { id: 1, name: "Makanan" },
    { id: 2, name: "Transportasi" },
    { id: 3, name: "Gaji" }
  ]);
  
  const [editingId, setEditingId] = useState(null);
  const [editingCatId, setEditingCatId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState({ show: false, id: null, type: 'trans' });

  // Filter States
  const [filterType, setFilterType] = useState({ income: true, expense: true });
  const [filterDate, setFilterDate] = useState({ start: "", end: "" });
  const [selectedYearChart, setSelectedYearChart] = useState(new Date().getFullYear().toString());
  const [selectedMonthChart, setSelectedMonthChart] = useState((new Date().getMonth() + 1).toString());

  // --- LOGIKA SUMMARY & CHART (TETAP) ---
  const summary = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    return transactions.reduce((acc, t) => {
      const tDate = new Date(t.transactionDate);
      const amt = Number(t.amount) || 0;
      const isInc = t.transactionType === "INCOME";
      if (tDate.getFullYear() === new Date().getFullYear()) {
        isInc ? acc.year.in += amt : acc.year.out += amt;
        if (tDate.getMonth() === new Date().getMonth()) {
          isInc ? acc.month.in += amt : acc.month.out += amt;
        }
        if (tDate >= startOfWeek) {
          isInc ? acc.week.in += amt : acc.week.out += amt;
        }
      }
      return acc;
    }, { week: {in:0, out:0}, month: {in:0, out:0}, year: {in:0, out:0}, lastMonth: {in:7500000, out:4000000}, sixMonth: {in:45000000, out:20000000} });
  }, [transactions]);

  const chartStats = useMemo(() => {
    const yearly = transactions.filter(t => new Date(t.transactionDate).getFullYear().toString() === selectedYearChart);
    const monthly = yearly.filter(t => (new Date(t.transactionDate).getMonth() + 1).toString() === selectedMonthChart);
    const group = (data) => data.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});
    return { yearly: group(yearly), monthly: group(monthly) };
  }, [transactions, selectedYearChart, selectedMonthChart]);

  // --- ACTIONS TRANSAKSI ---
  const handleAddRow = () => {
    const newRow = { 
      id: Date.now(), 
      transactionDate: new Date().toISOString().split('T')[0], 
      category: categories[0]?.name || "", 
      transactionType: "EXPENSE", 
      amount: 0, 
      description: "", // Kolom Description baru
      isNew: true 
    };
    setTransactions([newRow, ...transactions]);
    setEditingId(newRow.id);
  };

  const handleSave = (id, updatedData) => {
    setTransactions(transactions.map(t => t.id === id ? { ...updatedData, isNew: false } : t));
    setEditingId(null);
  };

  // --- ACTIONS KATEGORI ---
  const handleAddCategory = () => {
    const newCat = { id: Date.now(), name: "", isNew: true };
    setCategories([newCat, ...categories]);
    setEditingCatId(newCat.id);
  };

  const handleSaveCategory = (id, name) => {
    setCategories(categories.map(c => c.id === id ? { ...c, name, isNew: false } : c));
    setEditingCatId(null);
  };

  const handleDelete = () => {
    if (showDeleteModal.type === 'trans') {
      setTransactions(transactions.filter(t => t.id !== showDeleteModal.id));
    } else {
      setCategories(categories.filter(c => c.id !== showDeleteModal.id));
    }
    setShowDeleteModal({ show: false, id: null });
  };

  const filteredHistory = transactions.filter(t => {
    const dateMatch = (!filterDate.start || t.transactionDate >= filterDate.start) && (!filterDate.end || t.transactionDate <= filterDate.end);
    const typeMatch = (filterType.income && t.transactionType === "INCOME") || (filterType.expense && t.transactionType === "EXPENSE");
    return dateMatch && typeMatch;
  });

  return (
    <div className="money-container">
      {/* 1. CARDS */}
      <div className="summary-grid">
        <StatCard label="Minggu Ini" data={summary.week} color="#3498db" />
        <StatCard label="Bulan Ini" data={summary.month} color="#2ecc71" />
        <StatCard label="Bulan Lalu" data={summary.lastMonth} color="#f39c12" />
        <StatCard label="6 Bulan" data={summary.sixMonth} color="#9b59b6" />
        <StatCard label="Tahun Ini" data={summary.year} color="#e74c3c" />
      </div>

      {/* 2. TABLE TRANSAKSI (UPSERT) */}
      <div className="card-panel">
        <div className="panel-header">
          <h3>Transaksi Bulan Ini</h3>
          <button className="btn-primary" onClick={handleAddRow}>+ Baris Baru</button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Kategori</th>
              <th>Deskripsi</th> {/* Header Baru */}
              <th>Tipe</th>
              <th>Nominal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {transactions.slice(0, 20).map(t => (
              <EditableRow 
                key={t.id} data={t} categories={categories} isEditing={editingId === t.id} 
                onSave={handleSave} onEdit={() => setEditingId(t.id)}
                onCancel={() => { if(t.isNew) setTransactions(transactions.filter(x => x.id !== t.id)); setEditingId(null); }}
                onDelete={() => setShowDeleteModal({ show: true, id: t.id, type: 'trans' })} 
              />
            ))}
          </tbody>
          <tfoot>
            <tr className="footer-total">
              <td colSpan="4">TOTAL BULAN INI</td>
              <td className="txt-income">In: {summary.month.in.toLocaleString()}</td>
              <td className="txt-expense">Out: {summary.month.out.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 3. HISTORY & FILTER */}
      <div className="card-panel">
        <h3>Riwayat & Filter</h3>
        <div className="filter-bar">
          <div className="filter-group">
            <input type="date" value={filterDate.start} onChange={e => setFilterDate({...filterDate, start: e.target.value})} />
            <span>s/d</span>
            <input type="date" value={filterDate.end} onChange={e => setFilterDate({...filterDate, end: e.target.value})} />
          </div>
          <div className="filter-group">
            <label className="chk-label"><input type="checkbox" checked={filterType.income} onChange={() => setFilterType({...filterType, income: !filterType.income})} /> Pemasukan</label>
            <label className="chk-label"><input type="checkbox" checked={filterType.expense} onChange={() => setFilterType({...filterType, expense: !filterType.expense})} /> Pengeluaran</label>
          </div>
        </div>
        <table className="data-table">
          <thead><tr><th>Tanggal</th><th>Kategori</th><th>Deskripsi</th><th>Tipe</th><th>Nominal</th></tr></thead>
          <tbody>
            {filteredHistory.slice(0, 20).map(t => (
              <tr key={t.id}>
                <td>{t.transactionDate}</td>
                <td>{t.category || "-"}</td>
                <td>{t.description || "-"}</td>
                <td><span className={`badge ${t.transactionType.toLowerCase()}`}>{t.transactionType}</span></td>
                <td>Rp {Number(t.amount).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. PIE CHARTS */}
      <div className="card-panel">
        <div className="panel-header">
          <h3>Analisis Grafik</h3>
          <div className="chart-controls">
            <select value={selectedYearChart} onChange={e => setSelectedYearChart(e.target.value)}>
              <option value="2024">2024</option><option value="2025">2025</option><option value="2026">2026</option>
            </select>
            <select value={selectedMonthChart} onChange={e => setSelectedMonthChart(e.target.value)}>
              {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>Bulan {i+1}</option>)}
            </select>
          </div>
        </div>
        <div className="charts-grid">
          <div className="chart-box">
            <h4>Pie Tahunan ({selectedYearChart})</h4>
            <div className="pie-placeholder"><div className="pie-circle year"></div></div>
            <ul className="legend-list">{Object.entries(chartStats.yearly).map(([cat, val]) => <li key={cat}>{cat}: Rp {val.toLocaleString()}</li>)}</ul>
          </div>
          <div className="chart-box">
            <h4>Pie Bulanan ({selectedMonthChart})</h4>
            <div className="pie-placeholder"><div className="pie-circle"></div></div>
            <ul className="legend-list">{Object.entries(chartStats.monthly).map(([cat, val]) => <li key={cat}>{cat}: Rp {val.toLocaleString()}</li>)}</ul>
          </div>
        </div>
      </div>

      {/* 5. TABLE KATEGORI */}
      <div className="card-panel">
        <div className="panel-header">
          <h3>Master Kategori</h3>
          <button className="btn-primary" onClick={handleAddCategory}>+ Tambah Kategori</button>
        </div>
        <table className="data-table small-table">
          <thead><tr><th>ID</th><th>Nama Kategori</th><th>Aksi</th></tr></thead>
          <tbody>
            {categories.map(c => (
              <CategoryRow 
                key={c.id} data={c} 
                isEditing={editingCatId === c.id} 
                onSave={handleSaveCategory}
                onEdit={() => setEditingCatId(c.id)}
                onCancel={() => { if(c.isNew) setCategories(categories.filter(x => x.id !== c.id)); setEditingCatId(null); }}
                onDelete={() => setShowDeleteModal({ show: true, id: c.id, type: 'cat' })}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DELETE */}
      {showDeleteModal.show && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h4>Konfirmasi Hapus</h4>
            <p>Data ini akan dihapus permanen.</p>
            <div className="modal-btns">
              <button className="btn-gray" onClick={() => setShowDeleteModal({show:false})}>Batal</button>
              <button className="btn-danger" onClick={handleDelete}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- SUB-COMPONENTS ---
const StatCard = ({ label, data, color }) => (
  <div className="stat-card" style={{ borderTop: `5px solid ${color}` }}>
    <p className="stat-title">{label}</p>
    <div className="stat-row"><span className="txt-income">▲ {data.in.toLocaleString()}</span><span className="txt-expense">▼ {data.out.toLocaleString()}</span></div>
  </div>
);

const EditableRow = ({ data, categories, isEditing, onSave, onCancel, onEdit, onDelete }) => {
  const [form, setForm] = useState(data);
  if (isEditing) {
    return (
      <tr className="editing-row">
        <td><input type="date" value={form.transactionDate} onChange={e => setForm({...form, transactionDate: e.target.value})} /></td>
        <td>
          <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </td>
        <td><input type="text" placeholder="Deskripsi..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></td>
        <td><select value={form.transactionType} onChange={e => setForm({...form, transactionType: e.target.value})}><option value="INCOME">PEMASUKAN</option><option value="EXPENSE">PENGELUARAN</option></select></td>
        <td><input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} /></td>
        <td>
          <div className="action-btns-inline">
            <button className="btn-save" onClick={() => onSave(data.id, form)}>OK</button>
            <button className="btn-cancel-inline" onClick={onCancel}>✕</button>
          </div>
        </td>
      </tr>
    );
  }
  return (
    <tr>
      <td>{data.transactionDate}</td>
      <td>{data.category || "-"}</td>
      <td>{data.description || "-"}</td>
      <td><span className={`badge ${data.transactionType.toLowerCase()}`}>{data.transactionType}</span></td>
      <td>Rp {Number(data.amount).toLocaleString()}</td>
      <td><button className="btn-icon edit" onClick={onEdit}>✎</button><button className="btn-icon del" onClick={onDelete}>🗑</button></td>
    </tr>
  );
};

const CategoryRow = ({ data, isEditing, onSave, onCancel, onEdit, onDelete }) => {
  const [name, setName] = useState(data.name);
  if (isEditing) {
    return (
      <tr className="editing-row">
        <td>{data.isNew ? "New" : data.id}</td>
        <td><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nama kategori..." /></td>
        <td>
          <div className="action-btns-inline">
            <button className="btn-save" onClick={() => onSave(data.id, name)}>OK</button>
            <button className="btn-cancel-inline" onClick={onCancel}>✕</button>
          </div>
        </td>
      </tr>
    );
  }
  return (
    <tr>
      <td>{data.id}</td><td>{data.name}</td>
      <td><button className="btn-icon edit" onClick={onEdit}>✎</button><button className="btn-icon del" onClick={onDelete}>🗑</button></td>
    </tr>
  );
};

export default MoneyManagement;