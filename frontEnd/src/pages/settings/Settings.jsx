import "./settings.css";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import ClientesTab from "./tabs/ClientesTab";
import FazendasTab from "./tabs/FazendasTab";
import UsuariosTab from "./tabs/UsuariosTab";
import UsuariosClientesTab from "./tabs/UsuariosClientesTab";
import LavourasTab from "./tabs/LavourasTab";
import PluviometrosTab from "./tabs/PluviometrosTab";
import SafrasTab from "./tabs/SafrasTab";
import ServicosTab from "./tabs/ServicosTab";
import ProdutosTab from "./tabs/ProdutosTab";

const TABS = [
  { id: "clientes", label: "Clientes" },
  { id: "fazendas", label: "Fazendas" },
  { id: "usuarios", label: "Usuários" },
  { id: "usuarios_clientes", label: "Usuários x Clientes" },
  { id: "lavouras", label: "Lavouras" },
  { id: "pluviometros", label: "Pluviômetros" }, // ✅ NOVO
  { id: "safras", label: "Safras" },
  { id: "servicos", label: "Serviços" },
  { id: "produtos", label: "Produtos" },
];

function Settings() {
  const { usuario } = useAuth();
  const [tab, setTab] = useState("clientes");

  // ✅ Gate dentro do componente
  if (!usuario) {
    return <div className="settings-bloqueado">Você precisa estar logado.</div>;
  }

  if (usuario.role_global !== "super_admin") {
    return (
      <div className="settings-bloqueado">
        Acesso restrito a administradores do sistema.
      </div>
    );
  }

  return (
    <main className="page-shell">
      <div className="settings-page page-card">
        <aside className="settings-menu">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={tab === t.id ? "ativo" : ""}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </aside>

        <section className="settings-content">
          {tab === "clientes" && <ClientesTab />}
          {tab === "fazendas" && <FazendasTab />}
          {tab === "usuarios" && <UsuariosTab />}
          {tab === "usuarios_clientes" && <UsuariosClientesTab />}
          {tab === "lavouras" && <LavourasTab />}
          {tab === "pluviometros" && <PluviometrosTab />}
          {tab === "safras" && <SafrasTab />}
          {tab === "servicos" && <ServicosTab />}
          {tab === "produtos" && <ProdutosTab />}
        </section>
      </div>
    </main>
  );
}

export default Settings;
