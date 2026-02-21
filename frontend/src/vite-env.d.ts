/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_SOLANA_NETWORK: string
  readonly VITE_PROGRAM_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Extend Window interface to include Buffer
interface Window {
  Buffer: typeof import('buffer').Buffer;
}
