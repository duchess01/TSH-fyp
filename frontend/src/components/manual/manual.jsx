import { useState, useEffect } from 'react';
import { FiUploadCloud, FiCheckCircle, FiLoader, FiTrash2, FiX } from 'react-icons/fi';

const DeleteModal = ({ isOpen, onClose, onConfirm, manualName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <FiX className="text-xl" />
          </button>
        </div>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete "{manualName}"? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const ManualUpload = () => {
  const [manuals, setManuals] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [uploadingManual, setUploadingManual] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, manualName: null });

  useEffect(() => {
    fetchManuals();
  }, []);

  const validateManualName = (fileName) => {
    // Remove .pdf extension for validation
    const nameWithoutExtension = fileName.slice(0, -4);
    
    // Check if the name only contains alphanumeric characters and underscores
    const validNameRegex = /^[a-zA-Z0-9_]+$/;
    return validNameRegex.test(nameWithoutExtension);
  };

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

    setError(null);
    setSuccessMessage(null);

    const fileName = file.name;

    // Validate file extension
    if (!fileName.toLowerCase().endsWith('.pdf')) {
      setError('Please upload only PDF files.');
      event.target.value = '';
      return;
    }

    // Validate file name format
    if (!validateManualName(fileName)) {
      setError('Manual names can only contain alphanumeric characters and underscores. Spaces and special characters are not allowed.');
      event.target.value = '';
      return;
    }

    const existingManual = manuals.find(
      manual => manual.manual_name.toLowerCase() === fileName.toLowerCase()
    );

    if (existingManual) {
      setError(`A manual with the name "${fileName}" already exists. Please rename your file before uploading.`);
      event.target.value = '';
      return;
    }

    setUploading(true);
    setUploadingManual({
      manual_name: fileName,
      status: 'in_progress',
      created_at: new Date().toISOString()
    });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8002/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Upload failed');
      }

      setSuccessMessage('Manual uploaded successfully!');
      await fetchManuals();
    } catch (err) {
      setError(err.message || 'Failed to upload manual');
      console.error('Error uploading manual:', err);
    } finally {
      setUploading(false);
      setUploadingManual(null);
      event.target.value = '';
    }
  };

  const handleDelete = async () => {
    const manualName = deleteModal.manualName;
    setDeleteModal({ isOpen: false, manualName: null });
    
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`http://localhost:8000/manual/delete/${manualName}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Delete failed');
      }

      setSuccessMessage(`Manual "${manualName}" deleted successfully!`);
      await fetchManuals();
    } catch (err) {
      setError(err.message || 'Failed to delete manual');
      console.error('Error deleting manual:', err);
    }
  };

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

  const formatStatus = (status) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Combine uploaded manuals with currently uploading manual
  const allManuals = [...manuals];
  if (uploadingManual) {
    allManuals.unshift(uploadingManual);
  }

  return (
    <div className="flex flex-col items-center p-6 space-y-8 w-full lg:w-[90%] xl:w-[80%] max-w-8xl mx-auto">
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, manualName: null })}
        onConfirm={handleDelete}
        manualName={deleteModal.manualName}
      />

      {error && (
        <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="w-full bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          {successMessage}
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
                {uploading ? 'Upload in progress...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>

        {uploading && (
          <div className="mt-4 flex items-center text-indigo-600 space-x-2">
            <FiLoader className="animate-spin text-xl" />
            <span>Upload in progress, it may take up to 10 minutes</span>
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
              {allManuals.map((manual) => (
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
                    {manual.status !== 'in_progress' && (
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, manualName: manual.manual_name })}
                        className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-full hover:bg-red-50"
                        title="Delete manual"
                      >
                        <FiTrash2 className="text-xl" />
                      </button>
                    )}
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