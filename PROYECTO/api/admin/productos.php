<?php
// ==================== API ADMIN - PRODUCTOS ====================
// GET    → lista todos los productos
// POST   → añade un producto nuevo (con imagen)
// PUT    → edita un producto existente
// DELETE → elimina un producto

ob_start(); // Captura cualquier output inesperado (warnings, notices)
ini_set('display_errors', '0'); // No mezclar errores PHP con el JSON

session_start();
header('Content-Type: application/json');

// Solo admin puede usar esta API
if (($_SESSION['rol'] ?? '') !== 'admin') {
    echo json_encode(['error' => 'Acceso denegado.']);
    exit;
}

include('../../conexion/conexion.php');

try {
    // ── GET: devolver todos los productos ─────────────────────────────────────
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $conexion->query("SELECT * FROM productos ORDER BY id_producto DESC");
        ob_end_clean();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        exit;
    }

    // ── DELETE: eliminar producto ─────────────────────────────────────────────
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        parse_str(file_get_contents('php://input'), $datos);
        $id = intval($datos['id_producto'] ?? 0);
        if (!$id) { ob_end_clean(); echo json_encode(['error' => 'ID inválido.']); exit; }

        $stmt = $conexion->prepare("DELETE FROM productos WHERE id_producto = :id");
        $stmt->execute([':id' => $id]);
        ob_end_clean();
        echo json_encode(['ok' => true]);
        exit;
    }

    // ── POST: añadir producto nuevo ───────────────────────────────────────────
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $nombre      = trim($_POST['nombre'] ?? '');
        $descripcion = trim($_POST['descripcion'] ?? '');
        $categoria   = trim($_POST['categoria'] ?? '');
        $plataforma  = trim($_POST['plataforma'] ?? '');
        $marca       = trim($_POST['marca'] ?? '');
        $genero      = trim($_POST['genero'] ?? '');
        $precio      = floatval($_POST['precio'] ?? 0);
        $stock       = intval($_POST['stock'] ?? 0);
        $es_novedad  = isset($_POST['es_novedad']) ? 1 : 0;
        $id_editar   = intval($_POST['id_producto'] ?? 0); // 0 = nuevo

        if (!$nombre || !$precio) {
            ob_end_clean();
            echo json_encode(['error' => 'Nombre y precio son obligatorios.']);
            exit;
        }

        // Gestionar imagen si se sube una nueva
        $imagen_nombre = trim($_POST['imagen_actual'] ?? '');
        if (!empty($_FILES['imagen']['name'])) {
            $ext = strtolower(pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION)); // extrae la extensión del archivo (ej: "JPG" → "jpg")
            $permitidos = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'];
            if (!in_array($ext, $permitidos)) { // comprueba que la extensión está en la lista de formatos permitidos
                ob_end_clean();
                echo json_encode(['error' => 'Formato de imagen no permitido.']);
                exit;
            }
            $imagen_nombre = uniqid('prod_') . '.' . $ext;
            $destino = '../../img/' . $imagen_nombre;
            if (!move_uploaded_file($_FILES['imagen']['tmp_name'], $destino)) { // mueve el archivo desde la carpeta temporal del servidor a img/
                ob_end_clean();
                echo json_encode(['error' => 'Error al guardar la imagen.']);
                exit;
            }
        }

        if ($id_editar > 0) {
            // ── EDITAR producto existente
            $stmt = $conexion->prepare("
                UPDATE productos SET
                    nombre = :nombre, descripcion = :desc, categoria = :cat,
                    plataforma = :plat, marca = :marca, genero = :genero,
                    precio = :precio, stock = :stock, imagen = :imagen,
                    es_novedad = :es_novedad
                WHERE id_producto = :id
            ");
            $stmt->execute([
                ':nombre'     => $nombre,   ':desc'   => $descripcion,
                ':cat'        => $categoria, ':plat'  => $plataforma,
                ':marca'      => $marca,    ':genero' => $genero,
                ':precio'     => $precio,   ':stock'  => $stock,
                ':imagen'     => $imagen_nombre, ':id' => $id_editar,
                ':es_novedad' => $es_novedad
            ]);
            ob_end_clean();
            echo json_encode(['ok' => true, 'accion' => 'editado']);
        } else {
            // ── INSERTAR producto nuevo
            $stmt = $conexion->prepare("
                INSERT INTO productos (nombre, descripcion, categoria, plataforma, marca, genero, precio, stock, imagen, es_novedad)
                VALUES (:nombre, :desc, :cat, :plat, :marca, :genero, :precio, :stock, :imagen, :es_novedad)
            ");
            $stmt->execute([
                ':nombre'     => $nombre,   ':desc'   => $descripcion,
                ':cat'        => $categoria, ':plat'  => $plataforma,
                ':marca'      => $marca,    ':genero' => $genero,
                ':precio'     => $precio,   ':stock'  => $stock,
                ':imagen'     => $imagen_nombre, ':es_novedad' => $es_novedad
            ]);
            ob_end_clean();
            echo json_encode(['ok' => true, 'accion' => 'creado', 'id' => $conexion->lastInsertId()]);
        }
    }

} catch (Exception $e) {
    ob_end_clean(); // Limpiar cualquier output parcial antes de devolver el error
    echo json_encode(['error' => $e->getMessage()]);
}
?>
