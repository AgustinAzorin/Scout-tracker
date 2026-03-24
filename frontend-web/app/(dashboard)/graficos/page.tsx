import AgesChart from "@/components/charts/AgesChart";
import PromisasChart from "@/components/charts/PromisasChart";
import TadaChart from "@/components/charts/TadaChart";

export default function ChartsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow dark:bg-neutral-900">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Gráficos</h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Resumen visual de edades, promesas y estado TADA de los scouts activos.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AgesChart />
        <PromisasChart />
      </div>

      <TadaChart />
    </div>
  );
}