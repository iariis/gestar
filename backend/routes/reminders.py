from flask import Blueprint, jsonify, request

from extensions import db
from models import Patient, Reminder

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