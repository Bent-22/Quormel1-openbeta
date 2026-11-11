// QUORMEL 1 – Zufallszahlen: Ganzzahl-Helfer und Seed-Generator (Mulberry32) für das Duell.

export const rnd=n=>Math.floor(Math.random()*n);
export const mul=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
