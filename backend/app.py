"""
GESTAR+ - Backend API
Flask + almacenamiento en memoria (reemplazar por una base de datos real en producción).
"""

from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# -----------------------------------------------------------------------
# "Base de datos" en memoria
# -----------------------------------------------------------------------
patients = []
bp_records = []
symptom_records = []
messages = []

next_patient_id = 1
next_bp_id = 1
next_symptom_id = 1
next_message_id = 1

SINTOMAS_VALIDOS = {
    "Dolor de cabeza intenso",
    "Visión borrosa",
    "Hinchazón",
    "Dolor abdominal",
    "Náuseas",
    "Mareos",
}


def now_fecha_hora():
    now = datetime.now()
    return now.strftime("%d/%m/%Y"), now.strftime("%H:%M")


def find_patient_by_dni(dni):
    return next((p for p in patients if p["dni"] == dni), None)


# -----------------------------------------------------------------------
# Pacientes (embarazadas)
# -----------------------------------------------------------------------
@app.route("/api/patients", methods=["GET"])
def get_patients():
    return jsonify(patients), 200


@app.route("/api/patients", methods=["POST"])
def create_patient():
    global next_patient_id

    data = request.get_json(force=True, silent=True) or {}

    nombre = (data.get("nombre") or "").strip()
    apellido = (data.get("apellido") or "").strip()
    dni = (data.get("dni") or "").strip()
    email = (data.get("email") or "").strip()

    errors = {}

    if not nombre:
        errors["nombre"] = "Campo obligatorio"

    if not apellido:
        errors["apellido"] = "Campo obligatorio"

    if not dni:
        errors["dni"] = "Campo obligatorio"
    elif find_patient_by_dni(dni):
        errors["dni"] = "DNI ya registrado"

    if not email:
        errors["email"] = "Campo obligatorio"
    elif "@" not in email or "." not in email.split("@")[-1]:
        errors["email"] = "Formato de email inválido"

    if errors:
        return jsonify({"errors": errors}), 400

    patient = {
        "id": next_patient_id,
        "nombre": nombre,
        "apellido": apellido,
        "dni": dni,
        "email": email,
        "estado": "Activo",
    }

    patients.append(patient)
    next_patient_id += 1

    return jsonify(patient), 201


# -----------------------------------------------------------------------
# Presión arterial
# -----------------------------------------------------------------------
@app.route("/api/bp", methods=["GET"])
def get_bp_records():
    return jsonify(list(reversed(bp_records))), 200


@app.route("/api/bp", methods=["POST"])
def create_bp_record():
    global next_bp_id

    data = request.get_json(force=True, silent=True) or {}

    patient_id = data.get("patient_id")
    sistolica = data.get("sistolica")
    diastolica = data.get("diastolica")

    errors = {}

    patient = next(
        (p for p in patients if p["id"] == patient_id),
        None
    )

    if patient is None:
        errors["patient_id"] = "Seleccione una embarazada"

    try:
        sistolica = int(sistolica)

        if sistolica < 80 or sistolica > 200:
            errors["sistolica"] = "Entre 80 y 200"

    except (TypeError, ValueError):
        errors["sistolica"] = "Entre 80 y 200"

    try:
        diastolica = int(diastolica)

        if diastolica < 50 or diastolica > 130:
            errors["diastolica"] = "Entre 50 y 130"

    except (TypeError, ValueError):
        errors["diastolica"] = "Entre 50 y 130"

    if errors:
        return jsonify({"errors": errors}), 400

    fecha, hora = now_fecha_hora()

    record = {
        "id": next_bp_id,
        "patient_id": patient["id"],
        "patient_name": f'{patient["nombre"]} {patient["apellido"]}',
        "fecha": fecha,
        "hora": hora,
        "sistolica": sistolica,
        "diastolica": diastolica,
    }

    bp_records.append(record)
    next_bp_id += 1

    return jsonify(record), 201


# -----------------------------------------------------------------------
# Login de paciente
# -----------------------------------------------------------------------
@app.route("/api/login", methods=["POST"])
def patient_login():
    data = request.get_json(force=True, silent=True) or {}

    email = (data.get("email") or "").strip()
    password = (data.get("password") or "").strip()

    # En este prototipo, password == DNI
    patient = next(
        (
            p
            for p in patients
            if p["email"] == email and p["dni"] == password
        ),
        None,
    )

    if patient is None:
        return jsonify({"error": "Email o contraseña incorrectos."}), 401

    return jsonify(patient), 200


# -----------------------------------------------------------------------
# Síntomas
# -----------------------------------------------------------------------
@app.route("/api/symptoms/<dni>", methods=["GET"])
def get_symptoms(dni):
    records = [
        r
        for r in symptom_records
        if r["patient_dni"] == dni
    ]

    return jsonify(list(reversed(records))), 200


@app.route("/api/symptoms", methods=["POST"])
def create_symptom_record():
    global next_symptom_id

    data = request.get_json(force=True, silent=True) or {}

    dni = (data.get("patient_dni") or "").strip()
    symptoms = data.get("symptoms") or []

    if not find_patient_by_dni(dni):
        return jsonify({"error": "Paciente no encontrado"}), 404

    symptoms = [
        s
        for s in symptoms
        if s in SINTOMAS_VALIDOS
    ]

    if not symptoms:
        return jsonify({
            "error": "Seleccioná al menos un síntoma."
        }), 400

    fecha, hora = now_fecha_hora()

    record = {
        "id": next_symptom_id,
        "patient_dni": dni,
        "fecha": fecha,
        "hora": hora,
        "symptoms": symptoms,
    }

    symptom_records.append(record)
    next_symptom_id += 1

    return jsonify(record), 201


# -----------------------------------------------------------------------
# Mensajes paciente -> enfermero
# -----------------------------------------------------------------------
@app.route("/api/messages", methods=["GET"])
def get_messages():
    return jsonify(list(reversed(messages))), 200


@app.route("/api/messages", methods=["POST"])
def create_message():
    global next_message_id

    data = request.get_json(force=True, silent=True) or {}

    patient_dni = (data.get("patient_dni") or "").strip()
    message = (data.get("message") or "").strip()

    errors = {}

    patient = find_patient_by_dni(patient_dni)

    if patient is None:
        errors["patient_dni"] = "Paciente no encontrado"

    if not message:
        errors["message"] = "El mensaje no puede estar vacío"
    elif len(message) > 500:
        errors["message"] = "El mensaje no puede superar los 500 caracteres"

    if errors:
        return jsonify({"errors": errors}), 400

    fecha, hora = now_fecha_hora()

    new_message = {
        "id": next_message_id,
        "patient_dni": patient["dni"],
        "patient_name": f'{patient["nombre"]} {patient["apellido"]}',
        "message": message,
        "fecha": fecha,
        "hora": hora,
    }

    messages.append(new_message)
    next_message_id += 1

    return jsonify(new_message), 201


# -----------------------------------------------------------------------
# Health check
# -----------------------------------------------------------------------
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)