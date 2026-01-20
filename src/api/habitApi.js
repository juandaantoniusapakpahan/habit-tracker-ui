const BASE_URL = "http://localhost:8080/api";

export async function fetchHabitTracker(userId, month) {
  try {
    const res = await fetch(`${BASE_URL}/todo-task/get-checklist-byMonth?userId=${userId}&month=${month}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const response = await res.json();
    console.log("Full response:", response);


    return response.data;
  } catch (err) {
    console.error("Fetch error:", err);
  }
}
export async function checkChecklist(checklistId) {
  return fetch(`${BASE_URL}/todo-check-list/check?checkId=${checklistId}`, {
    method: "POST"
  });
}

export async function uncheckChecklist(checklistId) {
  return fetch(`${BASE_URL}/todo-check-list/uncheck?checkId=${checklistId}`, {
    method: "POST"
  });
}


export async function addTodoTask(userId, payload) {
  const res = await fetch(
    `${BASE_URL}/todo-task/register?userId=${userId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }
  );

  if (!res.ok) {
    throw new Error("Failed to add task");
  }

  return res.json();
}


export async function inactiveTodoTask(taskId) {
  return fetch(`${BASE_URL}/todo-task/soft-delete?taskId=${taskId}`, {
    method: "POST"
  });
}


export async function fetchHabitTrackerReadonly(userId, month) {
  try {
    const res = await fetch(`${BASE_URL}/todo-task/get-checklist-byMonth?userId=${userId}&month=${month}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const response = await res.json();
    console.log("Full response:", response);


    return response.data;
  } catch (err) {
    console.error("Fetch error:", err);
  }
}


export async function getchMontlyTaskAvg(userId, month) {
  try {
    const res = await fetch(`${BASE_URL}/todo-task/get-prt-byMonth?userId=${userId}&month=${month}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const response = await res.json();
    
    // Kembalikan tasks-nya saja agar di UI tinggal pakai .map()
    return response.data?.tasks || []; 
  } catch (err) {
    console.error("Fetch error:", err);
    return []; // Kembalikan array kosong jika error
  }
}