#!/bin/bash

# Backup Script for Chart Components
# Usage: ./backup.sh [filename] [description]

BACKUP_DIR="./backups/Chart"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

if [ $# -eq 0 ]; then
    echo "Usage: $0 <filename> [description]"
    echo "Example: $0 CandlestickChart.tsx 'before grid changes'"
    exit 1
fi

FILENAME=$1
DESCRIPTION=${2:-"manual backup"}

# Check if source file exists
if [ ! -f "src/components/Chart/$FILENAME" ]; then
    echo "Error: src/components/Chart/$FILENAME not found"
    exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create backup with timestamp
BACKUP_FILE="$BACKUP_DIR/$FILENAME.backup-$TIMESTAMP"
cp "src/components/Chart/$FILENAME" "$BACKUP_FILE"

echo "✅ Backup created: $BACKUP_FILE"
echo "📝 Description: $DESCRIPTION"

# Log the backup
echo "$(date): $FILENAME -> $BACKUP_FILE ($DESCRIPTION)" >> "$BACKUP_DIR/backup.log"
