const carrito = new Map();
const searchBarContainer = document.getElementById("searchBar");
const searchInput = document.createElement("input");
const btnComprar = document.getElementById("btnComprar");
const btnVaciarCarrito = document.getElementById("btnVaciarCarrito");

btnComprar.addEventListener("click", () => {
  comprar();
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

const productos = [
  {
    id: 1,
    categoria: "survival",
    nombre: "SCUM",
    precio: 60,
    stock: 5,
    stockInicial: 5,
    imagen: "img/scum.jpg",
  },
  {
    id: 2,
    categoria: "survival",
    nombre: "DayZ",
    precio: 60,
    stock: 5,
    stockInicial: 5,
    imagen: "img/dayz.jpg",
  },
  {
    id: 3,
    categoria: "survival",
    nombre: "VEIN",
    precio: 60,
    stock: 5,
    stockInicial: 5,
    imagen: "img/vein.jpg",
  },
  {
    id: 4,
    categoria: "combate",
    nombre: "Hell Let Loose",
    precio: 60,
    stock: 5,
    stockInicial: 5,
    imagen: "img/hll.jpg",
  },
];

cargarCarritoDesdeLocalStorage();

function encontrarProductoPorId(id) {
  return productos.find((producto) => producto.id === id);
}

function guardarCarritoEnLocalStorage() {
    const carritoArray = [];
    carrito.forEach((value, key, precio, nombre) => {
        carritoArray.push({
            id: key,
            cantidad: value.cantidad
        });
    });
    localStorage.setItem('carrito', JSON.stringify([carritoArray]));
}

function cargarCarritoDesdeLocalStorage() {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        const carritoJSON = JSON.parse(carritoGuardado);
        carritoJSON.forEach((item) => {
            carrito.set(item.id, item);
        });
        actualizarCarrito();
    }
}

function calcularTotal() {
  let total = 0;
  for (let i = 0; i < carrito.length; i++) {
    total += carrito[i].precio;
  }
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
            <button onclick="agregarAlCarrito(${producto.id})">Agregar al carrito</button>`;
    productosSurvivalDiv.appendChild(productoDiv);
  });
  combate.forEach((producto) => {
    const productoDiv = document.createElement("div");
    productoDiv.innerHTML = `
            <h3>${producto.nombre}</h3>
            <img src="${producto.imagen}" alt="${producto.nombre}" height="100px" width="200px">
            <p>Precio: $${producto.precio}</p>
            <button onclick="agregarAlCarrito(${producto.id})">Agregar al carrito</button>`;
    productosCombateDiv.appendChild(productoDiv);
  });
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
    alert("Producto agregado al carrito");
  } else {
    alert("Producto agotado");
  }
}

function eliminarDelCarrito(id) {
  if (carrito.has(id)) {
    const itemCarrito = carrito.get(id);
    itemCarrito.cantidad > 1 ? itemCarrito.cantidad-- : carrito.delete(id);
    actualizarStock(id, encontrarProductoPorId(id).stock + 1);
    actualizarCarrito();
    guardarCarritoEnLocalStorage();
    alert("Producto eliminado del carrito");
  } else {
    alert("El producto no se encuentra en el carrito");
  }
}

function vaciarCarrito() {
  if (carrito.size === 0) {
    alert("El carrito ya está vacío.");
  } else {
    carrito.clear();
    productos.forEach((producto) => {
      producto.stock = producto.stockInicial;
    });
    actualizarCarrito();
    guardarCarritoEnLocalStorage();
    alert("El carrito ha sido vaciado.");
  }
}
function actualizarCarrito() {
  const listaCarrito = document.getElementById("lista-carrito");
  listaCarrito.innerHTML = "";
  let total = 0;
  carrito.forEach((item, id) => {
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
  const elementoTotal = document.getElementById("total");
  elementoTotal.textContent = `Total: $${total}`;
}

function comprar() {
  if (carrito.size === 0) {
    alert("El carrito está vacío");
  } else {
    alert("¡Gracias por tu compra!");
    carrito.clear();
    actualizarCarrito();
    guardarCarritoEnLocalStorage();
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
            <button onclick="agregarAlCarrito(${producto.id})">Agregar al carrito</button>
        `;

    if (producto.categoria === "survival") {
      productosSurvivalDiv.appendChild(productoDiv);
    } else if (producto.categoria === "combate") {
      productosCombateDiv.appendChild(productoDiv);
    }
  });
}

mostrarProductos();
