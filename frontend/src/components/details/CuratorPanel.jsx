import React from "react";
import { ShieldAlert, Loader2 } from "lucide-react";

/**
 * Componente CuratorPanel
 * Exibe um painel de moderação para utilizadores com permissões de curador.
 * Permite que curadores ocultem ou restaurem a visibilidade de um modelo.
 * @param {{
 * model: object,
 * onSetVisibility: (isVisible: boolean) => void,
 * isLoading: boolean
 * }} props - As propriedades do componente.
 * @param {object} props.model - O objeto do modelo 3D, deve conter a propriedade 'is_visible'.
 * @param {(isVisible: boolean) => void} props.onSetVisibility - Função de callback para ser executada ao clicar nos botões.
 * @param {boolean} props.isLoading - Indica se uma ação de moderação está em andamento para exibir um feedback de carregamento.
 */

export const CuratorPanel = ({ model, onSetVisibility, isLoading }) => {
  // Não renderiza o painel se o estado de visibilidade do modelo ainda não foi carregado.
  if (model.is_visible === undefined) {
    return null;
  }

  return (
    <div className="mt-6 p-4 border-t border-dashed border-red-300 bg-red-50 rounded-lg">
      <h4 className="font-bold text-red-700 mb-2">Painel de Curador</h4>

      {model.is_visible ? (
        <button
          onClick={() => onSetVisibility(false)}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-red-100 text-red-700 font-bold py-2 rounded-lg hover:bg-red-200 transition disabled:opacity-70"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <ShieldAlert size={16} />
          )}
          {isLoading ? "Ocultando..." : "Ocultar Modelo"}
        </button>
      ) : (
        <button
          onClick={() => onSetVisibility(true)}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-green-100 text-green-700 font-bold py-2 rounded-lg hover:bg-green-200 transition disabled:opacity-70"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <ShieldAlert size={16} />
          )}
          {isLoading ? "Restaurando..." : "Restaurar Visibilidade"}
        </button>
      )}
    </div>
  );
};
