import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Register } from './components/authentification/register.tsx'

const container = document.querySelector("#root");

const root = createRoot(container!);

root.render(
  <StrictMode>
    <Register />
  </StrictMode>,
)
