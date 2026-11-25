const API = "https://gmail.googleapis.com/gmail/v1/users/me/messages";

// format the gmail body
const text = (p) =>
  p.body?.data
    ? atob(p.body.data.replace(/-/g, "+").replace(/_/g, "/"))
    : (p.parts || []).map(text).join("\n");

// function to get otp from gmail
const waitForOTP = async (since) => {
  const { token } = await chrome.identity.getAuthToken({ interactive: true });
  const get = async (url) => {
    const response = await fetch(API + url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();

    return data;
  };

  const q = encodeURIComponent(
    `from:noreply@mailer.iith.ac.in after:${Math.floor(since / 1000)}`,
  );

  // poll for otp 20 times
  for (let i = 0; i < 20; i++) {
    const { messages } = await get(`?q=${q}&maxResults=1`);
    const body = messages
      ? text((await get(`/${messages[0].id}?format=full`)).payload)
      : "";
    const otp = body.match(/OTP\D{0,30}(\d{6})/i)?.[1];
    if (otp) return otp;
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new Error("OTP email not found within 60s");
};

// listen for content.js message
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  waitForOTP(msg.since).then(
    (otp) => sendResponse({ otp }),
    (e) => sendResponse({ error: e.message }),
  );
  return true;
});
