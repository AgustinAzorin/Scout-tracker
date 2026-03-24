#!/bin/bash

# Script para gestionar migraciones de Supabase
# Uso: ./manage-migrations.sh [push|pull|reset|help]

SUPABASE_PROJECT_ID=${SUPABASE_PROJECT_ID:-$(cat .env.local 2>/dev/null | grep SUPABASE_URL | cut -d'/' -f4)}

function show_help() {
  echo "Scout Tracker Supabase Migration Manager"
  echo ""
  echo "Uso: ./manage-migrations.sh [comando]"
  echo ""
  echo "Comandos:"
  echo "  push          - Aplicar migraciones locales a Supabase"
  echo "  pull          - Descargar cambios remotos como migraciones"
  echo "  reset         - Resetear la BD y reaplicar migraciones"
  echo "  status        - Ver estado de migraciones"
  echo "  help          - Mostrar esta ayuda"
  echo ""
  echo "Requisitos:"
  echo "  - Supabase CLI instalado: npm install -g supabase"
  echo "  - Autenticado: supabase login"
}

case "$1" in
  push)
    echo "Aplicando migraciones locales a Supabase..."
    supabase db push
    ;;
  pull)
    echo "Descargando cambios remotos..."
    supabase db pull
    ;;
  reset)
    echo "ADVERTENCIA: Esto borrará todos los datos."
    read -p "¿Continuar? (s/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
      supabase db reset
    fi
    ;;
  status)
    echo "Estado de migraciones:"
    supabase migration list
    ;;
  *)
    show_help
    ;;
esac
