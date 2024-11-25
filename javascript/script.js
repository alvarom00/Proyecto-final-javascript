const carrito = [];

const productos = [
    {
        id: 1,
        nombre: "SCUM",
        precio: 60,
        stock: 5,
        imagen: "img/scum.jpg"
    },
    {
        id: 2,
        nombre: "DayZ",
        precio: 60,
        stock: 5,
        imagen: "img/dayz.jpg"
    },
    {
        id: 3,
        nombre: "VEIN",
        precio: 60,
        stock: 5,
        imagen: "img/vein.jpg"
    },
    {
        id: 4,
        nombre: "Hell Let Loose",
        precio: 60,
        stock: 5,
        imagen: "img/hll.jpg"
    },

];

function encontrarProductoPorId(id) {
    return productos.find(producto => producto.id === id);
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
      console.error('Producto no encontrado');
      return;
    }
    producto.stock += cantidad;
    if (producto.stock < 0) {
        producto.stock = 0;
        console.warn('El stock no puede ser negativo.');
      }
}
function mostrarProductos() {
    const productosDiv = document.getElementById("productos");
    productos.forEach(producto => {
        const productoDiv = document.createElement("div");
        productoDiv.innerHTML = `
            <h3>${producto.nombre}</h3>
            <img src="${producto.imagen}" alt="${producto.nombre}" height="100px" width="200px">
            <p>Precio: $${producto.precio}</p>
            <button onclick="agregarAlCarrito(${producto.id})">Agregar al carrito</button>`;
        productosDiv.appendChild(productoDiv);
    });
}

function agregarAlCarrito(id) {
    const producto = encontrarProductoPorId(id);
    if (producto.stock > 0) {
        carrito.push(producto);
        producto.stock--;
        actualizarCarrito();
        alert("Producto agregado al carrito");
    } else {
        alert("Producto agotado");
    }
}

function eliminarDelCarrito(id) {
    const indice = carrito.findIndex(producto => producto.id === id);
    if (indice !== -1) {
        carrito.splice(indice, 1);
        actualizarCarrito();
        alert("Producto eliminado del carrito");
    } else {
        alert("El producto no se encuentra en el carrito");
    }
    const producto = encontrarProductoPorId(id);
    actualizarStock(producto.id, 1);
}

function actualizarCarrito() {
  const listaCarrito = document.getElementById('lista-carrito');
  listaCarrito.innerHTML = '';
  let total = 0;
  carrito.forEach(producto => {
    const itemCarrito = document.createElement('li');
    itemCarrito.textContent = `${producto.nombre} - $${producto.precio}`;
    const botonEliminar = document.createElement('button');
    botonEliminar.textContent = 'Eliminar';
    botonEliminar.dataset.id = producto.id;
    botonEliminar.addEventListener('click', () => {
      eliminarDelCarrito(producto.id);
    });
    itemCarrito.appendChild(botonEliminar);
    listaCarrito.appendChild(itemCarrito);
    total += producto.precio;
  });
  const elementoTotal = document.getElementById('total');
  elementoTotal.textContent = `Total: $${total}`;
}

function comprar() {
    if (carrito.length === 0) {
      alert("El carrito está vacío");
    } else {
      alert("¡Gracias por tu compra!");
      carrito.length = 0;
      actualizarCarrito();
    }
  }

mostrarProductos();