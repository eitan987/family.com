let familyId = localStorage.getItem("familyId") || "demo";

async function loadData() {
  const res = await fetch(`/data/${familyId}`);
  const result = await res.json();
  tasks = result.tasks || [];
  events = result.events || [];
  messages = result.messages || [];
  renderTasks();
  renderCalendar();
  renderMessages();
}

async function saveData() {
  const body = {
    tasks,
    events,
    messages
  };
  await fetch(`/data/${familyId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
}