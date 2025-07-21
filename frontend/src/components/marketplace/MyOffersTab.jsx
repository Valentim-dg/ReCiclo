import React, { useState } from "react";
import {
  ListChecks,
  RefreshCcw,
  Coins,
  TrendingUp,
  User,
  Trash2,
  Loader2,
} from "lucide-react";

/**
 * Badge para exibir o status da oferta com cores e texto traduzido.
 * @param {{status: 'active' | 'completed' | 'cancelled'}} props
 */
const StatusBadge = ({ status }) => {
  const statusConfig = {
    active: {
      text: "Ativa",
      styles: "bg-green-100 text-green-800 border-green-200",
    },
    completed: {
      text: "Concluída",
      styles: "bg-blue-100 text-blue-800 border-blue-200",
    },
    cancelled: {
      text: "Cancelada",
      styles: "bg-gray-100 text-gray-800 border-gray-200",
    },
  };
  const currentStatus = statusConfig[status] || {
    text: status,
    styles: "bg-gray-100",
  };
  return (
    <span
      className={`px-3 py-1 text-xs font-medium rounded-full border ${currentStatus.styles}`}
    >
      {currentStatus.text}
    </span>
  );
};

/**
 * Badge para exibir o tipo da oferta (Venda ou Doação).
 * @param {{type: 'sale' | 'gift'}} props
 */
const OfferTypeBadge = ({ type }) => (
  <span
    className={`px-3 py-1 text-xs font-medium rounded-full border ${
      type === "sale"
        ? "bg-blue-50 text-blue-700 border-blue-200"
        : "bg-green-50 text-green-700 border-green-200"
    }`}
  >
    {type === "sale" ? "Venda" : "Doação"}
  </span>
);

/**
 * Badge para exibir o tipo da moeda (Reciclagem ou Reputação).
 * @param {{type: 'recycling' | 'reputation'}} props
 */
const CoinTypeBadge = ({ type }) => (
  <span
    className={`px-3 py-1 text-xs font-medium rounded-full border ${
      type === "recycling"
        ? "bg-green-50 text-green-700 border-green-200"
        : "bg-purple-50 text-purple-700 border-purple-200"
    }`}
  >
    {type === "recycling" ? "Reciclagem" : "Reputação"}
  </span>
);

/**
 * Card para exibir uma única oferta criada pelo utilizador.
 */
const MyOfferCard = ({ offer, onCancel, cancellingId }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
    <div className="border-b border-gray-100 p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <CoinTypeBadge type={offer.coin_type} />
          <OfferTypeBadge type={offer.offer_type} />
        </div>
        <StatusBadge status={offer.status} />
      </div>
    </div>
    <div className="p-4 flex-grow">
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`p-2 rounded-full ${
            offer.coin_type === "recycling" ? "bg-green-100" : "bg-purple-100"
          }`}
        >
          {offer.coin_type === "recycling" ? (
            <Coins size={18} className="text-green-700" />
          ) : (
            <TrendingUp size={18} className="text-purple-700" />
          )}
        </div>
        <div>
          <p className="text-lg font-bold text-slate-800">
            {offer.amount}{" "}
            {offer.coin_type === "recycling"
              ? "Moedas de Reciclagem"
              : "Moedas de Reputação"}
          </p>
        </div>
      </div>
      {offer.offer_type === "sale" && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
          <div className="flex justify-between">
            <span>Preço Unitário:</span>
            <span className="font-medium">{offer.price_per_coin}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Preço Total:</span>
            <span className="font-bold">
              {offer.total_price}{" "}
              {offer.coin_type === "recycling" ? "Rep" : "Rec"}
            </span>
          </div>
        </div>
      )}
      {offer.specific_user && (
        <div className="p-3 bg-blue-50 rounded-lg text-sm flex items-center gap-2">
          <User size={16} className="text-blue-700" />
          <span>
            Oferta direcionada para:{" "}
            <span className="font-medium">{offer.specific_user.username}</span>
          </span>
        </div>
      )}
    </div>
    <div className="p-4 bg-gray-50/50">
      {offer.status === "active" ? (
        <button
          onClick={() => onCancel(offer.id)}
          disabled={cancellingId === offer.id}
          className="w-full flex justify-center items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-2 rounded-lg transition disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {cancellingId === offer.id ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>A cancelar...</span>
            </>
          ) : (
            <>
              <Trash2 size={16} />
              <span>Cancelar Oferta</span>
            </>
          )}
        </button>
      ) : (
        <p className="text-center text-sm text-gray-500">
          Esta oferta não pode mais ser alterada.
        </p>
      )}
    </div>
  </div>
);

/**
 * Componente MyOffersTab
 * Renderiza a aba "Minhas Ofertas" do marketplace, listando todas as ofertas
 * criadas pelo utilizador e permitindo o cancelamento de ofertas ativas.
 * @param {{
 * offers: object[],
 * onCancel: (offerId: number) => void,
 * onRefetch: () => void
 * }} props - As propriedades do componente.
 */
const MyOffersTab = ({ offers, onCancel, onRefetch }) => {
  const [cancellingId, setCancellingId] = useState(null);

  const handleCancelClick = async (offerId) => {
    setCancellingId(offerId);
    await onCancel(offerId);
    setCancellingId(null);
  };

  if (offers.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <div className="mb-4 flex justify-center">
          <div className="p-3 bg-gray-100 rounded-full">
            <ListChecks size={24} className="text-gray-400" />
          </div>
        </div>
        <p className="text-gray-500 mb-2">
          Você ainda não criou nenhuma oferta.
        </p>
        <p className="text-sm text-gray-400">
          Vá para a aba "Vender" ou "Criar Doação" para criar a sua primeira
          oferta.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Minhas Ofertas Criadas
        </h2>
        <button
          onClick={onRefetch}
          className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg transition text-sm font-medium"
        >
          <RefreshCcw size={14} />
          <span>Atualizar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {offers.map((offer) => (
          <MyOfferCard
            key={offer.id}
            offer={offer}
            onCancel={handleCancelClick}
            cancellingId={cancellingId}
          />
        ))}
      </div>
    </div>
  );
};

export default MyOffersTab;
