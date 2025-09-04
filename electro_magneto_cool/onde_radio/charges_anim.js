
    // Récupération de l'élément SVG
    const svg = document.getElementById("mysvg");

    // Définition des charges : proton principal, électron et deuxième proton
    const charges = [
      { x: 250, y: 300, sign: 1, elem: null, symbol: null, visible: true },  // Proton principal (rouge) - toujours visible
      { x: 550, y: 300, sign: -1, elem: null, symbol: null, visible: false }, // Électron (bleu) - invisible au début
      { x: 400, y: 200, sign: 1, elem: null, symbol: null, visible: false }   // Deuxième proton (rouge) - invisible au début
    ];
    
    // États de visibilité
    let electronVisible = false;
    let secondProtonVisible = false;
    let firstProtonClick = true; // Nouvelle variable pour tracker le premier clic sur le proton

    // Création des éléments visuels pour chaque charge
    charges.forEach((c, i) => {
      // Création du cercle représentant la charge
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("r", 10);
      circle.setAttribute("cx", c.x);
      circle.setAttribute("cy", c.y);
      circle.setAttribute("class", c.sign > 0 ? "charge1" : "charge2");
      // Masquer les charges invisibles au début
      if (!c.visible) circle.style.display = "none";
      svg.appendChild(circle);
      c.elem = circle;
      
      // Création du symbole + ou - au centre de la charge
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", c.x);
      text.setAttribute("y", c.y);
      text.setAttribute("class", "charge-symbol");
      text.textContent = c.sign > 0 ? "+" : "−";
      // Masquer les symboles des charges invisibles
      if (!c.visible) text.style.display = "none";
      svg.appendChild(text);
      c.symbol = text;
    });

    // Fonction qui calcule le champ électrique en un point (x, y)
    function computeField(x, y) {
      let fx = 0, fy = 0; // Composantes du champ résultant
      charges.forEach(c => {
        if (!c.visible) return; // Ignorer les charges invisibles
        const dx = x - c.x; // Distance horizontale à la charge
        const dy = y - c.y; // Distance verticale à la charge
        const distSq = dx * dx + dy * dy; // Distance au carré
        if (distSq > 1) { // Éviter division par zéro près de la charge
          const dist = Math.sqrt(distSq);
          const force = c.sign / (distSq * 0.8); // Force avec facteur d'atténuation
          fx += force * dx / dist; // Composante x du champ
          fy += force * dy / dist; // Composante y du champ
        }
      });
      return { fx, fy };
    }

    // Tableaux pour stocker les chemins, flèches et points finaux des trajectoires
    const paths = [];
    const arrows = [];
    let positiveTrajectoryEndPoints = []; // Points finaux des trajectoires positives pour comparaison

    // Fonction qui trace une ligne de champ à partir d'un point donné
    function traceLine(x, y, startCharge, maxLength = 120) {
      let points = [`M${x},${y}`]; // Début du chemin SVG
      let steps = 150; // Nombre maximum d'étapes
      let stepSize = 1.2; // Taille de chaque pas
      let prevDir = null; // Direction précédente pour le lissage
      let currentLength = 0; // Longueur parcourue
      let endPoint = { x, y }; // Point final de la trajectoire

      for (let i = 0; i < steps; i++) {
        // Calcul du champ électrique au point actuel
        const { fx, fy } = computeField(x, y);
        const len = Math.sqrt(fx * fx + fy * fy);
        if (len === 0) break; // Arrêt si champ nul

        let dx = fx / len; // Direction normalisée
        let dy = fy / len;

        // Inversion de direction pour les charges négatives (attraction vs répulsion)
        if (startCharge && startCharge.sign < 0) {
          dx = -dx;
          dy = -dy;
        }

        // Lissage de la trajectoire avec la direction précédente
        if (prevDir) {
          const curveStrength = 0.4; // Force du lissage
          dx = (1 - curveStrength) * prevDir.dx + curveStrength * dx;
          dy = (1 - curveStrength) * prevDir.dy + curveStrength * dy;
          const dlen = Math.sqrt(dx * dx + dy * dy);
          if (dlen > 0) {
            dx /= dlen;
            dy /= dlen;
          }
        }

        // Calcul de la nouvelle position
        const newX = x + dx * stepSize;
        const newY = y + dy * stepSize;

        // Vérification de la longueur maximale autorisée
        currentLength += stepSize;
        if (currentLength > maxLength) break;
        
        x = newX;
        y = newY;
        endPoint = { x, y }; // Mise à jour du point final

        // Arrêt si on sort des limites du SVG
        if (x < 0 || x > 800 || y < 0 || y > 600) break;

        // Vérification de proximité avec une charge de signe opposé
        let nearOppositeCharge = false;
        charges.forEach(c => {
          if (!c.visible) return;
          const dist = Math.sqrt((x - c.x) * (x - c.x) + (y - c.y) * (y - c.y));
          if (dist < 15 && c.sign !== startCharge.sign) {
            nearOppositeCharge = true;
          }
        });
        if (nearOppositeCharge) break; // Arrêt si trop proche d'une charge opposée

        points.push(`L${x},${y}`); // Ajout du point au chemin
        prevDir = { dx, dy };
      }

      return { pathData: points.join(" "), endPoint, length: currentLength };
    }

    // Fonction qui calcule la distance minimale d'un point aux charges positives
    function getMinDistanceFromPositiveCharges(point) {
      let minDistance = Infinity;
      charges.forEach(c => {
        if (c.visible && c.sign > 0) {
          const distance = Math.sqrt(
            (point.x - c.x) ** 2 + (point.y - c.y) ** 2
          );
          minDistance = Math.min(minDistance, distance);
        }
      });
      return minDistance;
    }

    // Fonction qui trouve la distance minimale des trajectoires positives à leurs charges sources
    function getMinDistancePositiveTrajectoriesToCharges() {
      let minDistance = Infinity;
      positiveTrajectoryEndPoints.forEach(endPoint => {
        const distance = getMinDistanceFromPositiveCharges(endPoint);
        minDistance = Math.min(minDistance, distance);
      });
      return minDistance;
    }

    // Fonction principale qui met à jour toutes les trajectoires
    function updatePaths() {
      // Suppression des anciens éléments graphiques
      paths.forEach(p => p.parentNode && p.parentNode.removeChild(p));
      arrows.forEach(a => a.arrow.parentNode && a.arrow.parentNode.removeChild(a.arrow));
      paths.length = 0;
      arrows.length = 0;
      positiveTrajectoryEndPoints = []; // Réinitialisation des points finaux positifs

      const positiveCharges = charges.filter(c => c.visible && c.sign > 0);
      const negativeCharges = charges.filter(c => c.visible && c.sign < 0);
      const linesPerCharge = 20; // Nombre de trajectoires par charge
      const offsetRadius = 12; // Rayon de départ autour des charges

      // ÉTAPE 1 : Tracer d'abord toutes les trajectoires des charges positives
      positiveCharges.forEach(charge => {
        for (let i = 0; i < linesPerCharge; i++) {
          // Calcul de la position de départ (cercle autour de la charge)
          const angle = (2 * Math.PI * i) / linesPerCharge;
          const x = charge.x + Math.cos(angle) * offsetRadius;
          const y = charge.y + Math.sin(angle) * offsetRadius;
          
          // Traçage de la trajectoire positive avec longueur maximale (120)
          const result = traceLine(x, y, charge, 120);
          positiveTrajectoryEndPoints.push(result.endPoint); // Stockage du point final
          
          // Création du chemin SVG pour la trajectoire positive
          const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
          path.setAttribute("d", result.pathData);
          svg.appendChild(path);
          paths.push(path);

          // Création de la flèche animée pour cette trajectoire
          const arrow = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
          arrow.setAttribute("class", "arrow");
          svg.appendChild(arrow);
          arrows.push({ arrow, path, isNegative: false });
        }
      });

      // ÉTAPE 2 : Tracer les trajectoires des charges négatives avec contrainte de distance
      if (negativeCharges.length > 0) {
        const minPositiveDistance = getMinDistancePositiveTrajectoriesToCharges(); // Distance min des positives
        
        negativeCharges.forEach(charge => {
          for (let i = 0; i < linesPerCharge; i++) {
            // Calcul de la position de départ (cercle autour de la charge négative)
            const angle = (2 * Math.PI * i) / linesPerCharge;
            const x = charge.x + Math.cos(angle) * offsetRadius;
            const y = charge.y + Math.sin(angle) * offsetRadius;
            
            // Test de la trajectoire négative complète pour analyser son comportement
            const testResult = traceLine(x, y, charge, 120);
            
            // Vérification si la trajectoire négative viole la "zone positive"
            const negativeEndDistanceFromPositive = getMinDistanceFromPositiveCharges(testResult.endPoint);
            
            let maxLength = 120; // Longueur par défaut
            
            // Si la trajectoire négative s'approche trop près des charges positives
            if (negativeEndDistanceFromPositive < minPositiveDistance) {
              // Calcul de la violation de la zone interdite
              const violation = minPositiveDistance - negativeEndDistanceFromPositive;
              const maxViolation = minPositiveDistance * 0.5; // Zone de transition
              
              if (violation >= maxViolation) {
                // Suppression complète si violation trop importante
                continue;
              } else {
                // Réduction progressive de la longueur selon la violation
                const reductionFactor = 1 - (violation / maxViolation);
                maxLength = 120 * reductionFactor;
              }
            }
            
            // Suppression des trajectoires trop courtes
            if (maxLength < 10) continue;
            
            // Traçage final de la trajectoire négative avec longueur ajustée
            const result = traceLine(x, y, charge, maxLength);
            
            // Création du chemin SVG pour la trajectoire négative
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", result.pathData);
            svg.appendChild(path);
            paths.push(path);

            // Création de la flèche animée pour cette trajectoire
            const arrow = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
            arrow.setAttribute("class", "arrow");
            svg.appendChild(arrow);
            arrows.push({ arrow, path, isNegative: true });
          }
        });
      }
    }

    // Fonction d'animation des flèches le long des trajectoires
    function animate() {
      const t = performance.now() * 0.001; // Temps actuel en secondes
      const cycleTime = 3; // Durée d'un cycle complet en secondes
      
      arrows.forEach(({ arrow, path, isNegative }) => {
        if (!path || !arrow || !path.getTotalLength) return;
        const len = path.getTotalLength(); // Longueur totale du chemin
        if (len === 0) return;
        
        // Calcul de la position dans le cycle (0 à 1)
        const cycle = (t % cycleTime) / cycleTime;
        
        let pos; // Position de la flèche sur le chemin
        if (isNegative) {
          // Flèches négatives : vont des extrémités vers le centre (attraction)
          pos = len * (1 - cycle);
        } else {
          // Flèches positives : vont du centre vers l'extérieur (répulsion)
          pos = len * cycle;
        }
        
        // Calcul des points pour orienter la flèche
        const p1 = path.getPointAtLength(pos);
        const p2 = path.getPointAtLength(isNegative ? Math.max(pos - 8, 0) : Math.min(pos + 8, len));

        // Calcul de l'angle et création de la géométrie de la flèche
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const size = 6; // Taille de la flèche
        const cos = Math.cos(angle), sin = Math.sin(angle);
        const ax = p1.x, ay = p1.y;

        // Géométrie triangulaire de la flèche
        const points = [
          [ax + cos * size, ay + sin * size],           // Pointe
          [ax - sin * size * 0.5, ay + cos * size * 0.5], // Base gauche
          [ax + sin * size * 0.5, ay - cos * size * 0.5]  // Base droite
        ];
        arrow.setAttribute("points", points.map(p => p.join(",")).join(" "));
      });
      requestAnimationFrame(animate); // Répétition de l'animation
    }

    // Fonction pour permettre le déplacement des charges à la souris
    function setupDrag(charge) {
      let dragging = false;
      
      // Début du déplacement au clic
      charge.elem.addEventListener("mousedown", (e) => {
        dragging = true;
        charge.elem.style.cursor = "grabbing"; // Changement du curseur
      });
      
      // Déplacement pendant le mouvement de la souris
      window.addEventListener("mousemove", (e) => {
        if (!dragging) return;
        const rect = svg.getBoundingClientRect();
        // Limitation des positions dans les limites du SVG avec marges
        charge.x = Math.max(20, Math.min(780, e.clientX - rect.left));
        charge.y = Math.max(20, Math.min(580, e.clientY - rect.top));
        
        // Mise à jour de la position du cercle
        charge.elem.setAttribute("cx", charge.x);
        charge.elem.setAttribute("cy", charge.y);
        
        // Mise à jour de la position du symbole + ou -
        charge.symbol.setAttribute("x", charge.x);
        charge.symbol.setAttribute("y", charge.y);
        
        updatePaths(); // Recalcul de toutes les trajectoires
      });
      
      // Fin du déplacement au relâchement de la souris
      window.addEventListener("mouseup", () => {
        dragging = false;
        charge.elem.style.cursor = "grab"; // Retour du curseur normal
      });
    }

    // Configuration du déplacement pour chaque charge
    charges.forEach(setupDrag);
    
    // Fonction pour faire apparaître/disparaître l'électron
    function toggleElectron() {
      electronVisible = !electronVisible;
      const electron = charges[1]; // La charge négative (électron)
      const button = document.getElementById("toggleElectron");
      
      electron.visible = electronVisible;
      
      if(document.getElementById('next').style.display == 'none' || document.getElementById('next').style.display == ''){
        document.getElementById('toggleProton').style.display = 'block';
        document.getElementById('toggleElectron').style.display = 'none';
        electron.elem.style.display = "block";
        electron.symbol.style.display = "block";
        document.querySelector('.button-container p').textContent = "lorsqu'une charge négative entre dans le champs du proton, ils subissent une attraction";

      }

        else if (electronVisible) {
        // Afficher l'électron
        electron.elem.style.display = "block";
        electron.symbol.style.display = "block";
        button.textContent = "supprimer l'électron";
      } else {
        // Masquer l'électron
        electron.elem.style.display = "none";
        electron.symbol.style.display = "none";
        button.textContent = "ajouter l'électron";
      }
      
      // Mettre à jour les trajectoires
      updatePaths();
    }
    
    // Fonction pour faire apparaître/disparaître le deuxième proton
    function toggleProton() {
      secondProtonVisible = !secondProtonVisible;
      const proton = charges[2]; // Le deuxième proton
      const button = document.getElementById("toggleProton");
      const electron = charges[1]; // L'électron
      
      proton.visible = secondProtonVisible;
      

      if(document.getElementById('next').style.display == 'none' || document.getElementById('next').style.display == ''){
        // Premier clic sur le bouton proton
        if (firstProtonClick) {
          // Faire disparaître l'électron
          if (electronVisible) {
            electronVisible = false;
            electron.visible = false;
            electron.elem.style.display = "none";
            electron.symbol.style.display = "none";
          }
          firstProtonClick = false; // Marquer que le premier clic a eu lieu
        }
        
        document.getElementById('toggleElectron').style.display = 'block';
        document.getElementById('next').style.display = 'block';
        proton.elem.style.display = "block";
        proton.symbol.style.display = "block";
        document.querySelector('.button-container p').textContent = "quand une charge positive entre dans le champs d'un autre proton, les deux charges se repoussent.";
        updatePaths();
      }
      else if (secondProtonVisible) {
        // Afficher le proton
        proton.elem.style.display = "block";
        proton.symbol.style.display = "block";
        button.textContent = "supprimer le proton";
      } else {
        // Masquer le proton
        proton.elem.style.display = "none";
        proton.symbol.style.display = "none";
        button.textContent = "ajouter un proton";
      }
      
      // Mettre à jour les trajectoires
      updatePaths();
    }
    
    // Ajout des événements click sur les boutons
    document.getElementById("toggleElectron").addEventListener("click", toggleElectron);
    document.getElementById("toggleProton").addEventListener("click", toggleProton);
    
    // Initialisation : création des trajectoires et démarrage de l'animation
    updatePaths();
    animate();