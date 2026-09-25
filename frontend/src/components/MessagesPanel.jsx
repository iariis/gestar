import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function MessagesPanel({ showToast }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const [replyLoading, setReplyLoading] = useState(null);

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

  const handleReply = async (messageId) => {
    const reply = (replyText[messageId] || "").trim();

    if (!reply) {
      showToast("Escribí una respuesta antes de enviarla", false);
      return;
    }

    if (reply.length > 500) {
      showToast(
        "La respuesta no puede superar los 500 caracteres",
        false
      );
      return;
    }

    try {
      setReplyLoading(messageId);

      const updatedMessage = await api.replyMessage(
        messageId,
        reply
      );

      setMessages((prev) =>
        prev.map((item) =>
          item.id === messageId ? updatedMessage : item
        )
      );

      setReplyText((prev) => ({
        ...prev,
        [messageId]: "",
      }));

      showToast("Respuesta enviada correctamente", true);
    } catch (err) {
      showToast(
        err.data?.error ||
          err.message ||
          "No se pudo enviar la respuesta",
        false
      );
    } finally {
      setReplyLoading(null);
    }
  };

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
          <p className="text-gray-500">
            Cargando mensajes...
          </p>
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

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-xs font-semibold text-gray-500 mb-1">
                  Mensaje del paciente
                </p>

                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {item.message}
                </p>
              </div>

              {item.reply ? (
                <div className="bg-purple-50 rounded-lg p-4">
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
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">
                    Responder
                  </p>

                  <textarea
                    value={replyText[item.id] || ""}
                    onChange={(e) =>
                      setReplyText((prev) => ({
                        ...prev,
                        [item.id]: e.target.value,
                      }))
                    }
                    placeholder="Escribí una respuesta..."
                    maxLength={500}
                    rows={4}
                    className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-200"
                  />

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">
                      {(replyText[item.id] || "").length}/500
                      caracteres
                    </span>

                    <button
                      onClick={() => handleReply(item.id)}
                      disabled={replyLoading === item.id}
                      className="bg-purple-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
                    >
                      {replyLoading === item.id
                        ? "Enviando..."
                        : "Enviar respuesta"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}