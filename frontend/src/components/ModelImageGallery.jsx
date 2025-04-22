// components/ModelImageGallery.jsx
import React, { useState } from "react";

const ModelImageGallery = ({ images }) => {
  const [mainImage, setMainImage] = useState(
    images?.length > 0 ? images[0].image : "/placeholder.png"
  );

  // Função para lidar com a troca da imagem principal
  const handleThumbnailClick = (image) => {
    setMainImage(image);
  };

  return (
    <div className="rounded-lg overflow-hidden">
      {/* Imagem Principal */}
      <div className="mb-4 overflow-hidden bg-gray-100">
        <img
          src={mainImage}
          alt="Visualização do modelo 3D"
          className="w-full h-96 object-contain rounded-lg"
        />
      </div>

      {/* Miniaturas */}
      {images && images.length > 1 && (
        <div className="flex space-x-3 overflow-x-auto py-2">
          {images.map((img, index) => (
            <div
              key={index}
              className={`cursor-pointer rounded overflow-hidden flex-shrink-0 w-20 h-20 border-2 ${
                mainImage === img.image
                  ? "border-blue-500"
                  : "border-transparent"
              }`}
              onClick={() => handleThumbnailClick(img.image)}
            >
              <img
                src={img.image}
                alt={`Miniatura ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelImageGallery;
