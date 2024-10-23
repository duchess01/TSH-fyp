import { useState, useEffect } from 'react';
import { FiUploadCloud, FiCheckCircle, FiLoader, FiTrash2 } from 'react-icons/fi';

const ManualUpload = () => {
  const [manuals, setManuals] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all manuals on component mount
  useEffect(() => {
    fetchManuals();
  }, []);

  const fetchManuals = async () => {
    try {
      const response = await fetch('http://localhost:8000/manual/allstatus');
      if (!response.ok) throw new Error('Failed to fetch manuals');
      const result = await response.json();
      
      if (result.status_code === 200) {
        setManuals(result.data);
      } else {
        throw new Error(result.message || 'Failed to load manuals');
      }
    } catch (err) {
      setError('Failed to load manuals');
      console.error('Error fetching manuals:', err);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('manual', file);

    try {
      const response = await fetch('http://localhost:8002/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      // After successful upload, refresh the manuals list
      await fetchManuals();
    } catch (err) {
      setError('Failed to upload manual');
      console.error('Error uploading manual:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (manualName) => {
    if (!window.confirm(`Are you sure you want to delete ${manualName}?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/manual/delete/${manualName}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Delete failed');

      // After successful deletion, refresh the manuals list
      await fetchManuals();
    } catch (err) {
      setError('Failed to delete manual');
      console.error('Error deleting manual:', err);
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to format status
  const formatStatus = (status) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="flex flex-col items-center p-6 space-y-8 w-full lg:w-[90%] xl:w-[80%] max-w-8xl mx-auto">
      {error && (
        <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Upload Section */}
      <div className="w-full bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Upload New Manuals</h2>
        <div className="flex items-center space-x-4">
          <div className="relative w-full">
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".pdf"
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
              disabled={uploading}
            />
            <div className="flex items-center justify-between w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg">
              <div className="flex items-center space-x-2">
                <FiUploadCloud className="text-gray-500 text-2xl" />
                <span className="text-gray-700 text-sm">Select a PDF file to upload</span>
              </div>
              <button
                className={`text-white px-4 py-2 rounded-lg ${
                  uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-600'
                }`}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>

        {uploading && (
          <div className="mt-4 flex items-center text-indigo-600 space-x-2">
            <FiLoader className="animate-spin text-xl" />
            <span>Uploading Manual...</span>
          </div>
        )}
      </div>

      {/* Manuals Table */}
      <div className="w-full bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Uploaded Manuals</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left table-auto">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3">Manual Name</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created At</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {manuals.map((manual) => (
                <tr key={manual.manual_name} className="border-b hover:bg-gray-100 transition-colors">
                  <td className="px-4 py-3">{manual.manual_name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      {manual.status === 'completed' ? (
                        <>
                          <FiCheckCircle className="text-green-500 text-xl" />
                          <span className="text-green-600">{formatStatus(manual.status)}</span>
                        </>
                      ) : (
                        <>
                          <FiLoader className="animate-spin text-yellow-500 text-xl" />
                          <span className="text-yellow-600">{formatStatus(manual.status)}</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {formatDate(manual.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(manual.manual_name)}
                      className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-full hover:bg-red-50"
                      title="Delete manual"
                    >
                      <FiTrash2 className="text-xl" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManualUpload;