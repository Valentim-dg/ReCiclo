import { useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

/**
 * Obtém o token de autenticação do localStorage e formata os headers para a requisição.
 * Exibe um erro se o token não for encontrado.
 * @returns {object | null} O objeto de configuração dos headers ou null se não houver token.
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    toast.error("Você precisa estar logado para realizar esta ação.");
    return null;
  }
  return { headers: { Authorization: `Token ${token}` } };
};

/**
 * Hook useRecycleAPI
 * Encapsula a lógica de comunicação com a API para o registo de reciclagem.
 * Gere o estado de submissão e a chamada à API.
 * @returns {{
 * isSubmitting: boolean,
 * submitRecyclingData: (formData: object) => Promise<object | null>
 * }}
 */
export const useRecycleAPI = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Envia os dados do formulário de reciclagem para a API.
   * @param {object} formData - O objeto de estado do formulário de reciclagem.
   * @returns {Promise<object | null>} A resposta da API em caso de sucesso, ou null em caso de falha.
   */
  const submitRecyclingData = useCallback(async (formData) => {
    const config = getAuthHeaders();
    if (!config) return null;

    setIsSubmitting(true);
    try {
      const payload = {
        type:
          formData.bottleType === "Outro"
            ? formData.customBottleType
            : formData.bottleType,
        volume:
          formData.volume === "Outro" ? formData.customVolume : formData.volume,
        quantity: Number(formData.quantity),
      };

      const response = await axios.post(
        "http://127.0.0.1:8000/api/recycle/bottles/",
        payload,
        config
      );

      // Retorna os dados da resposta para que o componente possa decidir o que fazer (ex: mostrar conquistas).
      return response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Erro ao registar a reciclagem."
      );
      console.error("Erro ao registar reciclagem:", error);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { submitRecyclingData, isSubmitting };
};
