// Importa las funciones necesarias desde los SDK de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";


  // Configuración de Firebase-->
  const firebaseConfig = {
    apiKey: "AIzaSyC0dtM6tAIBH72tzADW3Y8tJLh44Etr_D0",
    authDomain: "signuplogin-d5708.firebaseapp.com",
    projectId: "signuplogin-d5708",
    storageBucket: "signuplogin-d5708.firebasestorage.app",
    messagingSenderId: "235351599773",
    appId: "1:235351599773:web:b0b1792ffd4e7767eb0274",
    measurementId: "G-EXGZ4BGB46"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

// Inicio de sesión-->
export async function login(email, password) {
  try {
    // Verifica que los parámetros se están pasando correctamente-->
    console.log("Email:", email, "Password:", password);

    // Intentar iniciar sesión en Firebase Auth-->
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // Inicio de sesión exitoso-->
    alert("Inicio de sesión exitoso. Redirigiendo...");
    return userCredential.user; 
  } catch (error) {
    // Manejo de errores-->
    if (error.code === "auth/wrong-password") {
      alert("Contraseña incorrecta. Por favor, verifica tus credenciales.");
    } else if (error.code === "auth/user-not-found") {
      alert("El correo no está registrado. Por favor, verifica tus credenciales.");
    } else {
      alert("Error al iniciar sesión: " + error.message);
    }
    throw error; 
  }
}

// Simulación de autenticación (solo para pruebas locales)-->
async function iniciarSesion(correo, contrasena) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const usuarios = [
        { correo: "test@correo.com", contrasena: "123456" }
      ];
      const usuarioValido = usuarios.find(
        (usuario) => usuario.correo === correo && usuario.contrasena === contrasena
      );
      resolve(!!usuarioValido);
    }, 1000);
  });
};

// Registro-->
export async function signup(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    alert('Tu registro fue exitoso: ' + userCredential.user.email);
  } catch (error) {
    alert('Error al intentar registrarse: ' + error.message);
  }
}

// Función para agregar datos a Firestore (mi base de datos)-->
export async function addData(collectionName, data) {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    alert('Documento agregado con ID: ' + docRef.id);
  } catch (error) {
    alert('Error al agregar datos: ' + error.message);
  }
}

const auth2 = getAuth();
onAuthStateChanged(auth2, (user) => {
  if (!user) {
    // Si no hay usuario autenticado, redirigir al login-->
    alert("No estás autenticado. Redirigiendo al inicio de sesión...");
    window.location.href = "./login.html";
  }
});

