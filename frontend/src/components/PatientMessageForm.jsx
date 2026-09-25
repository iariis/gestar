import { useState } from "react";
import { api } from "../api/client";

export default function PatientMessageForm({ patient, showToast }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const text = message.trim();

    if (!text) {
      showToast("Escribí un mensaje antes de enviarlo", false);
      return;
    }

    if (text.length > 500) {
      showToast("El mensaje no puede superar los 500 caracteres", false);
      return;
    }

    try {
      setLoading(true);

      await api.createMessage({
        patient_dni: patient.dni,
        message: text,
      });

      setMessage("");
      showToast("Mensaje enviado correctamente", true);
    } catch (err) {
      showToast(
        err.data?.errors?.message ||
          err.data?.errors?.patient_dni ||
          err.message ||
          "No se pudo enviar el mensaje",
        false
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm mt-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">
        Enviar mensaje al enfermero
      </h2>

      <p className="text-sm text-gray-500 mb-4">
        Escribí tu consulta o mensaje para el personal de salud.
      </p>

      <form onSubmit={handleSubmit}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escribí tu mensaje..."
          maxLength={500}
          rows={5}
          className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-200"
        />

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-400">
            {message.length}/500 caracteres
          </span>

          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar mensaje"}
          </button>
        </div>
      </form>
    </div>
  );
}