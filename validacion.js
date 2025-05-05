// Reemplaza la función agregarPersonaje() con esta versión mejorada
async function agregarPersonaje() {
  const nombre = document.getElementById('nombre').value.trim();
  const descripcion = document.getElementById('descripcion').value.trim();
  const imagen = document.getElementById('imagen').value.trim();
  const faccion = document.getElementById('faccion').value;
  const rol = document.getElementById('rol').value;

  // Validación mejorada
  if (!nombre || nombre.length > 50) {
    mostrarError("El nombre es requerido y debe tener menos de 50 caracteres");
    return;
  }

  if (!descripcion || descripcion.length > 500) {
    mostrarError("La descripción es requerida y debe tener menos de 500 caracteres");
    return;
  }

  if (!imagen || !validarURL(imagen)) {
    mostrarError("Por favor ingrese una URL de imagen válida (jpg, png o gif)");
    return;
  }

  // Mostrar indicador de carga
  const botonGuardar = document.querySelector('#agregar button');
  botonGuardar.disabled = true;
  botonGuardar.innerHTML = 'Guardando...';

  try {
    const { data, error: insertError } = await supabase
      .from('personajes')
      .insert([{ nombre, descripcion, imagen_url: imagen, faccion, rol }]);

    if (insertError) throw insertError;

    // Limpiar el formulario
    document.getElementById('nombre').value = '';
    document.getElementById('descripcion').value = '';
    document.getElementById('imagen').value = '';
    document.getElementById('faccion').selectedIndex = 0;
    document.getElementById('rol').selectedIndex = 0;

    mostrarExito("Personaje guardado exitosamente");
  } catch (error) {
    console.error('Error al insertar el personaje:', error);
    mostrarError("Error al guardar el personaje: " + error.message);
  } finally {
    botonGuardar.disabled = false;
    botonGuardar.innerHTML = 'Guardar';
  }
}

// Función para validar URLs de imagen
function validarURL(url) {
  const patron = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))(?:\?.*)?$/i;
  return patron.test(url);
}

// Funciones para mostrar mensajes (añade estos estilos CSS también)
function mostrarError(mensaje) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'mensaje-error';
  errorDiv.textContent = mensaje;
  
  const agregarSection = document.getElementById('agregar');
  const existingError = agregarSection.querySelector('.mensaje-error');
  if (existingError) existingError.remove();
  
  agregarSection.insertBefore(errorDiv, agregarSection.firstChild);
  setTimeout(() => errorDiv.remove(), 5000);
}

function mostrarExito(mensaje) {
  const exitoDiv = document.createElement('div');
  exitoDiv.className = 'mensaje-exito';
  exitoDiv.textContent = mensaje;
  
  const agregarSection = document.getElementById('agregar');
  const existingExito = agregarSection.querySelector('.mensaje-exito');
  if (existingExito) existingExito.remove();
  
  agregarSection.insertBefore(exitoDiv, agregarSection.firstChild);
  setTimeout(() => exitoDiv.remove(), 5000);
}


// Funciones para manejar el estado de carga
function mostrarCarga() {
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'loading';
  loadingDiv.innerHTML = '<div class="spinner"></div>';
  document.body.appendChild(loadingDiv);
}

function ocultarCarga() {
  const loadingDiv = document.querySelector('.loading');
  if (loadingDiv) loadingDiv.remove();
}

// Modifica las funciones asíncronas para usar el loader
async function mostrarPersonajes() {
  mostrarCarga();
  try {
    const { data: personajes, error } = await supabase.from('personajes').select('*');
    if (error) throw error;
    
    const contenedor = document.getElementById('listaPersonajes');
    contenedor.innerHTML = '';
    // ... resto del código ...
  } catch (error) {
    console.error('Error al obtener los personajes:', error);
    mostrarError("Error al cargar los personajes");
  } finally {
    ocultarCarga();
  }
}
