import React, { useState } from "react";
import axios from "axios";
import { X, Plus, Trash2, CheckCircle } from "lucide-react";

const ModelUploadModal = ({ closeModal, user, setModels, fetchModels }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Obtém o token correto do localStorage
  const token = localStorage.getItem("authToken");

  const handleFilesChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
  };

  const handleImagesChange = (e) => {
    const selectedImages = Array.from(e.target.files);
    setImages((prevImages) => [...prevImages, ...selectedImages]);
  };

  const removeFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const removeImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!user || !token) {
      setError("Você precisa estar logado para enviar um modelo.");
      return;
    }

    if (!name || !description || files.length === 0 || images.length === 0) {
      setError(
        "Preencha todos os campos e envie pelo menos um arquivo e uma imagem."
      );
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);

    // Adiciona múltiplos arquivos ao FormData
    files.forEach((file) => {
      formData.append("file", file);
    });

    // Adiciona múltiplas imagens ao FormData
    images.forEach((image) => {
      formData.append("image", image);
    });

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/models3d/",
        formData,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Mostrar mensagem de sucesso
      setSuccess(true);

      // Atualizar a lista de modelos
      if (typeof fetchModels === "function") {
        // Se temos uma função para buscar modelos do servidor, usamos ela
        await fetchModels(); // Esta é a linha chave que atualiza os modelos
      } else if (typeof setModels === "function") {
        // Caso contrário, tentamos atualizar o estado local
        setModels((prevModels) => [response.data, ...prevModels]);
      }

      // Fechar o modal após 1.5 segundos para mostrar a mensagem de sucesso
      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (error) {
      console.error("Erro ao enviar modelo:", error);
      let errorMessage = "Erro ao enviar modelo.";

      if (error.response && error.response.data) {
        console.log("Resposta de erro:", error.response.data);
        if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.file) {
          errorMessage = error.response.data.file[0];
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-lg font-semibold">Adicionar Modelo 3D</h2>
          <button onClick={closeModal} disabled={loading}>
            <X size={20} className="text-gray-600 hover:text-gray-800" />
          </button>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mt-3">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Mensagem de sucesso */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mt-3 flex items-center">
            <CheckCircle size={18} className="mr-2" />
            <p className="text-sm">Modelo enviado com sucesso!</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Nome do Modelo
            </label>
            <input
              type="text"
              className="mt-1 p-2 border rounded w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading || success}
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Descrição
            </label>
            <textarea
              className="mt-1 p-2 border rounded w-full"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={loading || success}
            />
          </div>

          {/* Upload de Múltiplos Arquivos STL */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Arquivos STL <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <label
                className={`cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded flex items-center ${
                  loading || success ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Plus size={16} className="mr-1" />
                Adicionar arquivos
                <input
                  type="file"
                  accept=".stl"
                  onChange={handleFilesChange}
                  className="hidden"
                  multiple
                  disabled={loading || success}
                />
              </label>
            </div>

            {/* Lista de arquivos selecionados */}
            {files.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-700">
                  Arquivos selecionados:
                </p>
                <ul className="mt-1 space-y-1">
                  {files.map((file, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded"
                    >
                      <span className="truncate">{file.name}</span>
                      {!loading && !success && (
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Upload de Múltiplas Imagens */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagens do Modelo <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <label
                className={`cursor-pointer bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded flex items-center ${
                  loading || success ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Plus size={16} className="mr-1" />
                Adicionar imagens
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImagesChange}
                  className="hidden"
                  multiple
                  disabled={loading || success}
                />
              </label>
            </div>

            {/* Lista de imagens selecionadas */}
            {images.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-700">
                  Imagens selecionadas:
                </p>
                <ul className="mt-1 space-y-1">
                  {images.map((image, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded"
                    >
                      <span className="truncate">{image.name}</span>
                      {!loading && !success && (
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button
            type="submit"
            className={`w-full mt-4 py-2 rounded transition ${
              success
                ? "bg-green-600 text-white"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
            disabled={loading || success}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Enviando...
              </span>
            ) : success ? (
              <span className="flex items-center justify-center">
                <CheckCircle size={18} className="mr-2" />
                Enviado com Sucesso
              </span>
            ) : (
              "Enviar Modelo"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ModelUploadModal;
