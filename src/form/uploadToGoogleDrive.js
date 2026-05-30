const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw-Nhm5dLAYcDu3V1oMPsK28NLBhpDxhw7ESX2C9YKQKu7CXopMxFU0c4yJv2p-RjE13A/exec"; // ← Replace after deploying

export async function uploadFilesToDrive(files, userName, folderId = null) {
  const fileArray = Array.from(files);
  if (fileArray.length === 0) return [];

  // Convert each file to Base64
  const base64Files = await Promise.all(
    fileArray.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () =>
            resolve({
              name: file.name,
              mimeType: file.type,
              data: reader.result.split(",")[1], // strip data-URI prefix
            });
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    )
  );

  const response = await fetch(SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({
      action: "uploadFiles",
      userName,
      files: base64Files,
      folderId,
    }),
  });

  const text = await response.text();
  const result = JSON.parse(text);

  if (result.success && result.links) {
    return { links: result.links, folderId: result.folderId };
  }

  return [];
}
