import { useState } from "react";

export default function RecordWeight({ patient }) {

    const [peso, setPeso] = useState("");
    const [resultado, setResultado] = useState(null);

    const registrarPeso = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:5000/api/weight", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    patient_id: patient.id,
                    peso: peso
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setResultado(data.errors);
                return;
            }

            setResultado(data);
            setPeso("");

        } catch (error) {
            console.error("Error al registrar el peso:", error);
        }
    };

    return (
        <div>
            <h2>Record Weight</h2>

            <form onSubmit={registrarPeso}>

                <label>Weight:</label>

                <input
                    type="number"
                    step="0.1"
                    value={peso}
                    onChange={(e) => setPeso(e.target.value)}
                    placeholder="Ej: 68.5"
                    required
                />

                <span> kg</span>

                <button type="submit">
                    Record
                </button>

            </form>

            {resultado && resultado.peso && (
                <div>
                    <h3>Weight registered</h3>
                    <p>Peso: {resultado.peso} kg</p>
                    <p>Fecha: {resultado.fecha}</p>
                    <p>Hora: {resultado.hora}</p>
                </div>
            )}

        </div>
    );
}