import { useEffect, useState } from "react";
import {
  fetchHabitTracker,
  fetchHabitTrackerReadonly,
  checkChecklist,
  uncheckChecklist,
  addTodoTask,
  inactiveTodoTask,
  getchMontlyTaskAvg,
  updateTodoTask // Pastikan ini diimport
} from "../api/habitApi";
import "./css/HabitTracker.css";

export default function HabitTracker({ userId }) {
  userId = userId || 1;
  const currentMonth = new Date().getMonth() + 1;

  const [data, setData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [averageData, setAverageData] = useState([]);
  const [readonlyData, setReadonlyData] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  const loadData = async () => {
    const result = await fetchHabitTracker(userId, currentMonth);
    setData(result);
  };

  const loadReadonlyTable = async (month) => {
    const result = await fetchHabitTrackerReadonly(userId, month);
    setReadonlyData(result);
  };

  const loadAverage = async (month) => {
    const result = await getchMontlyTaskAvg(userId, month);
    setAverageData(result || []);
  };

  useEffect(() => {
    loadData();
    loadReadonlyTable(currentMonth);
    loadAverage(currentMonth);
  }, [userId]);

  if (!data) return <div className="loading-container"><p>Loading Data...</p></div>;

  const todayStr = data.today;
  const monthName = new Date(todayStr).toLocaleDateString("en-US", {
    month: "long", year: "numeric"
  });

  const handleToggle = async (taskId, checklist) => {
    const newChecked = !checklist.isChecked;
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id !== taskId ? task : {
          ...task,
          todoCheckLists: task.todoCheckLists.map(cl =>
            cl.checkListId === checklist.checkListId ? { ...cl, isChecked: newChecked } : cl
          )
        }
      )
    }));
    try {
      newChecked ? await checkChecklist(checklist.checkListId) : await uncheckChecklist(checklist.checkListId);
    } catch { loadData(); }
  };

  const handleAddTask = async () => {
    if (!taskName.trim()) return alert("Task name wajib diisi");
    await addTodoTask(userId, { name: taskName, description: taskDesc });
    setTaskName(""); setTaskDesc(""); setShowForm(false);
    loadData();
  };

  // FUNGSI UPDATE TASK BARU
  const handleUpdateTask = async () => {
    if (!taskName.trim()) return alert("Task name wajib diisi");
    try {
      await updateTodoTask(selectedTaskId, { name: taskName, description: taskDesc });
      setShowUpdateForm(false);
      setTaskName(""); setTaskDesc("");
      loadData(); // Langsung refresh data
    } catch (error) {
      alert(error.message);
    }
  };

  const handleConfirmInactive = async () => {
    await inactiveTodoTask(selectedTaskId);
    setShowConfirm(false); 
    setSelectedTaskId(null);
    setShowUpdateForm(false); // Tutup form update juga
    loadData();
  };

  // Membuka form update dengan data awal
  const openUpdateForm = (task) => {
    setSelectedTaskId(task.id);
    setTaskName(task.name);
    setTaskDesc(task.description || "");
    setShowUpdateForm(true);
  };

 return (
    <div className="habit-wrapper">
      <div className="habit-container">
        <h1 className="habit-title">{monthName.toUpperCase()}</h1>

        {/* --- MAIN TRACKER TABLE --- */}
        <div className="table-responsive-wrapper">
          <table className="habit-table">
            <thead>
              <tr>
                <th className="task-col sticky-header">Task</th>
                {data.dates.map(date => (
                  <th key={date} className={date === todayStr ? "today-header" : ""}>
                    {date.slice(8)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.tasks.map(task => (
                <tr key={task.id}>
                  {/* Perbaikan: Klik nama task memanggil openUpdateForm */}
                  <td className="task-col task-clickable" onClick={() => openUpdateForm(task)}>
                    {task.name}
                  </td>
                  {data.dates.map(date => {
                    const cl = task.todoCheckLists.find(c => c.checkDate === date);
                    return (
                      <td key={date} className={date === todayStr ? "today-cell" : ""}>
                        {cl ? (
                          <input type="checkbox" className="checkbox-custom" checked={cl.isChecked} onChange={() => handleToggle(task.id, cl)} />
                        ) : <span className="empty-dash">—</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="add-task-section">
          <button className="add-task-btn" onClick={() => {
            setTaskName(""); setTaskDesc(""); setShowForm(true);
          }}>
            <span className="plus-icon">+</span> Add New Task
          </button>
        </div>

        <div className="section-spacer"></div>

        <div className="secondary-section">
          <div className="history-header">
            <h2 className="history-title">Activity History</h2>
            <div className="month-picker">
              <label>Month:</label>
              <select value={selectedMonth} onChange={(e) => {
                const m = parseInt(e.target.value);
                setSelectedMonth(m); loadReadonlyTable(m); loadAverage(m);
              }}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{new Date(2026, m - 1).toLocaleString("en-US", { month: "long" })}</option>
                ))}
              </select>
            </div>
          </div>

          {readonlyData && (
            <div className="table-responsive-wrapper readonly-margin">
              <table className="habit-table readonly-style">
                <thead>
                  <tr>
                    <th className="task-col">Task</th>
                    {readonlyData.dates.map(date => <th key={date}>{date.slice(8)}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {readonlyData.tasks.map(task => (
                    <tr key={task.id}>
                      <td className="task-col">{task.name}</td>
                      {readonlyData.dates.map(date => {
                        const cl = task.todoCheckLists.find(x => x.checkDate === date);
                        return <td key={date}>{cl?.isChecked ? "✔" : "—"}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {averageData.length > 0 && (
            <div className="average-card-container">
              <h3 className="section-subtitle">Monthly Performance</h3>
              <div className="modern-average-card">
                {averageData.map(item => (
                  <div key={item.taskId} className="avg-row">
                    <span className="avg-task-name">{item.taskName}</span>
                    <div className="avg-progress-bar">
                      <div className="avg-fill" style={{ width: `${item.average}%` }}></div>
                    </div>
                    <span className="avg-percentage">{item.average.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL ADD TASK */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-card modal-animate">
            <div className="modal-header">
              <h3>Create New Task</h3>
              <button className="close-x" onClick={() => setShowForm(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="input-group">
                <label>Task Name</label>
                <input type="text" placeholder="e.g. Morning Run" value={taskName} onChange={e => setTaskName(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Description (Optional)</label>
                <textarea placeholder="Write a short detail..." value={taskDesc} onChange={e => setTaskDesc(e.target.value)} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel-alt" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn-save-alt" onClick={handleAddTask}>Save Task</button>
            </div>
          </div>
        </div>
      )}

     {/* --- MODAL UPDATE TASK --- */}
      {showUpdateForm && (
        <div className="modal-overlay"> 
          {/* Overlay ini biasanya punya z-index: 1000 di CSS */}
          <div className="modal-card modal-animate">
            <div className="modal-header">
              <h3>Update Task</h3>
              <button className="close-x" onClick={() => setShowUpdateForm(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="input-group">
                <label>Task Name</label>
                <input type="text" value={taskName} onChange={e => setTaskName(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Description (Optional)</label>
                <textarea value={taskDesc} onChange={e => setTaskDesc(e.target.value)} />
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn-danger-alt" onClick={() => setShowConfirm(true)}>Delete</button>
              <div>
                <button className="btn-cancel-alt" style={{ marginRight: '8px' }} onClick={() => setShowUpdateForm(false)}>Cancel</button>
                <button className="btn-save-alt" onClick={handleUpdateTask}>Update Task</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL CONFIRM INACTIVE (Tumpukan paling atas) --- */}
      {showConfirm && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}> 
          {/* Kita paksa z-index lebih tinggi dari 1000 */}
          <div className="modal-card confirm-card modal-animate" style={{ zIndex: 2001 }}>
             <div className="modal-body text-center">
                <div className="warning-icon">!</div>
                <h3>Inactive Task?</h3>
                <p>This task will no longer appear in your daily tracker.</p>
             </div>
            <div className="modal-footer">
              <button className="btn-cancel-alt" onClick={() => setShowConfirm(false)}>Cancel</button>
              <button className="btn-danger-alt" onClick={handleConfirmInactive}>Yes, Inactive</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}