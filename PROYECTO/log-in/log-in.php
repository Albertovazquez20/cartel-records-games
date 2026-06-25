<?php
// Iniciar sesión al principio, antes de cualquier salida HTML
session_start();

// Conectar con bd desde el archivo conexion.php
include('../conexion/conexion.php');

$error_message = "";

// Solo procesar el login si se ha enviado el formulario (método POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $nombre_usuario = $_POST['nombre_usuario'];
        $password = $_POST['password'];

        // Buscar el usuario solo por nombre (sin comparar password en SQL)
        $sql = "SELECT * FROM usuarios WHERE nombre_usuario = :nombre_usuario";
        $stmt = $conexion->prepare($sql);
        $stmt->bindParam(':nombre_usuario', $nombre_usuario);
        $stmt->execute();

        if ($stmt->rowCount() >= 1) {
            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

            // Verificar la contraseña con el hash guardado en la BD
            if (password_verify($password, $usuario['contrasena'])) {
                $_SESSION['id_usuario']    = $usuario['id_usuario'];
                $_SESSION['nombre_usuario'] = $usuario['nombre_usuario'];
                $_SESSION['email']         = $usuario['email'];
                $_SESSION['rol']           = $usuario['rol'];
                header("Location: ../index.php");
                exit();
            } else {
                $error_message = "Usuario o contraseña incorrectos";
            }
        } else {
            $error_message = "Usuario o contraseña incorrectos";
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
    <title>Iniciar Sesión - Cartel Records Games</title>
    <link rel="stylesheet" href="log-in.css">
</head>

<body>
    <div class="login-container">
        <div class="login-box">

            <h2>Iniciar Sesión</h2>
            <p class="subtitle">Bienvenido de nuevo</p>

            <?php if (!empty($error_message)): ?>
                <p style="color: red; text-align: center;"><?php echo $error_message; ?></p>
            <?php endif; ?>

            <form action="" method="POST" class="login-form">
                <div class="input-group">
                    <label for="nombre_usuario">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Usuario
                    </label>
                    <input type="text" id="nombre_usuario" name="nombre_usuario" placeholder="Tu nombre de usuario" required>
                </div>

                <div class="input-group">
                    <label for="password">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        Contraseña
                    </label>
                    <input type="password" id="password" name="password" placeholder="••••••••" required>
                    <label class="mostrar-pass-label">
                        <input type="checkbox" onchange="togglePass('password', this)"> Mostrar contraseña
                    </label>
                </div>

                <button type="submit" class="btn-login">Iniciar Sesión</button>

                <p class="register-link">
                    ¿No tienes una cuenta? <a href="registro.php">Regístrate aquí</a>
                </p>
            </form>

            <a href="../index.php" class="back-home">← Volver a la página principal</a>
        </div>
    </div>

<script>
function togglePass(inputId, checkbox) {
    const input = document.getElementById(inputId);
    input.type = checkbox.checked ? 'text' : 'password';
}
</script>

</body>

</html>
