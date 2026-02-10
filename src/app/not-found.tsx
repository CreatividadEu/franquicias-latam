import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Pagina no encontrada
        </h2>
        <p className="text-gray-500 mb-8">
          La pagina que buscas no existe o ha sido movida.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Ir al inicio
          </Link>
          <Link
            href="/quiz"
            className="border border-blue-600 text-blue-600 px-6 py-3 rounded-xl font-medium hover:bg-blue-50 transition-colors"
          >
            Hacer el quiz
          </Link>
        </div>
      </div>
    </div>
  );
}
