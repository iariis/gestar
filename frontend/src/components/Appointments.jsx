import { useState } from "react";

export default function Agenda() {
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      patient: "María González",
      date: "08/10/2026",
      time: "10:00",
      type: "Control de presión",
      status: "Pendiente",
    },
    {
      id: 2,
      patient: "Ana Martínez",
      date: "08/10/2026",
      time: "11:30",
      type: "Control prenatal",
      status: "Pendiente",
    },
  ]);

  const handleComplete = (id) => {
    setAppointments((prev) =>
      prev.map((appointment) =>
        appointment.id === id
          ? { ...appointment, status: "Realizado" }
          : appointment
      )
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Agenda
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Próximos controles y consultas de las embarazadas.
        </p>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500">
            No hay turnos registrados.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-gray-800">
                    {appointment.patient}
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    {appointment.type}
                  </p>
                </div>

                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full ${
                    appointment.status === "Realizado"
                      ? "bg-green-50 text-green-700"
                      : "bg-yellow-50 text-yellow-700"
                  }`}
                >
                  {appointment.status}
                </span>
              </div>

              <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
                <span>📅 {appointment.date}</span>
                <span>🕐 {appointment.time}</span>
              </div>

              {appointment.status === "Pendiente" && (
                <button
                  onClick={() => handleComplete(appointment.id)}
                  className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700"
                >
                  Marcar como realizado
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}