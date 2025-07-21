import React from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useModelDetails } from "../hooks/useModelDetails";

// Sub-componentes
import { ModelImageGallery } from "../components/details/ModelImageGallery";
import { ModelInfo } from "../components/details/ModelInfo";
import { ActionButtons } from "../components/details/ActionButtons";
import { CuratorPanel } from "../components/details/CuratorPanel";
import { CommentSection } from "../components/details/CommentSection";
import { ArrowLeft, Loader2 } from "lucide-react";

/**
 * Componente ModelDetails
 * A página principal para exibir os detalhes completos de um único modelo 3D.
 * Utiliza o hook customizado `useModelDetails` para gerir a busca de dados e as interações do utilizador.
 */
const ModelDetails = () => {
  const { id } = useParams();
  const { user } = useAuth(); // Pega o utilizador global do contexto para lógicas de permissão (ex: curador)

  // O hook gere todo o estado e a lógica de API para esta página.
  const {
    model,
    loading,
    error,
    actionLoading,
    handleAction,
    setVisibility,
    handleDownload,
  } = useModelDetails(id);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin h-16 w-16 text-blue-500" />
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="text-center p-10">
        <h2 className="text-2xl font-bold text-red-500">Erro</h2>
        <p className="text-slate-600">{error}</p>
        <Link to="/" className="mt-4 inline-block text-blue-600">
          Voltar para a Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors group"
          >
            <ArrowLeft
              className="mr-2 group-hover:-translate-x-1 transition-transform"
              size={20}
            />
            <span className="font-medium">Voltar para Modelos</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="lg:col-span-3">
            <ModelImageGallery images={model.images} />
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-lg shadow-lg sticky top-8">
              <ModelInfo model={model} />
              <ActionButtons
                model={model}
                actionLoading={actionLoading}
                onLike={() => handleAction("like")}
                onSave={() => handleAction("save")}
                onDownload={handleDownload}
              />
              {/* O Painel de Curador só é renderizado se o utilizador logado tiver a permissão. */}
              {user?.is_curator && (
                <CuratorPanel
                  model={model}
                  onSetVisibility={setVisibility}
                  isLoading={actionLoading.visibility}
                />
              )}
            </div>
          </div>
        </div>

        {/* <div className="mt-12 bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-slate-800">
            Comentários
          </h2>
          <CommentSection modelId={id} />
        </div> */}
      </div>
    </div>
  );
};

export default ModelDetails;
