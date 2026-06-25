<?php
// ==================== CONEXION.PHP ====================
// Las credenciales se leen desde el archivo .env (no se escriben aquí)

// Ruta al .env (un nivel arriba de esta carpeta, en la raíz del proyecto)
$envFile = __DIR__ . '/../.env';

if (!file_exists($envFile)) {
    die("Error: archivo .env no encontrado en $envFile");
}

// parse_ini_file lee el .env como pares CLAVE=VALOR
$env = parse_ini_file($envFile);

$host = $env['DB_HOST'] ?? 'localhost';
$port = $env['DB_PORT'] ?? '3307';
$baseDeDatos = $env['DB_NAME'] ?? '';
$usuario = $env['DB_USER'] ?? 'root';
$clave = $env['DB_PASS'] ?? '';

try {
    $conexion = new PDO(
        "mysql:host=$host;port=$port;dbname=$baseDeDatos;charset=utf8",
        $usuario,
        $clave
    );
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

} catch (Exception $e) {
    echo "Error al realizar la conexión: " . $e->getMessage();
}
?>