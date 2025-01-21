const carrito = new Map();
const searchBarContainer = document.getElementById("searchBar");
const searchInput = document.createElement("input");
const btnComprar = document.getElementById("btnComprar");
const btnVaciarCarrito = document.getElementById("btnVaciarCarrito");

btnComprar.addEventListener("click", () => {
  realizarCompra();
});

btnVaciarCarrito.addEventListener("click", () => {
  vaciarCarrito();
});

searchInput.setAttribute("type", "text");
searchInput.setAttribute("placeholder", "Buscar juegos...");
searchInput.id = "inputBusqueda";
searchInput.addEventListener("input", () => {
  filtrarProductos(searchInput.value);
});

searchBarContainer.appendChild(searchInput);

let productos = [];

async function cargarProductos() {
  try {
    const response = await fetch("productos.json");
    if (!response.ok) {
      throw new Error("Error al cargar los productos");
    }
    productos = await response.json();
    mostrarProductos();
  } catch (error) {
    console.error("Hubo un problema al cargar los productos:", error);
    mostrarToast("Error al cargar productos", "linear-gradient(to right, #FF5F6D, #FFC371)");
  }
}

localStorage.clear();
cargarProductos();
cargarCarritoDesdeLocalStorage();

function encontrarProductoPorId(id) {
  return productos.find((producto) => producto.id === id);
}

function guardarCarritoEnLocalStorage() {
  const carritoArray = Array.from(carrito, ([key, value]) => ({
      id: key,
      cantidad: value.cantidad,
      precio: value.precio,
      nombre: value.nombre,
  }));
  localStorage.setItem("carrito", JSON.stringify(carritoArray));
}

function cargarCarritoDesdeLocalStorage() {
  const carritoGuardado = localStorage.getItem("carrito");
  if (carritoGuardado) {
      const carritoArray = JSON.parse(carritoGuardado);
      carritoArray.forEach((item) => {
          carrito.set(item.id, {
              ...encontrarProductoPorId(item.id),
              cantidad: item.cantidad,
          });
      });
      actualizarCarrito();
  }
}

function calcularTotal() {
  let total = 0;
  carrito.forEach((item) => {
      total += item.precio * item.cantidad;
  });
  return total;
}

function actualizarStock(id, cantidad) {
  const producto = encontrarProductoPorId(id);
  if (!producto) {
    console.error("Producto no encontrado");
    return;
  }
  producto.stock += cantidad;
  if (producto.stock < 0) {
    producto.stock = 0;
    console.warn("El stock no puede ser negativo.");
  }
}
function mostrarProductos(categoria) {
  const survivalHorrors = productos.filter(
    (producto) => producto.categoria === "survival"
  );
  const combate = productos.filter(
    (producto) => producto.categoria === "combate"
  );
  const productosSurvivalDiv = document.getElementById("productosSurvival");
  const productosCombateDiv = document.getElementById("productosCombate");
  productosSurvivalDiv.innerHTML = "";
  productosCombateDiv.innerHTML = "";
  survivalHorrors.forEach((producto) => {
    const productoDiv = document.createElement("div");
    productoDiv.innerHTML = `
            <h3>${producto.nombre}</h3>
            <img src="${producto.imagen}" alt="${producto.nombre}" height="100px" width="200px">
            <p>Precio: $${producto.precio}</p>
            <button onclick="agregarProducto(${producto.id})">Agregar al carrito</button>`;
    productosSurvivalDiv.appendChild(productoDiv);
  });
  combate.forEach((producto) => {
    const productoDiv = document.createElement("div");
    productoDiv.innerHTML = `
            <h3>${producto.nombre}</h3>
            <img src="${producto.imagen}" alt="${producto.nombre}" height="100px" width="200px">
            <p>Precio: $${producto.precio}</p>
            <button onclick="agregarProducto(${producto.id})">Agregar al carrito</button>`;
    productosCombateDiv.appendChild(productoDiv);
  });
}

function agregarConDemora(productoId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const producto = encontrarProductoPorId(productoId);
      if (producto && producto.stock > 0) {
        agregarAlCarrito(productoId);
        resolve("Producto agregado al carrito con éxito");
      } else {
        reject("Producto agotado");
      }
    }, 1000);
  });
}

function agregarProducto(productoId) {
  agregarConDemora(productoId)
    .then((mensaje) => mostrarToast(mensaje))
    .catch((error) => mostrarToast(error, "linear-gradient(to right, #FF5F6D, #FFC371)"));
}

function agregarAlCarrito(id) {
  const producto = encontrarProductoPorId(id);
  if (producto.stock > 0) {
    if (carrito.has(id)) {
      const itemCarrito = carrito.get(id);
      itemCarrito.cantidad++;
    } else {
      carrito.set(id, { ...producto, cantidad: 1 });
    }
    producto.stock--;
    actualizarCarrito();
    guardarCarritoEnLocalStorage();
  } else {
    mostrarToast("Producto agotado");
  }
}

function eliminarDelCarrito(id) {
  if (carrito.has(id)) {
    const itemCarrito = carrito.get(id);
    itemCarrito.cantidad > 1 ? itemCarrito.cantidad-- : carrito.delete(id);
    actualizarStock(id, encontrarProductoPorId(id).stock + 1);
    actualizarCarrito();
    guardarCarritoEnLocalStorage();
    mostrarToast("Producto eliminado del carrito");
  } else {
    mostrarToast("El producto no se encuentra en el carrito");
  }
}

function vaciarCarrito() {
  if (carrito.size === 0) {
    mostrarToast("El carrito ya está vacío.");
  } else {
    carrito.clear();
    productos.forEach((producto) => {
      producto.stock = producto.stockInicial;
    });
    actualizarCarrito();
    guardarCarritoEnLocalStorage();
    mostrarToast("El carrito ha sido vaciado.");
  }
}
function actualizarCarrito() {
  const listaCarrito = document.getElementById("lista-carrito");
  listaCarrito.innerHTML = "";
  let total = 0;

  carrito.forEach((item, id) => {
      if (!item.nombre || !item.precio) {
          console.warn("Producto inválido en el carrito", item);
          return;
      }
      const itemCarrito = document.createElement("li");
      itemCarrito.textContent = `${item.nombre} x${item.cantidad} - $${
          item.precio * item.cantidad
      }`;

      const botonEliminar = document.createElement("button");
      botonEliminar.textContent = "Eliminar";
      botonEliminar.addEventListener("click", () => {
          eliminarDelCarrito(id);
      });

      itemCarrito.appendChild(botonEliminar);
      listaCarrito.appendChild(itemCarrito);

      total += item.precio * item.cantidad;
  });

  document.getElementById("total").textContent = total.toFixed(2);
}

function mostrarToast(mensaje, colorFondo = "linear-gradient(to right, #00b09b, #96c93d)") {
  Toastify({
    text: mensaje,
    duration: 3000,
    gravity: "top",
    position: "right",
    backgroundColor: colorFondo,
    close: true
  }).showToast();
}

async function realizarCompra() {
  if (carrito.size === 0) {
    mostrarToast("El carrito está vacío", "linear-gradient(to right, #FF5F6D, #FFC371)");
    return;
  }

  try {
    mostrarToast("Procesando compra...");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    mostrarToast("¡Compra realizada con éxito!", "linear-gradient(to right, #4CAF50, #8BC34A)");
    carrito.clear();
    actualizarCarrito();
  } catch (error) {
    mostrarToast("Hubo un error durante la compra", "linear-gradient(to right, #FF5F6D, #FFC371)");
  }
}

function filtrarProductos(consulta) {
  const query = consulta.toLowerCase();
  const productosFiltrados = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(query)
  );
  const productosSurvivalDiv = document.getElementById("productosSurvival");
  const productosCombateDiv = document.getElementById("productosCombate");

  productosSurvivalDiv.innerHTML = "";
  productosCombateDiv.innerHTML = "";

  productosFiltrados.forEach((producto) => {
    const productoDiv = document.createElement("div");
    productoDiv.innerHTML = `
            <h3>${producto.nombre}</h3>
            <img src="${producto.imagen}" alt="${producto.nombre}" height="100px" width="200px">
            <p>Precio: $${producto.precio}</p>
            <button onclick="agregarProducto(${producto.id})">Agregar al carrito</button>
        `;

    if (producto.categoria === "survival") {
      productosSurvivalDiv.appendChild(productoDiv);
    } else if (producto.categoria === "combate") {
      productosCombateDiv.appendChild(productoDiv);
    }
  });
}

mostrarProductos();
