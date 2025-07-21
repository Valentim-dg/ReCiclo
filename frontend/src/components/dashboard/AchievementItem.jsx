import React from "react";
import { FaTrophy, FaLock } from "react-icons/fa";

/**
 * Componente AchievementItem
 * * Renderiza um único item na lista de conquistas do dashboard.
 * Exibe estilos visuais diferentes para conquistas desbloqueadas e bloqueadas,
 * e mostra uma barra de progresso para as que ainda não foram alcançadas.
 * * @param {{ achievement: object }} props - As propriedades do componente.
 * @param {object} props.achievement - O objeto da conquista vindo da API.
 * @param {boolean} props.achievement.unlocked - Indica se a conquista foi desbloqueada.
 * @param {object} props.achievement.progress - Contém o progresso atual e total.
 * @param {string} props.achievement.title - O título da conquista.
 * @param {string} props.achievement.description - A descrição da conquista.
 * @param {number} [props.achievement.reward_points=10] - A recompensa em moedas (opcional).
 */
const AchievementItem = ({ achievement }) => {
  const { unlocked, progress, title, description, reward_points } = achievement;

  const progressPercentage =
    progress.total > 0
      ? Math.min((progress.current / progress.total) * 100, 100)
      : 0;

  return (
    <li
      className={`flex items-start p-4 rounded-lg border transition-all duration-200 ${
        unlocked
          ? "bg-yellow-50 border-yellow-200"
          : "bg-slate-50 border-slate-200"
      }`}
    >
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
          unlocked ? "bg-yellow-400" : "bg-slate-300"
        }`}
      >
        {unlocked ? (
          <FaTrophy className="text-white" size={20} />
        ) : (
          <FaLock className="text-slate-500" size={18} />
        )}
      </div>
      <div className="w-full">
        <h4
          className={`font-bold ${
            unlocked ? "text-yellow-900" : "text-slate-700"
          }`}
        >
          {title}
        </h4>
        <p className="text-sm text-slate-600">{description}</p>

        {unlocked && (
          <p className="text-xs font-semibold text-yellow-700 mt-1">
            + {reward_points || 10} Moedas de Reputação
          </p>
        )}

        {!unlocked && progress && (
          <div className="mt-2">
            <div className="w-full bg-slate-200 rounded-full h-1.5">
              <div
                className="bg-yellow-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-right text-slate-500 mt-1">
              {progress.current} / {progress.total} {progress.unit}
            </p>
          </div>
        )}
      </div>
    </li>
  );
};

export default AchievementItem;
