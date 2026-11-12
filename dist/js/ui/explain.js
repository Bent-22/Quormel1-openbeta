// QUORMEL 1 – Erklärtexte zu Parametern und Kennzahlen, „So lernt das Auto“.
import {$} from "./dom.js";

export const EX={pa:"Die Lernrate (α) bestimmt, wie stark eine neue Erfahrung den alten Q-Wert überschreibt. Bei 0,01 lernt das Auto sehr langsam, aber stabil. Bei 1,0 zählt nur die neueste Erfahrung, das Lernen wird sprunghaft. Typisch sind Werte zwischen 0,1 und 0,3.",
pg:"Der Discount-Faktor (γ) legt fest, wie wichtig zukünftige Belohnungen sind. Bei 0 denkt das Auto nur an den nächsten Schritt. Bei 0,95 plant es weit voraus, zum Beispiel früh in eine Kurve zu lenken, um später das Ziel zu erreichen.",
pe:"Die Explorationsrate (ε) ist die Wahrscheinlichkeit, dass das Auto eine zufällige Aktion ausprobiert, statt die beste bekannte zu wählen. 1,00 bedeutet: am Anfang nur Ausprobieren. Ohne Exploration entdeckt das Auto keine besseren Wege.",
pd:"Nach jeder Episode wird ε mit diesem Faktor multipliziert. Bei 0,995 sinkt ε langsam, das Auto probiert lange aus. Bei 0,90 sinkt es schnell, das Auto verlässt sich früh auf sein Wissen. ε fällt nie unter 0,05.",
pn:"Eine Episode ist eine Fahrt vom Start bis zum Ziel oder bis zum Fehler. Mehr Episoden bedeuten mehr Erfahrung, aber auch längeres Training. Schwere Strecken brauchen meist deutlich mehr Episoden.",
ps:"Schritte pro Bild bestimmt, wie viele Simulationsschritte pro Bildschirm-Update berechnet werden. Das ändert nur das Tempo der Anzeige, nicht die Rechnung oder das Lernergebnis.",
rg:"Belohnung, wenn das Ziel erreicht wird. Je höher, desto stärker wird jeder Weg zum Ziel bevorzugt.",
rc:"Strafe, wenn das Auto die Straße verlässt. Eine hohe Strafe lehrt das Auto, Fehler zu vermeiden. Ist sie zu klein, riskiert es mehr.",
rp:"Belohnung für jeden Streckenpunkt Fortschritt Richtung Ziel. Sie sorgt dafür, dass das Auto nicht einfach stehen bleibt. Der Fortschritt wird nur für die Belohnung gemessen, nicht als Lenkhilfe.",
ri:"Strafe für Schritte ohne Fortschritt. Sie verhindert, dass das Auto auf der Stelle oder rückwärts fährt. Gibt es 1500 Schritte lang keinen neuen Fortschritt, endet die Fahrt mit derselben Strafe wie beim Verlassen der Straße.",
rd:"Kleine Strafe für Abstand zur Straßenmitte. Zu hohe Werte lassen das Auto ängstlich in der Mitte kleben, zu niedrige lassen es zum Rand driften."};
export const mk=(t,ar)=>{const d=document.createElement("details");d.className="ex"+(ar?" ar":"");d.innerHTML="<summary>"+(ar?"▸":"Erklärung")+"</summary><div></div>";d.lastChild.textContent=t;if(ar)d.ontoggle=()=>d.firstChild.textContent=d.open?"▾":"▸";return d};

// Initialisierung (Teil 1 von 2) – wird von main.js in der Reihenfolge der Originaldatei aufgerufen
export function init(){
$("code").innerHTML='<b>So lernt das Auto die Strecke</b><ol style="line-height:1.55;padding-left:20px"><li><b>Sehen:</b> Fünf Sensoren messen den Abstand zum Straßenrand. Dazu kommt die Richtung zum Ziel. Das ergibt einen <i>Zustand</i>.</li><li><b>Entscheiden:</b> Die Q-Tabelle hat pro Zustand fünf Zahlen, eine für jede Lenkaktion. Meist wählt das Auto die höchste Zahl. Mit der Wahrscheinlichkeit ε probiert es zufällig etwas aus (Exploration).</li><li><b>Fahren:</b> Das Auto lenkt und bewegt sich einen Schritt weiter.</li><li><b>Belohnung:</b> Fortschritt Richtung Ziel gibt Pluspunkte, die Straße zu verlassen gibt Minuspunkte, das Ziel gibt viele Pluspunkte.</li><li><b>Lernen:</b> Die gewählte Zahl wird angepasst: neu = alt + α · (Reward + γ · bester Wert im Folgezustand − alt).</li><li><b>Wiederholen:</b> Nach einem Fehler startet das Auto neu. ε sinkt, das Auto probiert weniger und nutzt mehr Erfahrung.</li></ol><small>Das Auto bekommt keine Fahrlinie und keine Ideallinie – nur Sensoren, Belohnungen und seine Q-Tabelle.</small> <button data-click="closeExplain">Schließen</button>';
$("bCode").onclick=()=>{const c=$("code");c.style.display=c.style.display==="block"?"none":"block"};
}

// Initialisierung (Teil 2 von 2) – wird von main.js in der Reihenfolge der Originaldatei aufgerufen
export function init2(){
Object.keys(EX).forEach(id=>{const l=$(id).parentNode;l.insertBefore(mk(EX[id],1),l.childNodes[1])});
$("kp").after(mk("Episode: eine Fahrt. Erfolgreich: Ziel erreicht. Fehlgeschlagen: Straße verlassen oder Zeitlimit. Erfolgsquote: Anteil erfolgreicher Fahrten insgesamt, „Letzte 100“ nur die letzten 100. ε: aktuelle Zufalls-Wahrscheinlichkeit. Bester Fortschritt: weitester erreichter Punkt der Strecke. Ø Reward: durchschnittliche Punkte pro Episode. Ø Fahrtdauer: Simulationsschritte pro Episode."));
}
