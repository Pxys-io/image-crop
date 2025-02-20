const directoryPicker = document.getElementById('directoryPicker');
    const imageContainer = document.getElementById('imageContainer');
    const cropContainer = document.getElementById('cropContainer');
    const cropCanvas = document.getElementById('cropCanvas');
    const cropButton = document.getElementById('cropButton');
    const saveButton = document.getElementById('saveButton');
    const cancelButton = document.getElementById('cancelButton');
    const croppedImageContainer = document.getElementById('croppedImageContainer');
    const ctx = cropCanvas.getContext('2d');

    let files = [];
    let currentImage = null;
    let cropRect = { x: 0, y: 0, width: 0, height: 0 };
    let isCropping = false;
    let startX, startY;

    directoryPicker.addEventListener('change', async (event) => {
      files = Array.from(event.target.files).filter(file => file.type.startsWith('image/'));
      imageContainer.innerHTML = ''; // Clear previous images
      cropContainer.style.display = 'none'; // Hide crop container
      croppedImageContainer.innerHTML = '<h2>Cropped Images</h2>'; // Reset cropped images

      if (files.length === 0) {
        alert('No images found in the selected directory.');
        return;
      }

      for (const file of files) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.addEventListener('click', () => openImageForCropping(file));
        imageContainer.appendChild(img);
      }
    });

    function openImageForCropping(file) {
      currentImage = file;
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        cropCanvas.width = img.width;
        cropCanvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        cropContainer.style.display = 'block';
        cropRect = { x: 0, y: 0, width: img.width, height: img.height }; // Reset cropRect
        drawCropRectangle();
      };
    }

    function drawCropRectangle() {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.clearRect(0, 0, cropCanvas.width, cropCanvas.height);

        const img = new Image();
        img.src = URL.createObjectURL(currentImage);
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          ctx.strokeRect(cropRect.x, cropRect.y, cropRect.width, cropRect.height);
        }
    }

    cropCanvas.addEventListener('mousedown', (e) => {
      isCropping = true;
      startX = e.offsetX;
      startY = e.offsetY;
      cropRect.x = startX;
      cropRect.y = startY;
      cropRect.width = 0;
      cropRect.height = 0;
    });

    cropCanvas.addEventListener('mousemove', (e) => {
      if (!isCropping) return;
      const currentX = e.offsetX;
      const currentY = e.offsetY;
      cropRect.width = currentX - cropRect.x;
      cropRect.height = currentY - cropRect.y;
      drawCropRectangle();
    });

    cropCanvas.addEventListener('mouseup', () => {
      isCropping = false;
    });

    cropCanvas.addEventListener('mouseleave', () => {
      isCropping = false;
    });


    cropButton.addEventListener('click', () => {
        // Ensure positive width and height
        if (cropRect.width < 0) {
            cropRect.x += cropRect.width;
            cropRect.width = -cropRect.width;
        }
        if (cropRect.height < 0) {
            cropRect.y += cropRect.height;
            cropRect.height = -cropRect.height;
        }

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = cropRect.width;
      tempCanvas.height = cropRect.height;
      const tempCtx = tempCanvas.getContext('2d');

      const img = new Image();
        img.src = URL.createObjectURL(currentImage);
        img.onload = () => {
          tempCtx.drawImage(
            img,
            cropRect.x,
            cropRect.y,
            cropRect.width,
            cropRect.height,
            0,
            0,
            cropRect.width,
            cropRect.height
          );

          // Display cropped image
          const croppedImg = document.createElement('img');
          croppedImg.src = tempCanvas.toDataURL();
          croppedImageContainer.appendChild(croppedImg);
        }
    });

    saveButton.addEventListener('click', () => {
      alert("Simulated save: In a real environment, the cropped image would be saved to a 'cropped' subdirectory. Due to WebContainer limitations, actual file system operations are not possible.");
      cropContainer.style.display = 'none';
    });

    cancelButton.addEventListener('click', () => {
      cropContainer.style.display = 'none';
    });
