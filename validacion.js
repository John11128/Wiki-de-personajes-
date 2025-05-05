// Configuración de Supabase (asegúrate de tener estas variables definidas)
const supabaseUrl = 'https://yfusfwzvnwnjdqbsmboh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmdXNmd3p2bnduamRxYnNtYm9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0MTQwOTIsImV4cCI6MjA2MTk5MDA5Mn0.4OuM1Z3-6MKdJsJPTSNPpBO2FNobmIFF44J7mQuCNms';

// Aquí se usa la función `createClient` correctamente
const supabase = createClient(supabaseUrl, supabaseKey);

// Exponiendo las funciones al global (por si las llamas en el HTML)
window.agregarPersonaje = agregarPersonaje;
window.mostrarPersonajes = mostrarPersonajes;

// Función principal para agregar personajes
async function agregarPersonaje() {
  // Obtener elementos del DOM
  const botonGuardar = document.querySelector('#agregar button');
  const nombreInput = document.getElementById('nombre');
  const descripcionInput = document.getElementById('descripcion');
  const imagenInput = document.getElementById('imagen');
  
  // Obtener y limpiar valores
  const nombre = nombreInput.value.trim();
  const descripcion = descripcionInput.value.trim();
  const imagen = imagenInput.value.trim();
  const faccion = document.getElementById('faccion').value;
  const rol = document.getElementById('rol').value;

  // Validación de campos
  if (!validarCampos(nombre, descripcion, imagen, nombreInput, descripcionInput, imagenInput)) {
    return;
  }

  // Configurar estado de carga
  botonGuardar.disabled = true;
  botonGuardar.innerHTML = '<span class="spinner-mini"></span> Guardando...';
  
  try {
    // Intentar conexión con Supabase
    const { data, error } = await supabase
      .from('personajes')
      .insert([{ 
        nombre, 
        descripcion, 
        imagen_url: imagen, 
        faccion, 
        rol 
      }])
      .select();

    // Manejar respuesta
    manejarRespuesta(data, error, nombreInput, descripcionInput, imagenInput);

  } catch (error) {
    manejarError(error);
  } finally {
    // Restaurar botón
    botonGuardar.disabled = false;
    botonGuardar.innerHTML = 'Guardar';
  }
}

// Función de validación de campos
function validarCampos(nombre, descripcion, imagen, nombreInput, descripcionInput, imagenInput) {
  let isValid = true;

  if (!nombre) {
    mostrarError("El nombre es obligatorio", nombreInput);
    isValid = false;
  } else if (nombre.length > 50) {
    mostrarError("El nombre no puede exceder 50 caracteres", nombreInput);
    isValid = false;
  }

  if (!descripcion) {
    mostrarError("La descripción es obligatoria", descripcionInput);
    isValid = false;
  } else if (descripcion.length > 500) {
    mostrarError("La descripción no puede exceder 500 caracteres", descripcionInput);
    isValid = false;
  }

  if (!imagen) {
    mostrarError("La URL de la imagen es obligatoria", imagenInput);
    isValid = false;
  } else if (!validarURL(imagen)) {
    mostrarError("Ingrese una URL de imagen válida (jpg, png, gif, webp)", imagenInput);
    isValid = false;
  }

  return isValid;
}

// Función para manejar la respuesta de Supabase
function manejarRespuesta(data, error, nombreInput, descripcionInput, imagenInput) {
  if (error) {
    // Error específico de Supabase
    if (error.code === 'PGRST301' || error.message.includes('relation "personajes" does not exist')) {
      throw new Error("La tabla 'personajes' no existe en la base de datos");
    } else if (error.message.includes('JWT expired')) {
      throw new Error("Conexión expirada. Recargue la página.");
    } else {
      throw error;
    }
  }

  if (!data || data.length === 0) {
    throw new Error("No se recibió confirmación de la base de datos");
  }

  // Éxito - limpiar formulario
  nombreInput.value = '';
  descripcionInput.value = '';
  imagenInput.value = '';
  document.getElementById('faccion').selectedIndex = 0;
  document.getElementById('rol').selectedIndex = 0;

  mostrarExito(`Personaje "${data[0].nombre}" guardado correctamente`);
}

// Función para manejar errores
function manejarError(error) {
  console.error("Error completo:", error);
  
  let mensajeError = "Error al guardar el personaje";
  
  if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
    mensajeError = "Error de conexión. Verifique su internet o si el servidor está disponible";
  } else if (error.message) {
    mensajeError += ": " + error.message;
  }
  
  mostrarError(mensajeError);
}

// Ejemplo de la función mostrarSeccion
function mostrarSeccion(seccion) {
  // Ocultar todas las secciones
  const secciones = document.querySelectorAll('.seccion');
  secciones.forEach(seccion => seccion.style.display = 'none');

  // Mostrar la sección que fue pasada como parámetro
  const seccionMostrar = document.getElementById(seccion);
  if (seccionMostrar) {
    seccionMostrar.style.display = 'block';
  }
}


// Función para validar URLs de imagen
function validarURL(url) {
  try {
    new URL(url); // Verifica que sea una URL válida
    const extensionesValidas = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return extensionesValidas.some(ext => url.toLowerCase().includes(ext));
  } catch {
    return false;
  }
}

// Función para mostrar errores
function mostrarError(mensaje, elementoInput = null) {
  // Eliminar mensajes anteriores
  const erroresAnteriores = document.querySelectorAll('.mensaje-error');
  erroresAnteriores.forEach(el => el.remove());

  // Crear elemento de error
  const errorDiv = document.createElement('div');
  errorDiv.className = 'mensaje-error';
  errorDiv.innerHTML = `⛔ ${mensaje}`;
  
  // Insertar en el formulario
  const formulario = document.getElementById('agregar');
  formulario.insertBefore(errorDiv, formulario.firstChild);
  
  // Enfocar el campo con error
  if (elementoInput) {
    elementoInput.focus();
    elementoInput.classList.add('input-error');
    setTimeout(() => elementoInput.classList.remove('input-error'), 2000);
  }
  
  // Auto-eliminación después de 5 segundos
  setTimeout(() => errorDiv.remove(), 5000);
}

// Función para mostrar éxito
function mostrarExito(mensaje) {
  const exitoDiv = document.createElement('div');
  exitoDiv.className = 'mensaje-exito';
  exitoDiv.innerHTML = `✅ ${mensaje}`;
  
  const agregarSection = document.getElementById('agregar');
  const existingExito = agregarSection.querySelector('.mensaje-exito');
  if (existingExito) existingExito.remove();
  
  agregarSection.insertBefore(exitoDiv, agregarSection.firstChild);
  setTimeout(() => exitoDiv.remove(), 5000);
}

// Función para mostrar personajes con manejo de carga
async function mostrarPersonajes() {
  mostrarCarga();
  try {
    const { data: personajes, error } = await supabase.from('personajes').select('*');
    if (error) throw error;
    
    const contenedor = document.getElementById('listaPersonajes');
    contenedor.innerHTML = '';
    
    if (personajes.length === 0) {
      contenedor.innerHTML = '<p>No hay personajes registrados todavía.</p>';
      return;
    }
    
    personajes.forEach(p => {
      contenedor.innerHTML += `
        <div class="personaje">
          ${p.imagen_url ? `<img src="${p.imagen_url}" alt="Imagen de ${p.nombre}">` : ''}
          <h3>${p.nombre}</h3>
          <p>${p.descripcion}</p>
          <p><strong>Facción:</strong> ${p.faccion}</p>
          <p><strong>Rol:</strong> ${p.rol}</p>
        </div>
      `;
    });
  } catch (error) {
    console.error('Error al obtener los personajes:', error);
    mostrarError("Error al cargar los personajes");
  } finally {
    ocultarCarga();
  }
}

// Funciones para el loader
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
