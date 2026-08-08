"use client";

import { CheckCircle2, LoaderCircle, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";

type ResumeOption = { id: string; title: string; version: number; uploadStatus: "LEGACY" | "READY" };
type Scalar = { path: string; label: string; existing: string | number | null; imported: string | number; state: "EMPTY" | "CONFLICT" | "SAME"; selected: boolean };
type ImportData = Record<string, unknown> & { personal: Record<string, unknown>; experience: Record<string, unknown>[]; education: Record<string, unknown>[]; skills: Record<string, unknown>[]; languages: Record<string, unknown>[]; projects: Record<string, unknown>[] };
type Plan = { scalars: Scalar[]; emailComparison: { existing: string; imported: string | null }; duplicates: Record<CollectionKey, boolean[]> };
type CollectionKey = "experience" | "education" | "skills" | "languages" | "projects";
const groups: Array<[CollectionKey, string]> = [["experience", "Experience"], ["education", "Education"], ["skills", "Skills"], ["languages", "Languages"], ["projects", "Projects"]];

function display(value: unknown) { return value === null || value === undefined || value === "" ? "Not provided" : String(value); }
const enumOptions: Record<string, string[]> = {
  employmentType: ["FULL_TIME", "PART_TIME", "CONTRACT", "FREELANCE", "INTERNSHIP", "TEMPORARY", "APPRENTICESHIP", "SELF_EMPLOYED"],
  educationLevel: ["MATRIC", "INTERMEDIATE", "DIPLOMA", "BACHELOR", "MASTER", "MPHIL", "PHD"],
  proficiency: ["BASIC", "CONVERSATIONAL", "PROFESSIONAL", "FLUENT", "NATIVE"],
};

function CollectionField({ field, value, onChange }: { field: string; value: unknown; onChange: (value: unknown) => void }) {
  const label = field.replace(/([A-Z])/g, " $1");
  if (enumOptions[field]) return <label className="text-xs font-semibold capitalize text-slate-600">{label}<select value={typeof value === "string" ? value : ""} onChange={(event) => onChange(event.target.value || null)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900"><option value="">Needs review</option>{enumOptions[field].map((option) => <option key={option} value={option}>{option.replaceAll("_", " ").toLowerCase()}</option>)}</select></label>;
  if (typeof value === "boolean" || field === "isNative" || field.startsWith("currently")) return <label className="text-xs font-semibold capitalize text-slate-600">{label}<select value={value === null ? "" : String(value)} onChange={(event) => onChange(event.target.value === "" ? null : event.target.value === "true")} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900"><option value="">Needs review</option><option value="true">Yes</option><option value="false">No</option></select></label>;
  const numeric = field === "startYear" || field === "endYear" || field === "years";
  return <label className="text-xs font-semibold capitalize text-slate-600">{label}<input type={field.endsWith("Date") ? "date" : numeric ? "number" : "text"} value={Array.isArray(value) ? value.join(", ") : value === null ? "" : String(value)} onChange={(event) => onChange(Array.isArray(value) ? event.target.value.split(",").map((entry) => entry.trim()).filter(Boolean) : numeric ? event.target.value === "" ? null : Number(event.target.value) : event.target.value || null)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900" /></label>;
}

export default function ResumeImportReview({ resumes, onImported }: { resumes: ResumeOption[]; onImported: () => Promise<void> }) {
  const managed = resumes.filter((resume) => resume.uploadStatus === "READY");
  const [resumeId, setResumeId] = useState(""); const [stage, setStage] = useState<"select" | "processing" | "review" | "result">("select");
  const [parseId, setParseId] = useState(""); const [data, setData] = useState<ImportData | null>(null); const [plan, setPlan] = useState<Plan | null>(null);
  const [selected, setSelected] = useState<Record<CollectionKey, number[]>>({ experience: [], education: [], skills: [], languages: [], projects: [] });
  const [error, setError] = useState(""); const [summary, setSummary] = useState<Record<string, number> | null>(null);

  async function processResume() {
    if (!resumeId) return; setStage("processing"); setError("");
    try {
      const response = await fetch("/api/profile/resume-import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resumeId }) });
      const result = await response.json(); if (!response.ok || !result.success) throw new Error(result.message ?? "Could not process this resume.");
      setParseId(result.parseId); setData(result.data); setPlan(result.plan);
      const defaults = Object.fromEntries(groups.map(([key]) => [key, (result.data[key] as unknown[]).map((_, index) => index).filter((index) => !result.plan.duplicates[key][index])])) as Record<CollectionKey, number[]>;
      setSelected(defaults); setStage("review");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not process this resume."); setStage("select"); }
  }

  function updateScalar(index: number, changes: Partial<Scalar>) { if (!plan) return; setPlan({ ...plan, scalars: plan.scalars.map((item, itemIndex) => itemIndex === index ? { ...item, ...changes } : item) }); }
  function updateCollection(key: CollectionKey, index: number, field: string, value: unknown) { if (!data) return; setData({ ...data, [key]: data[key].map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) }); }
  function toggleCollection(key: CollectionKey, index: number) { setSelected((current) => ({ ...current, [key]: current[key].includes(index) ? current[key].filter((value) => value !== index) : [...current[key], index] })); }

  const selectedCount = useMemo(() => (plan?.scalars.filter((item) => item.selected).length ?? 0) + Object.values(selected).reduce((sum, items) => sum + items.length, 0), [plan, selected]);

  async function confirm() {
    if (!data || !plan || !selectedCount) return; setError("");
    try {
      const response = await fetch("/api/profile/resume-import/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ parseId, data, selected, scalars: plan.scalars.filter((item) => item.selected).map(({ path, imported: value, existing: expectedExisting }) => ({ path, value, expectedExisting })) }) });
      const result = await response.json(); if (!response.ok || !result.success) throw new Error(result.message ?? "Import failed.");
      setSummary(result.summary); setStage("result"); await onImported();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Import failed."); }
  }

  if (!managed.length) return null;
  return <section className="mt-8 rounded-2xl border border-blue-200 bg-blue-50/40 p-5 sm:p-6" aria-labelledby="resume-import-heading">
    <div className="flex items-start gap-3"><Sparkles className="mt-1 text-blue-700" size={21} aria-hidden="true" /><div><h3 id="resume-import-heading" className="font-bold text-slate-950">Import profile details</h3><p className="mt-1 text-sm text-slate-600">Review every suggestion before anything changes. Your account email is never replaced.</p></div></div>
    {error ? <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
    {stage === "select" ? <div className="mt-5 flex flex-col gap-3 sm:flex-row"><label className="flex-1"><span className="sr-only">Resume to import</span><select value={resumeId} onChange={(event) => setResumeId(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm"><option value="">Select a stored resume</option>{managed.map((resume) => <option key={resume.id} value={resume.id}>{resume.title} (v{resume.version})</option>)}</select></label><button type="button" disabled={!resumeId} onClick={() => void processResume()} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">Prepare import preview</button></div> : null}
    {stage === "processing" ? <div role="status" className="mt-5 flex items-center gap-3 rounded-xl bg-white p-4 text-sm font-medium text-slate-700"><LoaderCircle className="animate-spin text-blue-600" size={18} /> Reading document, extracting text, and preparing suggestions…</div> : null}
    {stage === "review" && data && plan ? <div className="mt-6 space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Account email — comparison only</p><div className="mt-2 grid gap-2 text-sm sm:grid-cols-2"><p><b>Existing:</b> {plan.emailComparison.existing}</p><p><b>Resume:</b> {display(plan.emailComparison.imported)}</p></div></div>
      <fieldset><legend className="font-bold text-slate-900">Profile fields</legend><div className="mt-3 space-y-3">{plan.scalars.length ? plan.scalars.map((item, index) => <label key={item.path} className="block rounded-xl border border-slate-200 bg-white p-4"><span className="flex items-center gap-3"><input type="checkbox" checked={item.selected} disabled={item.state === "SAME"} onChange={(event) => updateScalar(index, { selected: event.target.checked })} /><span className="font-semibold text-slate-900">{item.label}</span><span className={`ml-auto rounded-full px-2 py-1 text-xs font-semibold ${item.state === "CONFLICT" ? "bg-amber-100 text-amber-800" : item.state === "SAME" ? "bg-slate-100 text-slate-600" : "bg-green-100 text-green-800"}`}>{item.state === "CONFLICT" ? "Conflict" : item.state === "SAME" ? "Already present" : "Empty profile field"}</span></span><span className="mt-3 grid gap-3 sm:grid-cols-2"><span className="text-sm text-slate-600"><b>Existing:</b> {display(item.existing)}</span><span><span className="text-xs font-semibold text-slate-600">Imported (editable)</span><input value={String(item.imported)} onChange={(event) => updateScalar(index, { imported: item.path === "professional.totalExperience" ? Number(event.target.value) : event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></span></span></label>) : <p className="rounded-xl bg-white p-4 text-sm text-slate-600">No reliable scalar suggestions were found.</p>}</div></fieldset>
      {groups.map(([key, label]) => <fieldset key={key}><legend className="font-bold text-slate-900">{label}</legend><div className="mt-3 space-y-3">{data[key].length ? data[key].map((item, index) => <div key={index} className="rounded-xl border border-slate-200 bg-white p-4"><label className="flex items-center gap-3"><input type="checkbox" checked={selected[key].includes(index)} onChange={() => toggleCollection(key, index)} /><span className="font-semibold">Include record</span>{plan.duplicates[key][index] ? <span className="ml-auto rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">Likely duplicate</span> : null}</label><div className="mt-3 grid gap-3 sm:grid-cols-2">{Object.entries(item).map(([field, value]) => <CollectionField key={field} field={field} value={value} onChange={(next) => updateCollection(key, index, field, next)} />)}</div><button type="button" onClick={() => { setData({ ...data, [key]: data[key].filter((_, itemIndex) => itemIndex !== index) }); setSelected((current) => ({ ...current, [key]: current[key].filter((value) => value !== index).map((value) => value > index ? value - 1 : value) })); }} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-red-600"><X size={14} /> Remove suggestion</button></div>) : <p className="text-sm text-slate-500">No reliable {label.toLowerCase()} suggestions found.</p>}</div></fieldset>)}
      <div className="flex flex-col gap-3 border-t border-blue-200 pt-5 sm:flex-row sm:justify-end"><button type="button" onClick={() => setStage("select")} className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold">Cancel</button><button type="button" disabled={!selectedCount} onClick={() => void confirm()} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">Import {selectedCount} selected item{selectedCount === 1 ? "" : "s"}</button></div>
    </div> : null}
    {stage === "result" && summary ? <div role="status" className="mt-5 rounded-xl border border-green-200 bg-green-50 p-5"><div className="flex items-center gap-2 font-bold text-green-800"><CheckCircle2 size={20} /> Import complete</div><p className="mt-2 text-sm text-green-800">Imported {summary.profileFields ?? 0} profile fields, {summary.skills ?? 0} skills, {summary.experience ?? 0} experience records, {summary.education ?? 0} education records, {summary.languages ?? 0} languages, and {summary.projects ?? 0} projects. Skipped {summary.duplicates ?? 0} duplicates.</p><button type="button" onClick={() => { setStage("select"); setSummary(null); setResumeId(""); }} className="mt-4 rounded-lg border border-green-300 bg-white px-4 py-2 text-sm font-semibold text-green-800">Import another resume</button></div> : null}
  </section>;
}
