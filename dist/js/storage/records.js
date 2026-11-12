// QUORMEL 1 – Persönliche Bestzeiten pro Strecken-ID (localStorage "q1pb2|…", ältere "q1pb|…").
import {app} from "../state.js";
import {PRE,cat,rs,trackHash,trackSamp} from "../core/track.js";

// F5: persönliche Bestzeiten pro Strecken-ID; alte namensbasierte Rekorde bleiben erhalten (nur Vorlagen werden eindeutig übernommen)
export const presetIds=()=>app.PREID||(app.PREID=Object.fromEntries(PRE.map(t=>[t.n,trackHash(rs(rs(cat(t.c),5),5),t.w)])));
export const pbKey=()=>"q1pb2|"+app.T.id;
export function pbGet(){let v=localStorage.getItem(pbKey());if(v===null&&presetIds()[app.T.name]===app.T.id){const o=localStorage.getItem("q1pb|"+app.T.name);if(o!==null&&Number.isFinite(+o)){localStorage.setItem(pbKey(),o);v=o}}return v!==null&&Number.isFinite(+v)?+v:null}
export function matchPreset(){const a=trackSamp(app.T.p).o;for(const t of PRE){if(Math.round(t.w)!==Math.round(app.T.w))continue;const b=trackSamp(rs(rs(cat(t.c),5),5)).o;if(a.every((q,i)=>Math.hypot(q[0]-b[i][0],q[1]-b[i][1])<8))return presetIds()[t.n]}return null} // F5: alte Speicherstände ohne ID – Vorlage tolerant erkennen
export function pbLegacy(){if(presetIds()[app.T.name]===app.T.id)return null;const o=localStorage.getItem("q1pb|"+app.T.name);return o!==null&&Number.isFinite(+o)?+o:null}
