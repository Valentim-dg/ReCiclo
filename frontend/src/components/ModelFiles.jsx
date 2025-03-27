import React from "react";
import { FaDownload } from "react-icons/fa";

const ModelFiles = ({ files }) => {
  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold">Arquivos Disponíveis</h2>
      {files.length === 0 ? (
        <p className="text-gray-500">Nenhum arquivo disponível.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {files.map((file) => (
            <li key={file.id} className="flex items-center justify-between p-2 bg-gray-100 rounded-lg">
              <span className="text-gray-700">{file.file_name}</span>
              <a
                href={file.file}
                download
                className="text-blue-500 hover:text-blue-700"
              >
                <FaDownload />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ModelFiles;
