<file path="src/App.jsx">
import React, { useState, useRef, useEffect } from 'react';
import Cropper from 'cropperjs';
import './App.css';

const API_BASE_URL = 'https://year-book-back.replit.app'; // Define API_BASE_URL

function App() {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null); // Add error state
  const cropperRef = useRef(null);
  const imageElement = useRef(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      await fetchData('/images', setImages);
      setError(null); // Clear any previous errors
    } catch (e) {
      setError(e.message); // Set the error message
    }
  };

  const onCropImage = async () => {
    if (!cropperRef.current) {
      return;
    }

    const canvas = cropperRef.current.getCroppedCanvas({
      width: 2048,
      height: 2048,
    });

    if (!canvas) {
      console.error("Failed to get cropped canvas.");
      return;
    }

    canvas.toBlob(async (blob) => {
      if (!blob) {
        console.error("Failed to create blob.");
        return;
      }

      const formData = new FormData();
      formData.append('file', blob, selectedImage.name); // Use full filename with extension

      try {
        const uploadResponse = await fetchData('/upload', null, {
          method: 'POST',
          body: formData,
        });

        // Mark as processed - Remove extension for API call
        const nameWithoutExtension = selectedImage.name.split('.').slice(0, -1).join('.');
        await fetchData(`/mark-processed/${nameWithoutExtension}`, null, {
          method: 'POST',
        });

        // Update local state
        setImages(prevImages =>
          prevImages.map(image =>
            image.name === selectedImage.name ? { ...image, processed: true } : image
          )
        );

      } catch (error) {
        console.error("Error during upload or marking processed:", error);
      } finally {
        setShowModal(false);
        setSelectedImage(null);
      }
    }, 'image/jpeg'); // Specify MIME type
  };

  const openCropModal = async (image) => {
    try {
      // Remove extension for API call
      const nameWithoutExtension = image.name.split('.').slice(0, -1).join('.');
      const data = await fetchData(`/image/${nameWithoutExtension}`);
      setSelectedImage({ ...image, url: data.url }); // Store the URL and full image data
      setShowModal(true);
    } catch (error) {
      console.error("Could not fetch image URL:", error);
    }
  };

  // Generic fetch function with retry
  const fetchData = async (url, setData, options = {}, retries = 3) => {
    for (let i = 0; i <= retries; i++) {
      try {
        const response = await fetch(`${API_BASE_URL}${url}`, options); // Prepend API_BASE_URL
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (setData) {
          setData(data);
        }
        return data; // Return data for calls that need it
      } catch (error) {
        console.error(`Fetch failed (attempt ${i + 1}/${retries + 1}) for ${url}:`, error);
        if (i === retries) {
          throw new Error(`Failed to fetch ${url} after ${retries + 1} attempts: ${error.message}`);
        }
        // Wait before retrying (simple exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  };

  useEffect(() => {
    if (showModal && selectedImage && selectedImage.url) {
      imageElement.current.src = selectedImage.url;

      if (cropperRef.current) {
        cropperRef.current.destroy();
      }

      cropperRef.current = new Cropper(imageElement.current, {
        aspectRatio: 1,
        viewMode: 1,
        ready() {
          // Optional: Set initial crop box
        },
      });
    }

    return () => {
      if (cropperRef.current) {
        cropperRef.current.destroy();
        cropperRef.current = null;
      }
    };
  }, [showModal, selectedImage]);

  return (
    <div className="app-container">
      <h1>Batch Crop</h1>
      <div className="instructions">
        <p><strong>Instructions:</strong></p>
        <ol>
          <li>Select an image from the list below to crop.</li>
          <li>Crop the image using the cropping tool.</li>
          <li>Click "Crop Image" to upload the cropped image.</li>
          <li>The image will be automatically marked as processed.</li>
        </ol>
      </div>

      {error && <div className="error-message">Error: {error}</div>} {/* Display error message */}

      <div className="image-list">
        {images.length > 0 ? (
          images.map((image) => (
            <div key={image.name} className="image-item">
              <button
                className={`image-item-button ${image.processed ? 'processed' : ''}`}
                onClick={() => openCropModal(image)}
              >
                {image.name}
              </button>
              <input
                type="checkbox"
                checked={image.processed}
                readOnly
                className="image-checkbox"
              />
            </div>
          ))
        ) : (
          !error && <p>Loading images...</p> // Show loading message only if no error
        )}
      </div>

      {showModal && selectedImage && (
        <div className="modal">
          <div className="modal-content">
            <img ref={imageElement} className="crop-image" alt="To Crop" />
            <button className="crop-button" onClick={onCropImage}>
              Crop Image
            </button>
            <button className="close-button" onClick={() => setShowModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
</file>
