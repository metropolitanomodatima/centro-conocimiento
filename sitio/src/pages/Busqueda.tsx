import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Buscador from '@/components/Buscador';
import Cargando from '@/components/Cargando';
import ErrorMensaje from '@/components/ErrorMensaje';
import TarjetaRecurso from '@/components/TarjetaRecurso';
import FilaRecurso from '@/components/FilaRecurso';
import ToggleVista from '@/components/ToggleVista';
import Paginacion from '@/components/Paginacion';
import { usePaginacion } from '@/controllers/usePaginacion';

const POR_PAGINA = 12;
import { CATEGORIAS } from '@/types/recurso';
import type { EntradaIndice, TipoRecurso } from '@/types/recurso';

const TIPOS_PUBLICOS = new Set(['concepto', 'territorio', 'cuenca', 'ley', 'conflicto']);
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
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
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

      {(() => {
        const filtrosActivos = tipos.length + (tema ? 1 : 0) + (region ? 1 : 0);
        return (
          <button
            type="button"
            onClick={() => setFiltrosAbiertos((v) => !v)}
            className="lg:hidden flex items-center justify-between w-full rounded-md border border-tierra-300 bg-white px-4 py-2 text-sm text-tierra-800 hover:border-rio-400"
            aria-expanded={filtrosAbiertos}
            aria-controls="panel-filtros"
          >
            <span className="font-medium">
              Filtros
              {filtrosActivos > 0 && (
                <span className="ml-2 rounded-full bg-rio-100 px-2 py-0.5 text-xs font-semibold text-rio-800">
                  {filtrosActivos}
                </span>
              )}
            </span>
            <span aria-hidden>{filtrosAbiertos ? '▲' : '▼'}</span>
          </button>
        );
      })()}

      <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside
          id="panel-filtros"
          aria-label="Filtros"
          className={`${filtrosAbiertos ? 'block' : 'hidden'} lg:block space-y-6`}
        >
          <section>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-tierra-500">
              Tipo de saber
            </h2>
            {(() => {
              const categoriasFiltradas = CATEGORIAS.filter((c) =>
                tiposVisibles == null ? true : (tiposVisibles as string[]).includes(c.tipo)
              );
              const publicas = categoriasFiltradas.filter((c) => TIPOS_PUBLICOS.has(c.tipo));
              const privadas = categoriasFiltradas.filter((c) => !TIPOS_PUBLICOS.has(c.tipo));
              const renderBtn = (c: typeof CATEGORIAS[0]) => {
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
                          : TIPOS_PUBLICOS.has(c.tipo)
                            ? 'text-tierra-700 hover:bg-tierra-100'
                            : 'bg-rio-50 text-rio-700 hover:bg-rio-100',
                      ].join(' ')}
                    >
                      <span>{c.etiquetaPlural}</span>
                      {total !== null && <span className="text-tierra-500">{total}</span>}
                    </button>
                  </li>
                );
              };
              return (
                <>
                  <ul className="space-y-1">{publicas.map(renderBtn)}</ul>
                  {privadas.length > 0 && (
                    <>
                      <div className="my-2 h-px bg-tierra-200" />
                      <ul className="space-y-1">{privadas.map(renderBtn)}</ul>
                    </>
                  )}
                </>
              );
            })()}
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
            <ResultadosPaginados
              resultados={resultados}
              consulta={consulta}
              lista={lista}
              alternarVista={alternarVista}
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface ResultadosPaginadosProps {
  resultados: EntradaIndice[];
  consulta: string;
  lista: boolean;
  alternarVista: () => void;
}

function ResultadosPaginados({
  resultados,
  consulta,
  lista,
  alternarVista,
}: ResultadosPaginadosProps) {
  const paginacion = usePaginacion(resultados, POR_PAGINA, `${consulta}|${resultados.length}`);

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-sm text-tierra-500">
          {paginacion.total} resultado{paginacion.total === 1 ? '' : 's'}
          {consulta && (
            <>
              {' '}para{' '}
              <em className="font-medium not-italic text-tierra-800">«{consulta}»</em>
            </>
          )}
          {paginacion.totalPaginas > 1 && (
            <span className="ml-1 text-tierra-400">
              · {paginacion.inicio}–{paginacion.fin}
            </span>
          )}
        </p>
        <ToggleVista lista={lista} onAlternar={alternarVista} />
      </div>
      {lista ? (
        <div className="flex flex-col gap-2">
          {paginacion.visibles.map((r) => (
            <FilaRecurso key={r.id} recurso={r} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {paginacion.visibles.map((r) => (
            <TarjetaRecurso key={r.id} recurso={r} />
          ))}
        </div>
      )}
      <div className="mt-6">
        <Paginacion
          pagina={paginacion.pagina}
          totalPaginas={paginacion.totalPaginas}
          hayAnterior={paginacion.hayAnterior}
          haySiguiente={paginacion.haySiguiente}
          onAnterior={paginacion.anterior}
          onSiguiente={paginacion.siguiente}
          onIr={paginacion.ir}
        />
      </div>
    </>
  );
}
