import warnings
warnings.filterwarnings('ignore')

import os
import sys
# Désactiver les messages de debug de YOLO
os.environ['ULTRALYTICS_VERBOSE'] = 'False'

from ultralytics import YOLO
import tempfile
from PIL import Image
import numpy as np
import base64
import io
import json

# Importer les bibliothèques pour l'OCR
try:
    import easyocr
    EASYOCR_AVAILABLE = True
    # Initialiser le reader EasyOCR une seule fois
    import contextlib
    with contextlib.redirect_stdout(sys.stderr):
        reader = easyocr.Reader(['en'], gpu=False, verbose=False)  # Désactiver les messages verbose
except ImportError:
    EASYOCR_AVAILABLE = False
    print("Warning: EasyOCR not available. Install with: pip install easyocr", file=sys.stderr)

def extract_text_with_ocr(plate_image):
    """
    Extrait le texte d'une image de plaque avec EasyOCR
    """
    if not EASYOCR_AVAILABLE:
        return "OCR non disponible - Installez easyocr"
    
    try:
        # Convertir l'image PIL en numpy array
        img_array = np.array(plate_image)
        
        # Effectuer la reconnaissance de texte (rediriger les messages vers stderr)
        import contextlib
        with contextlib.redirect_stdout(sys.stderr):
            results = reader.readtext(img_array)
        
        # Extraire les textes détectés
        if results:
            # Trier par confiance et prendre les meilleurs résultats
            results.sort(key=lambda x: x[2], reverse=True)
            texts = []
            for (bbox, text, confidence) in results:
                if confidence > 0.3:  # Seuil de confiance
                    texts.append(text.strip())
            
            if texts:
                return ' '.join(texts)
            else:
                return "Aucun texte détecté avec confiance suffisante"
        else:
            return "Aucun texte détecté"
            
    except Exception as e:
        return f"Erreur OCR: {str(e)}"

def extract_text_simple(plate_image):
    """
    Fonction OCR simple avec EasyOCR
    """
    return extract_text_with_ocr(plate_image)

def detect_license_plate(image_path, model_path='best.pt'):
    """
    Détecte les plaques d'immatriculation dans une image et extrait le texte
    """
    try:
        # Charger le modèle YOLO
        model = YOLO(model_path)
        
        # Ouvrir l'image
        img = Image.open(image_path).convert('RGB')
        
        # Faire la prédiction (rediriger les messages vers stderr)
        import contextlib
        with contextlib.redirect_stdout(sys.stderr):
            results = model.predict(img, verbose=False)
        
        # Annoter l'image
        annotated_img = results[0].plot()
        
        # Convertir en image PIL
        annotated_pil = Image.fromarray(annotated_img)
        
        # Convertir l'image annotée en base64
        buffer = io.BytesIO()
        annotated_pil.save(buffer, format='JPEG')
        annotated_img_str = base64.b64encode(buffer.getvalue()).decode()
        
        # Extraire les informations de détection et les plaques
        detections = []
        extracted_plates = []
        
        if results[0].boxes is not None:
            for i, box in enumerate(results[0].boxes):
                # Coordonnées de la boîte de détection
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                
                # Extraire la région de la plaque
                plate_region = img.crop((int(x1), int(y1), int(x2), int(y2)))
                
                # Extraire le texte avec OCR
                extracted_text = extract_text_simple(plate_region)
                
                # Convertir la plaque extraite en base64
                plate_buffer = io.BytesIO()
                plate_region.save(plate_buffer, format='JPEG')
                plate_img_str = base64.b64encode(plate_buffer.getvalue()).decode()
                
                detection = {
                    'confidence': float(box.conf[0]),
                    'bbox': box.xyxy[0].tolist(),
                    'class': int(box.cls[0]) if box.cls is not None else 0,
                    'plate_image': f"data:image/jpeg;base64,{plate_img_str}",
                    'extracted_text': extracted_text
                }
                detections.append(detection)
                extracted_plates.append({
                    'id': i,
                    'confidence': float(box.conf[0]),
                    'image': f"data:image/jpeg;base64,{plate_img_str}",
                    'extracted_text': extracted_text
                })
        
        return {
            'success': True,
            'annotated_image': f"data:image/jpeg;base64,{annotated_img_str}",
            'detections': detections,
            'extracted_plates': extracted_plates,
            'message': f"Détection réussie - {len(detections)} plaque(s) trouvée(s)"
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'message': 'Erreur lors de la détection'
        }

if __name__ == "__main__":
    if len(sys.argv) != 2:
        error_result = {'success': False, 'error': 'Usage: python yolo_detection.py <image_path>'}
        sys.stderr.write(json.dumps(error_result) + '\n')
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    # Rediriger tous les messages vers stderr pour éviter d'interférer avec le JSON
    import contextlib
    with contextlib.redirect_stdout(sys.stderr):
        result = detect_license_plate(image_path)
    
    # Écrire le JSON sur stdout sans caractères supplémentaires
    json_str = json.dumps(result, ensure_ascii=False)
    sys.stdout.write(json_str)
    sys.stdout.flush()