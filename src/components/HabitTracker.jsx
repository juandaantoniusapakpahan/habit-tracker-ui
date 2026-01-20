import { useEffect, useState } from "react";
import {
  fetchHabitTracker,
  fetchHabitTrackerReadonly,
  checkChecklist,
  uncheckChecklist,
  addTodoTask,
  inactiveTodoTask,
  getchMontlyTaskAvg
} from "../api/habitApi";
import "./css/HabitTracker.css";

export default function HabitTracker({ userId }) {
  userId = userId || 1;

  const currentMonth = new Date().getMonth() + 1;

  const [data, setData] = useState(null);

  // ===== NEW STATE (AMAN)
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [averageData, setAverageData] = useState(null);
  const [readonlyData, setReadonlyData] = useState(null);

  // state untuk add task
  const [showForm, setShowForm] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  /** =========================
   * LOAD MAIN TABLE (LAMA)
   ========================== */
  const loadData = async () => {
    const result = await fetchHabitTracker(userId, currentMonth);
    setData(result);
  };

  /** =========================
   * LOAD READONLY TABLE (BARU)
   ========================== */
  const loadReadonlyTable = async (month) => {
    const result = await fetchHabitTrackerReadonly(userId, month);
    setReadonlyData(result);
  };

  const loadAverage = async (month) => {
    setAverageData(await getchMontlyTaskAvg(userId, month));
  };

  useEffect(() => {
    loadData();
    loadReadonlyTable(currentMonth);
    //loadAverage(currentMonth);
  }, [userId]);

  if (!data) return <p>Loading...</p>;

  const todayStr = data.today;
  const monthName = new Date(todayStr).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });

  /** =========================
   * CHECK / UNCHECK
   ========================== */
  const handleToggle = async (taskId, checklist) => {
    const newChecked = !checklist.isChecked;

    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id !== taskId
          ? task
          : {
            ...task,
            todoCheckLists: task.todoCheckLists.map(cl =>
              cl.checkListId === checklist.checkListId
                ? { ...cl, isChecked: newChecked }
                : cl
            )
          }
      )
    }));

    try {
      newChecked
        ? await checkChecklist(checklist.checkListId)
        : await uncheckChecklist(checklist.checkListId);
    } catch {
      loadData();
    }
  };

  /** =========================
   * ADD TASK
   ========================== */
  const handleAddTask = async () => {
    if (!taskName.trim()) return alert("Task name wajib diisi");

    await addTodoTask(userId, {
      name: taskName,
      description: taskDesc
    });

    setTaskName("");
    setTaskDesc("");
    setShowForm(false);
    loadData();
  };

  /** =========================
   * INACTIVE TASK
   ========================== */
  const handleConfirmInactive = async () => {
    await inactiveTodoTask(selectedTaskId);
    setShowConfirm(false);
    setSelectedTaskId(null);
    loadData();
  };



  /** =========================
   * MONTH PICKER HANDLER
   ========================== */
  const handleMonthChange = async (e) => {
    const monthInt = parseInt(e.target.value);
    setSelectedMonth(monthInt);
    loadReadonlyTable(monthInt);
    //loadAverage(monthInt)
  };

  return (
    <div className="habit-wrapper">
      <div className="habit-container">

        {/* HEADER */}
        <div className="habit-title">{monthName.toUpperCase()}</div>

        {/* ADD TASK FORM */}
        {showForm && (
          <div className="add-task-overlay">
            <div className="add-task-card">
              <h3>Add New Task</h3>

              <input
                type="text"
                placeholder="Task name"
                value={taskName}
                onChange={e => setTaskName(e.target.value)}
              />

              <textarea
                placeholder="Description (optional)"
                value={taskDesc}
                onChange={e => setTaskDesc(e.target.value)}
              />

              <div className="form-actions">
                <button className="btn-primary" onClick={handleAddTask}>
                  Save
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showConfirm && (
          <div className="confirm-overlay">
            <div className="confirm-card">
              <h3>Confirmation</h3>
              <p>Are you sure to inactive task?</p>

              <div className="confirm-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </button>

                <button
                  className="btn-danger"
                  onClick={handleConfirmInactive}
                >
                  Yes, Inactive
                </button>
              </div>
            </div>
          </div>
        )}
        {/* ================= MAIN TABLE ================= */}
        <table className="habit-table">
          <thead>
            <tr>
              <th className="task-col">Task</th>
              {data.dates.map(date => (
                <th key={date}>{date.slice(8)}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.tasks.map(task => (
              <tr key={task.id}>
                <td
                  className="task-col task-clickable"
                  onClick={() => setSelectedTaskId(task.id) || setShowConfirm(true)}
                >
                  {task.name}
                </td>

                {data.dates.map(date => {
                  const checklist = task.todoCheckLists.find(
                    cl => cl.checkDate === date
                  );

                  return (
                    <td key={date}>
                      {checklist ? (
                        <input
                          type="checkbox"
                          checked={checklist.isChecked}
                          onChange={() => handleToggle(task.id, checklist)}
                        />
                      ) : "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="add-task-bottom">
          <button className="add-task-btn" onClick={() => setShowForm(true)}>
            ＋ Add Task
          </button>
        </div>

        {/* ================= MONTH PICKER (BAWAH) ================= */}
        <div className="secondary-section">
          <div className="month-picker">
            <label>Month:</label>
            <select value={selectedMonth} onChange={handleMonthChange}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>
                  {new Date(2026, m - 1).toLocaleString("en-US", { month: "long" })}
                </option>
              ))}
            </select>
          </div>

          {/* ================= READ ONLY TABLE ================= */}
          {readonlyData && (
            <table className="habit-table readonly">
              <thead>
                <tr>
                  <th className="task-col">Task</th>
                  {readonlyData.dates.map(date => (
                    <th key={date}>{date.slice(8)}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {readonlyData.tasks.map(task => (
                  <tr key={task.id}>
                    <td className="task-col">{task.name}</td>
                    {readonlyData.dates.map(date => {
                      const cl = task.todoCheckLists.find(
                        x => x.checkDate === date
                      );
                      return <td key={date}>{cl && cl.isChecked ? "✔" : "—"}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

          )}

          {averageData && (
            <table className="average-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Average (%)</th>
                </tr>
              </thead>
              <tbody>
                {averageData.map(item => (
                  <tr key={item.taskId}>
                    <td>{item.taskName}</td>
                    <td>{item.average.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
