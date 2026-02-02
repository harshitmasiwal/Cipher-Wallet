export const BitcoinIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 32 32"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.6 14.7c1.6-.4 2.7-1.4 2.4-3.3-.4-2.6-3.1-2.8-5.4-2.6V6h-1.8v2.7c-.5 0-1 0-1.5.1V6h-1.8v2.8c-.4 0-.8.1-1.2.1H6v2l1.4.3c.7.2.8.5.8.9v7.6c0 .3-.1.6-.6.6l-1.6.4.4 2.2h2.3c.4 0 .8.1 1.2.1V26h1.8v-2.7c.5 0 1 0 1.5.1V26h1.8v-2.8c3.2-.2 5.6-1.2 6-4.1.4-2.3-.8-3.6-2.4-4.4zm-4.8-3.7c1.1 0 3.1-.3 3.1 1.5s-2 1.6-3.1 1.6V11zm0 9.5v-3.6c1.3 0 3.7-.4 3.7 1.8s-2.4 1.8-3.7 1.8z"/>
  </svg>
);

export const EthereumIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 256 417"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M127.6 0L124 12.7v262.5l3.6 3.6 127.6-75.3L127.6 0z" />
    <path d="M127.6 0L0 203.5l127.6 75.3V0z" />
    <path d="M127.6 301.1l-2 2.4v111.3l2 .6 127.6-179.7-127.6 65.4z" />
    <path d="M127.6 415.4V301.1L0 235.7l127.6 179.7z" />
  </svg>
);


export const SolanaIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 397 311"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M64.6 237.6c2.6-2.6 6.1-4.1 9.8-4.1h317.7c6.1 0 9.1 7.4 4.8 11.7l-64.6 64.6c-2.6 2.6-6.1 4.1-9.8 4.1H4.8c-6.1 0-9.1-7.4-4.8-11.7l64.6-64.6z" />
    <path d="M64.6 4.1C67.2 1.5 70.7 0 74.4 0h317.7c6.1 0 9.1 7.4 4.8 11.7l-64.6 64.6c-2.6 2.6-6.1 4.1-9.8 4.1H4.8C-1.3 80.4-4.3 73 0 68.7L64.6 4.1z" />
    <path d="M332.4 120.8c-2.6-2.6-6.1-4.1-9.8-4.1H4.8c-6.1 0-9.1 7.4-4.8 11.7l64.6 64.6c2.6 2.6 6.1 4.1 9.8 4.1h317.7c6.1 0 9.1-7.4 4.8-11.7l-64.6-64.6z" />
  </svg>
);



export const CypherLogo = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 32 32" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Outer geometric ring (The 'C') */}
    <path d="M16 4C9.37 4 4 9.37 4 16C4 22.63 9.37 28 16 28C21.16 28 25.56 24.75 27.24 20.15H22.78C21.69 22.42 19.06 24 16 24C11.58 24 8 20.42 8 16C8 11.58 11.58 8 16 8C19.06 8 21.69 9.58 22.78 11.85H27.24C25.56 7.25 21.16 4 16 4Z" />
    
    {/* Inner digital Key/Node */}
    <path d="M20 16C20 18.21 18.21 20 16 20C13.79 20 12 18.21 12 16C12 13.79 13.79 12 16 12C18.21 12 20 13.79 20 16Z" />
    
    {/* Tech accent (The 'Bit') */}
    <rect x="24" y="14" width="6" height="4" rx="1" />
  </svg>
);