import { useState } from "react";

function RecordBloodPressure() {
    const [systolic, setSystolic] = useState("");
    const [diastolic, setDiastolic] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        console.log("Systolic:", systolic);
        console.log("Diastolic:", diastolic);
    };

    return (
        <div>
            <h2>Record Blood Pressure</h2>

            <form onSubmit={handleSubmit}>

                <label>Systolic pressure:</label>
                <input
                    type="number"
                    value={systolic}
                    onChange={(e) => setSystolic(e.target.value)}
                />

                <label>Diastolic pressure:</label>
                <input
                    type="number"
                    value={diastolic}
                    onChange={(e) => setDiastolic(e.target.value)}
                />

                <button type="submit">
                    Record
                </button>

            </form>
        </div>
    );
}

export default RecordBloodPressure;