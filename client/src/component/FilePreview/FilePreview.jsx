import React from "react";

const FilePreview = ({ file }) => {
  const [previewUrl, setPreviewUrl] = React.useState(null);

  React.useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="bg-gray-900 bg-opacity-60 p-8 rounded-3xl shadow-2xl backdrop-blur-lg border border-gray-700 transition-all duration-500 hover:shadow-blue-500/50">
      <p className="text-sm text-gray-400 mb-2">Preview:</p>
      {file.type.includes("image") ? (
        <img
          src={previewUrl}
          alt="Preview"
          className="max-w-xs rounded-lg border border-gray-700"
        />
      ) : (
        <div className="bg-gray-700 p-4 rounded-lg">
          <p className="text-gray-300">PDF Preview: {file.name}</p>
        </div>
      )}
    </div>
  );
};

export default FilePreview;
