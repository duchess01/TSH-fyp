import { useState } from 'react';
import { FiUploadCloud, FiCheckCircle, FiLoader } from 'react-icons/fi';

const ManualUpload = () => {
  const [manuals, setManuals] = useState([
    { name: 'Manual 1', status: 'Uploaded' },
    { name: 'Manual 3', status: 'Uploaded' },
    { name: 'Manual 2', status: 'Upload in progress' },
    { name: 'Manual 4', status: 'Upload in progress' },
  ]);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploading(true);
      setManuals([...manuals, { name: file.name, status: 'Upload in progress' }]);

      // Mock upload functionality
      setTimeout(() => {
        setManuals((prevManuals) =>
          prevManuals.map((manual) =>
            manual.name === file.name ? { ...manual, status: 'Uploaded' } : manual
          )
        );
        setUploading(false);
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 space-y-8 w-full lg:w-[90%] xl:w-[80%] max-w-8xl mx-auto">
      {/* Upload Section */}
      <div className="w-full bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Upload New Manuals</h2>
        <div className="flex items-center space-x-4">
          <div className="relative w-full">
            <input
              type="file"
              onChange={handleFileUpload}
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
              disabled={uploading}
            />
            <div className="flex items-center justify-between w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg">
              <div className="flex items-center space-x-2">
                <FiUploadCloud className="text-gray-500 text-2xl" />
                <span className="text-gray-700 text-sm">Select a file to upload</span>
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

        {/* Animated Uploading Status */}
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
                <th className="px-4 py-3 w-3/4">Manual Name</th> {/* Manual Name takes more space */}
                <th className="px-4 py-3 w-1/4">Status</th> {/* Status takes less space */}
              </tr>
            </thead>
            <tbody>
              {manuals.map((manual, index) => (
                <tr key={index} className="border-b hover:bg-gray-100 transition-colors">
                  <td className="px-4 py-3 w-3/4">{manual.name}</td>
                  <td className="px-4 py-3 w-1/4">
                    <div className="flex items-center space-x-2">
                      {manual.status === 'Uploaded' ? (
                        <>
                          <FiCheckCircle className="text-green-500 text-xl" />
                          <span className="text-green-600">Uploaded</span>
                        </>
                      ) : (
                        <>
                          <FiLoader className="animate-spin text-yellow-500 text-xl" />
                          <span className="text-yellow-600">Upload in progress</span>
                        </>
                      )}
                    </div>
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
