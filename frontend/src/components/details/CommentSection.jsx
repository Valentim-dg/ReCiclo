import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { Send, Loader2 } from "lucide-react";
import Avatar from "../ui/Avatar";

/**
 * Componente CommentSection
 * Exibe uma lista de comentários para um modelo 3D específico e permite
 * que utilizadores autenticados adicionem novos comentários.
 * @param {{ modelId: number | string }} props - As propriedades do componente.
 * @param {number | string} props.modelId - O ID do modelo 3D para buscar e associar comentários.
 */
export const CommentSection = ({ modelId }) => {
  const { user } = useAuth(); // Pega o utilizador logado do contexto
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Busca os comentários da API quando o componente é montado
  const fetchComments = useCallback(async () => {
    if (!modelId) return;
    try {
      setIsLoading(true);
      const response = await axios.get(
        `http://127.0.0.1:8000/api/comments/?model=${modelId}`
      );
      setComments(response.data);
    } catch (err) {
      console.error("Erro ao buscar comentários:", err);
      setError("Não foi possível carregar os comentários.");
    } finally {
      setIsLoading(false);
    }
  }, [modelId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Formata a data para uma leitura mais amigável
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Envia um novo comentário para a API
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!user) {
      toast.info("Você precisa estar logado para deixar um comentário.");
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem("authToken");

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/comments/`,
        { model: modelId, content: newComment },
        { headers: { Authorization: `Token ${token}` } }
      );
      // Adiciona o novo comentário no topo da lista para uma atualização instantânea
      setComments([response.data, ...comments]);
      setNewComment("");
    } catch (err) {
      console.error("Erro ao enviar comentário:", err);
      toast.error("Não foi possível enviar o seu comentário.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6">
      {/* Formulário para adicionar um novo comentário */}
      <form onSubmit={handleSubmitComment} className="mb-8">
        <div className="flex items-center gap-4">
          <Avatar
            src={user?.image}
            alt={user?.username}
            sizeClasses="w-10 h-10"
          />
          <div className="relative flex-1">
            <textarea
              rows="2"
              placeholder={
                user ? "Deixe seu comentário..." : "Faça login para comentar"
              }
              className="w-full p-3 pr-12 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={isSubmitting || !user}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
              disabled={isSubmitting || !newComment.trim()}
              aria-label="Enviar comentário"
            >
              {isSubmitting ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Secção da lista de comentários */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-8 text-slate-500">
            A carregar comentários...
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            Seja o primeiro a comentar!
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-4">
              <Avatar
                src={comment.user?.image}
                alt={comment.user?.username}
                sizeClasses="w-10 h-10"
              />
              <div className="flex-1 bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-slate-800">
                    {comment.user?.username || "Utilizador"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatDate(comment.date)}
                  </p>
                </div>
                <p className="text-slate-700">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
