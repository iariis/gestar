from datetime import datetime

from flask import Blueprint, jsonify, request

from extensions import db
from models import Patient, Reminder, BPRecord

reminders_bp = Blueprint("reminders", __name__)


@reminders_bp.route("/api/reminders/config", methods=["POST"])
def configure_reminder():
    data = request.get_json(force=True, silent=True) or {}

    patient_id = data.get("patient_id")
    tipo = (data.get("tipo") or "").strip().lower()
    horario = (data.get("horario") or "").strip()

    if not patient_id:
        return jsonify({"error": "Paciente requerido"}), 400

    if tipo not in ("mañana", "noche"):
        return jsonify({
            "error": "El tipo debe ser 'mañana' o 'noche'"
        }), 400

    if not horario:
        return jsonify({"error": "Horario requerido"}), 400

    patient = Patient.query.get(patient_id)

    if patient is None:
        return jsonify({"error": "Paciente no encontrado"}), 404

    reminder = Reminder.query.filter_by(
        patient_id=patient.id,
        tipo=tipo
    ).first()

    if reminder:
        reminder.horario = horario
        reminder.activo = True
    else:
        reminder = Reminder(
            patient_id=patient.id,
            tipo=tipo,
            horario=horario,
            activo=True,
        )
        db.session.add(reminder)

    db.session.commit()

    return jsonify(reminder.to_dict()), 200


@reminders_bp.route("/api/reminders/<int:patient_id>", methods=["GET"])
def get_reminders(patient_id):
    patient = Patient.query.get(patient_id)

    if patient is None:
        return jsonify({"error": "Paciente no encontrado"}), 404

    reminders = (
        Reminder.query
        .filter_by(patient_id=patient_id, activo=True)
        .order_by(Reminder.horario.asc())
        .all()
    )

    return jsonify([r.to_dict() for r in reminders]), 200


@reminders_bp.route(
    "/api/reminders/check/<int:patient_id>",
    methods=["GET"]
)
def check_reminder(patient_id):
    patient = Patient.query.get(patient_id)

    if patient is None:
        return jsonify({"error": "Paciente no encontrado"}), 404

    # Solo se controlan recordatorios de pacientes activos.
    if patient.estado.lower() != "activo":
        return jsonify({
            "mostrar": False,
            "motivo": "Paciente inactivo"
        }), 200

    ahora = datetime.now()

    fecha_hoy = ahora.strftime("%d/%m/%Y")
    hora_actual = ahora.strftime("%H:%M")

    recordatorios = (
        Reminder.query
        .filter_by(
            patient_id=patient_id,
            activo=True
        )
        .all()
    )

    for reminder in recordatorios:

        # El recordatorio empieza a estar pendiente
        # a partir de su horario configurado.
        if hora_actual < reminder.horario:
            continue

        # Si el horario de mañana ya pasó, no debe bloquear
        # el recordatorio de noche.
        if reminder.tipo == "mañana" and reminder.horario > "12:00":
            continue

        if reminder.tipo == "noche" and reminder.horario < "12:00":
            continue

        # Buscar registros de presión realizados hoy.
        registros_hoy = (
            BPRecord.query
            .filter_by(
                patient_id=patient_id,
                fecha=fecha_hoy
            )
            .all()
        )

        # Determinar si la paciente ya cumplió este horario.
        presion_cumplida = False

        for registro in registros_hoy:
            if registro.hora >= reminder.horario:
                presion_cumplida = True
                break

        if presion_cumplida:
            continue

        return jsonify({
            "mostrar": True,
            "recordatorio": reminder.to_dict(),
            "mensaje": "Es hora de registrar tu presión arterial"
        }), 200

    return jsonify({
        "mostrar": False
    }), 200