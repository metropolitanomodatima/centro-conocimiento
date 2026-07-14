interface Props {
  lista: boolean;
  onAlternar: () => void;
}

export default function ToggleVista({ lista, onAlternar }: Props) {
  return (
    <div className="flex items-center rounded-lg border border-tierra-200 bg-white p-0.5">
      <button
        type="button"
        onClick={() => lista && onAlternar()}
        title="Vista tarjetas"
        className={[
          'rounded-md p-1.5 transition',
          !lista ? 'bg-tierra-100 text-tierra-900' : 'text-tierra-400 hover:text-tierra-700',
        ].join(' ')}
      >
        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
          <rect x="1" y="1" width="6" height="6" rx="1" />
          <rect x="9" y="1" width="6" height="6" rx="1" />
          <rect x="1" y="9" width="6" height="6" rx="1" />
          <rect x="9" y="9" width="6" height="6" rx="1" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => !lista && onAlternar()}
        title="Vista lista"
        className={[
          'rounded-md p-1.5 transition',
          lista ? 'bg-tierra-100 text-tierra-900' : 'text-tierra-400 hover:text-tierra-700',
        ].join(' ')}
      >
        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
          <rect x="1" y="2" width="14" height="2" rx="1" />
          <rect x="1" y="7" width="14" height="2" rx="1" />
          <rect x="1" y="12" width="14" height="2" rx="1" />
        </svg>
      </button>
    </div>
  );
}