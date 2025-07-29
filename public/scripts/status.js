async function fetchStatus() {
  try {
    const response = await fetch("/api/status");
    if (!response.ok) throw new Error("Failed to load status");
    const data = await response.json();
    displayStatus(data.monitors);
  } catch (err) {
    document.getElementById("status-container").innerText = "Error loading status.";
  }
}

function displayStatus(monitors) {
  const container = document.getElementById("status-container");
  container.innerHTML = "";

  const statusMap = {
    0: { text: "🔴 DOWN", class: "down" },
    1: { text: "🟠 MAYBE", class: "paused" },
    2: { text: "🟢 UP", class: "up" },
    8: { text: "🟠 NOT CHECKED YET", class: "paused" },
    9: { text: "⏸️ PAUSED", class: "paused" },
  };

  monitors.forEach(monitor => {
    const { text, class: className } = statusMap[monitor.status] || { text: "❓ UNKNOWN", class: "" };

    const div = document.createElement("div");
    div.className = "monitor";
    div.innerHTML = `
      <h2>${monitor.friendly_name}</h2>
      <p class="status ${className}">Status: ${text}</p>
    `;
    container.appendChild(div);
  });
}

document.addEventListener("DOMContentLoaded", fetchStatus);
