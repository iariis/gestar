import { useEffect, useState } from "react";

import { api } from "../api/client";

export default function PatientMessageForm({ patient, showToast }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);

  const loadMessages = async () => {
    try {
      const data = await api.getMessages();

      const patientMessages = data.filter(
        (item) => item.patient_dni === patient.dni
      );

      setMessages(patientMessages);
    } catch (err) {
      console.error("Error al cargar mensajes:", err);
    }
  };

  useEffect(() => {
    if (!patient) return;

    loadMessages();

    // Actualiza los mensajes cada 3 segundos
    const interval = setInterval(() => {
      loadMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [patient]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const text = message.trim();

    if (!text) {
      showToast("Escribí un mensaje antes de enviarlo", false);
      return;
    }

    if (text.length > 500) {
      showToast(
        "El mensaje no puede superar los 500 caracteres",
        false
      );
      return;
    }

    try {
      setLoading(true);

      await api.createMessage({
        patient_dni: patient.dni,
        message: text,
      });

      setMessage("");

      await loadMessages();

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
    <div>
      {/* ENVIAR MENSAJE */}
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

      {/* MIS MENSAJES */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm mt-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Mis mensajes
        </h2>

        {messages.length === 0 ? (
          <p className="text-sm text-gray-500">
            Todavía no tenés mensajes enviados.
          </p>
        ) : (
          <div className="space-y-4">
            {messages.map((item) => (
              <div
                key={item.id}
                className="border border-gray-100 rounded-lg p-4"
              >
                {/* MENSAJE DE LA PACIENTE */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-500 mb-1">
                    Mi mensaje
                  </p>

                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {item.message}
                  </p>

                  <p className="text-xs text-gray-400 mt-2">
                    {item.fecha} - {item.hora}
                  </p>
                </div>

                {/* RESPUESTA DEL ENFERMERO */}
                {item.reply ? (
                  <div className="bg-purple-50 rounded-lg p-4 mt-3">
                    <p className="text-xs font-semibold text-purple-700 mb-1">
                      Respuesta del enfermero
                    </p>

                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {item.reply}
                    </p>

                    <p className="text-xs text-gray-400 mt-2">
                      Respondido el {item.fecha_respuesta} a las{" "}
                      {item.hora_respuesta}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 mt-3">
                    Esperando respuesta del enfermero...
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}