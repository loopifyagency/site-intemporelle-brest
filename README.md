# L'intemporelle Brest — site vitrine

Site statique (HTML / CSS / JS, aucune étape de build) pour le salon de manucure
**L'intemporelle Brest**, 245 rue Anatole France, 29200 Brest.

- Ouvrir `index.html` via un serveur statique (`python3 -m http.server`) ou déployer le dossier tel quel.
- GSAP 3.13 + ScrollTrigger et Lenis sont embarqués dans `assets/vendor/`, les polices
  (Bodoni Moda, Jost) dans `assets/fonts/` : aucune dépendance CDN, hormis l'iframe Google Maps.
- Respecte `prefers-reduced-motion` (version statique, sans pin ni défilement horizontal).

## À personnaliser
- **Visuels du nuancier / hero** : dessinés en SVG par `assets/js/main.js` (`data-nailset`). Pour utiliser de vraies
  photos, remplacer le contenu des `.tile__art` (section « Nuancier ») par une balise `<img loading="lazy" alt="…">`.
- **Réseaux sociaux** : aucun lien fourni, donc non affiché dans le footer.
- **Réservation** : pas de moteur de réservation en ligne ; le composeur calcule prix/durée puis propose appel ou SMS au 07 63 51 03 24.
- **Prestations / tarifs** : section `#prestations` (HTML) et tableau `GROUPS` dans `assets/js/main.js` (composeur).
