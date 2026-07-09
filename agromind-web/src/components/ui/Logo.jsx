/**
 * AgroMind AI — Logotipo Oficial
 * 
 * Símbolo minimalista que combina:
 * - Neurônio/IA (círculos interligados representando inteligência artificial)
 * - Folha/Agricultura (curva orgânica ascendente)
 * - Dados (grid de pontos representando análise)
 * 
 * Funciona em tema claro e escuro.
 */
export function Logo({ size = 32, variant = 'full', className = '' }) {
  const s = size
  const symbol = (
    <svg width={s} height={s} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4fe288" />
          <stop offset="100%" stopColor="#2fd26c" />
        </linearGradient>
        <linearGradient id="logoGradAccent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#66c8ff" />
          <stop offset="100%" stopColor="#4fe288" />
        </linearGradient>
      </defs>
      
      {/* Grid de dados — base tecnológica */}
      <g opacity="0.3">
        {[0, 1, 2].map(row => 
          [0, 1, 2].map(col => (
            <circle key={`${row}-${col}`} cx={8 + col * 8} cy={8 + row * 8} r="0.8" fill="currentColor" />
          ))
        )}
      </g>
      
      {/* Conexões neurais — linhas da IA */}
      <g stroke="url(#logoGrad)" strokeWidth="1.2" opacity="0.6" strokeLinecap="round">
        <line x1="16" y1="8" x2="10" y2="16" />
        <line x1="16" y1="8" x2="22" y2="16" />
        <line x1="10" y1="16" x2="16" y2="24" />
        <line x1="22" y1="16" x2="16" y2="24" />
        <line x1="16" y1="8" x2="16" y2="24" />
        <line x1="10" y1="16" x2="22" y2="16" />
      </g>
      
      {/* Neurônios principais (nós da IA) */}
      <circle cx="16" cy="8" r="3" fill="url(#logoGrad)" stroke="var(--color-canvas, #060b08)" strokeWidth="1.5" />
      <circle cx="10" cy="16" r="2.5" fill="url(#logoGradAccent)" stroke="var(--color-canvas, #060b08)" strokeWidth="1.5" />
      <circle cx="22" cy="16" r="2.5" fill="url(#logoGradAccent)" stroke="var(--color-canvas, #060b08)" strokeWidth="1.5" />
      <circle cx="16" cy="24" r="2" fill="url(#logoGrad)" stroke="var(--color-canvas, #060b08)" strokeWidth="1.5" />
      
      {/* Folha estilizada — curva orgânica ascendente */}
      <path 
        d="M16 28 C16 28 12 24 14 20 C16 16 18 14 18 10" 
        stroke="url(#logoGrad)" 
        strokeWidth="1.5" 
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      <path 
        d="M18 10 C18 10 20 12 20 15 C20 18 18 20 16 22" 
        stroke="url(#logoGrad)" 
        strokeWidth="1" 
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
    </svg>
  )

  if (variant === 'icon') return symbol

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {symbol}
      <div>
        <p className="font-extrabold tracking-tight text-ink leading-tight" style={{ fontSize: s * 0.5 }}>
          AgroMind
        </p>
        <p className="text-[10px] text-muted/70 uppercase tracking-[0.15em] font-semibold leading-none mt-0.5">
          AI Platform
        </p>
      </div>
    </div>
  )
}

export function LogoIcon({ size = 32, className = '' }) {
  return <Logo size={size} variant="icon" className={className} />
}