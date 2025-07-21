// src/context/AuthContext.js

import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";
import axios from "axios";
import { toast } from "react-toastify";
import LevelUpNotification from "../components/notifications/LevelUpNotification";

/**
 * @typedef {object} AuthContextType
 * @property {object | null} user - O objeto do utilizador autenticado ou null.
 * @property {boolean} isLoading - Verdadeiro enquanto a sessão inicial está a ser verificada.
 * @property {() => void} login - Função para ser chamada após um login bem-sucedido para buscar os dados do utilizador.
 * @property {() => void} logout - Função para terminar a sessão do utilizador.
 * @property {() => Promise<void>} refetchUser - Função para forçar a atualização dos dados do utilizador a partir da API.
 */

/**
 * @type {React.Context<AuthContextType | null>}
 */
const AuthContext = createContext(null);

/**
 * AuthProvider
 * Um componente Provedor que envolve a aplicação e gere todo o estado de autenticação,
 * incluindo o objeto do utilizador, o estado de carregamento e as funções de login/logout.
 * @param {{children: React.ReactNode}} props
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/auth/user/",
          {
            headers: { Authorization: `Token ${token}` },
          }
        );

        // Compara o nível do estado anterior com o novo para despoletar a notificação
        if (user && response.data.level > user.level) {
          toast(<LevelUpNotification newLevel={response.data.level} />, {
            style: {
              background: "transparent",
              boxShadow: "none",
              padding: "0",
            },
            icon: false,
            hideProgressBar: true,
            autoClose: 6000,
          });
        }

        setUser(response.data);
      } catch (error) {
        console.error("Sessão inválida, limpando token.", error);
        localStorage.removeItem("authToken");
        setUser(null);
      }
    }
    setIsLoading(false);
  }, [user]);

  // Efeito que roda uma vez na montagem da aplicação para verificar a sessão.
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Função para ser chamada pelo modal de Form após um login bem-sucedido.
  const login = useCallback(() => {
    setIsLoading(true);
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Função para terminar a sessão do utilizador.
  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    setUser(null);
  }, []);

  // O valor que será partilhado com todos os componentes descendentes.
  const value = {
    user,
    isLoading,
    login,
    logout,
    refetchUser: fetchCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook useAuth
 * Um hook customizado para facilitar o acesso ao AuthContext em qualquer
 * componente da aplicação, garantindo que ele seja usado dentro de um AuthProvider.
 * @returns {AuthContextType} O valor do contexto de autenticação.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
