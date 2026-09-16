#!/usr/bin/env bash
# =============================================================
# FREDA STYLE – Produktbilder importieren
# -------------------------------------------------------------
# Kopiert die Originaldateien aus dem Ordner "upload/" nach
# assets/img/products/ und benennt sie dabei verstaendlich um.
#
# Die Originale werden NICHT geloescht und NICHT veraendert.
#
# Aufruf aus dem Ordner freda-style/:
#   bash scripts/import-images.sh            # nutzt ./upload
#   bash scripts/import-images.sh /pfad/zum/ordner
# =============================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="${1:-$ROOT/upload}"
DEST="$ROOT/assets/img/products"

mkdir -p "$DEST"

# Originaldatei -> Zieldatei
MAP=(
  "Screenshot 2026-09-16 181847.png|military-blazer-01.png"
  "Screenshot 2026-09-16 181920.png|military-blazer-02.png"
  "Screenshot 2026-09-16 181933.png|rock-taschen-01.png"
  "Screenshot 2026-09-16 182011.png|bluse-01.png"
  "Screenshot 2026-09-16 182029.png|bluse-02.png"
  "4b77a0da-3ee4-4c10-a6bf-49c7cd54eb4d.png|jeansjacke-01.png"
  "Screenshot 2026-09-16 182217.png|jeansjacke-02.png"
  "Screenshot 2026-09-16 182234.png|jeansjacke-03.png"
  "Screenshot 2026-09-16 182245.png|jeansjacke-04.png"
  "bca65629-08bf-4a50-a34d-c3b21911289b.png|jeansjacke-05.png"
)

echo "Quelle: $SRC"
echo "Ziel:   $DEST"
echo

ok=0
missing=0

for entry in "${MAP[@]}"; do
  from="${entry%%|*}"
  to="${entry##*|}"

  if [ -f "$SRC/$from" ]; then
    cp -p "$SRC/$from" "$DEST/$to"
    echo "  kopiert   $from  ->  $to"
    ok=$((ok + 1))
  else
    echo "  FEHLT     $from  (erwartet als $to)"
    missing=$((missing + 1))
  fi
done

echo
echo "Fertig: $ok kopiert, $missing fehlen."
if [ "$missing" -gt 0 ]; then
  echo "Fehlende Bilder zeigen auf der Seite einen dezenten Platzhalter statt eines Fehlers."
fi
