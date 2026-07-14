import { useState } from 'react';

const CLAVE = 'vista_lista';

export function useVistaLista() {
  const [lista, setLista] = useState(() => localStorage.getItem(CLAVE) === '1');

  function alternar() {
    setLista((v) => {
      const nuevo = !v;
      localStorage.setItem(CLAVE, nuevo ? '1' : '0');
      return nuevo;
    });
  }

  return { lista, alternar };
}