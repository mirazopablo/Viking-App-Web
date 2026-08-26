#!/bin/bash

echo "🚀 Iniciando proceso de release para Viking App..."

# 1. Ejecutar standard-version para generar changelog, subir versión y crear el tag
echo "📦 Generando changelog y subiendo versión..."
pnpm run release

# 2. Enviar todo a GitHub (producción)
echo "☁️ Enviando cambios y tags a GitHub..."
git push --follow-tags origin main

echo "✅ ¡Release completada y en producción!"
