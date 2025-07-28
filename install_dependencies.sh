#!/bin/bash

echo "Installation des dépendances pour la reconnaissance de plaques..."

# Installer les dépendances Python
echo "Installation des packages Python..."
pip install -r requirements.txt

# Vérifier l'installation d'EasyOCR
echo "Vérification de l'installation d'EasyOCR..."
python -c "import easyocr; print('EasyOCR installé avec succès!')" 2>/dev/null || {
    echo "Erreur: EasyOCR n'a pas pu être installé correctement"
    echo "Essayez d'installer manuellement: pip install easyocr"
}

# Vérifier l'installation d'Ultralytics
echo "Vérification de l'installation d'Ultralytics..."
python -c "import ultralytics; print('Ultralytics installé avec succès!')" 2>/dev/null || {
    echo "Erreur: Ultralytics n'a pas pu être installé correctement"
    echo "Essayez d'installer manuellement: pip install ultralytics"
}

echo "Installation terminée!"
echo "Vous pouvez maintenant démarrer l'application avec: npm run dev" 