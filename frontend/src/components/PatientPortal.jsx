
import { useEffect, useState } from "react";

import PatientLoginForm from "./PatientLoginForm";
import SymptomsForm from "./SymptomsForm";
import PatientMessageForm from "./PatientMessageForm";

import { api } from "../api/client";

export default function PatientPortal({ onBack, showToast }) {
  const [currentPatient, setCurrentPatient] = useState(null);

  const [horario, setHorario] = useState("08:00");
  const [savingReminder, setSavingReminder] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [showReminderAlert, setShowReminderAlert] = useState(false);

  const loadReminders = async (patientId) => {
    try {
      const data = await api.getReminders(patientId);
      setReminders(data);
    } catch (error) {
      console.error("Error al cargar recordatorios:", error);
    }
  };

  const handleLogin = (patient) => {
    setCurrentPatient(patient);
    loadReminders(patient.id);
  };

  const handleSaveReminder = async () => {
    if (!currentPatient) return;

    setSavingReminder(true);

    try {
      await api.configureReminder({
        patient_id: currentPatient.id,
        tipo: "mañana",
        horario,
      });

      await loadReminders(currentPatient.id);

      showToast("Recordatorio guardado correctamente.", true);
    } catch (error) {
      console.error(error);

      showToast(
        error.data?.error ||
          "No se pudo guardar el recordatorio.",
        false
      );
    } finally {
      setSavingReminder(false);
    }
  };

  useEffect(() => {
    if (!currentPatient || reminders.length === 0) return;

    const checkReminder = () => {
      const now = new Date();

      const currentHour = String(now.getHours()).padStart(2, "0");
      const currentMinute = String(now.getMinutes()).padStart(2, "0");

      const currentTime = `${currentHour}:${currentMinute}`;

      const reminderExists = reminders.some(
        (reminder) => reminder.horario === currentTime
      );

      if (reminderExists) {
        setShowReminderAlert(true);
      }
    };

    checkReminder();

    const interval = setInterval(checkReminder, 1000);

    return () => clearInterval(interval);
  }, [currentPatient, reminders]);

  if (!currentPatient) {
    return (
      <PatientLoginForm
        onLogin={handleLogin}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">

      {/* AVISO DEL RECORDATORIO */}
      {showReminderAlert && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-semibold text-blue-800">
                Es hora de controlar tu presión
              </h2>

              <p className="text-sm text-blue-700 mt-1">
                Recordá registrar tu presión arterial.
              </p>
            </div>

            <button
              onClick={() => setShowReminderAlert(false)}
              className="text-blue-400 hover:text-blue-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* SÍNTOMAS */}
      <SymptomsForm
        patient={currentPatient}
        onLogout={() => setCurrentPatient(null)}
        showToast={showToast}
      />

      {/* MENSAJES */}
      <PatientMessageForm
        patient={currentPatient}
        showToast={showToast}
      />

      {/* RECORDATORIO DE PRESIÓN */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mt-6">

        <h2 className="text-base font-semibold text-gray-800 mb-2">
          Recordatorio de presión
        </h2>

        <p className="text-sm text-gray-500 mb-4">
          Elegí la hora en la que querés recibir el recordatorio.
        </p>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">
            Hora
          </label>

          <input
            type="time"
            value={horario}
            onChange={(e) => setHorario(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2"
          />
        </div>

        <button
          onClick={handleSaveReminder}
          disabled={savingReminder}
          className="w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 disabled:opacity-50"
        >
          {savingReminder
            ? "Guardando..."
            : "Guardar recordatorio"}
        </button>

        {/* RECORDATORIOS GUARDADOS */}
        {reminders.length > 0 && (
          <div className="mt-5">

            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Mi recordatorio
            </h3>

            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2"
              >
                <span className="text-sm text-gray-700">
                  Recordatorio de presión
                </span>

                <span className="font-medium text-sm text-gray-800">
                  {reminder.horario}
                </span>
              </div>
            ))}

          </div>
        )}
      </div>
    </div>
  );
}

