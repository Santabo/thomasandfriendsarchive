(async () => {
  // Skip redirect if already on a language-specific path
  const pathMatch = window.location.pathname.match(/^\/([a-z]{2}-[a-z]{2})(\/|$)/i);
  if (pathMatch) return;

  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    const country = data.country_code?.toUpperCase();

    const lang = (country === "US") ? "en-us" : "en-gb";
    window.location.replace(`/${lang}`);
  } catch (err) {
    console.error("Geolocation redirect failed:", err);
  }
})();
