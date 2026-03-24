export default function TeamPage({ params }: { params: { nombre: string } }) {
  return <div className="rounded-xl bg-white p-4 shadow">Equipo: {params.nombre}</div>;
}