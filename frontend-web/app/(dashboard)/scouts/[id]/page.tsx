export default function ScoutProfilePage({ params }: { params: { id: string } }) {
  return <div className="rounded-xl bg-white p-4 shadow">Perfil del scout {params.id}</div>;
}