import React, { useState } from "react";
import UserSearchInput from "./UserSearchInput";
import {
  Coins,
  TrendingUp,
  RefreshCcw,
  Loader2,
  ArrowRight,
} from "lucide-react";

const INITIAL_FORM_STATE = {
  receiver_id: null,
  offer_recycling_coins: 0,
  offer_reputation_coins: 0,
  request_recycling_coins: 0,
  request_reputation_coins: 0,
  message: "",
};

/**
 * Componente DirectExchangeTab
 * Renderiza um formulário para criar uma proposta de troca direta de moedas com outro utilizador.
 * @param {{
 * userBalance: { recyclingCoins: number, reputationCoins: number },
 * onExchangeCreated: (formState: object) => Promise<boolean>,
 * isSubmitting: boolean
 * }} props - As propriedades do componente.
 */
const DirectExchangeTab = ({
  userBalance,
  onExchangeCreated,
  isSubmitting,
}) => {
  const [formState, setFormState] = useState(INITIAL_FORM_STATE);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const intValue = Math.max(0, parseInt(value, 10) || 0);
    setFormState((prev) => ({
      ...prev,
      [name]: name.includes("coins") ? intValue : value,
    }));
  };

  const handleUserSelect = (user) => {
    setFormState((prev) => ({ ...prev, receiver_id: user ? user.id : null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formState.receiver_id) {
      alert("Por favor, selecione um utilizador para a troca.");
      return;
    }
    const success = await onExchangeCreated(formState);
    if (success) {
      setFormState(INITIAL_FORM_STATE); // Limpa o formulário
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 text-center">
        Nova Proposta de Troca
      </h2>

      <fieldset className="bg-white p-6 rounded-xl shadow-sm border">
        <legend className="text-lg font-semibold px-2">1. Destinatário</legend>
        <p className="text-sm text-slate-500 mb-4">
          Procure pelo utilizador com quem você deseja negociar.
        </p>
        <UserSearchInput onUserSelect={handleUserSelect} />
      </fieldset>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <fieldset className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
          <legend className="text-lg font-semibold px-2 text-blue-700">
            2. Você Oferece
          </legend>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
              <Coins size={16} className="text-green-600" /> Moedas de
              Reciclagem
            </label>
            <input
              type="number"
              name="offer_recycling_coins"
              value={formState.offer_recycling_coins}
              onChange={handleInputChange}
              min="0"
              className="w-full p-2 border rounded-md"
            />
            <p className="text-xs text-slate-500 mt-1">
              Seu saldo: {userBalance.recyclingCoins}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
              <TrendingUp size={16} className="text-purple-600" /> Moedas de
              Reputação
            </label>
            <input
              type="number"
              name="offer_reputation_coins"
              value={formState.offer_reputation_coins}
              onChange={handleInputChange}
              min="0"
              className="w-full p-2 border rounded-md"
            />
            <p className="text-xs text-slate-500 mt-1">
              Seu saldo: {userBalance.reputationCoins}
            </p>
          </div>
        </fieldset>

        <fieldset className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
          <legend className="text-lg font-semibold px-2 text-green-700">
            3. Em Troca de
          </legend>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
              <Coins size={16} className="text-green-600" /> Moedas de
              Reciclagem
            </label>
            <input
              type="number"
              name="request_recycling_coins"
              value={formState.request_recycling_coins}
              onChange={handleInputChange}
              min="0"
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
              <TrendingUp size={16} className="text-purple-600" /> Moedas de
              Reputação
            </label>
            <input
              type="number"
              name="request_reputation_coins"
              value={formState.request_reputation_coins}
              onChange={handleInputChange}
              min="0"
              className="w-full p-2 border rounded-md"
            />
          </div>
        </fieldset>
      </div>

      <fieldset>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          4. Mensagem (Opcional)
        </label>
        <textarea
          id="message"
          name="message"
          value={formState.message}
          onChange={handleInputChange}
          rows="3"
          className="w-full p-2 border rounded-md"
          placeholder="Adicione uma mensagem ou proposta..."
        ></textarea>
      </fieldset>

      <div className="flex justify-end pt-4 border-t">
        <button
          type="submit"
          disabled={!formState.receiver_id || isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-lg shadow-sm transition flex items-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed"
          title={
            !formState.receiver_id
              ? "Selecione um destinatário para enviar a proposta"
              : ""
          }
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" /> Enviando...
            </>
          ) : (
            <>
              <RefreshCcw size={18} /> Enviar Proposta
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default DirectExchangeTab;
