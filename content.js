const EMAIL = "ADD_YOUR_EMAIL";

const post = async (url, body) => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Tenant-Key": "iith" }, // same headers Pulse sends
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail?.message || `${url} failed: ${res.status}`); // e.g. rate limit message
  }

  return res.json();
};

const helper = async () => {
  if (sessionStorage.getItem("disha.access_token")) return; // already logged in

  // one attempt per min
  if (Date.now() - Number(sessionStorage.getItem("pulseLoginTried")) < 60000)
    return;

  sessionStorage.setItem("pulseLoginTried", Date.now());

  const ui = showOverlay(); // from overlay.js
  try {
    const since = Date.now();
    const { challenge_id } = await post("/api/auth/otp/request", {
      identifier: EMAIL,
    });
    ui.step(1);

    const { otp, error } = await chrome.runtime.sendMessage({ since }); // send message to background worker

    if (error) {
      throw new Error(error);
    }
    ui.step(2);

    const data = await post("/api/auth/otp/verify", { challenge_id, otp });

    for (const k of ["access_token", "refresh_token", "session_id"]) {
      sessionStorage.setItem(`disha.${k}`, data[k]);
    }

    // Pulse wipes the tokens on load unless it also finds the student id here
    localStorage.setItem("disha.session", data.student_id);
    if (data.profile?.role)
      localStorage.setItem("disha.role", data.profile.role);

    ui.step(3);
    setTimeout(() => (location.href = "/dashboard"), 350); // let the last check land
  } catch (e) {
    ui.fail(e.message);
    console.error(e);
  }
};

helper();
