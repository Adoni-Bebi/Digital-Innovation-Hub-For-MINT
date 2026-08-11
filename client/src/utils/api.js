const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("dih_token");

  const isFormData = options.body instanceof FormData;

  const config = {
    method: options.method || "GET",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(!isFormData && !options.blob && { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
  };

  if (options.body) {
    config.body = isFormData ? options.body : JSON.stringify(options.body);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, config);

  // Binary download (PDF, etc.)
  if (options.blob) {
    if (!res.ok) {
      let message = "Download failed";
      try {
        const err = await res.json();
        message = err.message || message;
      } catch {
        // ignore
      }
      throw new Error(message);
    }
    return res.blob();
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}