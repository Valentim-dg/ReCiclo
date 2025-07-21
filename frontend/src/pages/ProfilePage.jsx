import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

import ProfileForm from "../components/profile/ProfileForm";
import UserModelsGrid from "../components/profile/UserModelsGrid";
import { Loader2 } from "lucide-react";

/**
 * Componente ProfilePage
 * A página de gestão de perfil do utilizador. Permite que o utilizador edite as suas
 * informações pessoais e visualize/gestione os modelos 3D que publicou.
 * @param {{
 * onModelsChange: () => void
 * }} props - As propriedades do componente.
 * @param {() => void} props.onModelsChange - Função de callback para notificar o componente App de que a lista global de modelos precisa de ser atualizada (ex: após uma edição ou exclusão).
 */
const ProfilePage = ({ onModelsChange }) => {
  const { user, refetchUser } = useAuth();
  const [myModels, setMyModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Busca a lista de modelos criados pelo utilizador autenticado a partir da API.
   */
  const fetchMyModels = useCallback(async () => {
    if (!user) return;
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/models3d/my_models/",
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      setMyModels(response.data.results || response.data);
    } catch (error) {
      console.error("Erro ao buscar meus modelos:", error);
    }
  }, [user]);

  // Efeito para carregar os dados da página (modelos do utilizador) quando o componente monta ou o utilizador muda.
  useEffect(() => {
    const loadPageData = async () => {
      setIsLoading(true);
      await fetchMyModels();
      setIsLoading(false);
    };
    if (user) {
      loadPageData();
    }
  }, [user, fetchMyModels]);

  /**
   * Função de callback que é acionada após uma alteração (edição ou exclusão)
   * num dos modelos do utilizador. Atualiza tanto a lista local quanto a global.
   */
  const handleModelUpdate = () => {
    // Atualiza a lista local de modelos nesta página.
    fetchMyModels();
    // Notifica o componente App para que ele atualize a lista global de modelos (ex: na Home).
    if (typeof onModelsChange === "function") {
      onModelsChange();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-16 w-16 text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-10">
        <p>Você precisa estar logado para ver seu perfil.</p>
        <Link to="/" className="text-blue-500 mt-4 inline-block">
          Voltar para a Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-slate-800">
          Gerenciamento de Perfil
        </h1>
        <p className="mt-2 text-slate-600">
          Atualize suas informações e gerencie seus modelos.
        </p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <ProfileForm currentUser={user} onProfileUpdate={refetchUser} />
        </div>
        <div className="lg:col-span-2">
          <UserModelsGrid models={myModels} onModelChange={handleModelUpdate} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
