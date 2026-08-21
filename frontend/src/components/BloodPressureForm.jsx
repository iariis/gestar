import { useState } from "react";

export default function RecordBloodPressure({ patient }) {

    const [sistolica, setSistolica] = useState("");
    const [diastolica, setDiastolica] = useState("");
    const [resultado, setResultado] = useState(null);

    const registrarPresion = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:5000/api/bp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    patient_id: patient.id,
                    sistolica: sistolica,
                    diastolica: diastolica
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setResultado(data.errors);
                return;
            }

            setResultado(data);

            setSistolica("");
            setDiastolica("");

        } catch (error) {
            console.error("Error al registrar la presión:", error);
        }
    };

    return (
        <div>
            <h2>Record Blood Pressure</h2>

            <form onSubmit={registrarPresion}>

                <label>Systolic pressure:</label>

                <input
                    type="number"
                    value={sistolica}
                    onChange={(e) => setSistolica(e.target.value)}
                    placeholder="Ej: 120"
                    required
                />

                <label>Diastolic pressure:</label>

                <input
                    type="number"
                    value={diastolica}
                    onChange={(e) => setDiastolica(e.target.value)}
                    placeholder="Ej: 80"
                    required
                />

                <button type="submit">
                    Record
                </button>

            </form>

            {resultado && (
                <div>
                    <h3>{resultado.nivel}</h3>
                    <p>{resultado.mensaje}</p>
                </div>
            )}

        </div>
    );
}