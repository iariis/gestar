from extensions import db


class Reminder(db.Model):
    __tablename__ = "reminders"

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(
        db.Integer,
        db.ForeignKey("patients.id"),
        nullable=False
    )
    tipo = db.Column(db.String(10), nullable=False)
    horario = db.Column(db.String(5), nullable=False)
    activo = db.Column(db.Boolean, nullable=False, default=True)

    patient = db.relationship("Patient", backref="reminders")

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "tipo": self.tipo,
            "horario": self.horario,
            "activo": self.activo,
        }