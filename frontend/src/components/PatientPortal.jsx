import { useEffect, useState } from "react";

import PatientLoginForm from "./PatientLoginForm";
import SymptomsForm from "./SymptomsForm";
import RecordBloodPressure from "./RecordBloodPressure";
import ConfirmLogoutModal from "./ConfirmLogoutModal";

import { api } from "../api/client";

export default function PatientPortal({ onBack, showToast }) {
  const [currentPatient, setCurrentPatient] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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

      showToast("Recordatorio guardado correctamente.");
    } catch (error) {
      console.error(error);
      showToast("No se pudo guardar el recordatorio.");
    } finally {
      setSavingReminder(false);
    }
  };

  // Comprueba cada segundo si llegó la hora del recordatorio
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
    <div className="min-h-screen w-full bg-gray-50 px-4 py-8 flex flex-col items-center">

      {/* AVISO DEL RECORDATORIO */}
      {showReminderAlert && (
        <div className="w-full max-w-lg mb-4 bg-blue-50 border border-blue-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-semibold text-blue-800">
                🔔 Es hora de registrar tu presión arterial
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

      {/* ENCABEZADO */}
      <div className="w-full max-w-lg flex justify-between items-center mb-6">
        <h1 className="text-lg font-semibold text-gray-800">
          Hola, {currentPatient.nombre} 👋
        </h1>

        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          Salir
        </button>
      </div>

      {/* SÍNTOMAS */}
      <SymptomsForm
        patient={currentPatient}
        showToast={showToast}
      />

      {/* PRESIÓN ARTERIAL */}
      <RecordBloodPressure
        patient={currentPatient}
        showToast={showToast}
      />

      {/* RECORDATORIO DE PRESIÓN */}
      <div className="w-full max-w-lg bg-white rounded-xl shadow-sm p-5 mt-4">

        <h2 className="text-base font-semibold text-gray-800 mb-2">
          ⏰ Recordatorio de presión
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
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <button
          onClick={handleSaveReminder}
          disabled={savingReminder}
          className="w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 disabled:opacity-50"
        >
          {savingReminder ? "Guardando..." : "Guardar recordatorio"}
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

      {/* MODAL DE CIERRE DE SESIÓN */}
      <ConfirmLogoutModal
        open={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          showToast("Sesión cerrada correctamente.");
          setCurrentPatient(null);
          setReminders([]);
          setShowReminderAlert(false);
        }}
      />

    </div>
  );
}