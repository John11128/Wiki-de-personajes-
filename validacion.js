// Función mejorada para agregar personaje con validación y feedback
async function agregarPersonaje() {
  // Obtener elementos del DOM
  const botonGuardar = document.querySelector('#agregar button');
  const nombreInput = document.getElementById('nombre');
  const descripcionInput = document.getElementById('descripcion');
  const imagenInput = document.getElementById('imagen');
  
  // Obtener valores
  const nombre = nombreInput.value.trim();
  const descripcion = descripcionInput.value.trim();
  const imagen = imagenInput.value.trim();
  const faccion = document.getElementById('faccion').value;
  const rol = document.getElementById('rol').value;

  // 1. Validación de campos
  if (!nombre) {
    mostrarError("El nombre es obligatorio", nombreInput);
    return;
  }

  if (nombre.length > 50) {
    mostrarError("El nombre no puede exceder 50 caracteres", nombreInput);
    return;
  }

  if (!descripcion) {
    mostrarError("La descripción es obligatoria", descripcionInput);
    return;
  }

  if (descripcion.length > 500) {
    mostrarError("La descripción no puede exceder 500 caracteres", descripcionInput);
    return;
  }

  if (!imagen) {
    mostrarError("La URL de la imagen es obligatoria", imagenInput);
    return;
  }

  if (!validarURL(imagen)) {
    mostrarError("Ingrese una URL de imagen válida (jpg, png, gif, webp)", imagenInput);
    return;
  }

  // 2. Configurar estado de carga
  botonGuardar.disabled = true;
  botonGuardar.innerHTML = '<span class="spinner-mini"></span> Guardando...';
  
  try {
    // 3. Intentar conexión con Supabase
    const { data, error } = await supabase
      .from('personajes')
      .insert([{ 
        nombre, 
        descripcion, 
        imagen_url: imagen, 
        faccion, 
        rol 
      }])
      .select(); // Esto devuelve el registro insertado

    // 4. Manejar respuesta
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

    // 5. Éxito - limpiar formulario
    nombreInput.value = '';
    descripcionInput.value = '';
    imagenInput.value = '';
    document.getElementById('faccion').selectedIndex = 0;
    document.getElementById('rol').selectedIndex = 0;

    mostrarExito(`Personaje "${data[0].nombre}" guardado correctamente`);

  } catch (error) {
    // 6. Manejo de errores
    console.error("Error completo:", error);
    
    let mensajeError = "Error al guardar el personaje";
    
    if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      mensajeError = "Error de conexión. Verifique su internet o si el servidor está disponible";
    } else if (error.message) {
      mensajeError += ": " + error.message;
    }
    
    mostrarError(mensajeError);
    
  } finally {
    // 7. Restaurar botón
    botonGuardar.disabled = false;
    botonGuardar.innerHTML = 'Guardar';
  }
}

// Función para validar URLs de imagen (mejorada)
function validarURL(url) {
  try {
    new URL(url); // Verifica que sea una URL válida
    const extensionesValidas = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return extensionesValidas.some(ext => url.toLowerCase().includes(ext));
  } catch {
    return false;
  }
}

// Función para mostrar errores con foco en el campo
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
