const BASE_URL = "http://localhost:8080/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
};

export async function fetchHabitTracker(month) {
  try {
    const res = await fetch(`${BASE_URL}/todo-task/get-checklist-byMonth?month=${month}`, {
      method: "POST",
      headers: getAuthHeaders()
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const response = await res.json();
    return response.data;
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

export async function checkChecklist(checklistId) {
  return fetch(`${BASE_URL}/todo-check-list/check?checkId=${checklistId}`, {
    method: "POST",
    headers: getAuthHeaders()
  });
}

export async function uncheckChecklist(checklistId) {
  return fetch(`${BASE_URL}/todo-check-list/uncheck?checkId=${checklistId}`, {
    method: "POST",
    headers: getAuthHeaders()
  });
}

export async function addTodoTask(payload) {
  const res = await fetch(`${BASE_URL}/todo-task/register`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error("Failed to add task");
  return res.json();
}

export async function inactiveTodoTask(taskId) {
  return fetch(`${BASE_URL}/todo-task/soft-delete?taskId=${taskId}`, {
    method: "POST",
    headers: getAuthHeaders()
  });
}

export async function fetchHabitTrackerReadonly(month) {
  try {
    const res = await fetch(`${BASE_URL}/todo-task/get-checklist-byMonth?month=${month}&history=true`, {
      method: "POST",
      headers: getAuthHeaders()
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const response = await res.json();
    return response.data;
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

export async function getchMontlyTaskAvg(month) {
  try {
    const res = await fetch(`${BASE_URL}/todo-task/get-prt-byMonth?month=${month}`, {
      method: "POST",
      headers: getAuthHeaders()
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const response = await res.json();
    return response.data?.tasks || []; 
  } catch (err) {
    console.error("Fetch error:", err);
    return [];
  }
}

export async function updateTodoTask(taskId, payload) {
  const res = await fetch(`${BASE_URL}/todo-task/update?taskId=${taskId}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error("Failed to update task");
  return res.json();
}

export const loginUser = async (credentials) => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    });
    return response.json();
};

export const registerUser = async (userData) => {
    const response = await fetch(`${BASE_URL}/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    return response.json();
};