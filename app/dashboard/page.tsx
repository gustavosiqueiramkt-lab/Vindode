export default function DashboardRootPage() {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="text-center max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Bem-vindo ao Vindode</h1>
        <p className="text-gray-500 text-sm">
          Selecione um cliente na barra lateral para ver as métricas, ou adicione seu primeiro cliente.
        </p>
      </div>
    </div>
  )
}
