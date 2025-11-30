import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initMixpanel, identifyUserFromStorage } from './utils/mixpanel'

// Mixpanel 초기화
initMixpanel()

// 저장된 userId로 identify (백엔드와 distinctId 통일)
identifyUserFromStorage()

createRoot(document.getElementById('root')!).render(
  <App />
)
