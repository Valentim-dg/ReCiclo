import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

/**
 * Hook useModelDetails
 * Encapsula toda a lógica de estado e comunicação com a API para a página de detalhes de um modelo.
 * Gere a busca de dados, o estado de carregamento e as ações do utilizador (curtir, salvar, baixar, moderar).
 * @param {string | number} modelId - O ID do modelo a ser buscado.
 * @returns {{
 * model: object | null,
 * loading: boolean,
 * error: string | null,
 * actionLoading: { like: boolean, save: boolean, visibility: boolean, download: boolean },
 * handleAction: (endpoint: 'like' | 'save') => Promise<void>,
 * setVisibility: (isVisible: boolean) => Promise<void>,
 * handleDownload: () => Promise<void>
 * }}
 */
export const useModelDetails = (modelId) => {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({
    like: false,
    save: false,
    visibility: false,
    download: false,
  });

  const fetchModelDetails = useCallback(async () => {
    if (!modelId) return;
    setLoading(true);
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/models3d/${modelId}/`,
        {
          headers: token ? { Authorization: `Token ${token}` } : {},
        }
      );
      setModel(response.data);
    } catch (err) {
      setError("Modelo não encontrado ou falha ao carregar.");
    } finally {
      setLoading(false);
    }
  }, [modelId]);

  useEffect(() => {
    fetchModelDetails();
  }, [fetchModelDetails]);

  // Lida com ações genéricas como 'like' e 'save', com atualização otimista e rollback.
  const handleAction = useCallback(
    async (endpoint) => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Você precisa estar logado.");
        return;
      }

      const originalModel = { ...model };
      setActionLoading((prev) => ({ ...prev, [endpoint]: true }));

      // Atualização Otimista da UI
      setModel((prev) => {
        if (endpoint === "like")
          return {
            ...prev,
            is_liked: !prev.is_liked,
            likes: prev.is_liked ? prev.likes - 1 : prev.likes + 1,
          };
        if (endpoint === "save") return { ...prev, is_saved: !prev.is_saved };
        return prev;
      });

      try {
        await axios.post(
          `http://127.0.0.1:8000/api/models3d/${modelId}/${endpoint}/`,
          {},
          {
            headers: { Authorization: `Token ${token}` },
          }
        );
      } catch (err) {
        toast.error(`Erro ao processar ação.`);
        setModel(originalModel); // Rollback em caso de erro
      } finally {
        setActionLoading((prev) => ({ ...prev, [endpoint]: false }));
      }
    },
    [model, modelId]
  );

  // Lida com a ação de moderação de um curador.
  const setVisibility = useCallback(
    async (isVisible) => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Ação não permitida. Faça login novamente.");
        return;
      }
      setActionLoading((prev) => ({ ...prev, visibility: true }));
      try {
        await axios.post(
          `http://127.0.0.1:8000/api/models3d/${modelId}/set_visibility/`,
          { is_visible: isVisible },
          { headers: { Authorization: `Token ${token}` } }
        );
        setModel((prev) => ({ ...prev, is_visible: isVisible }));
        toast.success(
          `Modelo ${isVisible ? "restaurado" : "ocultado"} com sucesso!`
        );
      } catch (error) {
        toast.error("Falha ao moderar o modelo.");
        console.error("Erro na moderação:", error);
      } finally {
        setActionLoading((prev) => ({ ...prev, visibility: false }));
      }
    },
    [modelId]
  );

  // Lida com o download do ficheiro do modelo.
  const handleDownload = useCallback(async () => {
    if (!model) return;
    const token = localStorage.getItem("authToken");

    if (!token) {
      toast.error("Você precisa estar logado para baixar modelos.");
      return;
    }

    setActionLoading((prev) => ({ ...prev, download: true }));

    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/models3d/${modelId}/download/`,
        {
          headers: { Authorization: `Token ${token}` },
          responseType: "blob",
        }
      );

      // Cria um link temporário para iniciar o download do ficheiro no navegador.
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const contentDisposition = response.headers["content-disposition"];
      let filename = `modelo_${modelId}.zip`;
      if (contentDisposition) {
        const matches = contentDisposition.match(/filename="?([^"]+)"?/);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      }
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      setModel((prev) => ({ ...prev, downloads: (prev.downloads || 0) + 1 }));
      toast.success("Download iniciado!");
    } catch (error) {
      // Trata respostas de erro que vêm como um 'blob' de JSON.
      if (error.response?.data instanceof Blob) {
        try {
          const errorText = await error.response.data.text();
          const errorJson = JSON.parse(errorText);
          toast.error(
            errorJson.error || "Não foi possível realizar o download."
          );
        } catch (parseError) {
          toast.error("Ocorreu um erro inesperado no servidor.");
        }
      } else {
        toast.error("Erro de rede ou servidor indisponível.");
      }
    } finally {
      setActionLoading((prev) => ({ ...prev, download: false }));
    }
  }, [model, modelId]);

  return {
    model,
    loading,
    error,
    actionLoading,
    handleAction,
    setVisibility,
    handleDownload,
  };
};
