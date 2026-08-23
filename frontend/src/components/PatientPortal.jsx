import { useState } from "react";
import PatientLoginForm from "./PatientLoginForm";
import SymptomsForm from "./SymptomsForm";
import RecordWeight from "./RecordWeight";
import BloodPressureForm from "./BloodPressureForm";
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
        <>
            <SymptomsForm
                patient={currentPatient}
                onLogout={() => setCurrentPatient(null)}
                showToast={showToast}
            />
            <BloodPressureForm
                patient={currentPatient}
            />
            <RecordWeight
                patient={currentPatient}
            />
        </>
    );
}