import React, { useState, useEffect } from "react";
import { useMarketplaceAPI } from "../../hooks/useMarketplaceAPI";
import { useDebounce } from "../../hooks/useDebounce";
import { Search, User, X, Loader2 } from "lucide-react";

/**
 * Componente UserSearchInput
 * Um campo de input autossuficiente para pesquisar e selecionar um utilizador.
 * Utiliza um "debounce" para evitar chamadas excessivas à API enquanto o utilizador digita.
 * @param {{
 * onUserSelect: (user: object | null) => void
 * }} props - As propriedades do componente.
 * @param {(user: object | null) => void} props.onUserSelect - Função de callback que é chamada quando um utilizador é selecionado ou quando a seleção é limpa.
 */
const UserSearchInput = ({ onUserSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Hook customizado para atrasar a busca, melhorando a performance.
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { searchUsers } = useMarketplaceAPI();

  // Efeito que dispara a busca na API quando o termo de pesquisa "debounced" muda.
  useEffect(() => {
    if (debouncedSearchTerm) {
      setIsSearching(true);
      searchUsers(debouncedSearchTerm).then((results) => {
        setSearchResults(results);
        setIsSearching(false);
      });
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchTerm, searchUsers]);

  // Lida com a seleção de um utilizador a partir dos resultados.
  const handleSelect = (user) => {
    setSelectedUser(user);
    onUserSelect(user); // Comunica o utilizador selecionado para o componente pai.
    setSearchTerm("");
    setSearchResults([]);
  };

  // Limpa o utilizador selecionado e volta ao estado de pesquisa.
  const handleClear = () => {
    setSelectedUser(null);
    onUserSelect(null); // Comunica a limpeza para o componente pai.
  };

  // Se um utilizador já foi selecionado, exibe um "chip" com o seu nome.
  if (selectedUser) {
    return (
      <div className="flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg bg-slate-50">
        <div className="flex items-center gap-2">
          <User size={16} className="text-blue-600" />
          <span className="font-medium text-slate-800">
            {selectedUser.username}
          </span>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="text-slate-500 hover:text-red-600"
          aria-label="Limpar seleção"
        >
          <X size={18} />
        </button>
      </div>
    );
  }

  // Renderiza o campo de input de pesquisa.
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search size={18} className="text-gray-400" />
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Buscar utilizador por nome..."
        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      />
      {isSearching && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 className="animate-spin h-5 w-5 text-blue-500" />
        </div>
      )}
      {searchResults.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {searchResults.map((user) => (
            <button
              key={user.id}
              type="button"
              className="w-full px-4 py-2 text-left hover:bg-slate-100 flex items-center gap-2"
              onClick={() => handleSelect(user)}
            >
              <User size={16} className="text-slate-500" /> {user.username}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSearchInput;
