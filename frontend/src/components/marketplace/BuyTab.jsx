import React, { useState } from "react";
import {
  ShoppingCart,
  RefreshCcw,
  Gift,
  Loader2,
  Coins,
  TrendingUp,
} from "lucide-react";
import Avatar from "../ui/Avatar";

/**
 * Badge para exibir o tipo da oferta (Venda ou Doação).
 * @param {{ type: 'sale' | 'gift' }} props
 */
const OfferTypeBadge = ({ type }) => (
  <span
    className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
      type === "sale"
        ? "bg-blue-100 text-blue-800"
        : "bg-green-100 text-green-800"
    }`}
  >
    {type === "sale" ? "Venda" : "Doação"}
  </span>
);

/**
 * Badge para exibir o tipo da moeda (Reciclagem ou Reputação).
 * @param {{ type: 'recycling' | 'reputation' }} props
 */
const CoinTypeBadge = ({ type }) => (
  <span
    className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
      type === "recycling"
        ? "bg-green-100 text-green-800"
        : "bg-purple-100 text-purple-800"
    }`}
  >
    {type === "recycling" ? "Reciclagem" : "Reputação"}
  </span>
);

/**
 * Card para exibir uma única oferta no marketplace.
 */
const OfferCard = ({ offer, onPurchase, purchasingId }) => (
  <div
    key={offer.id}
    className="bg-white rounded-xl border border-gray-200 flex flex-col shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
  >
    {/* Cabeçalho do Card com informações do vendedor */}
    <div className="border-b border-gray-100 p-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <Avatar
            src={offer.seller?.image}
            alt={offer.seller?.username}
            sizeClasses="w-10 h-10"
          />
          <div>
            <p className="text-sm text-gray-500">Vendedor</p>
            <p className="font-bold text-slate-800">{offer.seller.username}</p>
          </div>
        </div>
        <OfferTypeBadge type={offer.offer_type} />
      </div>
    </div>

    {/* Corpo do Card com detalhes da oferta */}
    <div className="p-4 flex-grow">
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`p-3 rounded-full ${
            offer.coin_type === "recycling" ? "bg-green-100" : "bg-purple-100"
          }`}
        >
          {offer.coin_type === "recycling" ? (
            <Coins size={20} className="text-green-700" />
          ) : (
            <TrendingUp size={20} className="text-purple-700" />
          )}
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{offer.amount}</p>
          <p className="text-sm text-slate-600">
            <CoinTypeBadge type={offer.coin_type} />
          </p>
        </div>
      </div>

      {offer.offer_type === "sale" && (
        <div className="space-y-2 mb-4 p-3 bg-slate-50 rounded-lg text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Preço unitário:</span>
            <span className="font-medium text-slate-800">
              {offer.price_per_coin}
            </span>
          </div>
          <div className="flex justify-between text-base">
            <span className="text-slate-600 font-medium">Preço Total:</span>
            <span className="font-bold text-slate-900">
              {offer.total_price}{" "}
              {offer.coin_type === "recycling" ? "Rep" : "Rec"}
            </span>
          </div>
        </div>
      )}
    </div>

    {/* Botão de Ação */}
    <div className="p-4 bg-gray-50/50">
      <button
        onClick={() => onPurchase(offer.id)}
        disabled={purchasingId === offer.id}
        className={`w-full flex justify-center items-center gap-2 py-2.5 rounded-lg font-bold transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed ${
          offer.offer_type === "sale"
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "bg-green-600 hover:bg-green-700 text-white"
        }`}
      >
        {purchasingId === offer.id ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Processando...</span>
          </>
        ) : offer.offer_type === "sale" ? (
          <>
            <ShoppingCart size={16} />
            <span>Comprar</span>
          </>
        ) : (
          <>
            <Gift size={16} />
            <span>Aceitar Doação</span>
          </>
        )}
      </button>
    </div>
  </div>
);

/**
 * Componente BuyTab
 * Renderiza a aba "Comprar" ou "Doações" do marketplace, listando as ofertas disponíveis.
 * @param {{
 * offers: object[],
 * onPurchase: (offerId: number) => void,
 * onRefetch: () => void,
 * isDonationTab?: boolean
 * }} props - As propriedades do componente.
 */
const BuyTab = ({ offers, onPurchase, onRefetch, isDonationTab = false }) => {
  const [purchasingId, setPurchasingId] = useState(null);

  const handlePurchaseClick = async (offerId) => {
    setPurchasingId(offerId);
    await onPurchase(offerId);
    setPurchasingId(null);
  };

  const pageTitle = isDonationTab ? "Doações Disponíveis" : "Ofertas de Venda";
  const emptyMessage = isDonationTab
    ? "Não há doações disponíveis no momento."
    : "Não há ofertas de venda no momento.";

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">{pageTitle}</h2>
        <button
          onClick={onRefetch}
          className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg transition text-sm font-medium"
        >
          <RefreshCcw size={14} />
          <span>Atualizar</span>
        </button>
      </div>

      {offers.length === 0 ? (
        <div className="text-center py-16 px-6 bg-slate-50 rounded-lg">
          <div className="mb-4 flex justify-center">
            <div className="p-4 bg-slate-200 rounded-full">
              <ShoppingCart size={32} className="text-slate-500" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-700">
            {emptyMessage}
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              onPurchase={handlePurchaseClick}
              purchasingId={purchasingId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BuyTab;
