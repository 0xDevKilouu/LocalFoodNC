import { BrowserBarcodeReader, NotFoundException } from '@zxing/library';
import axios from 'axios';

let codeReader = null;
let scanning = false;

document.getElementById('scanButton').addEventListener('click', () => {
  if (!scanning) {
    startScanning();
  } else {
    stopScanning();
  }
});

function startScanning() {
  scanning = true;
  const videoElement = document.getElementById('video');
  videoElement.style.display = 'block';

  const constraints = {
    video: { facingMode: 'environment' } // Utilisez la caméra arrière si disponible
  };

  codeReader = new BrowserBarcodeReader();
  codeReader.decodeFromConstraints(constraints, 'video', (result, err) => {
    if (result) {
      console.log(result);
      stopScanning(); // Arrête le scanning une fois que le code-barres est détecté
      fetchProductInfo(result.text);
    }
    if (err && !(err instanceof NotFoundException)) {
      console.error(err);
      stopScanning(); // Arrête le scanning en cas d'erreur
    }
  });
}

function stopScanning() {
  scanning = false;
  codeReader.reset();
  const videoElement = document.getElementById('video');
  videoElement.style.display = 'none';
}

function fetchProductInfo(barcode) {
  axios.get(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
    .then(response => {
      console.log(response.data);
      if (response.data.status === 1) {
        displayProductInfo(response.data.product);
      } else {
        console.error('Product not found');
      }
    })
    .catch(error => {
      console.error('Error fetching product data:', error);
    });
}

function displayProductInfo(product) {
  const content = document.getElementById('content');
  content.innerHTML = `
    <h2>${product.product_name}</h2>
    <p>${product.ingredients_text}</p>
    <img src="${product.image_url}" alt="Product Image">
  `;
}
