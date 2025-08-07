/**
 * Aggregator for Cognitive Assessment
 * - Reads 5 subtest results by session_id
 * - Computes 6 cognitive scores
 * - Inserts a single row into public.cognitive_test_result
 *
 * Assumptions:
 * - localStorage keys:
 *   bb-session-id, bb-session-start, bb-session-end, bb-student-id, bb-conducted-by
 *   sb-url, sb-anon-key
 */
declare global {
  interface Window {
    supabase?: {
      createClient: (url: string, key: string) => any;
    };
    Supabase?: {
      createClient: (url: string, key: string) => any;
    };
    supabaseClient?: any;
  }
}
type SupabaseClient = ReturnType<NonNullable<NonNullable<typeof window.supabase | typeof window.Supabase>['createClient']>>;

type CognitiveScores = {
  dikkat_skoru: number;
  hafiza_skoru: number;
  isleme_hizi_skoru: number;
  gorsel_isleme_skoru: number;
  akil_mantik_yurutme_skoru: number;
  bilissel_esneklik_skoru: number;
};

type AggregatorResult =
  | { ok: true; id: string; scores: CognitiveScores }
  | { ok: false; reason: string; details?: any };

function getSupabaseClient(): SupabaseClient | null {
  try {
    const url = localStorage.getItem('sb-url');
    const key = localStorage.getItem('sb-anon-key');

    // UMD global'i yüklenmemiş olabilir: hem window.supabase hem window.Supabase kontrol edilir
    const lib = (window as any).supabase || (window as any).Supabase;
    if (!url || !key) return null;
    if (!lib || typeof lib.createClient !== 'function') return null;

    if ((window as any).supabaseClient) {
      return (window as any).supabaseClient as SupabaseClient;
    }
    (window as any).supabaseClient = lib.createClient(url, key);
    return (window as any).supabaseClient as SupabaseClient;
  } catch {
    return null;
  }
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}
function toPct(x: number) {
  return Math.round(x * 10000) / 100; // two decimals percentage
}
function pct(x: number) {
  return Math.round(x * 100) / 100;
}

// Linear normalization: value in [minVal, maxVal] mapped to [0..1], reversed if reverse=true
function normalize(value: number, minVal: number, maxVal: number, reverse = false) {
  if (maxVal === minVal) return 0;
  const t = clamp01((value - minVal) / (maxVal - minVal));
  const y = reverse ? 1 - t : t;
  return y;
}

// Safe number getter from possibly numeric string
function num(v: any, def = 0) {
  if (v == null) return def;
  if (typeof v === 'number' && isFinite(v)) return v;
  const n = Number(v);
  return isFinite(n) ? n : def;
}

async function readAttention(supabase: SupabaseClient, sessionId: string) {
  return supabase
    .from('attention_test_results')
    .select('*')
    .eq('session_id', sessionId)
    .order('test_end_time', { ascending: false })
    .limit(1)
    .maybeSingle();
}

async function readMemory(supabase: SupabaseClient, sessionId: string) {
  return supabase
    .from('memory_test_results')
    .select('*')
    .eq('session_id', sessionId)
    .order('test_end_time', { ascending: false })
    .limit(1)
    .maybeSingle();
}

async function readStroop(supabase: SupabaseClient, sessionId: string) {
  return supabase
    .from('stroop_test_results')
    .select('*')
    .eq('session_id', sessionId)
    .order('test_end_time', { ascending: false })
    .limit(1)
    .maybeSingle();
}

async function readPuzzle(supabase: SupabaseClient, sessionId: string) {
  return supabase
    .from('puzzle_test_results')
    .select('*')
    .eq('session_id', sessionId)
    .order('test_end_time', { ascending: false })
    .limit(1)
    .maybeSingle();
}

async function readLogic(supabase: SupabaseClient, sessionId: string) {
  return supabase
    .from('akil_mantik_test_results')
    .select('*')
    .eq('session_id', sessionId)
    .order('test_end_time', { ascending: false })
    .limit(1)
    .maybeSingle();
}

// First-version scoring (can be tuned later)
// Each component is normalized to [0..100] and weighted.
function computeScores(att: any, mem: any, str: any, pzl: any, logic: any): CognitiveScores {
  // Attention core
  const attAcc = num(att?.overall_accuracy ?? att?.accuracy_percentage ?? att?.success_rate, 0);
  const attAvgRtMs = num(att?.avg_response_time_ms ?? att?.average_response_time_ms, 0);
  const attSpeedN = normalize(attAvgRtMs, 300, 3000, true); // best=300ms, worst=3000ms
  const attentionCore = 0.6 * clamp01(attAcc / 100) + 0.4 * attSpeedN;

  // Stroop
  const strAcc = num(str?.accuracy_percentage ?? str?.success_rate, 0);
  const strAvgRt = num(str?.avg_response_time_ms ?? str?.average_response_time_ms, 0);
  const strSpeedN = normalize(strAvgRt, 300, 3000, true);
  const interference = num(str?.interference_ms ?? 0);
  const interN = normalize(interference, 0, 1000, true); // less interference is better
  const stroopComp = 0.7 * clamp01(strAcc / 100) + 0.15 * strSpeedN + 0.15 * interN;

  // Memory
  const shortVis = num(mem?.short_visual_accuracy ?? 0);
  const shortAud = num(mem?.short_auditory_accuracy ?? 0);
  const longVis = num(mem?.long_visual_accuracy ?? 0);
  const longAud = num(mem?.long_auditory_accuracy ?? 0);
  // fallback: if not present, use overall
  const memOverall = num(mem?.success_rate ?? mem?.accuracy_percentage, 0);
  const providedCount = [shortVis, shortAud, longVis, longAud].filter(v => v > 0).length;
  const memoryCore =
    providedCount > 0
      ? clamp01((shortVis + shortAud + longVis + longAud) / (providedCount * 100))
      : clamp01(memOverall / 100);

  // Puzzle components
  const pFour = num(pzl?.four_piece_score ?? 0);
  const pSix = num(pzl?.six_piece_score ?? 0);
  const pNine = num(pzl?.nine_piece_score ?? 0);
  const pSixteen = num(pzl?.sixteen_piece_score ?? 0);
  const pAvgRT = num(pzl?.average_response_time_ms ?? 0);
  const pSpeedN = normalize(pAvgRT, 300, 4000, true);
  const pSpatial = num(pzl?.spatial_reasoning_score ?? 0);
  const pPattern = num(pzl?.pattern_recognition_score ?? 0);
  const pProblem = num(pzl?.problem_solving_score ?? 0);
  const pFlex = num(pzl?.cognitive_flexibility_score ?? 0);
  const pAccAvgProvided = [pFour, pSix, pNine, pSixteen].filter(v => v > 0).length;
  const puzzleAcc =
    pAccAvgProvided > 0 ? clamp01((pFour + pSix + pNine + pSixteen) / (pAccAvgProvided * 100)) : 0;

  // Logic (Akıl-Mantık)
  const logicSR = num(logic?.success_rate ?? 0);
  const logicAvgRt = num(logic?.avg_response_time_ms ?? 0);
  const logicSpeedN = normalize(logicAvgRt, 300, 4000, true);
  const logicFour = num(logic?.dortlu_yatay_accuracy_percentage ?? 0);
  const logicSquare = num(logic?.dortlu_kare_accuracy_percentage ?? 0);
  const logicSixAcc = num(logic?.altili_kare_accuracy_percentage ?? 0);
  const logicLAcc = num(logic?.l_format_accuracy_percentage ?? 0);
  const logicNineAcc = num(logic?.dokuzlu_format_accuracy_percentage ?? 0);
  const logicVisProvided = [logicFour, logicSquare, logicSixAcc, logicLAcc, logicNineAcc].filter(v => v > 0).length;
  const logicVisualAcc =
    logicVisProvided > 0
      ? clamp01((logicFour + logicSquare + logicSixAcc + logicLAcc + logicNineAcc) / (logicVisProvided * 100))
      : 0;

  // 1) Dikkat Skoru: Attention + Stroop
  const dikkat = toPct(0.6 * attentionCore + 0.4 * stroopComp);

  // 2) Hafıza Skoru: Memory + small support from Logic success rate
  const hafiza = toPct(0.85 * memoryCore + 0.15 * clamp01(logicSR / 100));

  // 3) İşleme Hızı Skoru: Attention speed + Stroop speed + Puzzle speed
  const islemeHizi = toPct(0.4 * attSpeedN + 0.3 * strSpeedN + 0.3 * pSpeedN);

  // 4) Görsel İşleme Skoru: Puzzle accuracy + Logic visual accuracy
  const gorselIsleme = toPct(0.7 * puzzleAcc + 0.3 * logicVisualAcc);

  // 5) Akıl ve Mantık Yürütme Skoru: Logic success + Puzzle higher-order skills
  const puzzleReasoningSupport = clamp01((pSpatial + pPattern + pProblem) / (3 * 100));
  const akilMantik = toPct(0.7 * clamp01(logicSR / 100) + 0.3 * puzzleReasoningSupport);

  // 6) Bilişsel Esneklik: Puzzle flex + Stroop set shift + RT variability proxy
  const stroopFlexN = interN; // lower interference => higher flexibility
  const rtVar = num(pzl?.response_time_variance ?? 0);
  const rtVarN = normalize(rtVar, 0, 2_000_000, true); // heuristic cap
  const bilisselEsneklik = toPct(0.5 * clamp01(pFlex / 100) + 0.3 * stroopFlexN + 0.2 * rtVarN);

  return {
    dikkat_skoru: pct(dikkat),
    hafiza_skoru: pct(hafiza),
    isleme_hizi_skoru: pct(islemeHizi),
    gorsel_isleme_skoru: pct(gorselIsleme),
    akil_mantik_yurutme_skoru: pct(akilMantik),
    bilissel_esneklik_skoru: pct(bilisselEsneklik),
  };
}

async function insertCognitiveResult(
  supabase: SupabaseClient,
  payload: {
    student_id: string;
    conducted_by: string;
    session_id: string;
    test_start_time: string;
    test_end_time: string;
    duration_seconds: number;
    scores: CognitiveScores;
    alt_test_ozetleri?: any;
  }
) {
  const { data, error } = await supabase
    .from('cognitive_test_result')
    .insert([
      {
        student_id: payload.student_id,
        conducted_by: payload.conducted_by,
        session_id: payload.session_id,
        test_start_time: payload.test_start_time,
        test_end_time: payload.test_end_time,
        duration_seconds: payload.duration_seconds,
        dikkat_skoru: payload.scores.dikkat_skoru,
        hafiza_skoru: payload.scores.hafiza_skoru,
        isleme_hizi_skoru: payload.scores.isleme_hizi_skoru,
        gorsel_isleme_skoru: payload.scores.gorsel_isleme_skoru,
        akil_mantik_yurutme_skoru: payload.scores.akil_mantik_yurutme_skoru,
        bilissel_esneklik_skoru: payload.scores.bilissel_esneklik_skoru,
        alt_test_ozetleri: payload.alt_test_ozetleri ?? {},
      },
    ])
    .select()
    .limit(1);

  if (error) return { ok: false as const, reason: 'insert_error', details: error };
  return { ok: true as const, id: data?.[0]?.id, scores: payload.scores };
}

export async function runCognitiveAggregator(): Promise<AggregatorResult> {
  try {
    const sessionId = localStorage.getItem('bb-session-id') || '';
    const studentId = localStorage.getItem('bb-student-id') || '';
    const conductedBy = localStorage.getItem('bb-conducted-by') || '';
    const startISO = localStorage.getItem('bb-session-start') || '';
    const endISO = localStorage.getItem('bb-session-end') || '';

    if (!sessionId || !studentId || !conductedBy || !startISO || !endISO) {
      return { ok: false, reason: 'missing_session_info' };
    }

    // Tarih doğrulama
    const startMs = new Date(startISO).getTime();
    const endMs = new Date(endISO).getTime();
    if (!isFinite(startMs) || !isFinite(endMs)) {
      return { ok: false, reason: 'invalid_time', details: { startISO, endISO } };
    }

    const durationSeconds = Math.max(0, Math.round((endMs - startMs) / 1000));

    const supabase = getSupabaseClient();
    if (!supabase) return { ok: false, reason: 'supabase_init_failed' };

    // Auth doğrulaması: UMD client üzerinde auth.getUser yoksa veya kullanıcı yoksa reddet
    try {
      const authRes = await (supabase as any).auth?.getUser?.();
      const authed = !!authRes?.data?.user?.id;
      if (!authed) {
        return { ok: false, reason: 'unauthenticated' };
      }
    } catch (err) {
      // bazı UMD versiyonlarında auth bağlamı anlık hazır olmayabilir
      return { ok: false, reason: 'unauthenticated', details: String((err as any)?.message || err) };
    }

    // Alt testleri oku (son kaydı)
    const [att, mem, str, pzl, logic] = await Promise.all([
      readAttention(supabase, sessionId),
      readMemory(supabase, sessionId),
      readStroop(supabase, sessionId),
      readPuzzle(supabase, sessionId),
      readLogic(supabase, sessionId),
    ]);

    const missing: string[] = [];
    if (att.error || !att.data) missing.push('attention');
    if (mem.error || !mem.data) missing.push('memory');
    if (str.error || !str.data) missing.push('stroop');
    if (pzl.error || !pzl.data) missing.push('puzzle');
    if (logic.error || !logic.data) missing.push('akil_mantik');

    if (missing.length > 0) {
      return {
        ok: false,
        reason: 'missing_subtests',
        details: { missing, errors: { att, mem, str, pzl, logic } },
      };
    }

    const scores = computeScores(att.data, mem.data, str.data, pzl.data, logic.data);

    const altOzet = {
      attention_id: att.data.id,
      memory_id: mem.data.id,
      stroop_id: str.data.id,
      puzzle_id: pzl.data.id,
      akil_mantik_id: logic.data.id,
      attention_summary: {
        accuracy: att.data.accuracy_percentage ?? att.data.success_rate,
        avg_rt_ms: att.data.avg_response_time_ms ?? att.data.average_response_time_ms,
      },
      memory_summary: {
        overall: mem.data.success_rate ?? mem.data.accuracy_percentage,
        short_visual: mem.data.short_visual_accuracy,
        short_auditory: mem.data.short_auditory_accuracy,
        long_visual: mem.data.long_visual_accuracy,
        long_auditory: mem.data.long_auditory_accuracy,
      },
      stroop_summary: {
        accuracy: str.data.accuracy_percentage ?? str.data.success_rate,
        avg_rt_ms: str.data.avg_response_time_ms ?? str.data.average_response_time_ms,
        interference_ms: str.data.interference_ms,
      },
      puzzle_summary: {
        avg_rt_ms: pzl.data.average_response_time_ms,
        four: pzl.data.four_piece_score,
        six: pzl.data.six_piece_score,
        nine: pzl.data.nine_piece_score,
        sixteen: pzl.data.sixteen_piece_score,
        spatial: pzl.data.spatial_reasoning_score,
        pattern: pzl.data.pattern_recognition_score,
        problem: pzl.data.problem_solving_score,
        flexibility: pzl.data.cognitive_flexibility_score,
        rt_variance: pzl.data.response_time_variance,
      },
      logic_summary: {
        success_rate: logic.data.success_rate,
        avg_rt_ms: logic.data.avg_response_time_ms,
        section_acc: {
          dortlu_yatay: logic.data.dortlu_yatay_accuracy_percentage,
          dortlu_kare: logic.data.dortlu_kare_accuracy_percentage,
          altili_kare: logic.data.altili_kare_accuracy_percentage,
          l_format: logic.data.l_format_accuracy_percentage,
          dokuzlu_format: logic.data.dokuzlu_format_accuracy_percentage,
        },
      },
    };

    // Idempotent davranış: session_id unique ise upsert daha güvenli
    const ins = await insertCognitiveResult(supabase, {
      student_id: studentId,
      conducted_by: conductedBy,
      session_id: sessionId,
      test_start_time: startISO,
      test_end_time: endISO,
      duration_seconds: durationSeconds,
      scores,
      alt_test_ozetleri: altOzet,
    });

    if (!ins.ok) {
      // Hata kodu bazlı ek bilgi döndür
      const code = (ins as any)?.details?.code;
      return { ok: false, reason: 'insert_error', details: { code, raw: (ins as any)?.details } };
    }

    return ins;
  } catch (e: any) {
    return { ok: false, reason: 'unexpected_error', details: String(e?.message || e) };
  }
}

/**
 * Helper to set bb-session-end and run aggregator
 */
export async function finalizeAndAggregate(): Promise<AggregatorResult> {
  // Supabase UMD client kurulumu için gerekli anahtarlar kontrolü (UMD yaklaşımı)
  const sbUrl = localStorage.getItem('sb-url');
  const sbKey = localStorage.getItem('sb-anon-key');
  if (!sbUrl || !sbKey) {
    return { ok: false, reason: 'supabase_init_failed', details: 'Missing sb-url or sb-anon-key' };
  }

  // Session end yoksa kapat
  if (!localStorage.getItem('bb-session-end')) {
    localStorage.setItem('bb-session-end', new Date().toISOString());
  }

  // Aggregator öncesi auth doğrulaması runCognitiveAggregator içinde de yapılacak
  const res = await runCognitiveAggregator();

  // Başarılı ise localStorage'a id yaz
  if (res.ok) {
    try {
      localStorage.setItem('bb-last-cognitive-result-id', res.id);
    } catch {}
  } else {
    // Hata yönetimi: retry kuyruk örneği (sadece network/timeout-benzeri durumlar için anlamlı)
    // insert_error kodu 42501 (RLS) veya 23503 (FK) ise kuyruğa almak yerine kullanıcı/veri düzeltmesi gerekir.
    try {
      const queueKey = 'pendingCognitiveResults';
      const existing = JSON.parse(localStorage.getItem(queueKey) || '[]');
      const failure = res as Exclude<AggregatorResult, { ok: true; id: string; scores: CognitiveScores }>;
      existing.push({
        ts: new Date().toISOString(),
        session_id: localStorage.getItem('bb-session-id'),
        reason: failure.reason,
        details: failure.details ?? null,
      });
      localStorage.setItem(queueKey, JSON.stringify(existing));
    } catch {
      // yut
    }
  }
  return res;
}
