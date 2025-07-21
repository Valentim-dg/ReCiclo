import { useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// --- Funções Auxiliares ---

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
 * Formata uma mensagem de erro a partir de uma resposta da API para exibição.
 * @param {object} error - O objeto de erro do Axios.
 * @param {string} defaultMessage - Uma mensagem padrão para usar como fallback.
 * @returns {string} A mensagem de erro formatada.
 */
const formatApiError = (error, defaultMessage) => {
  if (error.response?.data) {
    const errorData = error.response.data;
    if (errorData.error) return errorData.error;
    if (errorData.detail) return errorData.detail;

    const firstErrorField = Object.keys(errorData)[0];
    if (firstErrorField && Array.isArray(errorData[firstErrorField])) {
      return errorData[firstErrorField][0];
    }
  }
  return defaultMessage;
};

/**
 * Hook useMarketplaceAPI
 * Encapsula toda a lógica de estado e comunicação com a API para as funcionalidades do Marketplace.
 * @returns {{
 * data: { availableOffers: object[], myOffers: object[], exchangeRequests: object[] },
 * userBalance: { recyclingCoins: number, reputationCoins: number },
 * isLoading: boolean,
 * isSubmitting: boolean,
 * fetchData: () => Promise<void>,
 * fetchUserBalance: () => Promise<void>,
 * searchUsers: (term: string) => Promise<object[]>,
 * createOffer: (offerData: object) => Promise<boolean>,
 * purchaseOffer: (offerId: number) => Promise<void>,
 * cancelOffer: (offerId: number) => Promise<void>,
 * createExchangeRequest: (exchangeData: object) => Promise<boolean>,
 * respondToExchangeRequest: (requestId: number, accept: boolean) => Promise<void>,
 * cancelExchangeRequest: (requestId: number) => Promise<void>
 * }}
 */
export const useMarketplaceAPI = () => {
  const [data, setData] = useState({
    availableOffers: [],
    myOffers: [],
    exchangeRequests: [],
  });
  const [userBalance, setUserBalance] = useState({
    recyclingCoins: 0,
    reputationCoins: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const config = getAuthHeaders();
    if (!config) {
      setIsLoading(false);
      return;
    }
    try {
      const [offersRes, myOffersRes, exchangeRes] = await Promise.all([
        axios.get("http://127.0.0.1:8000/api/coin-offers/", config),
        axios.get("http://127.0.0.1:8000/api/my-offers/", config),
        axios.get("http://127.0.0.1:8000/api/exchange-requests/", config),
      ]);
      setData({
        availableOffers: offersRes.data.results || offersRes.data,
        myOffers: myOffersRes.data.results || myOffersRes.data,
        exchangeRequests: exchangeRes.data.results || exchangeRes.data,
      });
    } catch (error) {
      toast.error("Erro ao carregar dados do marketplace.");
      console.error("Erro ao buscar dados do marketplace:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUserBalance = useCallback(async () => {
    const config = getAuthHeaders();
    if (!config) return;
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/user/dashboard/",
        config
      );
      setUserBalance({
        recyclingCoins: response.data.recyclingCoins,
        reputationCoins: response.data.reputationCoins,
      });
    } catch (error) {
      console.error("Erro ao buscar saldo do usuário:", error);
    }
  }, []);

  const searchUsers = useCallback(async (term) => {
    if (!term || term.length < 2) return [];
    const config = getAuthHeaders();
    if (!config) return [];
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/users/?search=${term}`,
        config
      );
      return response.data.results || response.data;
    } catch (error) {
      toast.error("Erro ao buscar usuários.");
      return [];
    }
  }, []);

  const createOffer = useCallback(
    async (offerData) => {
      if (!offerData.amount || offerData.amount <= 0) {
        toast.error("A quantidade de moedas deve ser maior que zero.");
        return false;
      }
      if (
        offerData.offer_type === "sale" &&
        (!offerData.price_per_coin || offerData.price_per_coin <= 0)
      ) {
        toast.error("O preço por moeda deve ser maior que zero.");
        return false;
      }
      if (
        offerData.coin_type === "recycling" &&
        offerData.amount > userBalance.recyclingCoins
      ) {
        toast.error(
          "Você não tem moedas de reciclagem suficientes para criar esta oferta."
        );
        return false;
      }
      if (
        offerData.coin_type === "reputation" &&
        offerData.amount > userBalance.reputationCoins
      ) {
        toast.error(
          "Você não tem moedas de reputação suficientes para criar esta oferta."
        );
        return false;
      }

      const config = getAuthHeaders();
      if (!config) return false;
      setIsSubmitting(true);
      try {
        await axios.post(
          "http://127.0.0.1:8000/api/coin-offers/",
          offerData,
          config
        );
        toast.success("Oferta criada com sucesso!");
        await fetchData();
        await fetchUserBalance();
        return true;
      } catch (error) {
        toast.error(formatApiError(error, "Erro ao criar oferta."));
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchData, fetchUserBalance, userBalance]
  );

  const purchaseOffer = useCallback(
    async (offerId) => {
      const config = getAuthHeaders();
      if (!config) return;
      try {
        await axios.post(
          `http://127.0.0.1:8000/api/coin-offers/${offerId}/purchase/`,
          {},
          config
        );
        toast.success("Compra realizada com sucesso!");
        await fetchData();
        await fetchUserBalance();
      } catch (error) {
        toast.error(formatApiError(error, "Erro ao comprar oferta."));
      }
    },
    [fetchData, fetchUserBalance]
  );

  const cancelOffer = useCallback(
    async (offerId) => {
      const config = getAuthHeaders();
      if (!config) return;
      try {
        await axios.post(
          `http://127.0.0.1:8000/api/coin-offers/${offerId}/cancel/`,
          {},
          config
        );
        toast.success("Oferta cancelada com sucesso!");
        await fetchData();
        await fetchUserBalance();
      } catch (error) {
        toast.error(formatApiError(error, "Erro ao cancelar oferta."));
      }
    },
    [fetchData, fetchUserBalance]
  );

  const createExchangeRequest = useCallback(
    async (exchangeData) => {
      if (
        exchangeData.offer_recycling_coins > userBalance.recyclingCoins ||
        exchangeData.offer_reputation_coins > userBalance.reputationCoins
      ) {
        toast.error("Saldo insuficiente para fazer a oferta.");
        return false;
      }
      if (
        exchangeData.offer_recycling_coins +
          exchangeData.offer_reputation_coins ===
          0 ||
        exchangeData.request_recycling_coins +
          exchangeData.request_reputation_coins ===
          0
      ) {
        toast.error(
          "Uma troca deve envolver a oferta e o pedido de pelo menos uma moeda."
        );
        return false;
      }

      const config = getAuthHeaders();
      if (!config) return false;
      setIsSubmitting(true);
      try {
        await axios.post(
          "http://127.0.0.1:8000/api/exchange-requests/",
          exchangeData,
          config
        );
        toast.success("Solicitação de troca enviada!");
        await fetchData();
        await fetchUserBalance();
        return true;
      } catch (error) {
        toast.error(
          formatApiError(error, "Erro ao criar solicitação de troca.")
        );
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchData, fetchUserBalance, userBalance]
  );

  const respondToExchangeRequest = useCallback(
    async (requestId, accept) => {
      const config = getAuthHeaders();
      if (!config) return;
      try {
        await axios.post(
          `http://127.0.0.1:8000/api/exchange-requests/${requestId}/respond/`,
          { accept },
          config
        );
        toast.success(
          accept ? "Troca aceite com sucesso!" : "Troca rejeitada."
        );
        await fetchData();
        await fetchUserBalance();
      } catch (error) {
        toast.error(formatApiError(error, "Erro ao responder à solicitação."));
      }
    },
    [fetchData, fetchUserBalance]
  );

  const cancelExchangeRequest = useCallback(
    async (requestId) => {
      const config = getAuthHeaders();
      if (!config) return;
      try {
        await axios.delete(
          `http://127.0.0.1:8000/api/exchange-requests/${requestId}/`,
          config
        );
        toast.success("Solicitação de troca cancelada.");
        await fetchData();
      } catch (error) {
        toast.error(formatApiError(error, "Erro ao cancelar a solicitação."));
      }
    },
    [fetchData]
  );

  return {
    data,
    userBalance,
    isLoading,
    isSubmitting,
    fetchData,
    fetchUserBalance,
    searchUsers,
    createOffer,
    purchaseOffer,
    cancelOffer,
    createExchangeRequest,
    respondToExchangeRequest,
    cancelExchangeRequest,
  };
};
