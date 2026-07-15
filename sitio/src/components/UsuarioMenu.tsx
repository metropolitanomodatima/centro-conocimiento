import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSesion } from '@/controllers/useSesion';
import { useRolPermitido } from '@/controllers/useRolPermitido';
import { urlLogin } from '@/services/sesion';
import Dialogo from '@/components/Dialogo';
import BarraProgreso from '@/components/BarraProgreso';

const ETIQUETA_ROL: Record<string, string> = {
  admin: 'Admin',
  editor: 'Editor',
  militancia: 'Militancia',
};

export default function UsuarioMenu() {
  const { sesion, cargando, logout } = useSesion();
  const esAdmin = useRolPermitido('admin');
  const [mostrarConfirm, setMostrarConfirm] = useState(false);
  const [autenticando, setAutenticando] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuAbierto) return;
    function cerrar(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAbierto(false);
      }
    }
    document.addEventListener('mousedown', cerrar);
    return () => document.removeEventListener('mousedown', cerrar);
  }, [menuAbierto]);

  if (cargando) return <div className="h-8 w-8 rounded-full bg-tierra-200 animate-pulse" />;

  if (!sesion) {
    return (
      <>
        {autenticando && <BarraProgreso />}
        <a
          href={urlLogin()}
          onClick={() => setAutenticando(true)}
          className="flex items-center gap-2 rounded-md border border-tierra-300 px-3 py-1.5 text-sm text-tierra-700 hover:border-rio-400 hover:text-rio-700 no-underline"
        >
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
          </svg>
          Autentícate
        </a>
      </>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {cerrando && <BarraProgreso />}
      {sesion.rol !== 'militancia' && (
        <Link
          to="/nuevo"
          aria-label="Sembrar saber"
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-alerce-600 text-white shadow-sm ring-1 ring-alerce-700/20 hover:bg-alerce-700 hover:shadow-md transition no-underline h-9 w-9 sm:h-auto sm:w-auto sm:rounded-md sm:px-3 sm:py-1.5 sm:text-sm sm:font-medium"
        >
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
            <path d="M8 3v10M3 8h10" strokeLinecap="round" />
          </svg>
          <span className="hidden sm:inline">Sembrar saber</span>
        </Link>
      )}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuAbierto((v) => !v)}
          className="flex items-center gap-2 rounded-md border border-tierra-200 px-2 py-1 hover:border-tierra-300 transition-colors"
        >
          <img
            src={sesion.avatarUrl}
            alt={sesion.login}
            className="h-6 w-6 rounded-full"
          />
          <span className="hidden text-sm text-tierra-700 sm:block">
            {sesion.nombre ?? sesion.login}
          </span>
          <span className="rounded bg-tierra-100 px-1.5 py-0.5 text-xs text-tierra-500">
            {ETIQUETA_ROL[sesion.rol]}
          </span>
          <svg
            className={`h-3 w-3 text-tierra-400 transition-transform duration-150 ${menuAbierto ? 'rotate-180' : ''}`}
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <path d="M2 4l4 4 4-4" />
          </svg>
        </button>

        {menuAbierto && (
          <div className="absolute right-0 top-full mt-1.5 w-52 rounded-xl border border-tierra-200 bg-white py-1 shadow-lg z-40">
            <a
              href={`https://github.com/${sesion.login}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuAbierto(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-tierra-700 hover:bg-tierra-50 hover:text-tierra-900 no-underline"
            >
              <svg className="h-4 w-4 shrink-0 text-tierra-400" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
              </svg>
              Ver perfil en GitHub
            </a>
            {esAdmin && (
              <Link
                to="/admin/roles"
                onClick={() => setMenuAbierto(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-tierra-700 hover:bg-tierra-50 hover:text-tierra-900 no-underline"
              >
                <svg className="h-4 w-4 shrink-0 text-tierra-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                  <circle cx="6" cy="5" r="2.5" />
                  <path d="M1 13c0-2.76 2.24-5 5-5h0c1.38 0 2.63.56 3.54 1.46" strokeLinecap="round" />
                  <path d="M11 9l1.5 1.5L15 8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Gestionar roles
              </Link>
            )}
            <div className="my-1 border-t border-tierra-100" />
            <button
              onClick={() => { setMenuAbierto(false); setMostrarConfirm(true); }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-tierra-500 hover:bg-tierra-50 hover:text-tierra-700"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M10 11l3-3-3-3M13 8H6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        )}
      </div>

      {mostrarConfirm && (
        <Dialogo
          titulo="Cerrar sesión"
          mensaje="¿Seguro que quieres cerrar sesión?"
          labelConfirmar="Cerrar sesión"
          labelCancelar="Cancelar"
          onConfirmar={() => { setMostrarConfirm(false); setCerrando(true); logout(); }}
          onCancelar={() => setMostrarConfirm(false)}
        />
      )}
    </div>
  );
}