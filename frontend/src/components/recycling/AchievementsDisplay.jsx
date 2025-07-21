import React from "react";
import { FaTrophy } from "react-icons/fa";

/**
 * Componente AchievementsDisplay
 * Renderiza um modal ou uma secção para exibir uma lista de conquistas recém-desbloqueadas.
 * É um componente puramente visual que celebra o progresso do utilizador.
 * @param {{
 * achievements: object[],
 * onClose: () => void
 * }} props - As propriedades do componente.
 * @param {object[]} props.achievements - Array de objetos de conquista, cada um contendo 'title' e 'description'.
 * @param {() => void} props.onClose - Função de callback para ser executada quando o botão "Continuar" é clicado.
 */
const AchievementsDisplay = ({ achievements, onClose }) => (
  <div className="text-center">
    <h2 className="text-2xl font-bold mb-4 text-slate-800">
      Novas Conquistas!
    </h2>
    <ul className="space-y-3 my-4">
      {achievements.map((ach, index) => (
        <li
          key={index}
          className="bg-yellow-50 p-4 rounded-lg flex items-start text-left border border-yellow-200"
        >
          <FaTrophy
            size={24}
            className="text-yellow-500 mr-4 mt-1 flex-shrink-0"
          />
          <div>
            <p className="font-bold text-yellow-800">{ach.title}</p>
            <p className="text-sm text-slate-600">{ach.description}</p>
          </div>
        </li>
      ))}
    </ul>
    <button
      onClick={onClose}
      className="w-full mt-4 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700"
    >
      Continuar
    </button>
  </div>
);

export default AchievementsDisplay;
