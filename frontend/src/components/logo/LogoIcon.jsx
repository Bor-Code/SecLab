export default function LogoIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="SecLab">
      <defs>
        <linearGradient id="seclabEducationGradient" x1="7" y1="6" x2="41" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2F6BFF" />
          <stop offset="1" stopColor="#16B8A6" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#seclabEducationGradient)" />
      <path
        d="M12.5 15.5c4.9 0 8.1 1.1 11.5 3.6 3.4-2.5 6.6-3.6 11.5-3.6v18.1c-4.6 0-7.8 1-11.5 3.4-3.7-2.4-6.9-3.4-11.5-3.4V15.5Z"
        fill="rgba(8, 24, 54, 0.78)"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M24 19.2V37" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      <path d="m28.4 26 2.2 2.2 4.2-5" stroke="#A7F3D0" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.8 21.3h4.6M15.8 25h4.6M15.8 28.7h4.6" stroke="#BFDBFE" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
