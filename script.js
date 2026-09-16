// ==========================================
// 1. VARIABLES GLOBALES Y CONFIGURACIÓN
// ==========================================
let cart = []; // Lista para almacenar los productos agregados al carrito
let total = 0; // Total acumulado de la compra en MXN

// URL actualizada de tu ejecutable de Apps Script (Versión 5)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyb6k4kagDFhhgZhoVC4_D7L_INd1D7RI5KVypyY4CmoSKmxDuaJ71hYKRuBHo4hdpy6w/exec";

// ==========================================
// 2. DICCIONARIO DE DESCRIPCIONES DE PRODUCTO
// ==========================================
// Explicación de la función de cada producto que se muestra en el menú emergente al presionar la foto
const productDetails = {
  "Keratina 1 lt": "Tratamiento intensivo de alaciado profesional que restaura la fibra capilar, elimina el frizz por completo y aporta un brillo radiante al cabello.",
  "Kit de Mantenimiento": "Fórmula diseñada para prolongar la duración del alisado de keratina, aportar hidratación continua y mantener el cabello suave libre de encrespamiento.",
  "Shampoo sin sal": "Limpia profundamente retirando impurezas y abriendo la cutícula capilar para preparar el cabello adecuadamente antes de aplicar cualquier tratamiento."
};

// ==========================================
// 3. FUNCIÓN PARA AGREGAR PRODUCTOS Y REGISTRAR EN GOOGLE SHEETS
// ==========================================
function addToCart(product, price) {
  // Pide los datos al cliente por medio de ventanas flotantes
  const nombre = prompt("Para agregar este producto al carrito, por favor ingresa tu Nombre Completo:");
  if (!nombre) return alert("El nombre es requerido para continuar.");

  const telefono = prompt("Ingresa tu número de Teléfono / WhatsApp:");
  if (!telefono) return alert("El teléfono es requerido para ponernos en contacto.");

  const domicilio = prompt("Ingresa tu Domicilio / Dirección de entrega:");
  if (!domicilio) return alert("El domicilio es requerido.");

  // Prepara los datos en formato URLSearchParams compatible con Apps Script
  const formData = new URLSearchParams();
  formData.append("nombre", nombre);
  formData.append("telefono", telefono);
  formData.append("domicilio", domicilio);
  formData.append("producto", product);

  // Envío a Google Sheets en segundo plano
  fetch(SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString()
  }).catch(error => console.error("Error al registrar cliente:", error));

  // Guardar datos en el carrito local
  cart.push({ product, price, nombre, telefono, domicilio });
  total += price;
  updateCart();

  alert(`¡Gracias ${nombre}! "${product}" se agregó a tu carrito.`);
}

// ==========================================
// 4. ELIMINAR O VACIAR CARRITO
// ==========================================
function removeFromCart(index) {
  total -= cart[index].price; // Resta el precio del producto eliminado
  cart.splice(index, 1);       // Elimina el elemento de la lista
  updateCart();               // Vuelve a pintar la lista en la pantalla
}

function clearCart() {
  cart = []; // Vacía la lista de productos
  total = 0;  // Resetea el monto total
  updateCart();
  
  // Limpia los registros guardados en la memoria del navegador
  localStorage.removeItem("cart");
  localStorage.removeItem("total");
}

// ==========================================
// 5. ACTUALIZAR LA INTERFAZ DEL CARRITO Y GUARDAR EN MEMORIA
// ==========================================
function updateCart() {
  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");

  if (cartItems) {
    cartItems.innerHTML = ""; // Limpia la lista actual para evitar duplicados

    cart.forEach((item, index) => {
      const li = document.createElement("li");
      li.innerHTML = `${item.product} - $${item.price} MXN <button class="remove-btn" onclick="removeFromCart(${index})">Eliminar</button>`;
      cartItems.appendChild(li);
    });
  }

  if (cartTotal) {
    cartTotal.textContent = `$${total} MXN`;
  }

  // Persistencia de datos en el navegador mediante LocalStorage
  localStorage.setItem("cart", JSON.stringify(cart));
  localStorage.setItem("total", total);
}

// ==========================================
// 6. INICIALIZACIÓN DE LA PÁGINA Y EVENTOS
// ==========================================
window.addEventListener("DOMContentLoaded", () => {
  // Carga el carrito desde la memoria local si el usuario recarga la página
  const savedCart = JSON.parse(localStorage.getItem("cart"));
  const savedTotal = parseFloat(localStorage.getItem("total"));

  if (Array.isArray(savedCart) && !isNaN(savedTotal)) {
    cart = savedCart;
    total = savedTotal;
    updateCart();
  }
  
  // Control para abrir y cerrar el panel lateral del carrito
  const toggle = document.getElementById("cart-toggle");
  const panel = document.getElementById("cart-panel");

  if (toggle && panel) {
    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      panel.classList.toggle("active");
    });

    document.addEventListener("click", (event) => {
      if (panel.classList.contains("active") &&
          !panel.contains(event.target) &&
          event.target !== toggle) {
        panel.classList.remove("active");
      }
    });
  }
});

// ==========================================
// 7. FUNCIONES PARA MOSTRAR/OCULTAR LA DESCRIPCIÓN DEL PRODUCTO
// ==========================================
// Muestra la ventana emergente con la función del producto cuando el usuario presiona su imagen
function showProductInfo(productName) {
  const modal = document.getElementById("productModal");
  const title = document.getElementById("modalTitle");
  const description = document.getElementById("modalDescription");

  if (modal && title && description) {
    title.innerText = productName;
    description.innerText = productDetails[productName] || "Información descriptiva no disponible por el momento.";
    modal.style.display = "flex"; // Abre la ventana emergente
  }
}

// Cierra la ventana emergente de descripción del producto
function closeProductModal() {
  const modal = document.getElementById("productModal");
  if (modal) {
    modal.style.display = "none";
  }
}

// ==========================================
// 8. CARRUSEL Y MODAL DE IMÁGENES DE ALACIADOS
// ==========================================
function scrollCarousel(direction) {
  const track = document.querySelector(".carousel-track");
  const scrollAmount = 300;
  
  if (track) {
    track.scrollBy({
      left: direction * scrollAmount,
      behavior: "smooth"
    });
  }
}

function openModal(src) {
  const modal = document.getElementById("image-modal");
  const modalImg = document.getElementById("modal-img");
  if (modal && modalImg) {
    modal.style.display = "block";
    modalImg.src = src;
  }
}

function closeModal() {
  const modal = document.getElementById("image-modal");
  if (modal) {
    modal.style.display = "none";
  }
}

// Cierra cualquier ventana modal si el usuario hace clic fuera del contenido
window.addEventListener("click", function (event) {
  const imageModal = document.getElementById("image-modal");
  const productModal = document.getElementById("productModal");

  if (event.target === imageModal) {
    closeModal();
  }
  if (event.target === productModal) {
    closeProductModal();
  }
});