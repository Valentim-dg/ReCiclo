import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Componente ModelImageGallery
 * Exibe uma galeria de imagens interativa para um modelo 3D.
 * Apresenta uma imagem principal e uma lista horizontal de miniaturas clicáveis
 * com setas de navegação que aparecem quando necessário.
 * @param {{ images: object[] }} props - As propriedades do componente.
 * @param {object[]} props.images - Array de objetos de imagem, cada um contendo uma URL.
 */
export const ModelImageGallery = ({ images }) => {
  // Estado para a imagem principal e para o efeito de transição
  const [mainImage, setMainImage] = useState(images?.[0]?.image || null);
  const [isFading, setIsFading] = useState(false);

  // Estado para controlar a visibilidade das setas de navegação
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Referência para o container das miniaturas para controlo do scroll
  const scrollContainerRef = useRef(null);

  // Função para verificar se o container de miniaturas pode ser rolado
  const checkScrollability = useCallback(() => {
    const el = scrollContainerRef.current;
    if (el) {
      const isScrollable = el.scrollWidth > el.clientWidth;
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(
        isScrollable && el.scrollLeft < el.scrollWidth - el.clientWidth - 1
      );
    }
  }, []);

  // Efeito para verificar a scrollabilidade na montagem e no redimensionamento da janela
  useEffect(() => {
    const timer = setTimeout(() => checkScrollability(), 100);
    window.addEventListener("resize", checkScrollability);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkScrollability);
    };
  }, [images, checkScrollability]);

  // Se não houver imagens, exibe um placeholder
  if (!images || images.length === 0) {
    return (
      <div className="bg-slate-200 aspect-video rounded-lg flex items-center justify-center text-slate-500">
        <p>Sem imagens disponíveis</p>
      </div>
    );
  }

  // Altera a imagem principal ao clicar numa miniatura
  const handleThumbnailClick = (newImageSrc) => {
    if (mainImage === newImageSrc) return;
    setIsFading(true);
    setTimeout(() => {
      setMainImage(newImageSrc);
      setIsFading(false);
    }, 150);
  };

  // Rola o container de miniaturas
  const handleScroll = (scrollOffset) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: scrollOffset,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Imagem Principal */}
      <div className="relative w-full aspect-video bg-slate-100 rounded-xl overflow-hidden shadow-lg">
        <img
          key={mainImage} // A chave força a re-renderização, útil para animações
          src={mainImage}
          alt="Visualização principal do modelo 3D"
          className={`w-full h-full object-contain transition-opacity duration-300 ${
            isFading ? "opacity-0" : "opacity-100"
          }`}
        />
      </div>

      {/* Galeria de Miniaturas com Setas de Navegação */}
      {images.length > 1 && (
        <div className="relative">
          <div
            ref={scrollContainerRef}
            onScroll={checkScrollability}
            className="flex items-center space-x-3 overflow-x-auto scrollbar-hide py-2"
          >
            {images.map((img, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden cursor-pointer transition-all duration-200"
                onClick={() => handleThumbnailClick(img.image)}
              >
                <img
                  src={img.image}
                  alt={`Miniatura ${index + 1}`}
                  className={`w-full h-full object-cover p-1 rounded-lg border-2
                    ${
                      mainImage === img.image
                        ? "border-blue-500"
                        : "border-transparent hover:border-gray-400"
                    }`}
                />
              </div>
            ))}
          </div>

          {/* Seta para a Esquerda */}
          {canScrollLeft && (
            <button
              onClick={() => handleScroll(-200)}
              className="absolute top-1/2 -translate-y-1/2 left-0 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-opacity"
              aria-label="Anterior"
            >
              <ChevronLeft size={20} className="text-gray-700" />
            </button>
          )}

          {/* Seta para a Direita */}
          {canScrollRight && (
            <button
              onClick={() => handleScroll(200)}
              className="absolute top-1/2 -translate-y-1/2 right-0 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-opacity"
              aria-label="Próxima"
            >
              <ChevronRight size={20} className="text-gray-700" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
