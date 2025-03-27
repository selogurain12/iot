import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthentificationIndex } from './components/authentification';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ListUsers } from './components/utilisateurs/users_list';
import { Toaster } from 'sonner';
import { ListHistorique } from './components/historique/historique_list';
import { ListCards } from './components/cards/card_list';
import { AuthProvider } from './context/authContext';
import { Profil } from './components/sidebar/profil';
import { ListModules } from './components/modules/module_list';

const container = document.querySelector("#root");

const root = createRoot(container!);

root.render(
  <StrictMode>
    <Router>
      <AuthProvider>
        <Toaster richColors />
          <Routes>
            <Route path="/" element={<AuthentificationIndex />} />
            <Route path="/userlist" element={<ListUsers />} />
            <Route path="/historic" element={<ListHistorique />} />
            <Route path="/card" element={<ListCards />} />
            <Route path="/profil" element={<Profil />} />
            <Route path="/module" element={<ListModules />} />
          </Routes>
      </AuthProvider>
    </Router>
  </StrictMode>,
)
