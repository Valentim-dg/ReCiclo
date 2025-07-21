import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  RefreshCcw,
  Coins,
  TrendingUp,
  User,
  Check,
  X,
  Loader2,
  GitCommitHorizontal,
} from "lucide-react";
import Avatar from "../ui/Avatar";

/**
 * Sub-componente para exibir o detalhe de moedas numa troca.
 * @param {{title: string, recycling: number, reputation: number, titleColor?: string}} props
 */
const CoinBreakdown = ({
  title,
  recycling,
  reputation,
  titleColor = "text-slate-700",
}) => (
  <div className="bg-slate-50 p-4 rounded-lg border flex-1">
    <p className={`text-sm font-bold mb-2 ${titleColor}`}>{title}</p>
    <div className="space-y-2 text-sm">
      {recycling > 0 && (
        <div className="flex items-center gap-2 text-green-700 font-medium">
          <Coins size={16} /> <span>{recycling} de Reciclagem</span>
        </div>
      )}
      {reputation > 0 && (
        <div className="flex items-center gap-2 text-purple-700 font-medium">
          <TrendingUp size={16} /> <span>{reputation} de Reputação</span>
        </div>
      )}
      {recycling <= 0 && reputation <= 0 && (
        <p className="text-slate-400">Nenhuma moeda</p>
      )}
    </div>
  </div>
);

/**
 * Sub-componente para exibir o status da troca com cores e texto traduzido.
 * @param {{status: 'pending' | 'accepted' | 'rejected' | 'cancelled'}} props
 */
const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { text: "Pendente", styles: "bg-yellow-100 text-yellow-800" },
    accepted: { text: "Aceite", styles: "bg-green-100 text-green-800" },
    rejected: { text: "Rejeitada", styles: "bg-red-100 text-red-800" },
    cancelled: { text: "Cancelada", styles: "bg-gray-100 text-gray-800" },
  };
  const currentStatus = statusConfig[status] || {
    text: status,
    styles: "bg-gray-100",
  };
  return (
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${currentStatus.styles}`}
    >
      {currentStatus.text}
    </span>
  );
};

/**
 * Card para exibir uma única solicitação de troca e as ações disponíveis.
 */
const ExchangeRequestCard = ({ request, onRespond, onCancel }) => {
  const { user: currentUser } = useAuth();
  const [isResponding, setIsResponding] = useState(false);

  if (!currentUser) return null;

  const isSender = request.requester?.id === currentUser.id;
  const otherUser = isSender ? request.receiver : request.requester;

  const handleResponse = async (accept) => {
    setIsResponding(true);
    await onRespond(request.id, accept);
    setIsResponding(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-slate-50/50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Avatar
            src={otherUser?.image}
            alt={otherUser?.username}
            sizeClasses="w-10 h-10"
          />
          <div>
            <p className="text-sm text-slate-500">
              {isSender ? "Proposta para" : "Proposta de"}
            </p>
            <p className="font-bold text-slate-800">
              {otherUser?.username || "Desconhecido"}
            </p>
          </div>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <CoinBreakdown
          title={
            isSender
              ? "Você Oferece"
              : `${otherUser?.username || "Utilizador"} Oferece`
          }
          recycling={request.offer_recycling_coins}
          reputation={request.offer_reputation_coins}
          titleColor="text-blue-700"
        />
        <div className="flex-shrink-0 my-2 md:my-0">
          <GitCommitHorizontal
            size={24}
            className="text-slate-400 rotate-90 md:rotate-0"
          />
        </div>
        <CoinBreakdown
          title={isSender ? "Em Troca de" : "Você Oferece"}
          recycling={request.request_recycling_coins}
          reputation={request.request_reputation_coins}
          titleColor="text-green-700"
        />
      </div>

      {request.message && (
        <div className="p-4 border-t text-sm">
          <p className="text-slate-500 italic">"{request.message}"</p>
        </div>
      )}

      {request.status === "pending" && (
        <div className="p-4 bg-slate-50/50 flex gap-3">
          {!isSender ? (
            <>
              <button
                onClick={() => handleResponse(true)}
                disabled={isResponding}
                className="flex-1 flex justify-center items-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-slate-400"
              >
                {isResponding ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Check size={16} />
                )}{" "}
                Aceitar
              </button>
              <button
                onClick={() => handleResponse(false)}
                disabled={isResponding}
                className="flex-1 flex justify-center items-center gap-2 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-slate-400"
              >
                <X size={16} /> Rejeitar
              </button>
            </>
          ) : (
            <button
              onClick={() => onCancel(request.id)}
              className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancelar Solicitação
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Componente ExchangesTab
 * Renderiza a aba "Solicitações de Troca" do marketplace, listando todas as
 * trocas pendentes e concluídas do utilizador.
 * @param {{
 * requests: object[],
 * onRespond: (requestId: number, accept: boolean) => void,
 * onCancel: (requestId: number) => void,
 * onRefetch: () => void
 * }} props - As propriedades do componente.
 */
const ExchangesTab = ({ requests, onRespond, onCancel, onRefetch }) => {
  if (requests.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-slate-50 rounded-lg">
        <RefreshCcw size={32} className="text-slate-400 mb-4" />
        <p className="text-slate-500">
          Nenhuma solicitação de troca encontrada.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">
          Minhas Solicitações de Troca
        </h2>
        <button
          onClick={onRefetch}
          className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg transition text-sm font-medium"
        >
          <RefreshCcw size={14} /> Atualizar
        </button>
      </div>
      {requests.map((req) => (
        <ExchangeRequestCard
          key={req.id}
          request={req}
          onRespond={onRespond}
          onCancel={onCancel}
        />
      ))}
    </div>
  );
};

export default ExchangesTab;
