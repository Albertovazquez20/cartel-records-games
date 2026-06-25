<?php
session_start();
session_destroy();
header("Location: ../index.php"); // sube un nivel desde log-in/ hasta la raíz
exit();
?>

