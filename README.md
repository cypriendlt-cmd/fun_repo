# 💌 Mission : choisir notre prochaine aventure

Un petit site web statique, moderne, romantique et humoristique, pensé pour être envoyé à sa copine (ou à toute personne aimée) afin qu'elle choisisse son activité surprise du week-end.

Le site fonctionne 100 % côté client :

- HTML / CSS / JavaScript vanilla
- Aucune dépendance à installer
- Envoi du mail via **EmailJS**
- Hébergement gratuit sur **GitHub Pages**

---

## 📁 Structure du projet

```
index.html   → structure du site
style.css    → design (palette rose/pêche/violet, animations, responsive)
script.js    → logique + configuration EmailJS + activités
README.md    → ce fichier
```

---

## 🚀 Démarrage rapide

1. Cloner ce dépôt (ou télécharger les fichiers).
2. Ouvrir `script.js` et remplacer les trois constantes EmailJS :
   ```js
   const EMAILJS_PUBLIC_KEY  = "VOTRE_PUBLIC_KEY";
   const EMAILJS_SERVICE_ID  = "VOTRE_SERVICE_ID";
   const EMAILJS_TEMPLATE_ID = "VOTRE_TEMPLATE_ID";
   ```
3. Ouvrir `index.html` dans un navigateur pour tester en local.
4. Pousser sur GitHub et activer GitHub Pages (voir plus bas).

> Tant que les identifiants EmailJS ne sont pas remplis, le site fonctionne quand même mais l'envoi est simulé (log dans la console). Idéal pour tester le flow.

---

## ✉️ Configuration d'EmailJS (pas à pas)

### 1. Créer un compte
- Va sur [https://www.emailjs.com](https://www.emailjs.com) et crée un compte gratuit.
- Le plan gratuit suffit largement (200 mails / mois).

### 2. Créer un service (fournisseur d'envoi)
- Dans le dashboard → **Email Services** → **Add New Service**.
- Choisis ton fournisseur (Gmail est le plus simple) et connecte ton compte mail.
- Note le **Service ID** (ex : `service_abc1234`).

### 3. Créer un template d'email
- Dans le dashboard → **Email Templates** → **Create New Template**.
- Dans le corps du mail, utilise les variables ci-dessous. Exemple de template :

```
Sujet : 💌 Elle a choisi ! ({{submission_date}})

Bonjour mon cher toi,

Voici la sélection officielle :

🥇 Choix numéro 1 : {{first_choice}}
🥈 Choix numéro 2 : {{second_choice}}
🥉 Choix numéro 3 : {{third_choice}}

🎬 Genre de film souhaité : {{movie_genre}}
🍽️ Restaurant : {{restaurant_choice}}

💬 Message perso :
{{personal_message}}

Envoyé le : {{submission_date}}
```

- Sauvegarde et note le **Template ID** (ex : `template_xyz9876`).

### 4. Variables à ajouter au template

| Variable            | Contenu                                     |
|---------------------|---------------------------------------------|
| `first_choice`      | Activité classée n°1                        |
| `second_choice`     | Activité classée n°2                        |
| `third_choice`      | Activité classée n°3                        |
| `movie_genre`       | Genre de film choisi (ou "Non concerné")    |
| `restaurant_choice` | Réponse restaurant                          |
| `personal_message`  | Message libre                               |
| `submission_date`   | Date/heure d'envoi (formatée FR)            |

### 5. Récupérer la Public Key
- Dashboard → **Account** → **General** → copie la **Public Key**.

### 6. Coller les identifiants
- Ouvre `script.js` et remplace les trois constantes en haut du fichier par tes vraies valeurs.

---

## 🧪 Tester en local

Le plus simple :

```bash
# Ouvre juste index.html dans ton navigateur (double-clic).
```

Ou avec un mini serveur (recommandé pour éviter les soucis CORS/localStorage) :

```bash
# Python 3
python -m http.server 8000

# Puis va sur http://localhost:8000
```

---

## 🌐 Publier sur GitHub Pages

1. Crée un repo GitHub public (ex : `mon-cadeau-surprise`).
2. Pousse `index.html`, `style.css`, `script.js`, `README.md` à la racine.
3. Va dans **Settings → Pages**.
4. **Source** : `Deploy from a branch`.
5. **Branch** : `main` / `/ (root)` → Save.
6. Après 1-2 minutes, l'URL est disponible : `https://ton-user.github.io/mon-cadeau-surprise/`.
7. Envoie ce lien à ta copine. ❤️

---

## 🔐 Sécuriser EmailJS (important !)

La Public Key est visible côté client, c'est **normal** avec EmailJS. Pour éviter tout usage abusif :

1. Dashboard EmailJS → **Account** → **Security** → active **Allow EmailJS API for specific domains**.
2. Ajoute uniquement ton domaine GitHub Pages, par exemple :
   ```
   https://ton-user.github.io
   ```
3. Sauvegarde. Toute tentative depuis un autre domaine sera bloquée.

---

## ✏️ Modifier les activités et les textes

### Ajouter / éditer une activité
Ouvre `script.js` et modifie le tableau `activities` :

```js
const activities = [
  {
    id: "picnic",              // identifiant unique (obligatoire)
    emoji: "🧺",
    title: "Pique-nique surprise",
    description: "Une jolie couverture, deux transats et beaucoup trop de fromage."
  },
  // ... ajoute autant d'entrées que tu veux
];
```

### Modifier les genres de film
Modifie le tableau `movieGenres` dans `script.js`.

### Changer les textes affichés
- Textes fixes (accueil, sections, boutons) → dans `index.html`.
- Messages dynamiques (erreurs, humour) → dans `script.js`.

### Changer la palette
Ouvre `style.css`, en haut du fichier tu trouveras les variables CSS (`--rose`, `--framboise`, etc.). Change-les pour repeindre tout le site en 5 secondes.

---

## ♿ Accessibilité

- Contrastes conformes.
- Boutons ≥ 48 px de haut sur mobile.
- Navigation clavier fonctionnelle (Tab, Entrée, Échap pour la modale).
- Attributs ARIA (`role`, `aria-checked`, `aria-live`).
- Respect de `prefers-reduced-motion` : animations désactivées si l'utilisateur le demande.

---

## 💾 Persistance

Le classement, le restaurant et le message sont sauvegardés automatiquement dans le `localStorage` du navigateur. Si elle recharge la page par erreur, ses choix sont restaurés.

Après un envoi réussi, un drapeau est également stocké dans le `localStorage` (`date-choice-sent-v1`). Un petit bouton « Recommencer » reste disponible en bas.

---

Fait avec ❤️ (et un peu trop de café).
