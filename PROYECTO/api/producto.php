<?php
// ==================== API PRODUCTO INDIVIDUAL ====================
// Devuelve un único producto por su id_producto en formato JSON

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

include('../conexion/conexion.php');

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id <= 0) {
    echo json_encode(['error' => 'ID de producto no válido']);
    exit;
}

try {
    $sql = "SELECT * FROM productos WHERE id_producto = :id LIMIT 1";
    $stmt = $conexion->prepare($sql);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    $producto = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$producto) {
        echo json_encode(['error' => 'Producto no encontrado']);
    } else {
        echo json_encode($producto);
    }

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
