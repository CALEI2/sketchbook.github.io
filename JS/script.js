// Detectar la página actual-->
const pageId = document.body.id;

// CÓDIGO DEL CANVAS-->
if (pageId === "canvas") {
    const canvas = document.getElementById("photo-canvas");
    const ctx = canvas.getContext("2d");

    // Variables iniciales-->
    let estaDibujando = false;
    let brushSize = 5;
    let colorActual = "#000000";
    let esBorrador = false;
    let figuraSeleccionada = "pincel";
    let startX, startY, currentX, currentY;
    let currentCanvasData;
    let rellenarFigura = false;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Variables para drag & drop-->
    let imageDragging = null;
    let imageX = 0;
    let imageY = 0;
    let offsetX = 0;
    let offsetY = 0;

    // Dibujar figuras y líneas-->
    canvas.addEventListener("mousedown", (e) => {
        startX = e.offsetX;
        startY = e.offsetY;
        estaDibujando = true;

        // Comprobar si una imagen está siendo arrastrada
        if (imageDragging) {
            offsetX = startX - imageX;
            offsetY = startY - imageY;
        } else {
            currentCanvasData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }

        if (figuraSeleccionada === "cubeta") {
            rellenarCubeta(startX, startY, colorActual);
            estaDibujando = false; // Terminar inmediatamente para evitar conflictos
        } else if (figuraSeleccionada === "pincel") {
            ctx.beginPath();
            ctx.moveTo(startX, startY);
        }
    });

    canvas.addEventListener("mousemove", (e) => {
        if (!estaDibujando) return;
        currentX = e.offsetX;
        currentY = e.offsetY;

        if (imageDragging) {
            // Mover imagen mientras se arrastra
            imageX = currentX - offsetX;
            imageY = currentY - offsetY;
            redrawCanvas();
        } else if (figuraSeleccionada === "pincel") {
            ctx.globalCompositeOperation = esBorrador ? 'destination-out' : 'source-over';
            ctx.strokeStyle = colorActual;
            ctx.lineWidth = brushSize;
            ctx.lineTo(currentX, currentY);
            ctx.stroke();
        } else {
            ctx.putImageData(currentCanvasData, 0, 0);
            ctx.lineWidth = brushSize;
            ctx.strokeStyle = colorActual;
            ctx.fillStyle = colorActual;

            switch (figuraSeleccionada) {
                case "rectangulo":
                    if (rellenarFigura) {
                        ctx.fillRect(startX, startY, currentX - startX, currentY - startY);
                    } else {
                        ctx.strokeRect(startX, startY, currentX - startX, currentY - startY);
                    }
                    break;
                case "circulo":
                    const radius = Math.sqrt(Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2));
                    ctx.beginPath();
                    ctx.arc(startX, startY, radius, 0, Math.PI * 2);
                    if (rellenarFigura) {
                        ctx.fill();
                    } else {
                        ctx.stroke();
                    }
                    ctx.closePath();
                    break;
                case "triangulo":
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(currentX, currentY);
                    ctx.lineTo(startX * 2 - currentX, currentY);
                    ctx.closePath();
                    if (rellenarFigura) {
                        ctx.fill();
                    } else {
                        ctx.stroke();
                    }
                    break;
            }
        }
    });

    canvas.addEventListener("mouseup", () => {
        estaDibujando = false;
        ctx.closePath();
        imageDragging = null; // Terminar el arrastre de la imagen
    });

    // Implementación de drag & drop-->
    canvas.addEventListener("dragover", (e) => e.preventDefault());

    canvas.addEventListener("drop", (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    imageDragging = img;
                    imageX = 0;
                    imageY = 0;
                    redrawCanvas();
                };
            };
            reader.readAsDataURL(file);
        }
    });

    // Redibujar el canvas con la imagen arrastrada-->
    function redrawCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (imageDragging) {
            ctx.drawImage(imageDragging, imageX, imageY, canvas.width / 2, canvas.height / 2); // Escalar imagen
        }
    }

    // Herramientas adicionales-->
    document.getElementById("brushTool").addEventListener("click", () => {
        figuraSeleccionada = "pincel";
        esBorrador = false;
    });
    document.getElementById("eraserTool").addEventListener("click", () => {
        figuraSeleccionada = "pincel";
        esBorrador = true;
    });
    document.getElementById("rectangulo").addEventListener("click", () => figuraSeleccionada = "rectangulo");
    document.getElementById("circulo").addEventListener("click", () => figuraSeleccionada = "circulo");
    document.getElementById("triangulo").addEventListener("click", () => figuraSeleccionada = "triangulo");
    document.getElementById("cubeta").addEventListener("click", () => figuraSeleccionada = "cubeta");

    document.getElementById("rellenar-color").addEventListener("change", (e) => {
        rellenarFigura = e.target.checked;
    });

    document.getElementById("guardar-imagen").addEventListener("click", () => {
        const imageData = canvas.toDataURL();
        const savedImages = JSON.parse(localStorage.getItem("galleryImages")) || [];
        savedImages.push(imageData);
        localStorage.setItem("galleryImages", JSON.stringify(savedImages));
        alert("¡Imagen guardada y añadida a la galería!");
    });

    document.getElementById("limpiar-canvas").addEventListener("click", () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    document.getElementById("colorPicker").addEventListener("input", (e) => {
        colorActual = e.target.value;
    });
    document.getElementById("lineWidthSlider").addEventListener("input", (e) => {
        brushSize = e.target.value;
    });

    // Función de la cubeta-->
function rellenarCubeta(x, y, color) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    const targetColor = getPixelColor(x, y, pixels);
    const fillColor = hexToRgb(color);

    // Si el color objetivo y el color de fondo son iguales no pasa nada-->
    if (targetColor.r === fillColor.r && targetColor.g === fillColor.g && targetColor.b === fillColor.b && targetColor.a === fillColor.a) {
        return;
    }

    const stack = [[x, y]];
    const visited = new Set();

    while (stack.length > 0) {
        const [px, py] = stack.pop();

        // Evitar recorrer fuera del lienzo-->
        if (px < 0 || px >= canvas.width || py < 0 || py >= canvas.height) continue;

        const index = (py * canvas.width + px) * 4;

        // Evitar píxeles ya visitados-->
        if (visited.has(index)) continue;

        const pixelColor = {
            r: pixels[index],
            g: pixels[index + 1],
            b: pixels[index + 2],
            a: pixels[index + 3]
        };

        // Si el píxel coincide con el color objetivo, so rellena-->
        if (pixelColor.r === targetColor.r && pixelColor.g === targetColor.g && pixelColor.b === targetColor.b && pixelColor.a === targetColor.a) {
            pixels[index] = fillColor.r;
            pixels[index + 1] = fillColor.g;
            pixels[index + 2] = fillColor.b;
            pixels[index + 3] = fillColor.a;

            // Añadir píxeles adyacentes-->
            stack.push([px + 1, py]);
            stack.push([px - 1, py]);
            stack.push([px, py + 1]);
            stack.push([px, py - 1]);
        }

        visited.add(index);
    }

    ctx.putImageData(imageData, 0, 0);
}

function getPixelColor(x, y, pixels) {
    const index = (y * canvas.width + x) * 4;
    return {
        r: pixels[index],
        g: pixels[index + 1],
        b: pixels[index + 2],
        a: pixels[index + 3]
    };
}

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b, a: 255 }; 
}

// CÓDIGO DE LA GALERÍA-->
} else if (pageId === "galeria") {
    const galleryContainer = document.getElementById("photo-gallery");
    const canvasEditor = document.getElementById("photo-canvas");
    const ctxEditor = canvasEditor.getContext("2d");
    const uploadPhotoInput = document.getElementById("upload-photo"); // Input para subir fotos

    canvasEditor.width = canvasEditor.offsetWidth;
    canvasEditor.height = canvasEditor.offsetHeight;

    // Cargar imágenes desde localStorage-->
    const savedImages = JSON.parse(localStorage.getItem("galleryImages")) || [];
    savedImages.forEach((imageData, index) => {
        addImageToGallery(imageData, index);
    });

    // Cargar imagen en el editor al hacer clic en la galería-->
    galleryContainer.addEventListener("click", (e) => {
        if (e.target.tagName === "IMG") {
            const img = new Image();
            img.src = e.target.src;
            img.onload = () => {
                ctxEditor.clearRect(0, 0, canvasEditor.width, canvasEditor.height);
                ctxEditor.drawImage(img, 0, 0, canvasEditor.width, canvasEditor.height);
            };
        }
    });

    // Función para eliminar todas las imágenes de la galería y de localStorage-->
    document.getElementById("eliminar-todas").addEventListener("click", () => {
        // Borrar las imágenes de localStorage-->
        localStorage.removeItem("galleryImages");

        // Eliminar todas las imágenes del DOM-->
        galleryContainer.innerHTML = ""; 
        alert("¡Todas las imágenes han sido eliminadas!");
    });

    // Función para añadir imágenes a la galería-->
    function addImageToGallery(imageData, index) {
        const imgContainer = document.createElement("div");
        imgContainer.classList.add("gallery-item-container");
    
        const imgElement = document.createElement("img");
        imgElement.src = imageData;
        imgElement.classList.add("gallery-item");
    
        imgContainer.appendChild(imgElement);
    
        galleryContainer.appendChild(imgContainer);
    }

    // Filtros-->
    const filters = {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0,
    };

    document.querySelectorAll(".filter-slider").forEach((slider) => {
        slider.addEventListener("input", () => {
            filters[slider.id] = slider.value;
            applyFilters();
        });
    });

    function applyFilters() {
        const filterString = ` 
            brightness(${filters.brightness}%) 
            contrast(${filters.contrast}%) 
            saturate(${filters.saturation}%) 
            blur(${filters.blur}px) 
        `;
        canvasEditor.style.filter = filterString;
    }

    // Función para subir una imagen desde la computadora-->
    uploadPhotoInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (readerEvent) => {
                const img = new Image();
                img.src = readerEvent.target.result;
                img.onload = () => {
                    // Mostrar la imagen cargada en el editor-->
                    ctxEditor.clearRect(0, 0, canvasEditor.width, canvasEditor.height);
                    ctxEditor.drawImage(img, 0, 0, canvasEditor.width, canvasEditor.height);
                };
            };
            reader.readAsDataURL(file);
        }
    });

    // Guardar imagen editada con filtros-->
    document.getElementById("guardar-imagen").addEventListener("click", () => {
        // Crear un nuevo canvas para aplicar los filtros-->
        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d");

        tempCanvas.width = canvasEditor.width;
        tempCanvas.height = canvasEditor.height;

        // Aplicar los filtros al contexto temporal-->
        const filterString = `
            brightness(${filters.brightness}%) 
            contrast(${filters.contrast}%) 
            saturate(${filters.saturation}%) 
            blur(${filters.blur}px)
        `;
        tempCtx.filter = filterString;

        // Dibuja la imagen del canvas principal en el canvas temporal-->
        tempCtx.drawImage(canvasEditor, 0, 0);

        // Exporta la imagen con filtros aplicados-->
        const editedImage = tempCanvas.toDataURL();

        // Guardar la imagen editada en localStorage-->
        const savedImages = JSON.parse(localStorage.getItem("galleryImages")) || [];
        savedImages.push(editedImage);
        localStorage.setItem("galleryImages", JSON.stringify(savedImages));

        // Añadir la imagen editada a la galería dinámicamente-->
        addImageToGallery(editedImage, savedImages.length - 1);

        alert("Imagen guardada exitosamente con los filtros aplicados.");
    });
}

