import React from "react";
import { Heart, BookmarkPlus, Download, Loader2 } from "lucide-react";

/**
 * Componente ActionButtons
 * Renderiza um grupo de botões de ação para um modelo 3D, incluindo Curtir, Salvar e Baixar.
 * @param {{
 * model: object,
 * actionLoading: { like: boolean, save: boolean, download: boolean },
 * onLike: () => void,
 * onSave: () => void,
 * onDownload: () => void
 * }} props - As propriedades do componente.
 * @param {object} props.model - O objeto do modelo 3D contendo dados como 'is_liked', 'likes', etc.
 * @param {object} props.actionLoading - Um objeto que controla o estado de carregamento de cada botão.
 * @param {() => void} props.onLike - Função de callback para ser executada ao clicar no botão de Curtir.
 * @param {() => void} props.onSave - Função de callback para ser executada ao clicar no botão de Salvar.
 * @param {() => void} props.onDownload - Função de callback para ser executada ao clicar no botão de Baixar.
 */
export const ActionButtons = ({
  model,
  actionLoading,
  onLike,
  onSave,
  onDownload,
}) => {
  // --- Estilos Base para os Botões ---
  // Agrupamos as classes comuns para facilitar a manutenção e garantir consistência.
  const baseButtonStyles =
    "w-full sm:w-auto flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-semibold transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md";

  // --- Estilos Condicionais para os Botões de Like e Salvar ---
  const likeButtonStyles = model.is_liked
    ? "bg-red-500 text-white"
    : "bg-slate-200 text-slate-700 hover:bg-slate-300";

  const saveButtonStyles = model.is_saved
    ? "bg-blue-600 text-white"
    : "bg-slate-200 text-slate-700 hover:bg-slate-300";

  return (
    <div className="mt-6 flex flex-col sm:flex-row gap-3">
      {/* Botão de Like */}
      <button
        onClick={onLike}
        disabled={actionLoading.like}
        className={`${baseButtonStyles} ${likeButtonStyles}`}
      >
        <Heart size={18} className={model.is_liked ? "fill-current" : ""} />
        <span>{model.likes}</span>
        {actionLoading.like && (
          <Loader2 size={16} className="animate-spin ml-2" />
        )}
      </button>

      {/* Botão de Salvar */}
      <button
        onClick={onSave}
        disabled={actionLoading.save}
        className={`${baseButtonStyles} ${saveButtonStyles}`}
      >
        <BookmarkPlus
          size={18}
          className={model.is_saved ? "fill-current" : ""}
        />
        <span>{model.is_saved ? "Salvo" : "Salvar"}</span>
        {actionLoading.save && (
          <Loader2 size={16} className="animate-spin ml-2" />
        )}
      </button>

      {/* Botão de Download */}
      <button
        onClick={onDownload}
        disabled={actionLoading.download}
        className={`${baseButtonStyles} bg-green-600 text-white hover:bg-green-700`}
      >
        <Download size={18} />
        <span>Baixar</span>
        {actionLoading.download && (
          <Loader2 size={16} className="animate-spin ml-2" />
        )}
      </button>
    </div>
  );
};
