export default async function handler(req, res) {
  const apiKey = process.env.UPTIMEROBOT_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API key not found" });
  }

  try {
    const response = await fetch("https://api.uptimerobot.com/v2/getMonitors", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        api_key: apiKey,
        format: "json"
      })
    });

    const data = await response.json();

    if (data.stat === "fail") {
      return res.status(500).json({ error: data.error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch data from UptimeRobot" });
  }
}
