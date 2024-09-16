import { PhotoIcon } from "@heroicons/react/24/solid";

function ChatModal({ closeModal }) {
  const handleSubmit = () => {
    //TO BE DONE
    console.log("SEND TO BE");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="fixed inset-0 bg-black opacity-50"
        onClick={() => closeModal()}
      ></div>
      <div className="bg-white p-6 rounded-lg shadow-lg z-10 w-1/2 h-1/2 max-w-1/2 max-h-1/2 flex flex-col">
        <h2 className="text-xl font-semibold mb-4">User Entered Solution</h2>
        <p className="mb-4">
          <form>
            <label
              htmlFor="about"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Solution
            </label>
            <div className="mt-2">
              <textarea
                id="about"
                name="about"
                rows={3}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                defaultValue={""}
              />
            </div>
            <label
              htmlFor="cover-photo"
              className="block text-sm font-medium leading-6 text-gray-900 mt-4"
            >
              Solution Image
            </label>
            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25">
              <div className="text-center">
                <PhotoIcon
                  aria-hidden="true"
                  className="mx-auto h-12 w-12 text-gray-300"
                />
                <div className="mt-4 flex text-sm leading-6 text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs leading-5 text-gray-600">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>
          </form>
        </p>
        <div className="flex gap-4 justify-end">
          <button
            onClick={closeModal}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Close
          </button>
          <button
            onClick={() => {
              handleSubmit();
              closeModal();
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatModal;
