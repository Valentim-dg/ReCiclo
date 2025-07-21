import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useDebounce } from "../hooks/useDebounce";
import { toast } from "react-toastify";
import { Search, PlusCircle, LogOut } from "lucide-react";
import { FaRecycle } from "react-icons/fa";
import Avatar from "./ui/Avatar";

// Componentes de modal
import Form from "./Form";
import ModelUploadModal from "./ModelUploadModal";
import RecycleModal from "./RecycleModal";

/**
 * Componente Header
 * A barra de navegação principal da aplicação. Gere a exibição de modais,
 * o dropdown do perfil do utilizador, a funcionalidade de logout e a barra de pesquisa.
 * @param {{
 * onSearch: (searchTerm: string) => void,
 * onActionComplete: () => void
 * }} props - As propriedades do componente.
 * @param {(searchTerm: string) => void} props.onSearch - Função de callback para notificar o App.jsx sobre uma nova pesquisa.
 * @param {() => void} props.onActionComplete - Função de callback (geralmente para re-buscar a lista de modelos) a ser passada para modais como o de upload.
 */
const Header = ({ onSearch, onActionComplete }) => {
  const { user, logout, refetchUser } = useAuth();
  const [activeModal, setActiveModal] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Efeito que executa a busca quando o termo "debounced" muda.
  useEffect(() => {
    if (debouncedSearchTerm !== undefined) {
      onSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, onSearch]);

  // Efeito para fechar o dropdown do perfil ao clicar fora dele.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate("/");
  };

  /**
   * Verifica se o utilizador está logado antes de abrir um modal para uma ação protegida.
   * Se não estiver logado, exibe uma notificação e abre o modal de login.
   * @param {'upload' | 'recycle'} modalType - O tipo de modal a ser aberto.
   */
  const handleProtectedAction = (modalType) => {
    if (user) {
      setActiveModal(modalType);
    } else {
      toast.info("Você precisa fazer login para realizar esta ação.");
      setActiveModal("login");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-20 w-full bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Esquerda: Logo e Navegação */}
            <div className="flex items-center gap-8">
              <Link to="/" className="font-bold text-xl text-slate-800">
                ReCiclo
              </Link>
              <nav className="hidden md:flex gap-4">
                <Link
                  to="/"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  Modelos 3D
                </Link>
                <Link
                  to="/marketplace"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  Marketplace
                </Link>
              </nav>
            </div>

            {/* Centro: Barra de Pesquisa */}
            <div className="flex-1 flex justify-center px-8">
              <div className="w-full max-w-lg">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Pesquisar modelos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full bg-slate-100 border border-transparent rounded-md py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Direita: Ações e Perfil do Utilizador */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleProtectedAction("upload")}
                className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                <PlusCircle size={18} /> Adicionar Modelo
              </button>
              <button
                onClick={() => handleProtectedAction("recycle")}
                className="hidden sm:flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-800"
              >
                <FaRecycle size={16} /> Reciclar
              </button>

              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button onClick={() => setIsDropdownOpen((o) => !o)}>
                    <Avatar
                      src={user.image}
                      alt={user.username}
                      sizeClasses="w-9 h-9"
                    />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-1">
                      <Link
                        to="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                      >
                        Meu Perfil
                      </Link>
                      <Link
                        to="/dashboard"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/likes"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                      >
                        Likes
                      </Link>
                      <Link
                        to="/favorites"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                      >
                        Favoritos
                      </Link>
                      <div className="border-t border-slate-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-100"
                      >
                        <LogOut size={16} /> Sair
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setActiveModal("login")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Modais */}
      {activeModal === "login" && <Form onClose={() => setActiveModal(null)} />}
      {activeModal === "upload" && (
        <ModelUploadModal
          closeModal={() => setActiveModal(null)}
          onUploadSuccess={onActionComplete}
        />
      )}
      {activeModal === "recycle" && (
        <RecycleModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          onActionComplete={refetchUser}
        />
      )}
    </>
  );
};

export default Header;
