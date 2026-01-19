const BASE_URL = "http://localhost:8080/api";

export async function fetchHabitTracker(userId) {
  try {
    const res = await fetch(`${BASE_URL}/todo-task/get-checklist-byMonth?userId=${userId}`, {
      method: "POST", // karena endpoint GET
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const response = await res.json();
    console.log("Full response:", response);

    // Ambil object habit tracker dari response.data
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
