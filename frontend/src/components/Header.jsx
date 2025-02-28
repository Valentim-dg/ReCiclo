import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Search } from "lucide-react";

const Header = ({}) => {
  const location = useLocation();

  return (
    <header
      className={`top-0 transition-all duration-300 flex items-center justify-between bg-white px-6 py-3 z-10 shadow-md w-full`}
    >
      {/* Menu Central */}
      <div className="flex-1 flex justify-center space-x-4 ">
        <Link
          to="/"
          className={`px-4 py-2 rounded-md ${
            location.pathname === "/" ? "bg-gray-200" : "hover:bg-gray-100"
          }`}
        >
          Modelos 3D
        </Link>
        <Link
          to="/marketplace"
          className={`px-4 py-2 rounded-md ${
            location.pathname === "/marketplace"
              ? "bg-gray-200"
              : "hover:bg-gray-100"
          }`}
        >
          Marketplace
        </Link>
      </div>

      {/* Barra de Pesquisa */}
      <div className="hidden md:flex items-center bg-gray-200 rounded-md px-3 py-1 w-full max-w-lg lg:max-w-md mr-4">
        <Search size={18} className="text-gray-500" />
        <input
          type="text"
          placeholder="Pesquisar..."
          className="bg-transparent outline-none px-2 w-full"
        />
      </div>

      {/* Botões de Login e Cadastro */}
      <div className="flex space-x-2">
        <button className="px-4 py-2 bg-black text-white rounded-md">
          Entrar
        </button>
        <button className="px-4 py-2 bg-black text-white rounded-md">
          Cadastrar
        </button>
      </div>
    </header>
  );
};

export default Header;
