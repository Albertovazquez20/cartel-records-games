<?php
// ==================== API PARA HOME ====================
// Devuelve tres consultas:
//   - novedades: 3 videojuegos aleatorios para el carrusel
//   - masVendidos: top 3 videojuegos más vendidos
//   - proximosLanzamientos: juegos aún no lanzados

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

include('../conexion/conexion.php');

try {
    // --- Novedades: productos marcados como novedad por el admin ---
    $sqlNovedades = "
        SELECT * FROM productos
        WHERE es_novedad = 1
        ORDER BY id_producto DESC
        LIMIT 6
    ";
    $stmtN = $conexion->prepare($sqlNovedades);
    $stmtN->execute();
    $novedades = $stmtN->fetchAll(PDO::FETCH_ASSOC);

    // Fallback: si no hay ninguno marcado, mostrar los 3 últimos añadidos
    if (empty($novedades)) {
        $sqlNovedades = "
            SELECT * FROM productos
            WHERE categoria = 'Videojuegos'
            ORDER BY id_producto DESC
            LIMIT 3
        ";
        $stmtN = $conexion->prepare($sqlNovedades);
        $stmtN->execute();
        $novedades = $stmtN->fetchAll(PDO::FETCH_ASSOC);
    }

    // --- Más vendidos: top 3 videojuegos por unidades vendidas ---
    $sqlVendidos = "
        SELECT p.*,
               COALESCE(SUM(dp.cantidad_producto), 0) AS total_vendido
        FROM productos p
        LEFT JOIN detalles_pedido dp ON p.id_producto = dp.id_producto
        WHERE p.categoria = 'Videojuegos'
        GROUP BY p.id_producto
        ORDER BY total_vendido DESC
        LIMIT 3
    ";
    $stmtV = $conexion->prepare($sqlVendidos);
    $stmtV->execute();
    $masVendidos = $stmtV->fetchAll(PDO::FETCH_ASSOC);

    // --- Próximos lanzamientos: cargados desde la BD ---
    $sqlProximos = "
        SELECT * FROM proximos_lanzamientos
        ORDER BY fecha_estreno ASC
    ";
    $stmtP = $conexion->prepare($sqlProximos);
    $stmtP->execute();
    $proximos = $stmtP->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'novedades' => $novedades,
        'masVendidos' => $masVendidos,
        'proximosLanzamientos' => $proximos
    ]);

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>