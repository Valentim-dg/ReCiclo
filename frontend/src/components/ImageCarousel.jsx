import React, { useState } from "react";

const ImageCarousel = ({ image }) => {
  const images = Array.isArray(image) ? image : [image]; // Se houver múltiplas imagens

  const [currentIndex, setCurrentIndex] = useState(0);

  const prevImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const nextImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="relative w-full h-64 md:h-96 bg-gray-200 rounded-lg overflow-hidden shadow-lg">
      {/* Imagem Principal */}
      <img
        src={images[currentIndex]}
        alt="Modelo 3D"
        className="w-full h-full object-cover transition-transform duration-300"
      />

      {/* Botão Esquerda */}
      {images.length > 1 && (
        <button
          onClick={prevImage}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
        >
          ◀
        </button>
      )}

      {/* Botão Direita */}
      {images.length > 1 && (
        <button
          onClick={nextImage}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
        >
          ▶
        </button>
      )}
    </div>
  );
};

export default ImageCarousel;
