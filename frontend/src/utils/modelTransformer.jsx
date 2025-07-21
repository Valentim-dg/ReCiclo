/**
 * Função transformModelsData
 * Transforma um array de objetos de modelo vindos da API para um formato
 * otimizado para a UI do frontend. Mapeia chaves de 'snake_case' para 'camelCase',
 * extrai a imagem principal e garante valores de fallback para campos opcionais.
 * @param {object[]} modelsData - O array de objetos de modelo brutos da API.
 * @returns {object[]} Um novo array de objetos de modelo formatados para a UI.
 */
export const transformModelsData = (modelsData) => {
  // Garante que a função sempre retorne um array, mesmo que a entrada seja inválida.
  if (!Array.isArray(modelsData)) {
    console.error(
      "transformModelsData esperava um array, mas recebeu:",
      modelsData
    );
    return [];
  }

  return modelsData.map((model) => ({
    id: model.id,
    name: model.name,
    description: model.description,
    likes: model.likes || 0,
    downloads: model.downloads || 0,
    isLiked: model.is_liked,
    isSaved: model.is_saved,
    price: model.price,
    isFree: model.is_free,

    // Extrai a imagem principal do array de imagens para ser usada como pré-visualização.
    image:
      model.images && model.images.length > 0
        ? model.images[0].image
        : "/placeholder.png",

    // Mantém o array original de imagens para uso em galerias.
    images: model.images || [],

    // Transforma os dados do utilizador aninhado.
    userName: model.user?.username || "Utilizador",
    userHandle: model.user?.handle || "utilizador",
    userImage: model.user?.image || null, // Usa null para que o componente Avatar mostre o ícone
  }));
};
