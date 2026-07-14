import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Buscador from '@/components/Buscador';
import Cargando from '@/components/Cargando';
import ErrorMensaje from '@/components/ErrorMensaje';
import TarjetaRecurso from '@/components/TarjetaRecurso';
import FilaRecurso from '@/components/FilaRecurso';
import ToggleVista from '@/components/ToggleVista';
import { CATEGORIAS } from '@/types/recurso';
import type { EntradaIndice, TipoRecurso } from '@/types/recurso';
import { buscar, type FiltrosBusqueda } from '@/services/busqueda';
import { cargarIndice, extraerFacetas, extraerRegiones } from '@/services/indice';
import { useTiposVisibles } from '@/controllers/useTiposVisibles';
import { useVistaLista } from '@/controllers/useVistaLista';

export default function Busqueda() {
  const tiposVisibles = useTiposVisibles();
  const [params, setParams] = useSearchParams();
  const consulta = params.get('q') ?? '';
  const tiposClave = params.getAll('tipo').join(',');
  const tema = params.get('tema');
  const region = params.get('region');

  const [resultados, setResultados] = useState<EntradaIndice[] | null>(null);
  const [todos, setTodos] = useState<EntradaIndice[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { lista, alternar: alternarVista } = useVistaLista();

  useEffect(() => {
    if (tiposVisibles === undefined) return;
    cargarIndice()
      .then((i) => {
        const recursos = tiposVisibles
          ? i.recursos.filter((r) => (tiposVisibles as string[]).includes(r.tipo))
          : i.recursos;
        setTodos(recursos);
      })
      .catch((e) => setError(e.message));
  }, [tiposVisibles]);

  const tipos = useMemo(
    () => (tiposClave ? (tiposClave.split(',') as TipoRecurso[]) : []),
    [tiposClave],
  );

  const filtros: FiltrosBusqueda = useMemo(
    () => ({
      tipos: tipos.length ? tipos : undefined,
      temas: tema ? [tema] : undefined,
      regiones: region ? [region] : undefined,
    }),
    [tipos, tema, region],
  );

  useEffect(() => {
    setResultados(null);
    buscar(consulta, filtros)
      .then((res) => {
        const filtrados = tiposVisibles
          ? res.filter((r) => (tiposVisibles as string[]).includes(r.tipo))
          : res;
        setResultados(filtrados);
      })
      .catch((e) => setError(e.message));
  }, [consulta, filtros, tiposVisibles]);

  const facetas = useMemo(() => (todos ? extraerFacetas(todos) : null), [todos]);
  const regiones = useMemo(() => (todos ? extraerRegiones(todos) : null), [todos]);

  const alternar = useCallback(
    (llave: 'tipo' | 'tema' | 'region', valor: string) => {
      const nuevos = new URLSearchParams(params);
      if (llave === 'tipo') {
        const actual = nuevos.getAll('tipo');
        nuevos.delete('tipo');
        const nuevosValores = actual.includes(valor)
          ? actual.filter((v) => v !== valor)
          : [...actual, valor];
        nuevosValores.forEach((v) => nuevos.append('tipo', v));
      } else {
        if (nuevos.get(llave) === valor) nuevos.delete(llave);
        else nuevos.set(llave, valor);
      }
      setParams(nuevos, { replace: true });
    },
    [params, setParams],
  );

  if (error) return <ErrorMensaje mensaje={error} />;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl font-bold text-tierra-900">Buscar</h1>
        <p className="text-tierra-600">Consulta título, resumen, contenido, temas y etiquetas.</p>
      </header>

      <Buscador destacado valorInicial={consulta} />

      <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside aria-label="Filtros" className="space-y-6">
          <section>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-tierra-500">
              Tipo de recurso
            </h2>
            <ul className="space-y-1">
              {CATEGORIAS.filter((c) => tiposVisibles == null ? true : (tiposVisibles as string[]).includes(c.tipo)).map((c) => {
                const activo = tipos.includes(c.tipo);
                const total = todos ? todos.filter((r) => r.tipo === c.tipo).length : null;
                return (
                  <li key={c.tipo}>
                    <button
                      type="button"
                      onClick={() => alternar('tipo', c.tipo)}
                      className={[
                        'w-full text-left rounded-md px-2 py-1 text-sm transition flex justify-between',
                        activo
                          ? 'bg-rio-100 text-rio-800 font-semibold'
                          : 'text-tierra-700 hover:bg-tierra-100',
                      ].join(' ')}
                    >
                      <span>{c.etiquetaPlural}</span>
                      {total !== null && <span className="text-tierra-500">{total}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          {facetas && facetas.temas.length > 0 && (
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-tierra-500">
                Tema
              </h2>
              <ul className="space-y-1">
                {facetas.temas.slice(0, 15).map(({ valor, total }) => {
                  const activo = tema === valor;
                  return (
                    <li key={valor}>
                      <button
                        type="button"
                        onClick={() => alternar('tema', valor)}
                        className={[
                          'w-full text-left rounded-md px-2 py-1 text-sm transition flex justify-between',
                          activo
                            ? 'bg-alerce-100 text-alerce-800 font-semibold'
                            : 'text-tierra-700 hover:bg-tierra-100',
                        ].join(' ')}
                      >
                        <span>{valor}</span>
                        <span className="text-tierra-500">{total}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {regiones && regiones.length > 0 && (
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-tierra-500">
                Región
              </h2>
              <ul className="space-y-1">
                {regiones.slice(0, 15).map(({ valor, total }) => {
                  const activo = region === valor;
                  return (
                    <li key={valor}>
                      <button
                        type="button"
                        onClick={() => alternar('region', valor)}
                        className={[
                          'w-full text-left rounded-md px-2 py-1 text-sm transition flex justify-between',
                          activo
                            ? 'bg-rio-100 text-rio-800 font-semibold'
                            : 'text-tierra-700 hover:bg-tierra-100',
                        ].join(' ')}
                      >
                        <span>{valor}</span>
                        <span className="text-tierra-500">{total}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </aside>

        <div>
          {!resultados ? (
            <Cargando />
          ) : resultados.length === 0 ? (
            <div className="rounded-xl border border-dashed border-tierra-300 bg-white p-10 text-center">
              <p className="text-tierra-700">Sin resultados para tu búsqueda.</p>
              <p className="mt-2 text-sm text-tierra-500">
                Prueba con menos filtros o palabras distintas.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between gap-2">
                <p className="text-sm text-tierra-500">
                  {resultados.length} resultado{resultados.length === 1 ? '' : 's'}
                  {consulta && (
                    <>
                      {' '}para{' '}
                      <em className="font-medium not-italic text-tierra-800">«{consulta}»</em>
                    </>
                  )}
                </p>
                <ToggleVista lista={lista} onAlternar={alternarVista} />
              </div>
              {lista ? (
                <div className="flex flex-col gap-2">
                  {resultados.map((r) => (
                    <FilaRecurso key={r.id} recurso={r} />
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {resultados.map((r) => (
                    <TarjetaRecurso key={r.id} recurso={r} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
