import React, { useState, useMemo } from "react";
import { Tag, Loader2, ArrowRight, TrendingUp, Coins } from "lucide-react";
import { toast } from "react-toastify";

/**
 * Componente SellTab
 * Renderiza o formulário para utilizadores criarem ofertas de venda de Moedas de Reciclagem.
 * A interface permite que o utilizador defina a quantidade e escolha entre rácios de troca pré-definidos.
 * Inclui validação de frontend e um resumo da transação em tempo real.
 * @param {{
 * userBalance: { recyclingCoins: number },
 * onOfferCreated: (offerData: object) => Promise<boolean>,
 * isSubmitting: boolean
 * }} props - As propriedades do componente.
 * @param {object} props.userBalance - O saldo de moedas do utilizador atual.
 * @param {(offerData: object) => Promise<boolean>} props.onOfferCreated - Função de callback para ser executada ao submeter o formulário.
 * @param {boolean} props.isSubmitting - Indica se uma ação de submissão está em andamento.
 */
const SellTab = ({ userBalance, onOfferCreated, isSubmitting }) => {
  const [amount, setAmount] = useState("");
  const [exchangeRate, setExchangeRate] = useState("1"); // '1' para 1:1, '0.5' para 2:1

  // Calcula os valores em tempo real para feedback do utilizador
  const { totalToReceive, isAmountValid } = useMemo(() => {
    const numAmount = Number(amount);
    const rate = Number(exchangeRate);

    const validAmount = !isNaN(numAmount) && numAmount >= 5;

    if (!validAmount) {
      return { totalToReceive: 0, isAmountValid: false };
    }

    // Math.floor garante que o resultado é sempre um número inteiro (ex: 5 * 0.5 = 2.5 -> 2).
    const result = Math.floor(numAmount * rate);
    return { totalToReceive: result, isAmountValid: true };
  }, [amount, exchangeRate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAmountValid) {
      toast.error("A quantidade a vender deve ser de, no mínimo, 5 moedas.");
      return;
    }

    const dataToSend = {
      offer_type: "sale",
      coin_type: "recycling",
      amount: Number(amount),
      price_per_coin: Number(exchangeRate),
    };

    const success = await onOfferCreated(dataToSend);
    if (success) {
      setAmount("");
      setExchangeRate("1"); // Reseta para o padrão
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        Criar Oferta de Venda
      </h2>
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
        <div className="bg-slate-50 p-4 rounded-lg border">
          <h3 className="text-lg font-semibold text-slate-800">
            Moeda à Venda: Reciclagem
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
              Quantidade a Vender
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="5"
              required
              className="w-full p-2 border rounded-md"
              placeholder="Mínimo 5 moedas"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-2">
              Rácio de Troca
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                className={`flex flex-col text-center p-4 rounded-lg border-2 cursor-pointer transition ${
                  exchangeRate === "1"
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="exchangeRate"
                  value="1"
                  checked={exchangeRate === "1"}
                  onChange={(e) => setExchangeRate(e.target.value)}
                  className="sr-only"
                />
                <p className="font-bold text-slate-800">Justo (1:1)</p>
                <p className="text-xs text-slate-500 mt-1">
                  1 Moeda de Reciclagem por 1 Moeda de Reputação
                </p>
              </label>
              <label
                className={`flex flex-col text-center p-4 rounded-lg border-2 cursor-pointer transition ${
                  exchangeRate === "0.5"
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="exchangeRate"
                  value="0.5"
                  checked={exchangeRate === "0.5"}
                  onChange={(e) => setExchangeRate(e.target.value)}
                  className="sr-only"
                />
                <p className="font-bold text-slate-800">Rápido (2:1)</p>
                <p className="text-xs text-slate-500 mt-1">
                  2 Moedas de Reciclagem por 1 Moeda de Reputação
                </p>
              </label>
            </div>
          </div>
        </fieldset>

        {/* Secção de Resumo da Transação */}
        <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
          <h4 className="font-semibold text-slate-800 mb-2">
            Resumo da Oferta
          </h4>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Coins size={16} className="text-green-600" />
              <span className="text-slate-600">Você venderá:</span>
            </div>
            <span className="font-bold text-green-700">
              {Number(amount) || 0} Moedas de Reciclagem
            </span>
          </div>
          <div className="flex items-center justify-center my-2">
            <ArrowRight size={16} className="text-slate-400" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-purple-600" />
              <span className="text-slate-600">E receberá:</span>
            </div>
            <span className="font-bold text-purple-700">
              {totalToReceive} Moedas de Reputação
            </span>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button
            type="submit"
            disabled={isSubmitting || !isAmountValid}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-lg shadow-sm transition flex items-center justify-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed w-48"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" /> A criar...
              </>
            ) : (
              <>
                <Tag size={18} /> Criar Oferta
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SellTab;
