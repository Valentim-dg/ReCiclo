import React from "react";
import { Link } from "react-router-dom";
import { Home, User, Heart, Star, Settings, Menu } from "lucide-react";

const Sidebar = ({ isSidebarExpanded, setIsSidebarExpanded }) => {
  return (
    <>
      {/* Botão de abrir Sidebar no Mobile */}
      <button
        className="fixed top-4 left-4 z-20 p-2 bg-gray-200 rounded-md lg:hidden"
        onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
      >
        <Menu size={24} />
      </button>

      {/* Sidebar principal */}
      <div
        className={`fixed h-full bg-white shadow-lg transition-all duration-300 ease-in-out z-10 
          ${isSidebarExpanded ? "w-64" : "w-64 lg:w-16"}
          ${isSidebarExpanded ? "left-0" : "-left-64 lg:left-0"}`}
      >
        {/* Botão de Toggle no Desktop */}
        <button
          className="p-4 focus:outline-none hidden lg:block"
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
        >
          <Menu size={24} />
        </button>

        {/* Menu Links */}
        <nav className="flex flex-col mt-10 space-y-2">
          <Link to="/" className="flex items-center p-4 hover:bg-gray-300">
            <Home size={24} />
            <span
              className={`ml-3 transition-all duration-300 ${
                isSidebarExpanded ? "opacity-100" : "opacity-0 lg:hidden"
              }`}
            >
              Início
            </span>
          </Link>
          <Link
            to="/profile"
            className="flex items-center p-4 hover:bg-gray-300"
          >
            <User size={24} />
            <span
              className={`ml-3 transition-all duration-300 ${
                isSidebarExpanded ? "opacity-100" : "opacity-0 lg:hidden"
              }`}
            >
              Perfil
            </span>
          </Link>
          <Link to="/likes" className="flex items-center p-4 hover:bg-gray-300">
            <Heart size={24} />
            <span
              className={`ml-3 transition-all duration-300 ${
                isSidebarExpanded ? "opacity-100" : "opacity-0 lg:hidden"
              }`}
            >
              Likes
            </span>
          </Link>
          <Link
            to="/favorites"
            className="flex items-center p-4 hover:bg-gray-300"
          >
            <Star size={24} />
            <span
              className={`ml-3 transition-all duration-300 ${
                isSidebarExpanded ? "opacity-100" : "opacity-0 lg:hidden"
              }`}
            >
              Favoritos
            </span>
          </Link>
          <Link
            to="/settings"
            className="flex items-center p-4 hover:bg-gray-300"
          >
            <Settings size={24} />
            <span
              className={`ml-3 transition-all duration-300 ${
                isSidebarExpanded ? "opacity-100" : "opacity-0 lg:hidden"
              }`}
            >
              Configurações
            </span>
          </Link>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
