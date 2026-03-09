<?php
$home = '/home/axisloyaltycloud';

echo "=== HOME DIRECTORY ===\n";
foreach (scandir($home) as $f) {
    if ($f === '.' || $f === '..') continue;
    $path = "$home/$f";
    $type = is_link($path) ? 'LINK -> ' . readlink($path) : (is_dir($path) ? 'DIR' : 'FILE');
    echo "$f  [$type]\n";
}

echo "\n=== DOMAINS ===\n";
$domains = "$home/domains";
if (is_dir($domains)) {
    foreach (scandir($domains) as $d) {
        if ($d === '.' || $d === '..') continue;
        echo "$d\n";
        $pub = "$domains/$d/public_html";
        if (is_dir($pub)) {
            foreach (scandir($pub) as $f) {
                if ($f === '.' || $f === '..') continue;
                $p = "$pub/$f";
                $t = is_link($p) ? 'LINK->' . readlink($p) : (is_dir($p) ? 'dir' : 'file');
                echo "  $f [$t]\n";
            }
        }
    }
}

echo "\n=== BACKUPS / ZIP FILES IN HOME ===\n";
$iter = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($home, RecursiveDirectoryIterator::SKIP_DOTS),
    RecursiveIteratorIterator::SELF_FIRST
);
foreach ($iter as $file) {
    if ($iter->getDepth() > 3) continue;
    $name = $file->getFilename();
    if (preg_match('/\.(zip|tar|gz|sql|bak)$/i', $name)) {
        echo $file->getPathname() . " (" . round($file->getSize()/1024/1024, 1) . " MB)\n";
    }
}

echo "\n=== axis-backend or axis-loyalty-backend dirs ===\n";
foreach (scandir($home) as $f) {
    if (stripos($f, 'axis') !== false || stripos($f, 'backup') !== false) {
        echo "$home/$f\n";
    }
}
