import React from "react";
import { Coins, TrendingUp, RefreshCcw } from "lucide-react";

/**
 * Componente UserBalanceCard
 * Exibe um card de destaque com o nome do utilizador e os seus saldos de moedas.
 * Inclui um botão para atualizar os saldos.
 * @param {{
 * user: object,
 * balance: { recyclingCoins: number, reputationCoins: number },
 * onRefetch: () => void
 * }} props - As propriedades do componente.
 * @param {object} props.user - O objeto do utilizador logado, deve conter 'username'.
 * @param {object} props.balance - Objeto com os saldos de moedas do utilizador.
 * @param {() => void} props.onRefetch - Função de callback para ser executada ao clicar no botão de atualizar.
 */
const UserBalanceCard = ({ user, balance, onRefetch }) => {
  // Determina se o saldo ainda está a ser carregado para dar feedback visual
  const isLoading = !balance;

  return (
    <div className="mb-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-white">
            Olá, {user?.username || "Visitante"}!
          </h2>
          <button
            onClick={onRefetch}
            className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition disabled:opacity-50"
            disabled={isLoading}
            aria-label="Atualizar Saldo"
          >
            <RefreshCcw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card para Moedas de Reciclagem */}
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 text-green-700 rounded-full">
                <Coins size={20} />
              </div>
              <p className="text-white font-medium">Moedas de Reciclagem</p>
            </div>
            <p className="text-3xl font-bold text-white">
              {balance?.recyclingCoins ?? "..."}
            </p>
          </div>

          {/* Card para Moedas de Reputação */}
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 text-purple-700 rounded-full">
                <TrendingUp size={20} />
              </div>
              <p className="text-white font-medium">Moedas de Reputação</p>
            </div>
            <p className="text-3xl font-bold text-white">
              {balance?.reputationCoins ?? "..."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserBalanceCard;
