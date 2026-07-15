import { useEffect, useMemo, useState } from 'react';

export function usePaginacion<T>(items: T[], porPagina: number, clave: unknown) {
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    setPagina(1);
  }, [clave]);

  const totalPaginas = Math.max(1, Math.ceil(items.length / porPagina));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const inicio = (paginaSegura - 1) * porPagina;
  const visibles = useMemo(
    () => items.slice(inicio, inicio + porPagina),
    [items, inicio, porPagina],
  );

  function ir(n: number) {
    const destino = Math.min(Math.max(1, n), totalPaginas);
    setPagina(destino);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return {
    pagina: paginaSegura,
    totalPaginas,
    visibles,
    ir,
    anterior: () => ir(paginaSegura - 1),
    siguiente: () => ir(paginaSegura + 1),
    hayAnterior: paginaSegura > 1,
    haySiguiente: paginaSegura < totalPaginas,
    inicio: inicio + 1,
    fin: Math.min(inicio + porPagina, items.length),
    total: items.length,
  };
}
