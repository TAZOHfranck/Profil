# MeetUp - Application de Rencontre

## 🔐 Configuration de l'Authentification Google

### 1. Configuration Supabase

Pour activer l'authentification Google, vous devez configurer votre projet Supabase :

#### A. Dans le Dashboard Supabase :
1. Allez dans **Authentication** > **Providers**
2. Activez **Google**
3. Configurez les paramètres :
   - **Client ID** : Votre Google OAuth Client ID
   - **Client Secret** : Votre Google OAuth Client Secret

#### B. Variables d'environnement :
Créez un fichier `.env` avec :
```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_anonyme_supabase
```

### 2. Configuration Google OAuth

#### A. Console Google Cloud :
1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API **Google+ API**
4. Créez des identifiants OAuth 2.0

#### B. Configuration des URLs autorisées :
- **JavaScript origins** : `http://localhost:5173`, `https://votre-domaine.com`
- **Redirect URIs** : `https://votre-projet.supabase.co/auth/v1/callback`

### 3. Test de l'Authentification

#### Panel de Debug (Développement uniquement) :
- Cliquez sur l'icône ⚙️ en bas à droite
- Vérifiez la configuration Supabase
- Testez l'authentification Google
- Créez un profil test si nécessaire

#### Logs de Debug :
Ouvrez la console du navigateur pour voir les logs détaillés :
- `🔄` : Tentatives de connexion
- `✅` : Opérations réussies
- `❌` : Erreurs
- `⚠️` : Avertissements

### 4. Résolution des Problèmes Courants

#### Erreur "Popup bloquée" :
- Autorisez les popups pour votre site
- Vérifiez que le navigateur n'a pas de bloqueur de popup actif

#### Erreur "Invalid redirect URI" :
- Vérifiez que l'URL de redirection est correctement configurée dans Google Cloud Console
- Format : `https://votre-projet.supabase.co/auth/v1/callback`

#### Profil non créé après connexion Google :
- Le trigger `handle_new_user()` crée automatiquement un profil
- Si le profil n'existe pas, utilisez le bouton "Créer profil test" dans le panel de debug

### 5. Fonctionnalités Implémentées

#### Authentification :
- ✅ Connexion par email/mot de passe
- ✅ Inscription par email/mot de passe
- ✅ Authentification Google OAuth
- ✅ Création automatique de profil
- ✅ Gestion des sessions

#### Sécurité :
- ✅ Row Level Security (RLS)
- ✅ Politiques d'accès granulaires
- ✅ Validation des données
- ✅ Protection contre les injections SQL

#### Fonctionnalités Avancées :
- ✅ Système de likes et super likes
- ✅ Matches mutuels automatiques
- ✅ Messagerie en temps réel
- ✅ Notifications push
- ✅ Vérification d'identité
- ✅ Test de compatibilité
- ✅ Événements communautaires
- ✅ Blog et articles
- ✅ Panel d'administration
- ✅ Cadeaux virtuels
- ✅ Système de crédits

### 6. Structure de la Base de Données

#### Tables principales :
- `profiles` : Profils utilisateurs
- `likes` : Système de likes
- `matches` : Correspondances mutuelles
- `messages` : Messagerie
- `notifications` : Notifications
- `photos` : Gestion des photos
- `reports` : Signalements
- `verification_requests` : Demandes de vérification
- `virtual_gifts_sent` : Cadeaux virtuels
- `compatibility_answers` : Réponses au test
- `community_events` : Événements
- `blog_posts` : Articles de blog

### 7. Déploiement

#### Variables d'environnement de production :
```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anonyme_production
```

#### Configuration Google OAuth pour la production :
- Ajoutez votre domaine de production dans les origins autorisées
- Mettez à jour l'URL de redirection avec votre domaine de production

## 🚀 Démarrage Rapide

1. **Installation** :
   ```bash
   npm install
   ```

2. **Configuration** :
   - Copiez `.env.example` vers `.env`
   - Remplissez les variables Supabase

3. **Développement** :
   ```bash
   npm run dev
   ```

4. **Build** :
   ```bash
   npm run build
   ```

## 📞 Support

Si vous rencontrez des problèmes avec l'authentification Google :
1. Vérifiez les logs dans la console
2. Utilisez le panel de debug en développement
3. Vérifiez la configuration Supabase et Google Cloud
4. Consultez la documentation Supabase Auth