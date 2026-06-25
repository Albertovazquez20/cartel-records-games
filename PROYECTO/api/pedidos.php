<?php
// ==================== API PEDIDOS ====================
// GET → devuelve todos los pedidos del usuario con sus productos

session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Requiere sesión iniciada
if (empty($_SESSION['id_usuario'])) {
    echo json_encode(['error' => 'Debes iniciar sesión para ver tus pedidos.']);
    exit;
}

include('../conexion/conexion.php');

try {
    $id_usuario = (int) $_SESSION['id_usuario'];

    // Obtener todos los pedidos del usuario con su dirección
    $stmtPedidos = $conexion->prepare("
        SELECT p.id_pedido, p.fecha_pedido, p.total_pedido, p.metodo_pago,
               d.calle, d.ciudad, d.provincia, d.codigo_postal, d.pais
        FROM pedidos p
        JOIN direcciones d ON d.id_direccion = p.id_direccion
        WHERE p.id_usuario = :uid
        ORDER BY p.fecha_pedido DESC
    ");
    $stmtPedidos->execute([':uid' => $id_usuario]);
    $pedidos = $stmtPedidos->fetchAll(PDO::FETCH_ASSOC);

    // Para cada pedido, obtener sus productos de detalles_pedido
    $stmtDetalle = $conexion->prepare("
        SELECT dp.cantidad_producto, dp.precio_unidad, dp.subtotal,
               pr.nombre, pr.imagen
        FROM detalles_pedido dp
        JOIN productos pr ON pr.id_producto = dp.id_producto
        WHERE dp.id_pedido = :pid
    ");

    foreach ($pedidos as &$pedido) {
        $stmtDetalle->execute([':pid' => $pedido['id_pedido']]);
        $pedido['productos'] = $stmtDetalle->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode($pedidos);

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
