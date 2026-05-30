export async function submitToGoogle(data) {
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw-Nhm5dLAYcDu3V1oMPsK28NLBhpDxhw7ESX2C9YKQKu7CXopMxFU0c4yJv2p-RjE13A/exec"; // ← Replace after deploying

  const response = await fetch(SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Network error: ${response.status}`);
  }

  const text = await response.text();

  let result;
  try {
    result = JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON response from server");
  }

  if (!result.success) {
    throw new Error(result.error || "Submission failed");
  }

  return result;
}
