import React, { useState, useEffect } from "react";
import { useRecycleAPI } from "../hooks/useRecycleAPI";
import { toast } from "react-toastify";
import RecycleForm from "./recycling/RecycleForm";
import AchievementsDisplay from "./recycling/AchievementsDisplay";
import { X } from "lucide-react";

/**
 * Componente RecycleModal
 * Um modal multi-etapas para o registo de reciclagem.
 * Gere a exibição do formulário de reciclagem e, após o sucesso,
 * pode exibir uma tela de conquistas desbloqueadas antes de fechar.
 * @param {{
 * isOpen: boolean,
 * onClose: () => void,
 * onActionComplete: (result: object) => void
 * }} props - As propriedades do componente.
 * @param {boolean} props.isOpen - Controla a visibilidade do modal.
 * @param {() => void} props.onClose - Função de callback para fechar o modal.
 * @param {(result: object) => void} props.onActionComplete - Função de callback para notificar o componente pai que uma ação foi concluída com sucesso, passando os dados da resposta da API.
 */
const RecycleModal = ({ isOpen, onClose, onActionComplete }) => {
  // Estado para controlar qual ecrã mostrar: 'form' ou 'achievements'
  const [view, setView] = useState("form");
  const [submissionResult, setSubmissionResult] = useState(null);
  const { submitRecyclingData, isSubmitting } = useRecycleAPI();

  // Reseta o modal para o estado inicial sempre que ele for aberto.
  useEffect(() => {
    if (isOpen) {
      setView("form");
      setSubmissionResult(null);
    }
  }, [isOpen]);

  /**
   * Lida com a submissão do formulário de reciclagem.
   * Chama a API e decide qual ecrã mostrar com base na resposta.
   * @param {object} formData - Os dados do formulário preenchidos pelo utilizador.
   */
  const handleFormSubmit = async (formData) => {
    const result = await submitRecyclingData(formData);

    if (result) {
      setSubmissionResult(result);

      // Notifica o App para atualizar os dados do utilizador.
      // Isto irá ativar a verificação de level up no AuthContext.
      if (typeof onActionComplete === "function") {
        onActionComplete(result);
      }

      // Se NÃO houve level up, mostra um toast de sucesso genérico.
      if (!result.leveled_up) {
        toast.success("Reciclagem registada com sucesso!");
      }

      // Decide se mostra a tela de conquistas ou fecha o modal
      if (result.new_achievements && result.new_achievements.length > 0) {
        setView("achievements");
      } else {
        onClose();
      }
    }
  };

  /**
   * Lida com o fecho da tela de conquistas.
   */
  const handleCloseAchievements = () => {
    // onActionComplete já foi chamado, então apenas fechamos o modal.
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
          aria-label="Fechar modal"
        >
          <X size={20} />
        </button>

        {view === "form" && (
          <>
            <h2 className="text-xl font-semibold mb-4">Reciclar Garrafas</h2>
            <RecycleForm
              onSubmit={handleFormSubmit}
              isSubmitting={isSubmitting}
            />
          </>
        )}

        {view === "achievements" && (
          <AchievementsDisplay
            achievements={submissionResult.new_achievements}
            onClose={handleCloseAchievements}
          />
        )}
      </div>
    </div>
  );
};

export default RecycleModal;
