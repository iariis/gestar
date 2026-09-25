import { useState } from "react";

import PatientLoginForm from "./PatientLoginForm";
import SymptomsForm from "./SymptomsForm";
import PatientMessageForm from "./PatientMessageForm";

export default function PatientPortal({ onBack, showToast }) {
  const [currentPatient, setCurrentPatient] = useState(null);

  if (!currentPatient) {
    return (
      <PatientLoginForm
        onLogin={setCurrentPatient}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <SymptomsForm
        patient={currentPatient}
        onLogout={() => setCurrentPatient(null)}
        showToast={showToast}
      />

      <PatientMessageForm
        patient={currentPatient}
        showToast={showToast}
      />
    </div>
  );
}