# Système de Reconnaissance de Plaques d'Immatriculation Mauritaniennes

Un système moderne de détection et d'extraction de plaques d'immatriculation utilisant YOLOv8 et Next.js.

## 🚀 Fonctionnalités

- **Détection automatique** des plaques d'immatriculation
- **Extraction des plaques** détectées
- **Interface moderne** et responsive
- **Téléchargement** des images annotées et plaques extraites
- **Support drag & drop** pour l'upload d'images

## 🛠️ Technologies

- **Frontend**: Next.js 15, React 18, TypeScript
- **Backend**: Python, Ultralytics YOLOv8
- **UI**: Tailwind CSS, Radix UI, Lucide Icons
- **Modèle**: YOLOv8 custom (best.pt)

## 📋 Prérequis

- Node.js 18+ 
- Python 3.8+
- npm ou yarn

## 🔧 Installation

1. **Cloner le projet**
```bash
git clone <votre-repo>
cd license-plate-recognition
```

2. **Installer les dépendances Node.js**
```bash
npm install
```

3. **Installer les dépendances Python**
```bash
pip install ultralytics pillow
```

4. **Vérifier que le modèle existe**
```bash
ls best.pt
```

## 🚀 Démarrage local

```bash
npm run dev
```

Le site sera accessible sur `http://localhost:3000`

## 🌐 Déploiement

### Option 1: Vercel (Recommandé)

1. **Installer Vercel CLI**
```bash
npm i -g vercel
```

2. **Déployer**
```bash
vercel
```

3. **Configuration automatique**
- Vercel détectera automatiquement Next.js
- Les variables d'environnement seront configurées
- Le déploiement sera automatique à chaque push

### Option 2: Railway

1. **Connecter votre repo GitHub**
2. **Configurer les variables d'environnement**
3. **Déployer automatiquement**

### Option 3: Netlify

1. **Build command**: `npm run build`
2. **Publish directory**: `.next`
3. **Variables d'environnement**: Configurer selon besoin

### Option 4: VPS/Dedicated Server

1. **Installer les dépendances système**
```bash
sudo apt update
sudo apt install python3 python3-pip nodejs npm
```

2. **Cloner et installer**
```bash
git clone <votre-repo>
cd license-plate-recognition
npm install
pip install ultralytics pillow
```

3. **Build et démarrer**
```bash
npm run build
npm start
```

4. **Configurer Nginx (optionnel)**
```nginx
server {
    listen 80;
    server_name votre-domaine.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 Configuration pour le déploiement

### Variables d'environnement

Créez un fichier `.env.local` :

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://votre-domaine.com
```

### Optimisations pour la production

1. **Optimiser les images**
```bash
npm run build
```

2. **Vérifier les performances**
```bash
npm run lint
```

## 📁 Structure du projet

```
license-plate-recognition/
├── app/                    # Pages Next.js
│   ├── api/               # API routes
│   │   └── detect-plate/  # Endpoint de détection
│   ├── globals.css        # Styles globaux
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Page d'accueil
├── components/            # Composants React
├── lib/                  # Utilitaires
├── public/               # Assets statiques
├── scripts/              # Scripts Python
│   └── yolo_detection.py # Script de détection
├── temp/                 # Fichiers temporaires
├── best.pt              # Modèle YOLOv8
├── package.json          # Dépendances Node.js
└── README.md            # Documentation
```

## 🐛 Dépannage

### Erreur de modèle
```bash
# Vérifier que le modèle existe
ls -la best.pt

# Redownloader si nécessaire
# (Vous devez avoir le fichier best.pt)
```

### Erreur de dépendances Python
```bash
pip install --upgrade ultralytics pillow
```

### Erreur de build
```bash
npm run build
# Vérifier les erreurs dans la console
```

## 📞 Support

Pour toute question ou problème :
- Créer une issue sur GitHub
- Contacter l'équipe de développement

## 📄 Licence

© 2024 Système de Reconnaissance de Plaques d'Immatriculation
Développé en partenariat avec IBTIKAR et ES DATA CLUB 