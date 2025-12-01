import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";

function Header({ mostrarFiltros, onToggleFiltros }) {
  return (
    <header className="app-header">
      <h1>Lançamento de Serviços</h1>

      {/* ÍCONE DE FILTROS NO HEADER */}
      <button
        type="button"
        className={`btn-filtros-header ${
          mostrarFiltros ? "btn-filtros-header--ativo" : ""
        }`}
        onClick={onToggleFiltros}
        title={mostrarFiltros ? "Esconder filtros" : "Mostrar filtros"}
      >
        <FontAwesomeIcon icon={faFilter} />
      </button>
    </header>
  );
}

export default Header;
