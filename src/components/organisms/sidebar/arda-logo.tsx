export function ArdaLogo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Simplified Arda logo mark -- orange "A" in a rounded shape */}
      <rect width="40" height="40" rx="8" fill="#FC5A29" />
      <path d="M20 8L10 32H15L17 27H23L25 32H30L20 8ZM18.5 23L20 18L21.5 23H18.5Z" fill="white" />
    </svg>
  );
}

export function ArdaLogoFull({ height = 28 }: { height?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <ArdaLogo size={height} />
      <span
        style={{
          fontSize: height * 0.6,
          fontWeight: 700,
          color: 'inherit',
          letterSpacing: '-0.02em',
        }}
      >
        arda
      </span>
    </div>
  );
}
