/// <reference types="vite/client" />

// CSS 모듈 타입 선언
declare module '*.css' {
  const content: string;
  export default content;
}

// SVG 모듈 타입 선언
declare module '*.svg' {
  const content: string;
  export default content;
}

