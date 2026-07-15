interface Props {
  pagina: number;
  totalPaginas: number;
  hayAnterior: boolean;
  haySiguiente: boolean;
  onAnterior: () => void;
  onSiguiente: () => void;
  onIr: (n: number) => void;
}

export default function Paginacion({
  pagina,
  totalPaginas,
  hayAnterior,
  haySiguiente,
  onAnterior,
  onSiguiente,
  onIr,
}: Props) {
  if (totalPaginas <= 1) return null;

  const paginas = calcularRango(pagina, totalPaginas);

  return (
    <nav
      aria-label="Paginación"
      className="flex flex-wrap items-center justify-center gap-1 text-sm"
    >
      <button
        type="button"
        onClick={onAnterior}
        disabled={!hayAnterior}
        className="rounded-md border border-tierra-300 px-3 py-1.5 text-tierra-700 hover:border-rio-400 hover:text-rio-700 disabled:opacity-40 disabled:hover:border-tierra-300 disabled:hover:text-tierra-700"
      >
        ← Anterior
      </button>
      {paginas.map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="px-2 text-tierra-400">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onIr(p)}
            aria-current={p === pagina ? 'page' : undefined}
            className={[
              'min-w-[2.25rem] rounded-md px-3 py-1.5',
              p === pagina
                ? 'bg-rio-600 text-white font-semibold'
                : 'border border-tierra-300 text-tierra-700 hover:border-rio-400 hover:text-rio-700',
            ].join(' ')}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={onSiguiente}
        disabled={!haySiguiente}
        className="rounded-md border border-tierra-300 px-3 py-1.5 text-tierra-700 hover:border-rio-400 hover:text-rio-700 disabled:opacity-40 disabled:hover:border-tierra-300 disabled:hover:text-tierra-700"
      >
        Siguiente →
      </button>
    </nav>
  );
}

function calcularRango(actual: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const rango: (number | '…')[] = [1];
  const inicio = Math.max(2, actual - 1);
  const fin = Math.min(total - 1, actual + 1);
  if (inicio > 2) rango.push('…');
  for (let i = inicio; i <= fin; i++) rango.push(i);
  if (fin < total - 1) rango.push('…');
  rango.push(total);
  return rango;
}
