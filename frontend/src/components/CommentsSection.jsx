import React, { useState, useEffect } from "react";
import axios from "axios";

const CommentsSection = ({ modelId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/api/models3d/${modelId}/comments/`)
      .then((response) => setComments(response.data))
      .catch((error) => console.error("Erro ao buscar comentários:", error));
  }, [modelId]);

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;

    const formData = new FormData();
    formData.append("text", newComment);
    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/models3d/${modelId}/comments/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setComments([...comments, response.data]);
      setNewComment("");
      setSelectedImage(null);
    } catch (error) {
      console.error("Erro ao enviar comentário:", error);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4">Discussão</h2>

      {/* Área para adicionar comentário */}
      <div className="mb-4 flex flex-col space-y-2">
        <textarea
          className="border p-2 rounded-lg w-full"
          placeholder="Escreva um comentário..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setSelectedImage(e.target.files[0])}
        />
        <button
          onClick={handleCommentSubmit}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Postar
        </button>
      </div>

      {/* Exibição dos comentários */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="border p-3 rounded-lg">
            <p className="text-sm font-semibold">{comment.user}</p>
            <p className="text-gray-600">{comment.text}</p>
            {comment.image && (
              <img
                src={comment.image}
                alt="Comentário"
                className="mt-2 w-32 h-32 object-cover rounded-lg"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentsSection;
