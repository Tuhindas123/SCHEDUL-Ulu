export async function findFileByName(filename, accessToken) {
  const query = encodeURIComponent(`name = '${filename}' and trashed = false`);
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || "Drive search failed");
  }

  const data = await res.json();
  return data.files?.[0] || null;
}

export async function uploadToDrive(blob, filename, accessToken) {
  const existing = await findFileByName(filename, accessToken);

  const metadata = {
    name: filename,
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };

  const form = new FormData();
  form.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" })
  );
  form.append("file", blob);

  const url = existing
    ? `https://www.googleapis.com/upload/drive/v3/files/${existing.id}?uploadType=multipart`
    : "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";

  const res = await fetch(url, {
    method: existing ? "PATCH" : "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || "Drive upload failed");
  }

  return res.json();
}
