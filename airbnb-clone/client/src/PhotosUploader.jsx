import axios from "axios";
import { useState } from "react";
import Image from "./Image.jsx";

/**
 * @param {string[]} addedPhotos  - array of photo paths in state
 * @param {(photos: string[]) => void} onChange - callback to update parent state
 */
export default function PhotosUploader({ addedPhotos, onChange }) {
  const [photoLink, setPhotoLink] = useState('');

  async function addPhotoByLink(ev) {
    ev.preventDefault();
    // Since we set axios.defaults.baseURL = 'http://localhost:5000' in App.jsx or main.jsx,
    // we can just use '/api/upload-by-link'. If not, use the full URL.
    const { data: filename } = await axios.post('/api/upload-by-link', { link: photoLink });
    // 'filename' is like "/uploads/1742062059083_photo.jpg"
    onChange(prev => [...prev, filename]);
    setPhotoLink('');
  }

  function uploadPhoto(ev) {
    const files = ev.target.files;
    const data = new FormData();
    for (let i = 0; i < files.length; i++) {
      data.append('photos', files[i]);
    }
    // Again, if you have axios.defaults.baseURL set, you can just do '/api/upload'
    axios.post('/api/upload', data, {
      headers: { 'Content-type': 'multipart/form-data' },
    }).then(response => {
      const { data: filenames } = response; 
      // e.g. ["\/uploads\/photo1678889999999.jpg", ...]
      onChange(prev => [...prev, ...filenames]);
    });
  }

  function removePhoto(ev, filename) {
    ev.preventDefault();
    onChange(addedPhotos.filter(photo => photo !== filename));
  }

  function selectAsMainPhoto(ev, filename) {
    ev.preventDefault();
    onChange([filename, ...addedPhotos.filter(photo => photo !== filename)]);
  }

  return (
    <>
      <div className="flex gap-2">
        <input
          value={photoLink}
          onChange={ev => setPhotoLink(ev.target.value)}
          type="text"
          placeholder="Add using a link ....jpg"
        />
        <button onClick={addPhotoByLink} className="bg-gray-200 px-4 rounded-2xl">
          Add photo
        </button>
      </div>
      <div className="mt-2 grid gap-2 grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {addedPhotos.length > 0 && addedPhotos.map(link => (
          <div className="h-32 flex relative" key={link}>
            {/* 
                If 'link' is "/uploads/filename.jpg", 
                our <Image> component will prepend "http://localhost:5000" 
                to display it. 
            */}
            <Image className="rounded-2xl w-full object-cover" src={link} alt="" />

            <button
              onClick={ev => removePhoto(ev, link)}
              className="cursor-pointer absolute bottom-1 right-1 text-white bg-black bg-opacity-50 rounded-2xl py-2 px-3"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none" viewBox="0 0 24 24"
                strokeWidth={1.5} stroke="currentColor"
                className="w-6 h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21..."
                />
              </svg>
            </button>

            <button
              onClick={ev => selectAsMainPhoto(ev, link)}
              className="cursor-pointer absolute bottom-1 left-1 text-white bg-black bg-opacity-50 rounded-2xl py-2 px-3"
            >
              {/* Show a star if it's the main photo (index 0) */}
              {link === addedPhotos[0] ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor"
                  viewBox="0 0 24 24" className="w-6 h-6"
                >
                  <path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007..." />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                  viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111..."
                  />
                </svg>
              )}
            </button>
          </div>
        ))}
        {/* Upload from local machine */}
        <label
          className="h-32 cursor-pointer flex items-center gap-1 justify-center border bg-transparent
                     rounded-2xl p-2 text-2xl text-gray-600"
        >
          <input type="file" multiple className="hidden" onChange={uploadPhoto} />
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"
          >
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5..."
            />
          </svg>
          Upload
        </label>
      </div>
    </>
  );
}
