import React, { useState } from "react";
import { Gift, Loader2 } from "lucide-react";
import UserSearchInput from "./UserSearchInput";

const INITIAL_FORM_STATE = {
  amount: "",
  specific_user_id: null,
};

/**
 * Componente DonateTab
 * Renderiza um formulário para criar uma oferta de doação de moedas de reciclagem.
 * As doações podem ser públicas ou direcionadas a um utilizador específico.
 * @param {{
 * userBalance: { recyclingCoins: number },
 * onOfferCreated: (offerData: object) => Promise<boolean>,
 * isSubmitting: boolean
 * }} props - As propriedades do componente.
 * @param {object} props.userBalance - O saldo de moedas do utilizador atual.
 * @param {(offerData: object) => Promise<boolean>} props.onOfferCreated - Função de callback para ser executada ao submeter o formulário.
 * @param {boolean} props.isSubmitting - Indica se uma ação de submissão está em andamento.
 */
const DonateTab = ({ userBalance, onOfferCreated, isSubmitting }) => {
  const [offerData, setOfferData] = useState(INITIAL_FORM_STATE);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOfferData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserSelect = (user) => {
    setOfferData((prev) => ({
      ...prev,
      specific_user_id: user ? user.id : null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Constrói o payload para a API, definindo o tipo como 'gift'
    const dataToSend = {
      offer_type: "gift",
      coin_type: "recycling", // Apenas moedas de reciclagem podem ser doadas
      amount: parseInt(offerData.amount, 10) || 0,
    };

    if (offerData.specific_user_id) {
      dataToSend.specific_user_id = offerData.specific_user_id;
    }

    const success = await onOfferCreated(dataToSend);
    if (success) {
      // Limpa o formulário
      setOfferData(INITIAL_FORM_STATE);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">Fazer uma Doação</h2>
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
        <div className="bg-slate-50 p-4 rounded-lg border">
          <h3 className="text-lg font-semibold text-slate-800">
            Moeda a ser Doada: Reciclagem
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Seu saldo disponível: {userBalance.recyclingCoins} moedas.
          </p>
        </div>

        <fieldset className="space-y-4">
          <div>
            <label
              htmlFor="amount"
              className="block text-slate-700 font-medium mb-2"
            >
              Quantidade a Doar
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              value={offerData.amount}
              onChange={handleInputChange}
              min="1"
              required
              className="w-full p-2 border rounded-md"
              placeholder="Ex: 50"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-2">
              Destinatário (Opcional)
            </label>
            <UserSearchInput onUserSelect={handleUserSelect} />
            <p className="text-sm text-slate-500 mt-2">
              Se não especificar, a doação ficará disponível para qualquer
              utilizador.
            </p>
          </div>
        </fieldset>

        <div className="flex justify-end pt-4 border-t">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-lg shadow-sm transition flex items-center justify-center gap-2 disabled:bg-slate-400 w-48"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" /> A doar...
              </>
            ) : (
              <>
                <Gift size={18} /> Criar Doação
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DonateTab;
