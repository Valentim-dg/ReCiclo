import React, { useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { X, ImagePlus, FilePlus, Trash2, Loader2 } from "lucide-react";

/**
 * Sub-componente para os campos de texto do formulário.
 */
const TextInfoForm = ({ formData, onFormChange }) => (
  <>
    <div>
      <label className="block text-sm font-medium">Nome do Modelo</label>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={onFormChange}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium">Descrição</label>
      <textarea
        name="description"
        value={formData.description}
        onChange={onFormChange}
        rows="3"
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        required
      />
    </div>
    <div>
      <label className="flex items-center">
        <input
          type="checkbox"
          name="is_free"
          checked={formData.is_free}
          onChange={onFormChange}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <span className="ml-2">Modelo Gratuito</span>
      </label>
    </div>
    {!formData.is_free && (
      <div>
        <label className="block text-sm font-medium">Preço (moedas)</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={onFormChange}
          min="1"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>
    )}
  </>
);

/**
 * Componente EditModelModal
 * Um modal completo para editar os detalhes de um modelo 3D, incluindo
 * informações de texto, imagens e ficheiros de modelo.
 * @param {{
 * model: object,
 * onClose: () => void,
 * onSuccess: () => void
 * }} props - As propriedades do componente.
 */
const EditModelModal = ({ model, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: model.name || "",
    description: model.description || "",
    is_free: model.is_free,
    price: model.price || 0,
  });

  const [currentImages, setCurrentImages] = useState(model.images || []);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [newImages, setNewImages] = useState([]);

  const [currentFiles, setCurrentFiles] = useState(model.files || []);
  const [filesToDelete, setFilesToDelete] = useState([]);
  const [newFiles, setNewFiles] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddNewImages = (e) => {
    if (e.target.files) {
      setNewImages((prev) => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const handleAddNewFiles = (e) => {
    if (e.target.files) {
      setNewFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const markForDeletion = (id, type) => {
    if (type === "image") {
      setImagesToDelete((prev) => [...prev, id]);
      setCurrentImages((prev) => prev.filter((img) => img.id !== id));
    } else {
      setFilesToDelete((prev) => [...prev, id]);
      setCurrentFiles((prev) => prev.filter((f) => f.id !== id));
    }
  };

  const removeNewFile = (index, type) => {
    if (type === "image") {
      setNewImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setNewFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem("authToken");
    const headers = { headers: { Authorization: `Token ${token}` } };

    try {
      // Apaga ficheiros e imagens marcados
      for (const imageId of imagesToDelete) {
        await axios.delete(
          `http://127.0.0.1:8000/api/model-images/${imageId}/`,
          headers
        );
      }
      for (const fileId of filesToDelete) {
        await axios.delete(
          `http://127.0.0.1:8000/api/model-files/${fileId}/`,
          headers
        );
      }

      // Adiciona novas imagens e ficheiros
      for (const imageFile of newImages) {
        const imageFormData = new FormData();
        imageFormData.append("image", imageFile);
        await axios.post(
          `http://127.0.0.1:8000/api/models3d/${model.id}/add_image/`,
          imageFormData,
          headers
        );
      }
      for (const stlFile of newFiles) {
        const fileFormData = new FormData();
        fileFormData.append("file", stlFile);
        await axios.post(
          `http://127.0.0.1:8000/api/models3d/${model.id}/add_file/`,
          fileFormData,
          headers
        );
      }

      // Atualiza os dados de texto por último
      await axios.patch(
        `http://127.0.0.1:8000/api/models3d/${model.id}/`,
        formData,
        headers
      );

      toast.success("Modelo atualizado com sucesso!");
      onSuccess();
    } catch (error) {
      console.error("Erro ao atualizar o modelo:", error.response?.data);
      toast.error("Falha ao atualizar o modelo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-lg font-semibold">Editar Modelo</h2>
          <button onClick={onClose} disabled={isSubmitting}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <TextInfoForm formData={formData} onFormChange={handleChange} />

          {/* Gestão de Imagens (Visual) */}
          <div>
            <label className="block text-sm font-medium mb-2">Imagens</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {currentImages.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.image}
                    alt="Imagem atual"
                    className="w-full h-24 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => markForDeletion(image.id, "image")}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                    aria-label="Apagar imagem"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {newImages.map((file, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Nova imagem"
                    className="w-full h-24 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewFile(index, "image")}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                    aria-label="Remover nova imagem"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => imageInputRef.current.click()}
                className="w-full h-24 border-2 border-dashed rounded-md flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50"
              >
                <ImagePlus size={24} />
                <span className="text-xs mt-1">Adicionar</span>
              </button>
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleAddNewImages}
                accept="image/*"
                multiple
                className="hidden"
              />
            </div>
          </div>

          {/* Gestão de Ficheiros de Modelo (Lista de Texto) */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Ficheiros de Modelo (.stl, .obj)
            </label>
            <div className="space-y-2">
              {currentFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex justify-between items-center bg-slate-100 p-2 rounded-md"
                >
                  <span className="truncate text-sm font-mono">
                    {file.file_name}
                  </span>
                  <button
                    type="button"
                    onClick={() => markForDeletion(file.id, "file")}
                    className="text-red-600 hover:text-red-500"
                    aria-label={`Apagar ficheiro ${file.file_name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {newFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-blue-100 p-2 rounded-md"
                >
                  <span className="truncate text-sm font-mono">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeNewFile(index, "file")}
                    className="text-red-600 hover:text-red-500"
                    aria-label={`Remover novo ficheiro ${file.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="mt-2 w-full border-2 border-dashed rounded-md flex items-center justify-center text-slate-500 hover:bg-slate-50 p-2"
            >
              <FilePlus size={16} />
              <span className="text-sm ml-2">Adicionar Ficheiros</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAddNewFiles}
              accept=".stl,.obj,.fbx"
              multiple
              className="hidden"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="bg-gray-200 py-2 px-4 rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white py-2 px-4 rounded-md w-36 flex justify-center"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Guardar Alterações"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModelModal;
