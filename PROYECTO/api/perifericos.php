<?php
// API para periféricos - devuelve JSON con los productos de la BD
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

include('../conexion/conexion.php');

try {
    $sql = "SELECT * FROM productos WHERE categoria = 'Accesorios' OR categoria = 'Accesorio' OR categoria = 'Perifericos' OR categoria = 'Periferico'";
    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($productos);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
