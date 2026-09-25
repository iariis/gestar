import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function MessagesPanel({ showToast }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await api.getMessages();
      setMessages(data);
    } catch (err) {
      showToast(
        err.message || "No se pudieron cargar los mensajes",
        false
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Mensajes de pacientes
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Consultas y mensajes enviados por las embarazadas.
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <p className="text-gray-500">Cargando mensajes...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500">
            No hay mensajes de pacientes.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h2 className="font-semibold text-gray-800">
                    {item.patient_name}
                  </h2>

                  <p className="text-xs text-gray-400 mt-1">
                    DNI: {item.patient_dni}
                  </p>
                </div>

                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {item.fecha} - {item.hora}
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {item.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}