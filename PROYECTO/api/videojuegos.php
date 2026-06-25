<?php
// ==================== API PARA OBTENER VIDEOJUEGOS ====================
// Este archivo devuelve los datos de la BD en formato JSON
// para que JavaScript pueda clonar el template y rellenar las tarjetas

// Cabeceras para permitir JSON y acceso desde JavaScript
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Conectar a la base de datos
include('../conexion/conexion.php');

try {
    // Consultar los videojuegos de la tabla productos
    $sql = "SELECT * FROM productos WHERE categoria = 'Videojuegos' OR categoria = 'Videojuego'";
    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Devolver los datos en formato JSON
    echo json_encode($productos);

} catch (Exception $e) {
    // Devolver error en formato JSON
    echo json_encode(['error' => $e->getMessage()]);
}
?>