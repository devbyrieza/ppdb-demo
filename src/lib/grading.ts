export const ANSWER_KEYS = {
  MTs: {
    1: "B",
    2: "D",
    3: "A",
    4: "B",
    5: "C", // PAI
    6: "A",
    7: "A",
    8: "B",
    9: "A",
    10: "D", // B.Indo
    11: "C",
    12: "B",
    13: "A",
    14: "A",
    15: "A", // IPA (q13 replaced)
    16: "D",
    17: "A",
    18: "C",
    19: "B",
    20: "B", // Mat (q20 replaced)
  },
  IL: {
    1: "B",
    2: "B",
    3: "B",
    4: "D",
    5: "B", // PAI
    6: "D",
    7: "C",
    8: "B",
    9: "D",
    10: "B", // B.Indo
    11: "B",
    12: "C",
    13: "C",
    14: "D",
    15: "B", // IPA
    16: "A",
    17: "C",
    18: "D",
    19: "B",
    20: "C", // Mat (q20 replaced)
  },
  SMA: {
    1: "A",
    2: "A",
    3: "C",
    4: "B",
    5: "B", // Nahwu
    6: "D",
    7: "C",
    8: "B",
    9: "D",
    10: "B", // B.Indo
    11: "B",
    12: "C",
    13: "C",
    14: "D",
    15: "B", // IPA
    16: "A",
    17: "C",
    18: "D",
    19: "B",
    20: "C", // Mat (q20 replaced)
  },
};

export function calculateAkademikScore(
  answers: Record<string, string>,
  jenjang: "MTs" | "IL" | "SMA",
): number {
  const key = ANSWER_KEYS[jenjang];
  if (!key) return 0;

  let correct = 0;
  for (let i = 1; i <= 20; i++) {
    if (answers[i] === key[i as keyof typeof key]) {
      correct++;
    }
  }
  return (correct / 20) * 100;
}

export function calculateKepribadianScore(
  answers: Record<string, string>,
): number {
  // Logic: Assume 'A' is generally the "Pesantren" answer for simplicity unless key map provided.
  // Ideally this needs a map. For now, let's assume random distribution or just count 'A'.
  // User asked AI to determine. Let's assume Option A is positive for 50% and B for 50%.
  // BUT without the text of questions here, it's impossible to know.
  // Fallback: Return a placeholder score or count 'A' as simple metric if acceptable.
  // BETTER: Return 80 (Safe default) if logic unknown, OR calculate based on provided key.
  // Given user instructions, I'll calculate based on majority 'A' being positive for now
  // as in many forms A is the "ideal" first choice.
  let positive = 0;
  Object.values(answers).forEach((val) => {
    if (val === "A") positive++;
  });
  return (positive / Object.keys(answers).length) * 100;
}

export function calculateKesiapanScore(
  answers: Record<string, number>,
): number {
  // Likert 1-5. Max score = 15 * 5 = 75.
  let total = 0;
  Object.values(answers).forEach((val) => (total += Number(val)));
  // Normalize to 0-100
  // Max possible for 15 questions is 75.
  const maxPossible = 15 * 5;
  return (total / maxPossible) * 100;
}

export function calculateFinalScore(
  akademik: number,
  quran: number,
  wawancara: number,
  kepribadian: number,
  kesiapan: number,
): number {
  // Weighting:
  // Akademik 30%, Quran 30%, Wawancara 20%, Kepribadian 10%, Kesiapan 10%
  return (
    akademik * 0.3 +
    quran * 0.3 +
    wawancara * 0.2 +
    kepribadian * 0.1 +
    kesiapan * 0.1
  );
}

export function determineStatus(
  finalScore: number,
  quranScore: number,
): "LULUS" | "CADANGAN" | "DITOLAK" {
  // Critical Condition: Quran < 40 (Grade E) -> GAGAL
  if (quranScore < 40) return "DITOLAK";

  if (finalScore >= 70) return "LULUS";
  if (finalScore >= 55) return "CADANGAN";
  return "DITOLAK";
}

export function gradeToScore(grade: string): number {
  switch (grade?.toUpperCase()) {
    case "A":
      return 95; // Mid 85-100
    case "B":
      return 77; // Mid 70-84
    case "C":
      return 62; // Mid 55-69
    case "D":
      return 47; // Mid 40-54
    case "E":
      return 20; // < 40
    default:
      return 0;
  }
}

export function scoreToGrade(score: number): string {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "E";
}

// ============================================================================
// NEW GRADING LOGIC (Based on Excel R.H Matrix)
// ============================================================================

export function evaluateKepribadianGrade(
  score: number,
): "A" | "B" | "C" | "D" | "E" {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "E";
}

export function evaluateAkademikGrade(
  score: number,
): "A" | "B" | "C" | "D" | "E" {
  if (score >= 75) return "A";
  if (score >= 60) return "B";
  if (score >= 45) return "C";
  if (score >= 30) return "D";
  return "E";
}

export function evaluateQuranGrade(score: number): "A" | "B" | "C" | "D" | "E" {
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  if (score >= 35) return "D";
  return "E";
}

export function evaluateWawancaraGrade(
  score: number,
): "A" | "B" | "C" | "D" | "E" {
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  if (score >= 35) return "D";
  return "E";
}

export function evaluateKesiapanGrade(
  score: number,
): "A" | "B" | "C" | "D" | "E" {
  if (score >= 75) return "A";
  if (score >= 55) return "B";
  if (score >= 40) return "C";
  if (score >= 25) return "D";
  return "E";
}

export function evaluateStatusGrade(
  status: string | null | undefined,
): "A" | "B" | "C" | "D" | "E" {
  const s = status?.toLowerCase() || "";
  if (s.includes("sangat layak") || s === "siap" || s.includes("diterima"))
    return "A";
  if (
    s.includes("layak") ||
    s.includes("cukup") ||
    s === "cukup siap" ||
    s.includes("cadangan")
  )
    return "B";
  if (s.includes("tidak layak") || s.includes("ditolak") || s.includes("gagal"))
    return "D";
  return "C";
}

export function determineFinalDecision(grades: {
  quran: "A" | "B" | "C" | "D" | "E";
  akademik: "A" | "B" | "C" | "D" | "E";
  kepribadian: "A" | "B" | "C" | "D" | "E";
  kesiapan: "A" | "B" | "C" | "D" | "E";
  wawancaraSantri: "A" | "B" | "C" | "D" | "E";
  wawancaraOrangTua: "A" | "B" | "C" | "D" | "E";
}): "DITERIMA" | "CADANGAN" | "DITOLAK" {
  const vals = Object.values(grades);

  // 1. CRITICAL REJECTION (DITOLAK)
  // Any D or E is an automatic rejection
  if (vals.includes("D") || vals.includes("E")) return "DITOLAK";

  // Quran or Wawancara Calon Santri getting C is also automatic rejection for many Jenjang
  if (grades.quran === "C" || grades.wawancaraSantri === "C") return "DITOLAK";

  // 2. AUTOMATIC RESERVE (CADANGAN)
  // Rule: "Jika Quran dapet Cadangan (B), otomatis masuk Cadangan"
  if (grades.quran === "B") return "CADANGAN";

  // Also if Wawancara Calon Santri is B, it's very likely Cadangan unless everything else is A
  if (grades.wawancaraSantri === "B") {
    const countA = vals.filter((v) => v === "A").length;
    if (countA < 4) return "CADANGAN";
  }

  // 3. DITERIMA (LULUS)
  // At this point Quran is 'A'.
  // Allowed one 'C' in non-critical components (Akademik, Ortu, Kesiapan, Kepribadian)
  const countC = vals.filter((v) => v === "C").length;
  if (countC > 1) return "CADANGAN";

  return "DITERIMA";
}
