export default function Logo() {
  return (
    <div className="logo wordmark">
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L14.6 9H21.5L15.9 13.2L18.1 20L12 15.9L5.9 20L8.1 13.2L2.5 9H9.4L12 2Z"
          fill="url(#g1)"
        />
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="24" y2="24">
            <stop offset="0%" stopColor="#5eead4" />
            <stop offset="100%" stopColor="#fb7185" />
          </linearGradient>
        </defs>
      </svg>
      <span className="star">STAR</span>
      <span className="traders">TRADERS</span>
    </div>
  );
}
