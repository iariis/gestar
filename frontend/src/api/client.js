// Cliente HTTP simple para hablar con el backend Flask.

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.error || "Error de red");
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  getPatients: () => request("/patients"),

  createPatient: (payload) =>
    request("/patients", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getBPRecords: () => request("/bp"),

  createBPRecord: (payload) =>
    request("/bp", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload) =>
    request("/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getSymptoms: (dni) =>
    request(`/symptoms/${encodeURIComponent(dni)}`),

  createSymptomRecord: (payload) =>
    request("/symptoms", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Mensajes del paciente
  getMessages: () => request("/messages"),

  createMessage: (payload) =>
    request("/messages", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Respuesta del enfermero - GT-104
  replyMessage: (messageId, reply) =>
    request(`/messages/${messageId}/reply`, {
      method: "POST",
      body: JSON.stringify({ reply }),
    }),
};