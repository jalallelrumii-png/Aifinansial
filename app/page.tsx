"use client";
import { useState, useCallback, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, ComposedChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { DATA as SEED_DATA, KAS as SEED_KAS, pct } from "./lib/data";

const P = {
  bg: "#06090F", surface: "#0C1220", surfaceHigh: "#111B2E",
  border: "#1A2840", cyan: "#22D3EE", green: "#34D399",
  red: "#F87171", amber: "#FBBF24", text: "#E2E8F0",
  sub: "#94A3B8", muted: "#475569",
};

const LS_DATA = "fin_data_v1";
const LS_KAS  = "fin_kas_v1";

function computeRows(raw: { bulan: string; pendapatan: number; beban: number }[]) {
  return raw.map(d => ({
    ...d,
    laba: d.pendapatan - d.beban,
    gpm: parseFloat(((d.pendapatan - d.beban) / d.pendapatan * 100).toFixed(1)),
    anomali: d.beban > d.pendapatan * 0.9,
  }));
}

const CTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: P.surfaceHigh, border: `1px solid ${P.border}`, borderRadius: 8, padding: "10px 14px" }}>
      <div style={{ fontSize: 11, color: P.muted, fontWeight: 700, marginBottom: 6 }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ fontSize: 12, color: p.color, marginBottom: 2 }}>
          {p.name}: <span style={{ fontFamily: "monospace", fontWeight: 700 }}>Rp {p.value} Jt</span>
        </div>
      ))}
    </div>
  );
};

const KCard = ({ label, value, unit, d, accent = P.cyan, alert, sub }: any) => {
  const dNum = parseFloat(d);
  return (
    <div style={{
      background: P.surface, border: `1px solid ${alert ? P.amber + "88" : P.border}`,
      borderRadius: 12, padding: "14px 16px", position: "relative", overflow: "hidden",
    }}>
      {alert && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: P.amber }} />}
      <div style={{ fontSize: 10, color: P.muted, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: "monospace", fontSize: 20, fontWeight: 700, color: accent, lineHeight: 1 }}>
        {value}{unit && <span style={{ fontSize: 12, color: P.sub, marginLeft: 3 }}>{unit}</span>}
      </div>
      {d !== undefined && (
        <div style={{ fontSize: 11, color: dNum >= 0 ? P.green : P.red, marginTop: 5 }}>
          {dNum >= 0 ? "▲" : "▼"} {Math.abs(dNum)}% vs bln lalu
        </div>
      )}
      {sub && <div style={{ fontSize: 11, color: P.muted, marginTop: 4 }}>{sub}</div>}
    </div>
  );
};

const SecTitle = ({ icon, children }: any) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
    <span style={{ fontSize: 14 }}>{icon}</span>
    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: P.muted, textTransform: "uppercase" }}>{children}</span>
    <div style={{ flex: 1, height: "0.5px", background: P.border }} />
  </div>
);

function Dashboard({ data, kas }: any) {
  if (!data.length) return (
    <div style={{ padding: 32, textAlign: "center", color: P.muted, fontSize: 13 }}>
      Belum ada data. Tambah data di tab <strong style={{ color: P.cyan }}>📝 Input</strong>.
    </div>
  );
  const LATEST = data[data.length - 1];
  const PREV   = data[data.length - 2] ?? LATEST;
  const RUNWAY  = Math.floor(kas / LATEST.beban);
  const ANOMALIES = data.filter((d: any) => d.anomali);
  const BULAN = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];

  return (
    <div style={{ padding: 16 }}>
      <SecTitle icon="📊">Ringkasan — {LATEST.bulan}</SecTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
        <KCard label="Pendapatan" value={LATEST.pendapatan} unit="Jt" d={pct(LATEST.pendapatan, PREV.pendapatan)} accent={P.cyan} />
        <KCard label="Laba Bersih" value={LATEST.laba} unit="Jt" d={pct(LATEST.laba, PREV.laba)} accent={LATEST.laba > 0 ? P.green : P.red} />
        <KCard label="Gross Margin" value={`${LATEST.gpm}%`} accent={LATEST.gpm > 20 ? P.green : P.amber} />
        <KCard label="Burn Rate" value={LATEST.beban} unit="Jt/bln" accent={P.amber} />
        <KCard label="Kas Tersedia" value={kas.toLocaleString("id")} unit="Jt" accent={P.cyan} />
        <KCard label="Runway" value={RUNWAY} unit="bulan"
          accent={RUNWAY > 6 ? P.green : P.red} alert={RUNWAY <= 6}
          sub={`Aman s/d ${BULAN[(new Date().getMonth() + RUNWAY) % 12]}`} />
      </div>

      <SecTitle icon="📈">Tren Pendapatan vs Beban</SecTitle>
      <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12, padding: "16px 4px 8px", marginBottom: 20 }}>
        <ResponsiveContainer width="100%" height={190}>
          <AreaChart data={data} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={P.cyan} stopOpacity={0.35} /><stop offset="95%" stopColor={P.cyan} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={P.red} stopOpacity={0.3} /><stop offset="95%" stopColor={P.red} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={P.border} strokeDasharray="3 3" />
            <XAxis dataKey="bulan" tick={{ fill: P.muted, fontSize: 9 }} />
            <YAxis tick={{ fill: P.muted, fontSize: 9 }} />
            <Tooltip content={<CTip />} />
            <Area type="monotone" dataKey="pendapatan" name="Pendapatan" stroke={P.cyan} fill="url(#gP)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="beban" name="Beban" stroke={P.red} fill="url(#gE)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 4 }}>
          {[{ c: P.cyan, l: "Pendapatan" }, { c: P.red, l: "Beban" }].map(x => (
            <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: P.sub }}>
              <div style={{ width: 20, height: 2, background: x.c, borderRadius: 1 }} />{x.l}
            </div>
          ))}
        </div>
      </div>

      <SecTitle icon="💰">Laba Bersih per Bulan</SecTitle>
      <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12, padding: "16px 4px 8px", marginBottom: 20 }}>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
            <CartesianGrid stroke={P.border} strokeDasharray="3 3" />
            <XAxis dataKey="bulan" tick={{ fill: P.muted, fontSize: 9 }} />
            <YAxis tick={{ fill: P.muted, fontSize: 9 }} />
            <Tooltip content={<CTip />} />
            <Bar dataKey="laba" name="Laba Bersih" radius={[4, 4, 0, 0]}>
              {data.map((_: any, i: number) => <Cell key={i} fill={data[i].laba >= 0 ? P.green : P.red} fillOpacity={0.85} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {ANOMALIES.length > 0 && (
        <>
          <SecTitle icon="⚠️">Deteksi Anomali</SecTitle>
          {ANOMALIES.map((d: any, i: number) => (
            <div key={i} style={{
              background: `${P.amber}12`, border: `1px solid ${P.amber}40`,
              borderRadius: 10, padding: "12px 14px", marginBottom: 8,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: P.amber }}>{d.bulan}</div>
                <div style={{ fontSize: 11, color: P.sub, marginTop: 2 }}>
                  Beban = {((d.beban / d.pendapatan) * 100).toFixed(0)}% dari pendapatan
                </div>
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 12, color: d.laba >= 0 ? P.green : P.red, fontWeight: 700 }}>
                Laba Rp {d.laba}Jt
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function InputData({ rawData, setRawData, kas, setKas }: any) {
  const empty = { bulan: "", pendapatan: "", beban: "" };
  const [form, setForm] = useState(empty);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [kasDraft, setKasDraft] = useState(String(kas));
  const [kasSaved, setKasSaved] = useState(false);
  const [err, setErr] = useState("");

  const validate = () => {
    if (!form.bulan.trim()) return "Nama bulan wajib diisi.";
    if (!form.pendapatan || isNaN(Number(form.pendapatan)) || Number(form.pendapatan) <= 0) return "Pendapatan harus angka > 0.";
    if (!form.beban || isNaN(Number(form.beban)) || Number(form.beban) <= 0) return "Beban harus angka > 0.";
    if (editIdx === null && rawData.find((d: any) => d.bulan === form.bulan.trim())) return `Bulan "${form.bulan}" sudah ada.`;
    return "";
  };

  const submit = () => {
    const e = validate(); if (e) { setErr(e); return; }
    setErr("");
    const row = { bulan: form.bulan.trim(), pendapatan: Number(form.pendapatan), beban: Number(form.beban) };
    if (editIdx !== null) {
      const next = [...rawData]; next[editIdx] = row; setRawData(next); setEditIdx(null);
    } else {
      setRawData([...rawData, row]);
    }
    setForm(empty);
  };

  const del = (i: number) => { setRawData(rawData.filter((_: any, idx: number) => idx !== i)); };
  const edit = (i: number) => {
    const d = rawData[i];
    setForm({ bulan: d.bulan, pendapatan: String(d.pendapatan), beban: String(d.beban) });
    setEditIdx(i); setErr("");
  };

  const saveKas = () => {
    const v = Number(kasDraft);
    if (!isNaN(v) && v >= 0) { setKas(v); setKasSaved(true); setTimeout(() => setKasSaved(false), 2000); }
  };

  const loadSeed = () => {
    setRawData(SEED_DATA.map((d: any) => ({ bulan: d.bulan, pendapatan: d.pendapatan, beban: d.beban })));
    setKas(SEED_KAS); setKasDraft(String(SEED_KAS));
  };

  const inp = (field: string, val: string) => setForm(f => ({ ...f, [field]: val }));

  const inputStyle = {
    width: "100%", background: P.bg, border: `1px solid ${P.border}`,
    borderRadius: 8, padding: "10px 12px", color: P.text,
    fontSize: 13, fontFamily: "inherit", outline: "none",
  };

  return (
    <div style={{ padding: 16 }}>
      <SecTitle icon="➕">Tambah / Edit Data Bulanan</SecTitle>
      <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12, padding: "16px", marginBottom: 16 }}>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: P.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Nama Bulan</div>
          <input value={form.bulan} onChange={e => inp("bulan", e.target.value)}
            placeholder="contoh: Apr'25" style={inputStyle} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: P.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Pendapatan (Jt)</div>
            <input type="number" value={form.pendapatan} onChange={e => inp("pendapatan", e.target.value)}
              placeholder="335" style={inputStyle} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: P.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Beban (Jt)</div>
            <input type="number" value={form.beban} onChange={e => inp("beban", e.target.value)}
              placeholder="285" style={inputStyle} />
          </div>
        </div>
        {err && <div style={{ fontSize: 12, color: P.red, marginBottom: 10 }}>⚠ {err}</div>}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={submit} style={{
            flex: 1, background: editIdx !== null ? P.amber : P.cyan, color: P.bg,
            border: "none", borderRadius: 8, padding: "11px", fontSize: 13,
            fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          }}>{editIdx !== null ? "✏️ Update Data" : "➕ Tambah Bulan"}</button>
          {editIdx !== null && (
            <button onClick={() => { setEditIdx(null); setForm(empty); setErr(""); }} style={{
              background: "none", border: `1px solid ${P.border}`, borderRadius: 8,
              padding: "11px 14px", fontSize: 12, color: P.muted, cursor: "pointer", fontFamily: "inherit",
            }}>Batal</button>
          )}
        </div>
      </div>

      <SecTitle icon="💰">Kas Perusahaan (Jt)</SecTitle>
      <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12, padding: "16px", marginBottom: 16, display: "flex", gap: 8 }}>
        <input type="number" value={kasDraft} onChange={e => setKasDraft(e.target.value)}
          placeholder="1290" style={{ ...inputStyle, flex: 1 }} />
        <button onClick={saveKas} style={{
          background: kasSaved ? P.green : P.surfaceHigh, color: kasSaved ? P.bg : P.text,
          border: `1px solid ${P.border}`, borderRadius: 8, padding: "10px 16px",
          fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
        }}>{kasSaved ? "✓ Saved" : "Simpan"}</button>
      </div>

      <SecTitle icon="📋">Data Tersimpan ({rawData.length} bulan)</SecTitle>
      {rawData.length === 0 ? (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <div style={{ fontSize: 12, color: P.muted, marginBottom: 14 }}>Belum ada data. Tambah manual atau muat data contoh.</div>
          <button onClick={loadSeed} style={{
            background: P.surfaceHigh, border: `1px solid ${P.border}`, borderRadius: 8,
            padding: "10px 20px", fontSize: 12, color: P.sub, cursor: "pointer", fontFamily: "inherit",
          }}>📥 Muat Data Contoh (9 Bulan)</button>
        </div>
      ) : (
        <>
          <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 60px", padding: "9px 12px", background: P.surfaceHigh, fontSize: 10, color: P.muted, fontWeight: 700, textTransform: "uppercase" }}>
              <div>Bulan</div><div>Pendapatan</div><div>Beban</div><div>Laba</div><div></div>
            </div>
            {rawData.map((d: any, i: number) => {
              const laba = d.pendapatan - d.beban;
              return (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 60px", padding: "10px 12px", borderTop: `1px solid ${P.border}`, fontSize: 12, alignItems: "center" }}>
                  <div style={{ color: d.beban > d.pendapatan * 0.9 ? P.amber : P.text, fontWeight: 700 }}>{d.bulan}</div>
                  <div style={{ fontFamily: "monospace", color: P.cyan }}>{d.pendapatan}</div>
                  <div style={{ fontFamily: "monospace", color: P.red }}>{d.beban}</div>
                  <div style={{ fontFamily: "monospace", color: laba >= 0 ? P.green : P.red, fontWeight: 700 }}>{laba >= 0 ? "+" : ""}{laba}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => edit(i)} style={{ background: "none", border: "none", color: P.amber, cursor: "pointer", fontSize: 14, padding: 0 }}>✏️</button>
                    <button onClick={() => del(i)} style={{ background: "none", border: "none", color: P.red, cursor: "pointer", fontSize: 14, padding: 0 }}>🗑</button>
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={loadSeed} style={{
            width: "100%", background: "none", border: `1px solid ${P.border}`, borderRadius: 8,
            padding: "10px", fontSize: 11, color: P.muted, cursor: "pointer", fontFamily: "inherit",
          }}>↺ Reset ke Data Contoh</button>
        </>
      )}
    </div>
  );
}

function AnalisisAI({ data, kas, aiText, aiLoading, callAI, hasKey }: any) {
  return (
    <div style={{ padding: 16 }}>
      <SecTitle icon="🤖">Executive Summary AI</SecTitle>
      {!hasKey && (
        <div style={{ background: `${P.amber}12`, border: `1px solid ${P.amber}44`, borderRadius: 10, padding: "12px 14px", marginBottom: 14, fontSize: 12, color: P.amber }}>
          ⚠️ Groq API Key belum diset. Masuk tab <strong>⚙️ Setting</strong>.
        </div>
      )}
      {data.length < 2 && (
        <div style={{ background: `${P.cyan}10`, border: `1px solid ${P.cyan}30`, borderRadius: 10, padding: "12px 14px", marginBottom: 14, fontSize: 12, color: P.sub }}>
          ℹ️ Tambah minimal 2 bulan data di tab <strong style={{ color: P.cyan }}>📝 Input</strong> untuk analisis optimal.
        </div>
      )}
      <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: P.sub, lineHeight: 1.7, marginBottom: 18, textAlign: "center" }}>
          AI menganalisis {data.length} bulan data keuangan Anda → ringkasan eksekutif, risiko, rekomendasi aksi.
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button onClick={callAI} disabled={aiLoading || !hasKey || data.length < 1} style={{
            background: (!hasKey || aiLoading || data.length < 1) ? P.border : P.cyan,
            color: (!hasKey || aiLoading || data.length < 1) ? P.muted : P.bg,
            border: "none", borderRadius: 8, padding: "11px 28px",
            fontSize: 13, fontWeight: 700, cursor: (!hasKey || aiLoading || data.length < 1) ? "not-allowed" : "pointer",
            fontFamily: "inherit",
          }}>
            {aiLoading ? "⏳ Menganalisis..." : !hasKey ? "🔒 API Key Diperlukan" : "⚡ Generate Analisis AI"}
          </button>
        </div>
      </div>

      {aiLoading && (
        <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12, padding: 28, textAlign: "center" }}>
          <div style={{ fontSize: 13, color: P.muted }}>AI sedang membaca data keuangan Anda...</div>
          <div style={{ marginTop: 12, display: "flex", gap: 6, justifyContent: "center" }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: P.cyan, animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite` }} />)}
          </div>
        </div>
      )}

      {aiText && !aiLoading && (
        <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12, padding: "20px 18px" }}>
          <div style={{ fontSize: 11, color: P.muted, letterSpacing: "0.08em", marginBottom: 14, textTransform: "uppercase", fontWeight: 700 }}>● Hasil Analisis CFO AI</div>
          <div style={{ fontSize: 13, lineHeight: 1.85, color: P.text, whiteSpace: "pre-wrap" }}>{aiText}</div>
        </div>
      )}
    </div>
  );
}

function Proyeksi({ data }: any) {
  const [mode, setMode] = useState("base");
  if (data.length < 3) return (
    <div style={{ padding: 32, textAlign: "center", color: P.muted, fontSize: 13 }}>
      Butuh minimal 3 bulan data untuk proyeksi.<br />
      <span style={{ color: P.cyan }}>Tambah data di tab 📝 Input.</span>
    </div>
  );

  const LATEST = data[data.length - 1];
  const last3p = data.slice(-3).map((d: any) => d.pendapatan);
  const last3e = data.slice(-3).map((d: any) => d.beban);
  const trendP = (last3p[2] - last3p[0]) / 2;
  const trendE = (last3e[2] - last3e[0]) / 2;
  const FCAST = ["Bln+1","Bln+2","Bln+3"].map((bulan, i) => {
    const p = Math.round(LATEST.pendapatan + trendP * (i + 1));
    const e = Math.round(LATEST.beban + trendE * (i + 1));
    return { bulan, pendapatan: p, beban: e, laba: p - e, type: "proyeksi" };
  });

  const mult = mode === "optimis" ? 1.18 : mode === "pesimis" ? 0.82 : 1.0;
  const adj = FCAST.map(f => ({ ...f, pendapatan: Math.round(f.pendapatan * mult), laba: Math.round(f.laba * mult) }));
  const chartData = [...data.slice(-4).map((d: any) => ({ ...d, type: "aktual" })), ...adj];

  return (
    <div style={{ padding: 16 }}>
      <SecTitle icon="🔮">Proyeksi 3 Bulan</SecTitle>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[["base","📊 Base"],["optimis","🚀 +18%"],["pesimis","📉 −18%"]].map(([k, l]) => (
          <button key={k} onClick={() => setMode(k)} style={{
            flex: 1, padding: "8px 4px", borderRadius: 8, fontSize: 10, fontWeight: 700,
            border: `1px solid ${mode === k ? P.cyan : P.border}`,
            background: mode === k ? `${P.cyan}18` : P.surface,
            color: mode === k ? P.cyan : P.muted, cursor: "pointer", fontFamily: "inherit",
          }}>{l}</button>
        ))}
      </div>
      <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12, padding: "16px 4px 8px", marginBottom: 20 }}>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="gFP" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={P.cyan} stopOpacity={0.3} /><stop offset="95%" stopColor={P.cyan} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={P.border} strokeDasharray="3 3" />
            <XAxis dataKey="bulan" tick={{ fill: P.muted, fontSize: 9 }} />
            <YAxis tick={{ fill: P.muted, fontSize: 9 }} />
            <Tooltip content={<CTip />} />
            <Area type="monotone" dataKey="pendapatan" name="Pendapatan" stroke={P.cyan} fill="url(#gFP)" strokeWidth={2} dot={false} />
            <Bar dataKey="laba" name="Laba" radius={[3,3,0,0]}>
              {chartData.map((d: any, i: number) => <Cell key={i} fill={d.laba >= 0 ? P.green : P.red} fillOpacity={d.type === "proyeksi" ? 0.5 : 0.85} />)}
            </Bar>
            <Line type="monotone" dataKey="beban" name="Beban" stroke={P.red} strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", padding: "10px 14px", background: P.surfaceHigh, fontSize: 10, color: P.muted, fontWeight: 700, textTransform: "uppercase" }}>
          <div>Bulan</div><div>Pendapatan</div><div>Beban</div><div>Laba Est.</div>
        </div>
        {adj.map((f, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", padding: "11px 14px", borderTop: `1px solid ${P.border}`, fontSize: 12 }}>
            <div style={{ color: P.amber, fontWeight: 700 }}>{f.bulan}</div>
            <div style={{ fontFamily: "monospace", color: P.cyan }}>{f.pendapatan}Jt</div>
            <div style={{ fontFamily: "monospace", color: P.red }}>{f.beban}Jt</div>
            <div style={{ fontFamily: "monospace", color: f.laba >= 0 ? P.green : P.red, fontWeight: 700 }}>{f.laba}Jt</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Setting({ groqKey, setGroqKey }: any) {
  const [draft, setDraft] = useState(groqKey);
  const [saved, setSaved] = useState(false);
  const save = () => { setGroqKey(draft.trim()); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return (
    <div style={{ padding: 16 }}>
      <SecTitle icon="⚙️">Konfigurasi API</SecTitle>
      <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12, padding: "18px 16px", marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: P.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Groq API Key</div>
        <input type="password" value={draft} onChange={e => setDraft(e.target.value)}
          placeholder="gsk_xxxxxxxxxxxxxxxxxxxx"
          style={{ width: "100%", background: P.bg, border: `1px solid ${P.border}`, borderRadius: 8, padding: "10px 12px", color: P.text, fontSize: 13, fontFamily: "monospace", outline: "none", marginBottom: 12 }}
        />
        <div style={{ fontSize: 11, color: P.muted, marginBottom: 14, lineHeight: 1.6 }}>
          Daftar gratis di <span style={{ color: P.cyan }}>console.groq.com</span> → Create API Key.
        </div>
        <button onClick={save} style={{
          width: "100%", background: saved ? P.green : P.cyan, color: P.bg,
          border: "none", borderRadius: 8, padding: 11, fontSize: 13,
          fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
        }}>{saved ? "✓ Tersimpan!" : "Simpan API Key"}</button>
      </div>
      <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 11, color: P.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Model AI Aktif</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: groqKey ? P.green : P.muted }} />
          <div>
            <div style={{ fontSize: 13, color: P.text, fontWeight: 700 }}>llama-3.3-70b-versatile</div>
            <div style={{ fontSize: 11, color: P.muted }}>Groq Cloud · Free tier · ~200 token/s</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const [tab, setTab]         = useState("dashboard");
  const [aiText, setAiText]   = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [groqKey, setGroqKey] = useState("");

  // Data state — load dari localStorage
  const [rawData, setRawDataState] = useState<{ bulan: string; pendapatan: number; beban: number }[]>([]);
  const [kas, setKasState]         = useState(SEED_KAS);
  const [hydrated, setHydrated]    = useState(false);

  // Hydrate dari localStorage setelah mount (avoid SSR mismatch)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_DATA);
      const savedKas = localStorage.getItem(LS_KAS);
      if (saved) setRawDataState(JSON.parse(saved));
      if (savedKas) setKasState(Number(savedKas));
    } catch {}
    setHydrated(true);
  }, []);

  const setRawData = (next: any[]) => {
    setRawDataState(next);
    try { localStorage.setItem(LS_DATA, JSON.stringify(next)); } catch {}
  };

  const setKas = (v: number) => {
    setKasState(v);
    try { localStorage.setItem(LS_KAS, String(v)); } catch {}
  };

  const data = computeRows(rawData);

  const callAI = useCallback(async () => {
    if (!data.length) return;
    setAiLoading(true); setAiText("");
    const LATEST = data[data.length - 1];
    const RUNWAY  = Math.floor(kas / LATEST.beban);
    const ANOMALIES = data.filter(d => d.anomali);
    try {
      const prompt = `Kamu adalah CFO AI untuk perusahaan menengah Indonesia. Berikan executive summary keuangan dalam Bahasa Indonesia yang tajam dan actionable.

DATA KEUANGAN ${data.length} BULAN:
${data.map(d => `${d.bulan}: Pendapatan Rp${d.pendapatan}Jt | Beban Rp${d.beban}Jt | Laba Rp${d.laba}Jt | GPM ${d.gpm}%`).join("\n")}

METRIK KRITIS:
- Burn Rate: Rp${LATEST.beban}Jt/bulan | Runway: ${RUNWAY} bulan | Kas: Rp${kas}Jt
- Anomali: ${ANOMALIES.map(a => a.bulan).join(", ") || "Tidak ada"}
- GPM max: ${Math.max(...data.map(d => d.gpm))}% | GPM min: ${Math.min(...data.map(d => d.gpm))}%

Format response (emoji, bahasa eksekutif, tegas):

🏦 KONDISI BISNIS
[2-3 kalimat kondisi finansial saat ini]

⚠️ RISIKO UTAMA
• [Risiko 1 dengan angka spesifik]
• [Risiko 2 dengan angka spesifik]
• [Risiko 3 dengan angka spesifik]

✅ REKOMENDASI AKSI
• [Aksi 1 — target angka]
• [Aksi 2 — target angka]
• [Aksi 3 — timeline]

📈 OUTLOOK 3 BULAN
[2 kalimat proyeksi berdasarkan tren data]`;

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, clientKey: groqKey }),
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      setAiText(result.text);
    } catch (err: any) {
      setAiText(`❌ Error: ${err.message || "Koneksi ke Groq gagal."}`);
    }
    setAiLoading(false);
  }, [data, kas, groqKey]);

  const tabs = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "input",     icon: "📝", label: "Input" },
    { id: "analisis",  icon: "🤖", label: "AI" },
    { id: "proyeksi",  icon: "🔮", label: "Proyeksi" },
    { id: "setting",   icon: "⚙️", label: "Setting" },
  ];

  if (!hydrated) return <div style={{ background: P.bg, minHeight: "100dvh" }} />;

  return (
    <div style={{ background: P.bg, minHeight: "100dvh", color: P.text, paddingBottom: 72 }}>
      <style>{`@keyframes pulse{0%,80%,100%{opacity:.2}40%{opacity:1}}`}</style>

      <div style={{
        background: P.surface, borderBottom: `1px solid ${P.border}`,
        padding: "14px 16px 12px", position: "sticky", top: 0, zIndex: 100,
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" as any,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, color: P.muted, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700 }}>Logika Financial AI</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: P.text, marginTop: 1 }}>Laporan Keuangan</div>
          </div>
          <div style={{
            background: groqKey ? `${P.green}20` : `${P.amber}20`,
            border: `1px solid ${groqKey ? P.green : P.amber}44`,
            borderRadius: 20, padding: "3px 9px", fontSize: 10,
            color: groqKey ? P.green : P.amber, fontWeight: 700,
          }}>{groqKey ? "● AI AKTIF" : "● SET API KEY"}</div>
        </div>
      </div>

      {tab === "dashboard" && <Dashboard data={data} kas={kas} />}
      {tab === "input"     && <InputData rawData={rawData} setRawData={setRawData} kas={kas} setKas={setKas} />}
      {tab === "analisis"  && <AnalisisAI data={data} kas={kas} aiText={aiText} aiLoading={aiLoading} callAI={callAI} hasKey={!!groqKey} />}
      {tab === "proyeksi"  && <Proyeksi data={data} />}
      {tab === "setting"   && <Setting groqKey={groqKey} setGroqKey={setGroqKey} />}

      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: P.surface, borderTop: `1px solid ${P.border}`,
        display: "flex", zIndex: 9999,
        paddingBottom: "env(safe-area-inset-bottom)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" as any,
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: "10px 0 8px", background: "none", border: "none",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            color: tab === t.id ? P.cyan : P.muted, cursor: "pointer", fontFamily: "inherit",
            borderTop: tab === t.id ? `2px solid ${P.cyan}` : "2px solid transparent",
          }}>
            <span style={{ fontSize: 15 }}>{t.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
