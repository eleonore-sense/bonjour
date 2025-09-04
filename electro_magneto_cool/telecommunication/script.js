document.addEventListener("DOMContentLoaded", function () {
    // Event listeners
    document.getElementById("envoyer_bouton").addEventListener("click", binaire);
    document.getElementById("numerique_bouton").addEventListener("click", numerique);
    document.getElementById("signal_bouton").addEventListener("click", info_bit);
    document.getElementById("emettre_bouton").addEventListener("click", prochaine_etape);
    document.getElementById("retranscrire_bouton").addEventListener("click", retranscrire_signal);
    document.getElementById("envoyer_relais_bouton").addEventListener("click", envoyer_vers_relais);
    document.getElementById("emettre_signal_relais2_bouton").addEventListener("click", emettre_signal_relais2);
    document.getElementById("decoder_bouton").addEventListener("click", decoder_signal);
    document.getElementById("traduire_binaire_bouton").addEventListener("click", traduire_binaire);

    // ===== FONCTIONS UTILITAIRES =====
    
    function getBits() {
        const message2P = document.querySelector('#message_2 p');
        let binaryText = '';
        const spans = message2P.querySelectorAll('span');
        spans.forEach((span, index) => {
            if (index > 0) binaryText += ' ';
            binaryText += span.textContent;
        });
        return binaryText.replace(/\s/g, '');
    }

    function binaryToText(binaryString) {
        let result = '';
        for (let i = 0; i < binaryString.length; i += 8) {
            const byte = binaryString.substr(i, 8);
            if (byte.length === 8) {
                const charCode = parseInt(byte, 2);
                result += String.fromCharCode(charCode);
            }
        }
        return result;
    }

    function charToBinary(char) {
        return char.charCodeAt(0).toString(2).padStart(8, '0');
    }

    // ===== FONCTION GÉNÉRIQUE POUR DESSINER SIGNAL ÉLECTRIQUE =====
    
    function drawSignalElectrique(config) {
        const {
            pathGroupId,
            bits,
            speed = 200,
            enableScrolling = true,
            onComplete,
            width = 200,
            highlightSpans = false,
            binaireProgressElementId = null
        } = config;

        // Préparer l'affichage du binaire si demandé
        if (binaireProgressElementId) {
            const binaireElement = document.getElementById(binaireProgressElementId);
            if (binaireElement) {
                binaireElement.textContent = '';
                document.getElementById('binaire_decode').style.display = 'block';
            }
        }

        const pathGroup = document.getElementById(pathGroupId);
        const baseY = 70;
        const highY = 10;
        
        let x = 10;
        let currentBitIndex = 0;
        const bitWidth = 7;
        let pathData = "";
        
        function drawNextBit() {
    if (currentBitIndex >= bits.length) {
        // Enlever le highlight du dernier bit avant de terminer
        if (highlightSpans && currentBitIndex > 0) {
            $(`#bit_${currentBitIndex - 1}`).removeClass('highlight');
        }
        if (onComplete) setTimeout(onComplete, 800);
        return;
            }
            
            // Gestion des spans colorés
    if (highlightSpans) {
        if (currentBitIndex > 0) {
            $(`#bit_${currentBitIndex - 1}`).removeClass('highlight');
        }
        $(`#bit_${currentBitIndex}`).addClass('highlight');
    }
            
            const bit = bits[currentBitIndex];
            const y = bit === '1' ? highY : baseY;
            
            // Dessiner le path SVG
            if (currentBitIndex > 0) {
                const prevBit = bits[currentBitIndex - 1];
                const prevY = prevBit === '1' ? highY : baseY;
                if (prevY !== y) {
                    pathData += `L${x} ${prevY} L${x} ${y} `;
                }
            } else {
                pathData = `M${x} ${y} `;
            }
            
            pathData += `L${x + bitWidth} ${y} `;
            
            // Mettre à jour le SVG seulement si pathGroup existe
            if (pathGroup) {
                const existingPath = pathGroup.querySelector('path');
                if (existingPath) {
                    existingPath.setAttribute('d', pathData);
                } else {
                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path.setAttribute('d', pathData);
                    path.setAttribute('stroke', 'black');
                    path.setAttribute('stroke-width', '1');
                    path.setAttribute('fill', 'none');
                    pathGroup.appendChild(path);
                }
            }
            
            x += bitWidth;
            currentBitIndex++;
     
            // Ajouter le bit au texte binaire si demandé
            if (binaireProgressElementId) {
                const binaireElement = document.getElementById(binaireProgressElementId);
                if (binaireElement) {
                    binaireElement.textContent += bit;
                }
            }

            // Défilement si nécessaire
            if (pathGroup && enableScrolling && x > width - 20) {
                const newPathData = pathData.replace(/([ML])(\d+\.?\d*)/g, (match, command, xVal) => {
                    const newX = parseFloat(xVal) - bitWidth;
                    return command + newX;
                });
                pathData = newPathData;
                x = width - 20;
            }
            
            setTimeout(drawNextBit, speed);
        }
        
        setTimeout(drawNextBit, 500);
    }

    // ===== FONCTION GÉNÉRIQUE POUR DÉFILEMENT =====
    
    function defilerSignalElectrique(config) {
        const {
            pathGroupId,
            bits,
            direction = 'left',
            speed = 200,
            bitWidth = 7,
            onBitChange = null,
            onComplete = null
        } = config;
        
        const pathGroup = document.getElementById(pathGroupId);
        const existingPath = pathGroup.querySelector('path');
        
        if (existingPath) {
            let currentBitIndex = 0;
            
            function faireDefiler() {
                if (currentBitIndex >= bits.length) {
                    if (onComplete) onComplete();
                    return;
                }
                
                const bit = bits[currentBitIndex];
                
                // Appeler la fonction personnalisée si fournie
                if (onBitChange) onBitChange(bit, currentBitIndex);
                
                // Faire défiler
                const currentPath = existingPath.getAttribute('d');
                if (currentPath) {
                    const multiplier = direction === 'left' ? -1 : 1;
                    const newPathData = currentPath.replace(/([ML])(\d+\.?\d*)/g, (match, command, xVal) => {
                        const newX = parseFloat(xVal) + (bitWidth * multiplier);
                        return command + newX;
                    });
                    existingPath.setAttribute('d', newPathData);
                }
                
                currentBitIndex++;
                setTimeout(faireDefiler, speed);
            }
            
            faireDefiler();
        }
    }

    // ===== FONCTION GÉNÉRIQUE POUR PROPAGATION D'ONDE =====
    
    function propagateWaveSignal(config) {
        const {
            svgId,
            pathId, 
            bits,
            width = 436,
            height = 80,
            propagationSpeed = 8,
            bitDuration = 15,
            direction = 'leftToRight',
            onComplete
        } = config;
        
        const svg = document.getElementById(svgId);
        const path = document.getElementById(pathId);
        
        const centerY = height / 2;
        const amplitude = 25;
        
        let frame = 0;
        let waveData = [];
        const maxPoints = Math.ceil(width / propagationSpeed);
        
        function animatePropagation() {
            frame++;
            
            const currentBitIndex = Math.floor(frame / bitDuration);
            const bitProgress = (frame % bitDuration) / bitDuration;
            
            if (currentBitIndex < bits.length) {
                const currentBit = bits[currentBitIndex];
                
                let oscillationsForThisBit = currentBit === '0' ? 1 : 2;
                const bitPhase = bitProgress * oscillationsForThisBit * 2 * Math.PI;
                const y = centerY + (amplitude * 0.7) * Math.sin(bitPhase);
                
                if (direction === 'leftToRight') {
                    waveData.unshift({ x: 0, y: y, bit: currentBit });
                    for (let i = 1; i < waveData.length; i++) {
                        waveData[i].x += propagationSpeed;
                    }
                    waveData = waveData.filter(point => point.x < width);
                } else {
                    waveData.unshift({ x: width, y: y, bit: currentBit });
                    for (let i = 1; i < waveData.length; i++) {
                        waveData[i].x -= propagationSpeed;
                    }
                    waveData = waveData.filter(point => point.x >= 0);
                }
                
                if (waveData.length > maxPoints) {
                    waveData = waveData.slice(0, maxPoints);
                }
                
                let pathData = "";
                for (let i = 0; i < waveData.length; i++) {
                    const point = waveData[i];
                    pathData += (i === 0 ? "M" : "L") + point.x + " " + point.y + " ";
                }
                
                path.setAttribute('d', pathData);
                path.setAttribute('stroke', 'black');
                path.setAttribute('stroke-width', '1');
                
                requestAnimationFrame(animatePropagation);
            } else {
                // Animation de fin - faire disparaître les dernières ondes
                if (waveData.length > 0) {
                    if (direction === 'leftToRight') {
                        for (let i = 0; i < waveData.length; i++) {
                            waveData[i].x += propagationSpeed;
                        }
                        waveData = waveData.filter(point => point.x < width);
                    } else {
                        for (let i = 0; i < waveData.length; i++) {
                            waveData[i].x -= propagationSpeed;
                        }
                        waveData = waveData.filter(point => point.x >= 0);
                    }
                    
                    let pathData = "";
                    for (let i = 0; i < waveData.length; i++) {
                        const point = waveData[i];
                        pathData += (i === 0 ? "M" : "L") + point.x + " " + point.y + " ";
                    }
                    path.setAttribute('d', pathData);
                    
                    if (waveData.length > 0) {
                        requestAnimationFrame(animatePropagation);
                    } else {
                        if (onComplete) setTimeout(onComplete, 500);
                    }
                }
            }
        }
        
        animatePropagation();
    }

    // ===== FONCTION GÉNÉRIQUE POUR POINTS LUMINEUX =====
    
function creerPointLumineux(chemin, cheminLength, callback = null, isFirstBit = false) {
    const point = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    point.setAttribute('r', '4');
    point.setAttribute('fill', 'black');
    point.setAttribute('opacity', '1');
    
    const svg = document.getElementById('chemin_relais');
    svg.appendChild(point);
    
    // Si c'est le premier bit, créer la légende "impulsion lumineuse"
    let legendeImpulsion = null;
    if (isFirstBit) {
        legendeImpulsion = document.getElementById('legende-impulsion');
        legendeImpulsion.style.display = 'block';
    }
    
    let distance = 0;
    const speed = cheminLength / 300;
    
function animer() {
    if (distance <= cheminLength) {
        const pointSurChemin = chemin.getPointAtLength(distance);
        point.setAttribute('cx', pointSurChemin.x);
        point.setAttribute('cy', pointSurChemin.y);
        
        // Faire suivre la légende "impulsion lumineuse" plus simplement
        if (legendeImpulsion) {
            // Position absolue par rapport à la page
            legendeImpulsion.style.left = (1215 + pointSurChemin.x + 15) + 'px';
            legendeImpulsion.style.top = (138 + pointSurChemin.y - 25) + 'px';
        }
        
        distance += speed;
        requestAnimationFrame(animer);
    } else {
        svg.removeChild(point);
        
        // Cacher la légende quand la boule arrive
        if (legendeImpulsion) {
            legendeImpulsion.style.display = 'none';
        }
        
        if (callback) callback();
    }
}
    
    animer();
}

    // ===== FONCTION POUR DESSINER LES FRÉQUENCES =====
    
    function dessinerFrequences() {
        const width = 120;
        const height = 60;
        
        // Bit 0 - 1 oscillation
        let pathData0 = "";
        for (let x = 0; x <= width; x++) {
            const phase = (x / width) * 1 * 2 * Math.PI;
            const y = height/2 + 20 * Math.sin(phase);
            pathData0 += (x === 0 ? "M" : "L") + x + " " + y + " ";
        }
        document.getElementById('wave_0').setAttribute('d', pathData0);
        
        // Bit 1 - 3 oscillations
        let pathData1 = "";
        for (let x = 0; x <= width; x++) {
            const phase = (x / width) * 3 * 2 * Math.PI;
            const y = height/2 + 20 * Math.sin(phase);
            pathData1 += (x === 0 ? "M" : "L") + x + " " + y + " ";
        }
        document.getElementById('wave_1').setAttribute('d', pathData1);
    }

    // ===== FONCTION POUR CONTRÔLER LES FRÉQUENCES =====
    
    function controlerFrequences(bit) {
        if (bit === '0') {
            document.getElementById('wave_0').style.strokeWidth = '2.5';
            document.getElementById('wave_1').style.strokeWidth = '1';
        } else {
            document.getElementById('wave_0').style.strokeWidth = '1';
            document.getElementById('wave_1').style.strokeWidth = '2.5';
        }
    }

    function resetFrequences() {
        document.getElementById('wave_0').style.strokeWidth = '1';
        document.getElementById('wave_1').style.strokeWidth = '1';
    }

    // ===== FONCTIONS PRINCIPALES =====

    function binaire() {
        $("#envoyer_bouton").css("display", "none");
        $("#message_2").css("display", "block");

        document.querySelector('#legende').textContent = "le message est traduit en language binaire composé de 0 et de 1";

        const message1Text = document.querySelector('#message_1 p').textContent;
        const message2P = document.querySelector('#message_2 p');

        let spanText = '';
        for (let i = 0; i < message1Text.length; i++) {
            spanText += `<span id="letter_${i}">${message1Text[i]}</span>`;
            if (i < message1Text.length - 1) {
                spanText += ' ';
            }
        }
        message2P.innerHTML = spanText;
        
        let currentIndex = 0;

        function transformNextChar() {
            if (currentIndex < message1Text.length) {
                const char = message1Text[currentIndex];
                const binary = charToBinary(char);
                const letterSpan = document.getElementById(`letter_${currentIndex}`);
                
                letterSpan.classList.add('letter-highlight');
                
                setTimeout(() => {
                    letterSpan.innerHTML = binary;
                    letterSpan.classList.remove('letter-highlight');
                    letterSpan.classList.add('bold-text');
                    
                    setTimeout(() => {
                        letterSpan.classList.remove('bold-text');
                        letterSpan.classList.add('consolas');
                    }, 300);
                }, 300);
                
                currentIndex++;
                setTimeout(transformNextChar, 700);
            } else {
                setTimeout(() => $("#numerique_bouton").css("display", "block"), 800);
            }
        }

        setTimeout(transformNextChar, 1500);
    }

    function numerique() {
        $("#numerique_bouton").css("display", "none");
        $("#signal_svg").css("display", "block");

        $('#legende').text("le signal numérique est généré : 1 = haut, 0 = bas");

        const message2P = document.querySelector('#message_2 p');
        const binaryText = message2P.innerHTML.replace(/<span[^>]*>/g, '').replace(/<\/span>/g, '').replace(/\s+/g, ' ').trim();
        const allBits = binaryText.replace(/\s/g, '');
        
        let spanText = '';
        let bitIndex = 0;

        for (let i = 0; i < binaryText.length; i++) {
            if (binaryText[i] === ' ') {
                spanText += ' ';
            } else {
                spanText += `<span id="bit_${bitIndex}" class="consolas">${binaryText[i]}</span>`;
                bitIndex++;
            }
        }
        message2P.innerHTML = spanText;

        drawSignalElectrique({
            pathGroupId: 'signal_path',
            bits: allBits,
            speed: 200,
            highlightSpans: true,
            onComplete: () => $("#signal_bouton").css("display", "block")
        });
    }

    function info_bit() {
        $("#message_pop_up").css("display", "block");
        $("#signal_bouton").css("display", "none");
        
        dessinerFrequences();
        
        setTimeout(() => {
            $("#emettre_bouton").css("display", "block");
            $("#antenne_emettrice").css("display", "block");
            $("#antenne_relai_1").css("display", "block");
        }, 800);
    }

function prochaine_etape() {
    $('#legende').text("transmission sur 1.8 GHz : la sinusoïde se propage vers l'antenne relais");
    $("#sinusoide").css("display", "block");
    
    const allBits = getBits();
    
    // Cacher immédiatement le bouton et le pop-up
    $("#emettre_bouton").css("display", "none");
    $("#message_pop_up").css("display", "none");
   


    propagateWaveSignal({
        svgId: 'sinusoide',
        pathId: 'sineWave',
        bits: allBits,
        width: 436,
        propagationSpeed: 5,
        bitDuration: 15,
        direction: 'leftToRight',
        onComplete: () => {
            $('#legende').text("Signal reçu par l'antenne relais !");
            setTimeout(() => {
                $("#retranscrire_bouton").css("display", "block");
            }, 1000);
        }
    });
    
    // Faire défiler le signal électrique en même temps
    defilerSignalElectrique({
        pathGroupId: 'signal_path',
        bits: allBits,
        direction: 'right',
        speed: 150,
        onBitChange: (bit) => {
            if (bit === '0') {
                document.getElementById('wave_0').style.strokeWidth = '2.5';
                document.getElementById('wave_1').style.strokeWidth = '1';
            } else {
                document.getElementById('wave_0').style.strokeWidth = '1';
                document.getElementById('wave_1').style.strokeWidth = '2.5';
            }
        },
        onComplete: () => {
            // Remettre les fréquences normales
            document.getElementById('wave_0').style.strokeWidth = '1';
            document.getElementById('wave_1').style.strokeWidth = '1';
            
// Après 3 secondes, remettre le signal comme à la fin de sa création
setTimeout(() => {
    // 1. Rendre invisible
    const pathGroup = document.getElementById('signal_path');
    const existingPath = pathGroup.querySelector('path');
    if (existingPath) {
        existingPath.style.opacity = '0';
    }
    
    // 2. Redessiner avec scrolling
    drawSignalElectrique({
        pathGroupId: 'signal_path',
        bits: allBits,
        speed: 0,
        enableScrolling: true,
        onComplete: () => {
            // 3. Rendre visible une fois en position finale
            if (existingPath) {
                existingPath.style.opacity = '1';
            }
        }
    });
}, 1000);
        }
    });
}
    function retranscrire_signal() {
        $("#retranscrire_bouton").css("display", "none");
        $('#legende').text("Le signal est maintenant reconverti en signal électrique.");
        $("#signal_electrique_svg").css("display", "block");
        
        const allBits = getBits();
        
        setTimeout(() => {
            drawSignalElectrique({
                pathGroupId: 'signal_electrique_path',
                bits: allBits,
                speed: 70,
                onComplete: () => {
                    $('#legende').text("Signal électrique prêt à être transmis vers l'antenne relais du récepteur");
                    $("#envoyer_relais_bouton").css("display", "block");
                }
            });
        }, 0);
    }

    function envoyer_vers_relais() {
        $('#legende').text("Le signal traverse la fibre optique : points noirs = bits 1 (impulsions lumineuses)");
        $("#envoyer_relais_bouton").css("display", "none");
        $("#antenne_relais_2").css("display", "block");
        $("#chemin_relais").css("display", "block");
        $("#signal_electrique_arrivee_svg").css("display", "block");
$("#chemin_relais").css("display", "block");
$("#signal_electrique_arrivee_svg").css("display", "block");

// Afficher la légende "fibre optique"
$("#legende-fibre").css("display", "block");


        const allBits = getBits();
        animationFibreOptique(allBits);
    }

    function animationFibreOptique(bits) {
        const chemin = document.getElementById('ligne_relais');
        const cheminLength = chemin.getTotalLength();
        
        let currentBitIndex = 0;
        const bitInterval = 200;

        // Variables pour la boîte d'arrivée
        const pathGroup = document.getElementById('signal_electrique_arrivee_path');
        const width = 200;
        const height = 80;
        const baseY = height - 10;
        const highY = 10;
        let x = 10;
        let currentBitArrivee = 0;
        const bitWidth = 7;
        let pathData = "";
        let animationStarted = false;

        // Variables pour faire défiler la boîte signal électrique relais 1
        const pathGroupRelais1 = document.getElementById('signal_electrique_path');
        const existingPathRelais1 = pathGroupRelais1.querySelector('path');

        function drawNextBitArrivee() {
            if (currentBitArrivee >= bits.length) {
                setTimeout(() => {
                    $('#legende').text("Signal électrique prêt à être transmis vers l'antenne réceptrice !");
                    $("#emettre_signal_relais2_bouton").css("display", "block");
                }, 500);
                return;
            }

            const bit = bits[currentBitArrivee];
            const y = bit === '1' ? highY : baseY;

            if (currentBitArrivee > 0) {
                const prevBit = bits[currentBitArrivee - 1];
                const prevY = prevBit === '1' ? highY : baseY;
                if (prevY !== y) {
                    pathData += `L${x} ${prevY} L${x} ${y} `;
                }
            } else {
                pathData = `M${x} ${y} `;
            }

            pathData += `L${x + bitWidth} ${y} `;

            const existingPath = pathGroup.querySelector('path');
            if (existingPath) {
                existingPath.setAttribute('d', pathData);
            } else {
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', pathData);
                path.setAttribute('stroke', 'black');
                path.setAttribute('stroke-width', '1');
                path.setAttribute('fill', 'none');
                pathGroup.appendChild(path);
            }

            x += bitWidth;
            currentBitArrivee++;

            if (x > width - 20) {
                const newPathData = pathData.replace(/([ML])(\d+\.?\d*)/g, (match, command, xVal) => {
                    const newX = parseFloat(xVal) - bitWidth;
                    return command + newX;
                });
                pathData = newPathData;
                x = width - 20;
            }

            setTimeout(drawNextBitArrivee, 200);
        }

        function startAnimationQuandPremiereBouleArrive() {
            if (!animationStarted) {
                animationStarted = true;
                $('#legende').text("Signal reçu et converti en temps réel !");
                setTimeout(drawNextBitArrivee, 3000);
            }
        }

        function envoyerProchainBit() {
            if (currentBitIndex >= bits.length) return;
            
            const bit = bits[currentBitIndex];
            
            // Faire défiler la boîte signal électrique relais 1
            if (existingPathRelais1) {
                const currentPath = existingPathRelais1.getAttribute('d');
                if (currentPath) {
                    const newPathData = currentPath.replace(/([ML])(\d+\.?\d*)/g, (match, command, xVal) => {
                        const newX = parseFloat(xVal) + bitWidth;
                        return command + newX;
                    });
                    existingPathRelais1.setAttribute('d', newPathData);
                }
            }
            
            if (bit === '1') {
    const isFirstBit = (currentBitIndex === 0);
    creerPointLumineux(chemin, cheminLength, startAnimationQuandPremiereBouleArrive, isFirstBit);
} else {
    setTimeout(startAnimationQuandPremiereBouleArrive, 300);
}
            
            currentBitIndex++;
            setTimeout(envoyerProchainBit, bitInterval);
        }
        
        envoyerProchainBit();
    }

    function emettre_signal_relais2() {
        $('#legende').text("Transmission depuis l'antenne relais vers l'antenne réceptrice");
        $("#emettre_signal_relais2_bouton").css("display", "none");
        $("#telephone_recepteur").css("display", "block");      
        $("#antenne_receptrice").css("display", "block");
        $("#portable2").css("display", "block");
        $("#sinusoide_2").css("display", "block");
        $("#signal_electrique_receptrice_svg").css("display", "block");
        
        const allBits = getBits();
// Copier l'état du premier signal vers le deuxième
const firstSignalPath = document.querySelector('#signal_path path');
const secondSignalGroup = document.getElementById('signal_electrique_path');

if (firstSignalPath && secondSignalGroup) {
    // Supprimer l'ancien path s'il existe
    const oldPath = secondSignalGroup.querySelector('path');
    if (oldPath) oldPath.remove();
    
    // Créer un nouveau path identique
    const newPath = firstSignalPath.cloneNode(true);
    secondSignalGroup.appendChild(newPath);
    
    // Afficher la deuxième boîte
    $("#signal_electrique_svg").css("display", "block");
}
        propagateWaveSignal({
            svgId: 'sinusoide_2',
            pathId: 'sineWave_2',
            bits: allBits,
            width: 391,
            propagationSpeed: 5,
            bitDuration: 15,
            direction: 'rightToLeft',
            onComplete: () => {
                $('#legende').text("Signal reçu par l'antenne réceptrice !");
                $("#decoder_bouton").css("display", "block");
            }
        });

        setTimeout(() => {
            $('#legende').text("Signal reçu et converti par l'antenne réceptrice !");
            drawSignalElectrique({
                pathGroupId: 'signal_electrique_receptrice_path',
                bits: allBits,
                speed:150,
                onComplete: () => {}
            });
        }, 700);
    }

    function decoder_signal() {
        $('#legende').text("Décodage du signal en signal électrique");
        $("#decoder_bouton").css("display", "none");
        
        const allBits = getBits();
        
        setTimeout(() => {
            drawSignalElectrique({
                pathGroupId: null,
                bits: allBits,
                speed: 150,
                binaireProgressElementId: 'texte_binaire_decode',
                onComplete: () => {
                    $('#legende').text("Signal électrique reçu ! Conversion en binaire...");
                    $("#traduire_binaire_bouton").css("display", "block");
                }
            });
            
            defilerSignalElectrique({
                pathGroupId: 'signal_electrique_receptrice_path',
                bits: allBits,
                direction: 'left',
                speed: 200
            });
        }, 1000);
    }

    function traduire_binaire() {
        $('#legende').text("Traduction du binaire en message original");
        $("#traduire_binaire_bouton").css("display", "none");
        $("#message_final").css("display", "block");
        
        const allBits = getBits();
        const message = binaryToText(allBits);
        
        const messageFinalP = document.querySelector('#message_final p');
        
        let spanText = '';
        for (let i = 0; i < allBits.length; i += 8) {
            const byte = allBits.substr(i, 8);
            spanText += `<span id="final_group_${Math.floor(i/8)}" class="consolas">${byte}</span>`;
            if (i + 8 < allBits.length) spanText += ' ';
        }
        
        messageFinalP.innerHTML = spanText;
        
        setTimeout(() => {
            animerTraductionBinaireVersTexte(allBits, message);
        }, 1000);
    }

    function animerTraductionBinaireVersTexte(bits, finalMessage) {
        let currentCharIndex = 0;
        
        function transformNextChar() {
            if (currentCharIndex < finalMessage.length) {
                const char = finalMessage[currentCharIndex];
                const groupSpan = document.getElementById(`final_group_${currentCharIndex}`);
                
                if (groupSpan) {
                    groupSpan.classList.add('letter-highlight');
                    
                    setTimeout(() => {
                        groupSpan.textContent = char;
                        groupSpan.classList.remove('letter-highlight', 'consolas');
                        groupSpan.classList.add('bold-text');
                        
                        setTimeout(() => {
                            groupSpan.classList.remove('bold-text');
                        }, 300);
                    }, 500);
                }
                
                currentCharIndex++;
                setTimeout(transformNextChar, 800);
            } else {
                setTimeout(() => {
                    $('#legende').text("Message décodé avec succès ! Communication terminée.");
                }, 1000);
            }
        }
        
        setTimeout(transformNextChar, 500);
    }
});

// ===== TOOLTIPS ET LIENS =====

function createTooltip(element, text, link) {
    if (!element) {
        console.log("Element non trouvé pour le tooltip"); // DEBUG
        return;
    }
    
    const tooltip = document.getElementById('tooltip');
    
    element.classList.add('clickable-element');
    
    element.addEventListener('mouseenter', (e) => {
        tooltip.textContent = text;
        tooltip.style.display = 'block';
        tooltip.style.left = e.pageX + 10 + 'px';
        tooltip.style.top = e.pageY - 30 + 'px';
    });
    
    element.addEventListener('mousemove', (e) => {
        tooltip.style.left = e.pageX + 10 + 'px';
        tooltip.style.top = e.pageY - 30 + 'px';
    });
    
    element.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
    });
    
    element.addEventListener('click', () => {
        window.open(link, '_blank');
    });
}

// Appliquer aux antennes relais et fibre optique (avec vérification)
setTimeout(() => { // Attendre que tous les éléments soient créés
    const antenneRelais1 = document.getElementById('antenne_relai_1');
    const antenneRelais2 = document.getElementById('antenne_relais_2');
    const fibreOptique = document.getElementById('chemin_relais');

    createTooltip(antenneRelais1, 'En apprendre plus sur les antennes relais', 'https://example.com/antennes-relais');
    createTooltip(antenneRelais2, 'En apprendre plus sur les antennes relais', 'https://example.com/antennes-relais');
    createTooltip(fibreOptique, 'En apprendre plus sur la fibre optique', 'https://example.com/antennes-relais');
}, 1000);