<?php
// ==================== API CHECKOUT ====================
// POST → guarda dirección + pedido + detalles_pedido en BD

session_start();
header('Content-Type: application/json'); // indica que el servidor va a devolver datos en formato JSON
header('Access-Control-Allow-Origin: *'); //Esto tiene que ver con CORS — una medida de seguridad de los navegadores que por defecto bloquea peticiones entre dominios distintos. El * significa "acepta peticiones desde cualquier origen".
// Solo acepta POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// Requiere sesión iniciada
if (empty($_SESSION['id_usuario'])) {
    echo json_encode(['error' => 'Debes iniciar sesión para hacer un pedido.']);
    exit;
}

include('../conexion/conexion.php');

try {
    // ── 1. Leer datos del formulario de dirección ─────────────────────────────
    $id_usuario = (int) $_SESSION['id_usuario'];

    // ── Leer si el usuario usa una dirección ya guardada ─────────────────────
    $id_direccion_existente = intval($_POST['id_direccion_existente'] ?? 0);

    // Solo leer los campos del formulario si es una dirección nueva
    $calle = trim($_POST['calle'] ?? '');
    $ciudad = trim($_POST['ciudad'] ?? '');
    $provincia = trim($_POST['provincia'] ?? '');
    $codigo_postal = trim($_POST['codigo_postal'] ?? '');
    $pais = trim($_POST['pais'] ?? '');
    $telefono = trim($_POST['telefono_contacto'] ?? '');

    // Método de pago (solo valores permitidos)
    $metodosPago = ['Tarjeta', 'PayPal', 'Contrarembolso'];
    $metodo_pago = in_array($_POST['metodo_pago'] ?? '', $metodosPago)
        ? $_POST['metodo_pago']
        : 'Tarjeta';

    // ── 2. Leer los productos del carrito (JSON string enviado desde JS) ──────
    $carritoJson = $_POST['carrito'] ?? '[]';
    $carrito = json_decode($carritoJson, true);

    // Validar campos de dirección solo si NO se usa una existente
    if ($id_direccion_existente === 0) {
        if (empty($calle) || empty($ciudad) || empty($provincia) || empty($codigo_postal) || empty($pais)) {
            echo json_encode(['error' => 'Faltan campos de la dirección.']);
            exit;
        }
    }
    if (empty($carrito) || !is_array($carrito)) {
        echo json_encode(['error' => 'El carrito está vacío.']);
        exit;
    }

    // ── Validar que hay stock suficiente para cada producto ────────────────────
    foreach ($carrito as $item) {
        $stmtStock = $conexion->prepare("
            SELECT stock, nombre FROM productos WHERE id_producto = :id
        ");
        $stmtStock->execute([':id' => intval($item['id'])]); // intval() convierte el id a entero para evitar inyecciones SQL
        $prod = $stmtStock->fetch(PDO::FETCH_ASSOC);

        if (!$prod) {
            echo json_encode(['error' => 'Producto no encontrado: ' . $item['nombre']]);
            exit;
        }
        if ($prod['stock'] < intval($item['cantidad'])) { // intval() convierte la cantidad a entero por seguridad
            echo json_encode(['error' => 'Stock insuficiente para "' . $prod['nombre'] . '". Solo quedan ' . $prod['stock'] . ' unidades.']);
            exit;
        }
    }

    // ── Inicio de transacción: todo o nada ────────────────────────────────────
    $conexion->beginTransaction();

    // ── 3. Obtener o insertar la dirección ───────────────────────────────────
    if ($id_direccion_existente > 0) {
        // Verificar que esa dirección pertenece al usuario
        $stmtCheck = $conexion->prepare("
            SELECT id_direccion FROM direcciones
            WHERE id_direccion = :did AND id_usuario = :uid
            LIMIT 1
        ");
        $stmtCheck->execute([':did' => $id_direccion_existente, ':uid' => $id_usuario]);
        $row = $stmtCheck->fetch();
        if (!$row) {
            echo json_encode(['error' => 'Dirección no válida.']);
            exit;
        }
        $id_direccion = $id_direccion_existente;
    } else {
        // Nueva dirección desde el formulario
        $stmtDir = $conexion->prepare("
            INSERT INTO direcciones (id_usuario, calle, ciudad, provincia, pais, codigo_postal, telefono_contacto)
            VALUES (:uid, :calle, :ciudad, :provincia, :pais, :cp, :tel)
        ");
        $stmtDir->execute([
            ':uid' => $id_usuario,
            ':calle' => $calle,
            ':ciudad' => $ciudad,
            ':provincia' => $provincia,
            ':pais' => $pais,
            ':cp' => $codigo_postal,
            ':tel' => $telefono
        ]);
        $id_direccion = (int) $conexion->lastInsertId();
    }

    // ── 4. Calcular el total del pedido  ───────────────────────────────────────
    $total = 0;
    foreach ($carrito as $item) {
        $total += floatval($item['precio']) * intval($item['cantidad']);
    }

    // ── 5. Insertar el pedido ─────────────────────────────────────────────────
    $stmtPed = $conexion->prepare("
        INSERT INTO pedidos (id_usuario, id_direccion, total_pedido, metodo_pago)
        VALUES (:uid, :did, :total, :metodo)
    ");
    $stmtPed->execute([
        ':uid' => $id_usuario,
        ':did' => $id_direccion,
        ':total' => round($total, 2),
        ':metodo' => $metodo_pago
    ]);
    $id_pedido = (int) $conexion->lastInsertId();

    // ── 6. Insertar cada producto en detalles_pedido ──────────────────────────
    $stmtDet = $conexion->prepare("
        INSERT INTO detalles_pedido (id_pedido, id_producto, cantidad_producto, precio_unidad)
        VALUES (:pid, :prod, :cant, :precio)
    ");
    foreach ($carrito as $item) {
        $stmtDet->execute([
            ':pid' => $id_pedido,
            ':prod' => intval($item['id']),
            ':cant' => intval($item['cantidad']),
            ':precio' => floatval($item['precio'])
        ]);
    }

    // ── 7. Descontar el stock de cada producto comprado ───────────────────────
    $stmtDescStock = $conexion->prepare("
        UPDATE productos SET stock = stock - :cantidad WHERE id_producto = :id
    ");
    foreach ($carrito as $item) {
        $stmtDescStock->execute([
            ':cantidad' => intval($item['cantidad']),
            ':id' => intval($item['id'])
        ]);
    }

    // ── Confirmar la transacción ──────────────────────────────────────────────
    $conexion->commit();

    echo json_encode([
        'ok' => true,
        'id_pedido' => $id_pedido,
        'message' => '¡Pedido confirmado!'
    ]);

} catch (Exception $e) {
    $conexion->rollBack();
    echo json_encode(['error' => $e->getMessage()]);
}

?>