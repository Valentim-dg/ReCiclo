import React, { useState, useEffect } from "react";
import axios from "axios";
import { Send } from "lucide-react";

const CommentSection = ({ modelId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Buscar comentários da API
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://127.0.0.1:8000/api/comments/?model=${modelId}`
        );
        setComments(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Erro ao buscar comentários:", err);
        setError("Não foi possível carregar os comentários");
        setLoading(false);
      }
    };

    if (modelId) {
      fetchComments();
    }
  }, [modelId]);

  // Formatar data
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("pt-BR", options);
  };

  // Enviar novo comentário
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await axios.post(`http://127.0.0.1:8000/api/comments/`, {
        model: modelId,
        content: newComment,
      });
      setComments([response.data, ...comments]);
      setNewComment("");
    } catch (err) {
      console.error("Erro ao enviar comentário:", err);
      setError("Não foi possível enviar o comentário");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Formulário de comentário */}
      <form onSubmit={handleSubmitComment} className="mb-8">
        <div className="flex">
          <textarea
            rows="3"
            placeholder="Deixe seu comentário sobre este modelo..."
            className="flex-1 p-3 border rounded-l-lg resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={isSubmitting}
          ></textarea>
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-r-lg px-4 hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            disabled={isSubmitting || !newComment.trim()}
          >
            <Send size={20} />
          </button>
        </div>
      </form>

      {/* Estado de carregamento */}
      {loading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Lista de comentários */}
      {!loading && comments.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          Seja o primeiro a comentar sobre este modelo!
        </div>
      )}

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="border-b pb-4 last:border-b-0">
            <div className="flex items-center mb-2">
              <img
                src={comment.user?.image || "/default-avatar.png"}
                alt={`Avatar de ${comment.user?.name || "Usuário"}`}
                className="w-8 h-8 rounded-full mr-2 object-cover"
              />
              <div>
                <p className="font-medium">{comment.user?.name || "Usuário"}</p>
                <p className="text-xs text-gray-500">
                  {formatDate(comment.date)}
                </p>
              </div>
            </div>
            <p className="text-gray-800 pl-10">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
