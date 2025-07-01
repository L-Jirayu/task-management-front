const BASE_URL = "http://localhost:3000/todolist";

export async function getTodos() {
  const res = await fetch(BASE_URL);
  return await res.json();
}

export async function createTodo(data) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function updateTodo(id, data) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

export async function deleteTodo(id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  const text = await res.text();
  return text ? JSON.parse(text) : {};
}
