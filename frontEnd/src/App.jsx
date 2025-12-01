import { useState } from "react";
import Header from "./components/Header";
import Realizado from "./pages/realizado/Realizado";

function App() {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  return (
    <>
      <div className="app-container">
        <Header
          mostrarFiltros={mostrarFiltros}
          onToggleFiltros={() => setMostrarFiltros((prev) => !prev)}
        />
        <Realizado mostrarFiltros={mostrarFiltros} />
      </div>
    </>
  );
}

export default App;
