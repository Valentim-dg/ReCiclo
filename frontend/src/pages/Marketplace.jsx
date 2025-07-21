import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useMarketplaceAPI } from "../hooks/useMarketplaceAPI";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ShoppingCart,
  Tag,
  ListChecks,
  RefreshCcw,
  Gift,
  Heart,
  Plus,
  Loader,
} from "lucide-react";

// Importa os componentes de cada aba do marketplace
import BuyTab from "../components/marketplace/BuyTab";
import SellTab from "../components/marketplace/SellTab";
import MyOffersTab from "../components/marketplace/MyOffersTab";
import ExchangesTab from "../components/marketplace/ExchangesTab";
import DirectExchangeTab from "../components/marketplace/DirectExchangeTab";
import UserBalanceCard from "../components/marketplace/UserBalanceCard";
import DonateTab from "../components/marketplace/DonateTab";

/**
 * Componente Marketplace
 * A página principal do marketplace, que serve como um hub central para todas as
 * transações de moedas. Utiliza um sistema de abas para separar as diferentes
 * funcionalidades, como comprar, vender, doar e gerir trocas.
 * @param {{ user: object }} props - As propriedades do componente.
 */
const Marketplace = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("buy");

  // Hook customizado que encapsula toda a lógica de estado e chamadas à API para o marketplace.
  const {
    data,
    userBalance,
    isLoading,
    isSubmitting,
    createOffer,
    fetchData,
    purchaseOffer,
    cancelOffer,
    createExchangeRequest,
    fetchUserBalance,
    respondToExchangeRequest,
    cancelExchangeRequest,
  } = useMarketplaceAPI();

  // Efeito que busca os dados iniciais do marketplace quando o utilizador é carregado.
  useEffect(() => {
    if (user) {
      fetchData();
      fetchUserBalance();
    }
  }, [user, fetchData, fetchUserBalance]);

  // Se não houver um token, o hook useMarketplaceAPI já exibe um toast.
  // Esta verificação adicional garante que nada seja renderizado.
  if (!localStorage.getItem("authToken")) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Marketplace</h1>
          <p className="text-gray-600">
            Você precisa estar logado para aceder ao marketplace.
          </p>
        </div>
      </div>
    );
  }

  // Exibe um ecrã de carregamento enquanto os dados iniciais são buscados.
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader className="animate-spin h-10 w-10 text-blue-500" />
        <p className="ml-4">A carregar dados do marketplace...</p>
      </div>
    );
  }

  // Estrutura de dados para organizar a navegação por abas em grupos lógicos.
  const tabGroups = {
    explore: [
      { id: "buy", label: "Comprar", icon: ShoppingCart },
      { id: "donate", label: "Doações", icon: Heart },
    ],
    create: [
      { id: "sell", label: "Vender", icon: Tag },
      { id: "create_donation", label: "Criar Doação", icon: Plus },
    ],
    manage: [
      { id: "myoffers", label: "Minhas Ofertas", icon: ListChecks },
      { id: "exchanges", label: "Solicitações", icon: RefreshCcw },
      { id: "direct", label: "Nova Troca", icon: Gift },
    ],
  };

  // Renderiza o conteúdo da aba ativa com base no estado 'activeTab'.
  const renderActiveTab = () => {
    switch (activeTab) {
      case "buy":
        return (
          <BuyTab
            offers={data.availableOffers.filter((o) => o.offer_type === "sale")}
            onPurchase={purchaseOffer}
            onRefetch={fetchData}
          />
        );
      case "donate":
        return (
          <BuyTab
            offers={data.availableOffers.filter((o) => o.offer_type === "gift")}
            onPurchase={purchaseOffer}
            onRefetch={fetchData}
            isDonationTab={true}
          />
        );
      case "sell":
        return (
          <SellTab
            userBalance={userBalance}
            onOfferCreated={createOffer}
            isSubmitting={isSubmitting}
          />
        );
      case "create_donation":
        return (
          <DonateTab
            userBalance={userBalance}
            onOfferCreated={createOffer}
            isSubmitting={isSubmitting}
          />
        );
      case "myoffers":
        return (
          <MyOffersTab
            offers={data.myOffers}
            onCancel={cancelOffer}
            onRefetch={fetchData}
          />
        );
      case "exchanges":
        return (
          <ExchangesTab
            requests={data.exchangeRequests}
            currentUser={user}
            onRespond={respondToExchangeRequest}
            onCancel={cancelExchangeRequest}
            onRefetch={fetchData}
          />
        );
      case "direct":
        return (
          <DirectExchangeTab
            userBalance={userBalance}
            onExchangeCreated={createExchangeRequest}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return (
          <BuyTab
            offers={data.availableOffers.filter((o) => o.offer_type === "sale")}
            onPurchase={purchaseOffer}
            onRefetch={fetchData}
          />
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <ToastContainer position="bottom-right" autoClose={3000} />
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800">
          Marketplace de Moedas
        </h1>
        <p className="mt-2 text-slate-600">
          Compre, venda, doe ou troque as suas moedas com outros utilizadores.
        </p>
      </div>
      <UserBalanceCard
        user={user}
        balance={userBalance}
        onRefetch={fetchUserBalance}
      />
      <div className="mb-6 bg-white rounded-xl shadow-md">
        <div className="flex flex-wrap items-center border-b border-slate-200">
          {Object.entries(tabGroups).map(([groupName, tabs], groupIndex) => (
            <React.Fragment key={groupName}>
              {groupIndex > 0 && (
                <div className="h-6 w-px bg-slate-200 mx-2"></div>
              )}
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-3 px-5 font-medium text-sm transition-all border-b-2 ${
                      activeTab === tab.id
                        ? "text-blue-600 border-blue-600 bg-blue-50"
                        : "text-gray-500 border-transparent hover:text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-md p-6">
        {renderActiveTab()}
      </div>
    </div>
  );
};

export default Marketplace;
