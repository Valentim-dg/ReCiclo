import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, PlusCircle, LogOut, RefreshCcw } from "lucide-react";
import ModelUploadModal from "./ModelUploadModal";
import Form from "./Form";
import RecycleModal from "./RecycleModal";

const Header = ({ user, setUser, setModels }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRecycleModalOpen, setIsRecycleModalOpen] = useState(false);

  const dropdownRef = useRef(null); // Referência para o dropdown
  const modalRef = useRef(null); // Referência para o modal

  // Função para logout
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  // Fecha o dropdown ou os modais ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsLoginModalOpen(false);
        setIsUploadModalOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 flex items-center justify-between bg-white px-6 py-3 z-10 w-full">
      {/* Menu Central */}
      <div className="flex-1 flex justify-center space-x-4">
        <Link to="/" className="px-4 py-2 rounded-md hover:bg-gray-100">
          Modelos 3D
        </Link>
        <Link
          to="/marketplace"
          className="px-4 py-2 rounded-md hover:bg-gray-100"
        >
          Marketplace
        </Link>
      </div>

      {/* Barra de Pesquisa */}
      <div className="hidden md:flex items-center bg-gray-200 rounded-md px-3 py-1 w-full max-w-lg mr-4">
        <Search size={18} className="text-gray-500" />
        <input
          type="text"
          placeholder="Pesquisar..."
          className="bg-transparent outline-none px-2 w-full"
        />
      </div>

      {/* Botão de Adicionar Modelo */}
      {user && (
        <button
          className="px-4 py-2 bg-transparent text-black rounded-md flex items-center hover:bg-gray-200 transition mr-4"
          onClick={() => setIsUploadModalOpen(true)}
        >
          <PlusCircle size={18} className="mr-2" /> Adicionar Modelo
        </button>
      )}

      {/* Botão de Reciclar */}
      <button
        className="px-4 py-2 bg-green-500 text-white rounded-md flex items-center hover:bg-green-600 transition mr-4"
        onClick={() => setIsRecycleModalOpen(true)}
      >
        <RefreshCcw size={18} className="mr-2" /> Reciclar
      </button>

      {/* Usuário Logado */}
      {user ? (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center"
          >
            <img
              src={user.profileImage || "/default-avatar.png"}
              alt="Usuário"
              className="w-10 h-10 rounded-full cursor-pointer border"
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md">
              <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">
                Meu Perfil
              </Link>
              <Link to="/likes" className="block px-4 py-2 hover:bg-gray-100">
                Likes
              </Link>
              <Link
                to="/favorites"
                className="block px-4 py-2 hover:bg-gray-100"
              >
                Favoritos
              </Link>
              <Link
                to="/settings"
                className="block px-4 py-2 hover:bg-gray-100"
              >
                Configurações
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-red-600 hover:bg-gray-100 w-full"
              >
                <LogOut size={16} className="mr-2" /> Sair
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          className="px-4 py-2 bg-black text-white rounded-md"
          onClick={() => setIsLoginModalOpen(true)}
        >
          Login
        </button>
      )}

      {/* Modais */}
      {isLoginModalOpen && (
        <div ref={modalRef}>
          <Form onClose={() => setIsLoginModalOpen(false)} setUser={setUser} />
        </div>
      )}
      {isUploadModalOpen && (
        <div ref={modalRef}>
          <ModelUploadModal
            closeModal={() => setIsUploadModalOpen(false)}
            user={user}
            setModels={setModels}
          />
        </div>
      )}

      {/* Modal de Reciclagem */}
      <RecycleModal
        isOpen={isRecycleModalOpen}
        onClose={() => setIsRecycleModalOpen(false)}
      />
    </header>
  );
};

export default Header;
