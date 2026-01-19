import { useEffect, useState } from "react";
import { fetchHabitTracker, checkChecklist, uncheckChecklist } from "../api/habitApi";
import "./css/HabitTracker.css";

export default function HabitTracker({ userId }) {
  const [data, setData] = useState(null);
  userId = userId || 1;

  useEffect(() => {
    fetchHabitTracker(userId).then(setData);
  }, [userId]);

  if (!data) return <p>Loading...</p>;

  const todayStr = data.today;
  const monthName = new Date(todayStr).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });

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
      if (newChecked) {
        await checkChecklist(checklist.checkListId);
      } else {
        await uncheckChecklist(checklist.checkListId);
      }
    } catch (err) {
      console.error("Failed to update checklist", err);
      setData(prev => ({
        ...prev,
        tasks: prev.tasks.map(task =>
          task.id !== taskId
            ? task
            : {
                ...task,
                todoCheckLists: task.todoCheckLists.map(cl =>
                  cl.checkListId === checklist.checkListId
                    ? { ...cl, isChecked: checklist.isChecked }
                    : cl
                )
              }
        )
      }));
    }
  };

  return (
    <div className="habit-wrapper">
      <div className="habit-container">
        <div className="habit-title">{monthName.toUpperCase()}</div>

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
                <td className="task-col">{task.name}</td>

                {data.dates.map(date => {
                  const checklist = task.todoCheckLists.find(cl => cl.checkDate === date);
                  const isToday = date === todayStr;

                  return (
                    <td key={date} className={isToday ? "today-cell" : ""}>
                      {checklist ? (
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={checklist.isChecked}
                          onChange={() => handleToggle(task.id, checklist)}
                        />
                      ) : (
                        <span className="empty-cell">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
