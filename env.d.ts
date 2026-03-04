/// <reference types="vite/client" />

// Allow importing .sql files as raw strings
declare module '*.sql?raw' {
  const content: string;
  export default content;
}
