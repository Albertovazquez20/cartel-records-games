<?php
// Iniciar sesión al principio, antes de cualquier salida HTML
session_start();

// Conectar con la bd desde el archivo conexion.php
include('../conexion/conexion.php');

$error_message = "";

// Solo procesar el registro si se ha enviado el formulario (método POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $nombre_usuario = $_POST['nombre'];
        $email          = $_POST['email'];
        $password       = $_POST['password'];
        $password_conf  = $_POST['password-confirm'];

        // Comprobar que las dos contraseñas coinciden
        if ($password !== $password_conf) {
            $error_message = "Las contraseñas no coinciden.";
        } else {
            // Encriptar la contraseña antes de guardarla
            $password_hash = password_hash($password, PASSWORD_DEFAULT);

            // Insertar el nuevo usuario en la base de datos
            $sql = "INSERT INTO usuarios (nombre_usuario, email, contrasena, rol)
                    VALUES (:nombre, :email, :password, 'cliente')";
            $stmt = $conexion->prepare($sql);
            $stmt->bindParam(':nombre',   $nombre_usuario);
            $stmt->bindParam(':email',    $email);
            $stmt->bindParam(':password', $password_hash);
            $stmt->execute();

            // Si todo fue bien, redirigir al login
            header("Location: log-in.php");
            exit();
        }

    } catch (Exception $e) {
        $error_message = "Error al realizar la conexión: " . $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro - Mi Página Web</title>
    <link rel="stylesheet" href="log-in.css">
</head>
<body>
    <div class="login-container">
        <div class="login-box">

            <h2>Crear Cuenta</h2>
            <p class="subtitle">Únete a nuestra comunidad</p>

            <?php if (!empty($error_message)): ?>
                <p style="color: red; text-align: center;"><?php echo $error_message; ?></p>
            <?php endif; ?>

            <form action="" method="POST" class="login-form">
                <div class="input-group">
                    <label for="nombre">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Nombre de usuario
                    </label>
                    <input type="text" id="nombre" name="nombre" placeholder="Tu nombre de usuario" required>
                </div>

                <div class="input-group">
                    <label for="email">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                        Email
                    </label>
                    <input type="email" id="email" name="email" placeholder="tu@email.com" required>
                </div>

                <div class="input-group">
                    <label for="password">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        Contraseña
                    </label>
                    <input type="password" id="password" name="password" placeholder="••••••••" required minlength="8">
                </div>

                <div class="input-group">
                    <label for="password-confirm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        Confirmar contraseña
                    </label>
                    <input type="password" id="password-confirm" name="password-confirm" placeholder="••••••••" required minlength="8">
                </div>

                <div class="options">
                    <label class="remember">
                        <input type="checkbox" name="terms" required>
                        <span>Acepto los <a href="#" class="forgot-password">términos y condiciones</a></span>
                    </label>
                </div>

                <button type="submit" class="btn-login">Crear Cuenta</button>

                <p class="register-link">
                    ¿Ya tienes una cuenta? <a href="log-in.php">Inicia sesión aquí</a>
                </p>
            </form>

            <a href="../index.php" class="back-home">← Volver a la página principal</a>
        </div>
    </div>
</body>
</html>
