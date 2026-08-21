// Cliente HTTP simple para hablar con el backend Flask.
// En desarrollo, Vite reenvía /api al backend en el puerto 5000.
const BASE_URL = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
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
    request("/patients", { method: "POST", body: JSON.stringify(payload) }),

  getBPRecords: () => request("/bp"),
  createBPRecord: (payload) =>
    request("/bp", { method: "POST", body: JSON.stringify(payload) }),

  login: (payload) =>
    request("/login", { method: "POST", body: JSON.stringify(payload) }),

  getSymptoms: (dni) => request(`/symptoms/${encodeURIComponent(dni)}`),
  createSymptomRecord: (payload) =>
    request("/symptoms", { method: "POST", body: JSON.stringify(payload) }),

  registerNurse: (payload) =>
    request("/nurse/register", { method: "POST", body: JSON.stringify(payload) }),
  loginNurse: (payload) =>
    request("/nurse/login", { method: "POST", body: JSON.stringify(payload) }),
  logoutNurse: () => request("/nurse/logout", { method: "POST" }),
  getMe: () => request("/nurse/me"),

  getWeights: () => request("/weights"),
  createWeightRecord: (payload) =>
    request("/weights", { method: "POST", body: JSON.stringify(payload) }),
  getAlerts: () => request("/alerts"),
};
