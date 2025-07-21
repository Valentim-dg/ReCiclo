import React, { useState, useEffect } from "react";
import { User } from "lucide-react";

/**
 * Componente Avatar
 * Renderiza uma imagem de perfil circular. Se a imagem falhar ao carregar ou
 * se nenhuma imagem for fornecida, exibe um ícone de utilizador como fallback.
 * @param {{
 * src?: string | null,
 * alt?: string,
 * sizeClasses?: string
 * }} props - As propriedades do componente.
 * @param {string | null} [props.src] - A URL da imagem a ser exibida.
 * @param {string} [props.alt="Avatar"] - O texto alternativo para a imagem.
 * @param {string} [props.sizeClasses="w-10 h-10"] - As classes de tamanho do Tailwind CSS para o avatar.
 */
const Avatar = ({ src, alt = "Avatar", sizeClasses = "w-10 h-10" }) => {
  const [imageError, setImageError] = useState(false);

  // Efeito para resetar o estado de erro se a prop 'src' mudar.
  // Isto garante que o componente tente carregar uma nova imagem se a prop for atualizada.
  useEffect(() => {
    setImageError(false);
  }, [src]);

  // Se não houver uma URL de imagem ou se o carregamento da imagem tiver falhado,
  // renderiza o ícone de fallback.
  if (!src || imageError) {
    return (
      <div
        className={`${sizeClasses} rounded-full bg-slate-300 flex items-center justify-center border-2 border-slate-200`}
      >
        <User className="text-white" style={{ width: "60%", height: "60%" }} />
      </div>
    );
  }

  // Tenta renderizar a imagem principal.
  return (
    <img
      src={src}
      alt={alt}
      className={`${sizeClasses} rounded-full object-cover border-2 border-slate-200`}
      // Se a imagem falhar ao carregar (ex: URL quebrada), atualiza o estado para acionar o fallback.
      onError={() => setImageError(true)}
    />
  );
};

export default Avatar;
