function getPregnancyInfo(fechaParto) {
  if (!fechaParto) {
    return {
      trimestre: "No disponible",
      monitoreos: "Registrar fecha de parto",
    };
  }

  const parto = new Date(`${fechaParto}T00:00:00`);
  const hoy = new Date();

  const diferencia = parto.getTime() - hoy.getTime();
  const semanasRestantes = Math.ceil(
    diferencia / (1000 * 60 * 60 * 24 * 7)
  );

  const semanasEmbarazo = 40 - semanasRestantes;

  if (semanasEmbarazo < 1 || semanasEmbarazo > 40) {
    return {
      trimestre: "Fuera de rango",
      monitoreos: "Revisar fecha de parto",
    };
  }

  if (semanasEmbarazo <= 13) {
    return {
      trimestre: "1.er trimestre",
      monitoreos: "Presión arterial y síntomas",
    };
  }

  if (semanasEmbarazo <= 27) {
    return {
      trimestre: "2.º trimestre",
      monitoreos: "Presión, síntomas y peso",
    };
  }

  return {
    trimestre: "3.er trimestre",
    monitoreos: "Presión, síntomas y peso frecuente",
  };
}

export default function PatientListTable({ patients }) {
  return (
    <div className="fade-in">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Lista de usuarios
      </h2>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Apellido</th>
              <th className="px-4 py-3 font-medium">DNI</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Fecha de parto</th>
              <th className="px-4 py-3 font-medium">Trimestre</th>
              <th className="px-4 py-3 font-medium">Monitoreos</th>
              <th className="px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {patients.map((p) => {
              const info = getPregnancyInfo(p.fecha_parto);

              return (
                <tr key={p.id}>
                  <td className="px-4 py-3">{p.nombre}</td>

                  <td className="px-4 py-3">{p.apellido}</td>

                  <td className="px-4 py-3">{p.dni}</td>

                  <td className="px-4 py-3">{p.email}</td>

                  <td className="px-4 py-3">
                    {p.fecha_parto || "No registrada"}
                  </td>

                  <td className="px-4 py-3">
                    {info.trimestre}
                  </td>

                  <td className="px-4 py-3">
                    {info.monitoreos}
                  </td>

                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      {p.estado}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {patients.length === 0 && (
          <p className="text-center text-gray-400 py-8 text-sm">
            No hay embarazadas registradas.
          </p>
        )}
      </div>
    </div>
  );
}