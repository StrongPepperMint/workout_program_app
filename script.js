const STORAGE_KEY = "workout-program-app-state";
const EXERCISES = ["Squat", "Bench Press", "Deadlift", "Press"];
const EXERCISE_INCREMENTS = {
  Squat: 5,
  "Bench Press": 2.5,
  Deadlift: 5,
  Press: 2.5,
};
const STRENGTH_STAGE_ORDER = ["5x5", "4x4", "3x3", "2x2"];
const STRENGTH_STAGE_CONFIG = {
  "5x5": { targetSets: 5, targetReps: 5, thresholdRpe: 8 },
  "4x4": { targetSets: 4, targetReps: 4, thresholdRpe: 8.5 },
  "3x3": { targetSets: 3, targetReps: 3, thresholdRpe: 9 },
  "2x2": { targetSets: 2, targetReps: 2, thresholdRpe: 9.5 },
};

const navLinks = document.querySelectorAll(".nav-link");
const screens = document.querySelectorAll(".screen");
const goButtons = document.querySelectorAll("[data-go]");
const baselineInputs = document.querySelectorAll("[data-exercise][data-field]");
const programModeInputs = document.querySelectorAll('[name="program-mode"]');

const generateProgramButton = document.getElementById("generate-program-button");
const completeSessionButton = document.getElementById("complete-session-button");
const saveExerciseButton = document.getElementById("save-exercise-button");
const prevExerciseButton = document.getElementById("prev-exercise-button");
const nextExerciseButton = document.getElementById("next-exercise-button");
const backToSessionButton = document.getElementById("back-to-session-button");
const userNameInput = document.getElementById("user-name-input");
const plateIncrementInput = document.getElementById("plate-increment-input");
const includePracticeInput = document.getElementById("include-practice-input");
const practiceToggleRow = document.getElementById("practice-toggle-row");

const summarySessionLabel = document.getElementById("summary-session-label");
const summaryNote = document.getElementById("summary-note");
const setupPreview = document.getElementById("setup-preview");
const programSchedulePreview = document.getElementById("program-schedule-preview");
const todayProgramSchedulePreview = document.getElementById("today-program-schedule-preview");
const todaySessionTitle = document.getElementById("today-session-title");
const todaySessionCopy = document.getElementById("today-session-copy");
const todayIncrementSummary = document.getElementById("today-increment-summary");
const todayExerciseGrid = document.getElementById("today-exercise-grid");
const recordExerciseList = document.getElementById("record-exercise-list");
const backoffSummary = document.getElementById("backoff-summary");
const historyList = document.getElementById("history-list");
const historyStats = document.getElementById("history-stats");
const historyFilters = document.getElementById("history-filters");
const historyChartGrid = document.getElementById("history-chart-grid");
const historyViewSessionButton = document.getElementById("history-view-session");
const historyViewExerciseButton = document.getElementById("history-view-exercise");
const exportHistoryButton = document.getElementById("export-history-button");
const resetHistoryButton = document.getElementById("reset-history-button");
const prExerciseFilters = document.getElementById("pr-exercise-filters");
const prContent = document.getElementById("pr-content");
const installCard = document.getElementById("install-card");
const installTitle = document.getElementById("install-title");
const installCopy = document.getElementById("install-copy");
const installAppButton = document.getElementById("install-app-button");
const updateCard = document.getElementById("update-card");
const updateTitle = document.getElementById("update-title");
const updateCopy = document.getElementById("update-copy");
const applyUpdateButton = document.getElementById("apply-update-button");

let historyViewMode = "session";
let historyExerciseFilter = "all";
let deferredInstallPrompt = null;
let waitingServiceWorker = null;
const HIGH_VOLUME_REP_EQUIVALENTS = [18, 17.5, 15, 14.5, 12, 11.5, 11, 10];
const HIGH_VOLUME_TEMPLATES = [
  { summary: "4x12", rpeTarget: 6, sets: [{ reps: 12, count: 4, percent: 1 }] },
  { summary: "4x12", rpeTarget: 6.5, sets: [{ reps: 12, count: 4, percent: 1 }] },
  { summary: "12,3x12", rpeTarget: 7, sets: [{ reps: 12, count: 1, percent: 1 }, { reps: 12, count: 3, percent: 0.8 }] },
  { summary: "10,3x12", rpeTarget: 7.5, sets: [{ reps: 10, count: 1, percent: 1 }, { reps: 12, count: 3, percent: 0.8 }] },
  { summary: "10,3x10", rpeTarget: 8, sets: [{ reps: 10, count: 1, percent: 1 }, { reps: 10, count: 3, percent: 0.8 }] },
  { summary: "10,2x10", rpeTarget: 8.5, sets: [{ reps: 10, count: 1, percent: 1 }, { reps: 10, count: 2, percent: 0.8 }] },
  { summary: "10,10", rpeTarget: 9, sets: [{ reps: 10, count: 1, percent: 1 }, { reps: 10, count: 1, percent: 0.8 }] },
];
const PRACTICE_TEMPLATES = [
  { summary: "4x5", rpeTarget: "5~6", targetSets: 4, targetReps: 5 },
  { summary: "4x3", rpeTarget: "5~6", targetSets: 4, targetReps: 3 },
];

const defaultState = {
  userName: "사용자",
  plateIncrement: 1.25,
  currentSessionNumber: 1,
  programMode: "strength",
  includePracticePhase: true,
  phase: "strength",
  programCompleted: false,
  exercisePhases: {
    Squat: "strength",
    "Bench Press": "strength",
    Deadlift: "strength",
    Press: "strength",
  },
  readyForStrength: {
    Squat: false,
    "Bench Press": false,
    Deadlift: false,
    Press: false,
  },
  exerciseProgressions: {
    Squat: 1,
    "Bench Press": 1,
    Deadlift: 1,
    Press: 1,
  },
  exerciseStrengthStages: {
    Squat: "5x5",
    "Bench Press": "5x5",
    Deadlift: "5x5",
    Press: "5x5",
  },
  completedExercises: {
    Squat: false,
    "Bench Press": false,
    Deadlift: false,
    Press: false,
  },
  selectedPrExercise: "Squat",
  latestPrRecords: {},
  prHistory: [],
  manualNextSessionWeights: {},
  selectedExercise: "Squat",
  currentSessionRecords: {},
  baselines: {
    Squat: { weight: 115, reps: 10 },
    "Bench Press": { weight: 80, reps: 10 },
    Deadlift: { weight: 120, reps: 10 },
    Press: { weight: 50, reps: 9 },
  },
  history: [],
};

let appState = loadState();

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return structuredClone(defaultState);
    }

    return {
      ...structuredClone(defaultState),
      ...JSON.parse(saved),
    };
  } catch (error) {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

function showScreen(screenName) {
  screens.forEach((screen) => {
    screen.classList.toggle("active", screen.id === `screen-${screenName}`);
  });

  navLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.screen === screenName);
  });

  const summaryCard = summarySessionLabel?.closest(".summary-card");
  if (summaryCard) {
    summaryCard.hidden = screenName === "today";
  }
}

function scrollToTodayScreenBottom() {
  const todayScreen = document.getElementById("screen-today");
  if (!todayScreen) {
    return;
  }

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      window.scrollTo({
        top: todayScreen.offsetTop + todayScreen.scrollHeight,
        behavior: "smooth",
      });
    });
  });
}

function isIosLikeDevice() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isStandaloneMode() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function updateInstallCard() {
  if (!installCard || !installTitle || !installCopy || !installAppButton) {
    return;
  }

  if (isStandaloneMode()) {
    installCard.hidden = false;
    installTitle.textContent = "앱처럼 사용 중";
    installCopy.textContent = "이미 홈 화면 또는 설치된 앱으로 실행 중입니다.";
    installAppButton.hidden = true;
    return;
  }

  if (deferredInstallPrompt) {
    installCard.hidden = false;
    installTitle.textContent = "앱 설치 가능";
    installCopy.textContent = "안드로이드 Chrome 계열 브라우저에서는 설치 버튼으로 바로 홈 화면에 추가할 수 있습니다.";
    installAppButton.hidden = false;
    return;
  }

  if (isIosLikeDevice()) {
    installCard.hidden = false;
    installTitle.textContent = "iPhone/iPad 설치";
    installCopy.textContent = "Safari의 공유 메뉴에서 '홈 화면에 추가'를 누르면 앱처럼 사용할 수 있습니다.";
    installAppButton.hidden = true;
    return;
  }

  installCard.hidden = false;
  installTitle.textContent = "설치 안내";
  installCopy.textContent = "배포 후 HTTPS 주소로 열면 브라우저 메뉴나 주소창의 설치 기능으로 홈 화면에 추가할 수 있습니다.";
  installAppButton.hidden = true;
}

function updateUpdateCard() {
  if (!updateCard || !updateTitle || !updateCopy || !applyUpdateButton) {
    return;
  }

  if (!waitingServiceWorker) {
    updateCard.hidden = true;
    return;
  }

  updateCard.hidden = false;
  updateTitle.textContent = "새 버전이 준비됨";
  updateCopy.textContent = "업데이트를 누르면 최신 HTML, 스타일, 스크립트로 다시 불러옵니다.";
}

function promptForAppUpdate(registration) {
  waitingServiceWorker = registration?.waiting || null;
  updateUpdateCard();
}

function roundToLoadableWeight(value) {
  const roundUnit = Number(appState.plateIncrement) * 2;
  if (!roundUnit) {
    return value;
  }

  return Math.round(value / roundUnit) * roundUnit;
}

function roundToCustomUnit(value, roundUnit) {
  if (!roundUnit) {
    return value;
  }

  return Math.round(value / roundUnit) * roundUnit;
}

function formatWeight(value) {
  return `${Number(value).toFixed(value % 1 === 0 ? 0 : 1)}kg`;
}

function calculateEstimatedOneRepMax(weight, reps) {
  return weight / (1.0278 - 0.0278 * reps);
}

function calculateStrengthStartWeight(estimatedOneRepMax) {
  return roundToLoadableWeight(estimatedOneRepMax * 0.65);
}

function calculateStrengthSessionWeight(exercise, baseline, sessionNumber) {
  const estimatedOneRepMax = calculateEstimatedOneRepMax(baseline.weight, baseline.reps);
  const startWeight = calculateStrengthStartWeight(estimatedOneRepMax);
  const increment = EXERCISE_INCREMENTS[exercise] || 2.5;
  const nextWeight = startWeight + increment * (sessionNumber - 1);
  return roundToLoadableWeight(nextWeight);
}

function calculateStrengthReferenceWeightFromStart(startWeight, repEquivalent) {
  return roundToLoadableWeight(
    (startWeight / 0.65) * (1.0278 - (0.0278 * repEquivalent)),
  );
}

function calculateWeightForRepEquivalent(estimatedOneRepMax, reps) {
  return roundToLoadableWeight(
    estimatedOneRepMax * (1.0278 - (0.0278 * reps)),
  );
}

function calculateHighVolumeStartWeight(estimatedOneRepMax) {
  return calculateWeightForRepEquivalent(estimatedOneRepMax, 18);
}

function calculateHighVolumeSessionWeight(baseline, sessionNumber) {
  const estimatedOneRepMax = calculateEstimatedOneRepMax(baseline.weight, baseline.reps);
  const highVolumeStartWeight = calculateHighVolumeStartWeight(estimatedOneRepMax);

  if (sessionNumber === 1) {
    return roundToCustomUnit(highVolumeStartWeight, Number(appState.plateIncrement) * 4);
  }

  const repEquivalent = HIGH_VOLUME_REP_EQUIVALENTS[Math.max(sessionNumber - 1, 0)] || 10;
  return roundToLoadableWeight(
    (highVolumeStartWeight / (1.0278 - (0.0278 * 18))) * (1.0278 - (0.0278 * repEquivalent)),
  );
}

function calculatePracticeStartWeight(estimatedOneRepMax) {
  return calculateWeightForRepEquivalent(estimatedOneRepMax, 12);
}

function calculatePracticeSessionWeight(baseline, sessionNumber) {
  const estimatedOneRepMax = calculateEstimatedOneRepMax(baseline.weight, baseline.reps);
  const practiceStartWeight = calculatePracticeStartWeight(estimatedOneRepMax);

  if (sessionNumber === 1) {
    return practiceStartWeight;
  }

  return roundToLoadableWeight(
    (practiceStartWeight / (1.0278 - (0.0278 * 10))) * (1.0278 - (0.0278 * 8)),
  );
}

function buildSetPlanFromBlocks(prescribedWeight, blocks) {
  let setOrder = 1;
  return blocks.flatMap((block, blockIndex) =>
    Array.from({ length: block.count }, () => {
      const targetWeight = roundToLoadableWeight(prescribedWeight * block.percent);
      const setType = block.percent === 1 && blockIndex === 0 ? "top_set" : "backoff_set";
      const labelPrefix = setType === "top_set" ? "메인" : "백오프";
      const entry = {
        setOrder,
        label: `${labelPrefix} ${setOrder}`,
        targetWeight,
        targetReps: block.reps,
        setType,
      };
      setOrder += 1;
      return entry;
    }),
  );
}

function buildFixedSetPlan(prescribedWeight, targetSets, targetReps) {
  return Array.from({ length: targetSets }, (_, index) => ({
    setOrder: index + 1,
    label: `세트 ${index + 1}`,
    targetWeight: prescribedWeight,
    targetReps,
    setType: "fixed_set",
  }));
}

function getPhaseLabel(phase) {
  const labels = {
    high_volume: "고반복",
    practice: "연습",
    strength: "스트렝스",
    complete: "완료",
    mixed: "혼합",
  };

  return labels[phase] || phase;
}

function getExercisePhase(exercise) {
  return appState.exercisePhases[exercise] || appState.phase;
}

function syncGlobalPhaseFromExercises() {
  const phases = EXERCISES.map((exercise) => getExercisePhase(exercise));
  const firstPhase = phases[0];
  appState.phase = phases.every((phase) => phase === firstPhase) ? firstPhase : "mixed";
}

function getCurrentPhaseSessionLabel() {
  if (appState.programCompleted) {
    return `${getPhaseLabel(appState.phase)} 완료`;
  }

  if (appState.phase === "mixed") {
    return "단계 혼합 진행";
  }

  const progressionValues = EXERCISES.map((exercise) => appState.exerciseProgressions[exercise] || 1);
  const firstValue = progressionValues[0];
  const sameProgression = progressionValues.every((value) => value === firstValue);

  if (sameProgression) {
    return `${getPhaseLabel(appState.phase)} ${firstValue}세션`;
  }

  return `${getPhaseLabel(appState.phase)} 진행 중`;
}

function shouldUsePracticePhase() {
  return appState.programMode === "strength" && appState.includePracticePhase;
}

function isHighVolumeTestContext() {
  return appState.programMode === "high_volume";
}

function getPrTestTitle() {
  return isHighVolumeTestContext() ? "10RM 테스트" : "PR 테스트";
}

function getPrMetricLabel() {
  return isHighVolumeTestContext() ? "10RM" : "PR";
}

function getStrengthStage(exercise) {
  return appState.exerciseStrengthStages[exercise] || "5x5";
}

function getCompletedExercises() {
  return EXERCISES.filter((exercise) => appState.completedExercises[exercise]);
}

function getPrEligibleExercises() {
  return getCompletedExercises();
}

function hasSavedTenRmRecord(exercise) {
  return appState.latestPrRecords[exercise]?.testType === "10RM";
}

function getMissingTenRmExercises() {
  return EXERCISES.filter((exercise) => !hasSavedTenRmRecord(exercise));
}

function getStrengthStageConfig(exercise) {
  const stage = getStrengthStage(exercise);
  return STRENGTH_STAGE_CONFIG[stage] || STRENGTH_STAGE_CONFIG["5x5"];
}

function getNextStrengthStage(currentStage) {
  const currentIndex = STRENGTH_STAGE_ORDER.indexOf(currentStage);
  if (currentIndex === -1 || currentIndex === STRENGTH_STAGE_ORDER.length - 1) {
    return currentStage;
  }

  return STRENGTH_STAGE_ORDER[currentIndex + 1];
}

function shouldAdvanceStrengthStage(exerciseResult) {
  if (!exerciseResult.success || exerciseResult.failureChoice === "repeat") {
    return false;
  }

  const stageConfig = STRENGTH_STAGE_CONFIG[exerciseResult.stage] || STRENGTH_STAGE_CONFIG["5x5"];
  return Number(exerciseResult.lastSetRpe) >= stageConfig.thresholdRpe;
}

function shouldCompleteStrengthCycle(exerciseResult) {
  return (
    exerciseResult.success &&
    exerciseResult.failureChoice !== "repeat" &&
    exerciseResult.stage === "2x2" &&
    Number(exerciseResult.lastSetRpe) >= 9.5
  );
}

function getPlannedStageLabel(exerciseResult) {
  const currentStage = exerciseResult.stage || "5x5";
  if (exerciseResult.failureChoice === "repeat") {
    return `다음 회차 ${currentStage} 유지`;
  }

  if (shouldAdvanceStrengthStage(exerciseResult)) {
    const nextStage = getNextStrengthStage(currentStage);
    if (nextStage !== currentStage) {
      return `다음 회차 ${nextStage} 예정`;
    }
  }

  return `다음 회차 ${currentStage} 유지`;
}

function buildCurrentSession() {
  return EXERCISES.map((exercise) => {
    const baseline = appState.baselines[exercise];
    const exerciseProgression = appState.exerciseProgressions[exercise] || 1;
    const exercisePhase = getExercisePhase(exercise);
    const stage = getStrengthStage(exercise);
    const isCompleted = Boolean(appState.completedExercises[exercise]);
    const isReadyForStrength = Boolean(appState.readyForStrength[exercise]);
    let phase = appState.phase;
    let sessionLabel = `${getPhaseLabel(phase)} ${exerciseProgression}세션`;
    let summaryText = "";
    let prescribedWeight = 0;
    let setPlan = [];
    let targetRpe = "";

    if (isReadyForStrength) {
      phase = "practice";
      sessionLabel = "연습 완료";
      summaryText = "스트렝스 시작 대기";
      prescribedWeight = appState.manualNextSessionWeights[exercise]
        ?? calculateStrengthSessionWeight(exercise, baseline, 1);
      setPlan = [];
      targetRpe = "";
    } else if (exercisePhase === "high_volume") {
      phase = "high_volume";
      const template = HIGH_VOLUME_TEMPLATES[Math.max(exerciseProgression - 1, 0)] || HIGH_VOLUME_TEMPLATES.at(-1);
      prescribedWeight = appState.manualNextSessionWeights[exercise] ?? calculateHighVolumeSessionWeight(baseline, exerciseProgression);
      setPlan = buildSetPlanFromBlocks(prescribedWeight, template.sets);
      summaryText = template.summary;
      targetRpe = template.rpeTarget;
    } else if (exercisePhase === "practice") {
      phase = "practice";
      const template = PRACTICE_TEMPLATES[Math.max(exerciseProgression - 1, 0)] || PRACTICE_TEMPLATES.at(-1);
      prescribedWeight = appState.manualNextSessionWeights[exercise] ?? calculatePracticeSessionWeight(baseline, exerciseProgression);
      setPlan = buildFixedSetPlan(prescribedWeight, template.targetSets, template.targetReps);
      summaryText = template.summary;
      targetRpe = template.rpeTarget;
    } else {
      phase = "strength";
      const stageConfig = getStrengthStageConfig(exercise);
      prescribedWeight = appState.manualNextSessionWeights[exercise] ?? calculateStrengthSessionWeight(
        exercise,
        baseline,
        exerciseProgression,
      );
      setPlan = buildFixedSetPlan(prescribedWeight, stageConfig.targetSets, stageConfig.targetReps);
      summaryText = stage;
      targetRpe = STRENGTH_STAGE_CONFIG[stage]?.thresholdRpe ? `전환 기준 ${STRENGTH_STAGE_CONFIG[stage].thresholdRpe}` : "";
      sessionLabel = `${getPhaseLabel(phase)} ${exerciseProgression}세션`;
    }

    if (appState.programCompleted && appState.programMode === "high_volume") {
      phase = "complete";
      sessionLabel = "고반복 완료";
    }

    return {
      exercise,
      phase,
      stage,
      isCompleted,
      isReadyForStrength,
      sessionLabel,
      summaryText,
      progression: exerciseProgression,
      prescribedWeight,
      targetSets: setPlan.length,
      targetReps: setPlan[0]?.targetReps || 0,
      setPlan,
      targetRpe,
    };
  });
}

function getLatestHistoryForExercise(exercise) {
  const reversedHistory = appState.history.slice().reverse();
  for (const sessionRecord of reversedHistory) {
    const matchedExercise = sessionRecord.exercises.find((entry) => entry.exercise === exercise);
    if (matchedExercise) {
      return {
        dateLabel: sessionRecord.dateLabel,
        sessionLabel: sessionRecord.sessionLabel,
        ...matchedExercise,
      };
    }
  }

  return null;
}

function getLatestPrRecord(exercise) {
  return appState.latestPrRecords[exercise] || null;
}

function getSessionRecord(exercise) {
  return appState.currentSessionRecords[exercise] || null;
}

function getRecordNavigationState() {
  const session = buildCurrentSession();
  const currentIndex = Math.max(
    session.findIndex((item) => item.exercise === appState.selectedExercise),
    0,
  );
  const completedCount = session.filter((item) => Boolean(appState.currentSessionRecords[item.exercise])).length;

  return {
    session,
    currentIndex,
    total: session.length,
    completedCount,
    previousExercise: session[currentIndex - 1]?.exercise || "",
    nextExercise: session[currentIndex + 1]?.exercise || "",
  };
}

function getExerciseCardState(exercise) {
  if (appState.readyForStrength[exercise]) {
    return {
      statusClass: "done",
      statusLabel: "스트렝스 시작 가능",
      planLabel: "연습 2세션이 끝났습니다. 바로 스트렝스로 전환하거나, 연습 1세션을 더 진행할 수 있습니다.",
    };
  }

  if (appState.programMode === "high_volume" && appState.completedExercises[exercise]) {
    return {
      statusClass: "done",
      statusLabel: "10RM 테스트 가능",
      planLabel: "이 운동은 고반복 마지막 세션을 끝냈습니다. 바로 10RM 테스트를 기록할 수 있습니다.",
    };
  }

  if (appState.completedExercises[exercise]) {
    return {
      statusClass: "done",
      statusLabel: "사이클 완료",
      planLabel: "이 운동은 스트렝스 사이클이 끝났습니다. PR 테스트나 새 사이클 시작을 권장합니다.",
    };
  }

  const record = getSessionRecord(exercise);
  if (!record) {
    return {
      statusClass: "pending",
      statusLabel: "아직 기록 전",
      planLabel: "기록 후 다음 회차 진행 방식을 고를 수 있습니다.",
    };
  }

  const successLabel = record.success ? "기록 완료" : "실패 기록됨";
  const choiceToPlan = {
    continue: "다음 회차 정상 진행 예정",
    repeat: "다음 회차도 동일 중량 예정",
    backoff: record.success ? "정상 진행 예정" : "백오프 후 다음 회차 진행 예정",
    adjust: "다음 회차 감량 예정",
  };
  const phasePlan = record.phase === "strength"
    ? getPlannedStageLabel(record)
    : `다음 회차 ${record.sessionLabel || getPhaseLabel(record.phase)} 기준으로 진행`;

  return {
    statusClass: record.success ? "done" : "alert",
    statusLabel: successLabel,
    planLabel: `${choiceToPlan[record.failureChoice] || "다음 회차 진행 방식 미정"} · ${phasePlan}`,
  };
}

function buildEmptyExerciseRecord(item) {
  return {
    exercise: item.exercise,
    phase: item.phase,
    sessionLabel: item.sessionLabel,
    summaryText: item.summaryText,
    prescribedWeight: item.prescribedWeight,
    targetSets: item.targetSets,
    targetReps: item.targetReps,
    setPlan: item.setPlan,
    actualSets: item.setPlan.map((set) => ({
      weight: set.targetWeight,
      reps: 0,
    })),
    lastSetRpe: "",
    note: "",
    success: true,
    failureChoice: "backoff",
    backoffEntries: [],
  };
}

function updateSetupInputs() {
  userNameInput.value = appState.userName;
  plateIncrementInput.value = appState.plateIncrement;
  programModeInputs.forEach((input) => {
    input.checked = input.value === appState.programMode;
  });
  includePracticeInput.checked = appState.includePracticePhase;
  practiceToggleRow.hidden = appState.programMode !== "strength";

  baselineInputs.forEach((input) => {
    const exercise = input.dataset.exercise;
    const field = input.dataset.field;
    input.value = appState.baselines[exercise][field];
  });
}

function renderSetupPreview() {
  const previewItems = EXERCISES.map((exercise) => {
    const baseline = appState.baselines[exercise];
    const estimatedOneRepMax = calculateEstimatedOneRepMax(baseline.weight, baseline.reps);
    const highVolumeStartWeight = calculateHighVolumeStartWeight(estimatedOneRepMax);
    const practiceStartWeight = calculatePracticeSessionWeight(baseline, 1);
    const strengthStartWeight = calculateStrengthStartWeight(estimatedOneRepMax);

    return `
      <div class="preview-item">
        <p class="preview-title">${exercise}</p>
        <p class="preview-main">예상 1RM ${formatWeight(estimatedOneRepMax)}</p>
        <p class="muted">고반복 시작 ${formatWeight(highVolumeStartWeight)}</p>
        <p class="muted">연습 시작 ${formatWeight(practiceStartWeight)}</p>
        <p class="muted">스트렝스 시작 ${formatWeight(strengthStartWeight)}</p>
      </div>
    `;
  }).join("");

  setupPreview.innerHTML = previewItems;
}

function buildScheduleRows() {
  if (appState.programMode === "high_volume") {
    const highVolumeRows = HIGH_VOLUME_TEMPLATES.map((template, index) => {
      const cells = EXERCISES.map((exercise) => {
        const baseline = appState.baselines[exercise];
        return formatWeight(calculateHighVolumeSessionWeight(baseline, index + 1));
      });

      return {
        phase: "고반복",
        session: `${index + 1}세션`,
        structure: template.summary,
        note: `목표 RPE ${template.rpeTarget}`,
        cells,
      };
    });

    const highVolumeTestCells = EXERCISES.map((exercise) => {
      const baseline = appState.baselines[exercise];
      return formatWeight(calculateHighVolumeSessionWeight(baseline, HIGH_VOLUME_TEMPLATES.length + 1));
    });

    highVolumeRows.push({
      phase: "테스트",
      session: "10RM",
      structure: "10RM 테스트",
      note: "엑셀 참고표 마지막 10회 기준 중량으로 테스트",
      cells: highVolumeTestCells,
    });

    return highVolumeRows;
  }

  const rows = [];
  if (appState.includePracticePhase) {
    PRACTICE_TEMPLATES.forEach((template, index) => {
      rows.push({
        phase: "연습",
        session: `${index + 1}세션`,
        structure: template.summary,
        note: `목표 RPE ${template.rpeTarget}`,
        cells: EXERCISES.map((exercise) => formatWeight(
          calculatePracticeSessionWeight(appState.baselines[exercise], index + 1),
        )),
      });
    });
  }

  const strengthStartCells = EXERCISES.map((exercise) => calculateStrengthSessionWeight(
    exercise,
    appState.baselines[exercise],
    1,
  ));
  const strength5x5RefCells = strengthStartCells.map((startWeight) =>
    calculateStrengthReferenceWeightFromStart(startWeight, 7.5));
  const strength4x4RefCells = strengthStartCells.map((startWeight) =>
    calculateStrengthReferenceWeightFromStart(startWeight, 6));
  const strength3x3RefCells = strengthStartCells.map((startWeight) =>
    calculateStrengthReferenceWeightFromStart(startWeight, 4.5));
  const strength2x2RefCells = strengthStartCells.map((startWeight) =>
    calculateStrengthReferenceWeightFromStart(startWeight, 3));

  rows.push({
    phase: "스트렝스",
    session: "시작",
    structure: "1RM 65%",
    note: "스트렝스 시작 중량",
    cells: strengthStartCells.map((weight) => formatWeight(weight)),
  });
  rows.push({
    phase: "스트렝스",
    session: "5x5",
    structure: "5x5",
    note: "엑셀 참고치 · 목표 RPE <8",
    cells: strength5x5RefCells.map((weight) => formatWeight(weight)),
  });
  rows.push({
    phase: "스트렝스",
    session: "4x4",
    structure: "4x4",
    note: "엑셀 참고치 · 목표 RPE 8",
    cells: strength4x4RefCells.map((weight) => formatWeight(weight)),
  });
  rows.push({
    phase: "스트렝스",
    session: "3x3",
    structure: "3x3",
    note: "엑셀 참고치 · 목표 RPE 8.5",
    cells: strength3x3RefCells.map((weight) => formatWeight(weight)),
  });
  rows.push({
    phase: "스트렝스",
    session: "2x2",
    structure: "2x2",
    note: "엑셀 참고치 · 목표 RPE 8.5~9",
    cells: strength2x2RefCells.map((weight) => formatWeight(weight)),
  });
  rows.push({
    phase: "테스트",
    session: "마무리",
    structure: "PR 테스트",
    note: "2x2 마지막 세트 RPE 9.5 이상 시 권장",
    cells: EXERCISES.map(() => "선택"),
  });

  return rows;
}

function renderProgramSchedulePreview() {
  if (!programSchedulePreview && !todayProgramSchedulePreview) {
    return;
  }

  const rows = buildScheduleRows();
  const previewMarkup = `
    <div class="schedule-table-wrap">
      <table class="schedule-table">
        <thead>
          <tr>
            <th>단계</th>
            <th>세션</th>
            <th>구성</th>
            <th>Squat</th>
            <th>Bench Press</th>
            <th>Deadlift</th>
            <th>Press</th>
            <th>비고</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((row) => `
            <tr>
              <td class="schedule-phase">${row.phase}</td>
              <td>${row.session}</td>
              <td>${row.structure}</td>
              ${row.cells.map((cell) => `<td>${cell}</td>`).join("")}
              <td class="schedule-note">${row.note}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;

  if (programSchedulePreview) {
    programSchedulePreview.innerHTML = previewMarkup;
  }

  if (todayProgramSchedulePreview) {
    todayProgramSchedulePreview.innerHTML = previewMarkup;
  }
}

function renderSummary() {
  summarySessionLabel.textContent = getCurrentPhaseSessionLabel();
  const adjustedExercises = Object.keys(appState.manualNextSessionWeights);
  const completedExercises = EXERCISES.filter((exercise) => appState.completedExercises[exercise]);
  const readyForStrengthExercises = EXERCISES.filter((exercise) => appState.readyForStrength[exercise]);

  if (appState.programMode === "high_volume" && completedExercises.length === EXERCISES.length) {
    summaryNote.textContent = "모든 운동이 고반복을 마쳤습니다. 각 운동의 10RM 테스트를 기록할 수 있습니다.";
    return;
  }

  if (readyForStrengthExercises.length) {
    summaryNote.textContent =
      `${readyForStrengthExercises.join(", ")}은 연습 2세션을 마쳐 스트렝스 시작 또는 연습 1세션 추가를 선택할 수 있습니다.`;
    return;
  }

  if (completedExercises.length === EXERCISES.length) {
    summaryNote.textContent = "모든 주요 운동의 스트렝스 사이클이 끝났습니다. PR 테스트 또는 새 사이클을 시작할 수 있습니다.";
    return;
  }

  if (completedExercises.length) {
    summaryNote.textContent =
      `${completedExercises.join(", ")}은 사이클 완료 상태입니다. 나머지 운동은 계속 진행할 수 있습니다.`;
    return;
  }

  if (adjustedExercises.length) {
    summaryNote.textContent =
      `${adjustedExercises.join(", ")}은 이전 실패 선택에 따라 조정된 중량으로 계산되고 있습니다.`;
    return;
  }

  if (appState.phase === "practice") {
    summaryNote.textContent = "연습 파트를 마친 운동은 스트렝스 시작 또는 연습 1세션 추가를 선택할 수 있습니다.";
    return;
  }

  if (appState.phase === "high_volume") {
    summaryNote.textContent = "고반복 프로그램은 엑셀 참고표 기준 7개 작업 세션 뒤 10RM 테스트로 이어집니다.";
    return;
  }

  summaryNote.textContent = `${appState.userName}님의 기준 기록으로 현재 단계 세션이 계산되고 있습니다.`;
}

function renderTodayScreen() {
  const session = buildCurrentSession();
  const adjustedExercises = Object.keys(appState.manualNextSessionWeights);

  todaySessionTitle.textContent = getCurrentPhaseSessionLabel();
  const completedExercises = session.filter((item) => item.isCompleted).map((item) => item.exercise);
  const readyForStrengthExercises = session.filter((item) => item.isReadyForStrength).map((item) => item.exercise);
  todaySessionCopy.textContent = completedExercises.length && appState.programMode === "high_volume"
    ? `${completedExercises.join(", ")}은 고반복을 마쳐서 바로 10RM 테스트로 넘어갈 수 있습니다.`
    : readyForStrengthExercises.length
    ? `${readyForStrengthExercises.join(", ")}은 연습을 마쳐 스트렝스 시작 또는 연습 1세션 추가를 고를 수 있습니다.`
    : completedExercises.length
    ? `${completedExercises.join(", ")}은 사이클이 끝나서 PR 테스트 권장 상태입니다.`
    : appState.phase === "practice"
    ? "연습 파트에서는 가벼운 중량으로 자세와 리듬을 점검한 뒤 스트렝스로 넘어갑니다."
    : appState.phase === "high_volume"
    ? "고반복 세션은 엑셀 구성 참고치 기준으로 진행되고, 마지막엔 10RM 테스트로 이어집니다."
    : adjustedExercises.length
    ? `${adjustedExercises.join(", ")}은 실패 선택에 따라 조정된 중량이 적용되어 있습니다.`
    : "이번 세션에서 할 운동을 선택해서 하나씩 기록할 수 있습니다.";
  todayIncrementSummary.textContent = appState.phase === "strength"
    ? "스쿼트/데드 5kg, 벤치/프레스 2.5kg"
    : "세션 템플릿에 맞춰 자동 계산";

  todayExerciseGrid.innerHTML = session.map((item) => {
    const cardState = getExerciseCardState(item.exercise);

    return `
    <article class="exercise-card">
      <p class="exercise-name">${item.exercise}</p>
      <p class="exercise-main">${formatWeight(item.prescribedWeight)}</p>
      <p class="exercise-sub">${item.phase === "strength" ? item.stage : item.summaryText} · ${item.sessionLabel}</p>
      <span class="exercise-status ${cardState.statusClass}">
        ${cardState.statusLabel}
      </span>
      <p class="exercise-plan">${cardState.planLabel}</p>
      <div class="exercise-actions">
        ${item.isReadyForStrength
          ? `
            <button class="secondary-button" data-start-strength-exercise="${item.exercise}">이 운동 스트렝스 시작</button>
            <button class="secondary-button" data-extra-practice-exercise="${item.exercise}">연습 1세션 더</button>
          `
          : item.isCompleted
          ? `<button class="secondary-button" data-open-pr="${item.exercise}">${appState.programMode === "high_volume" ? "10RM 테스트 열기" : "PR 테스트 열기"}</button>`
          : `<button class="secondary-button" data-open-exercise="${item.exercise}">이 운동 기록하기</button>`
        }
      </div>
    </article>
  `;
  }).join("");

  document.querySelectorAll("[data-open-exercise]").forEach((button) => {
    button.addEventListener("click", () => {
      appState.selectedExercise = button.dataset.openExercise;
      saveState();
      renderRecordScreen();
      showScreen("record");
    });
  });

  document.querySelectorAll("[data-open-pr]").forEach((button) => {
    button.addEventListener("click", () => {
      appState.selectedPrExercise = button.dataset.openPr;
      saveState();
      renderPrScreen();
      showScreen("pr");
    });
  });

  document.querySelectorAll("[data-start-strength-exercise]").forEach((button) => {
    button.addEventListener("click", () => {
      startStrengthForExercise(button.dataset.startStrengthExercise);
    });
  });

  document.querySelectorAll("[data-extra-practice-exercise]").forEach((button) => {
    button.addEventListener("click", () => {
      startExtraPracticeForExercise(button.dataset.extraPracticeExercise);
    });
  });
}

function buildSetRows(exercise, prescribedWeight, targetSets, targetReps) {
  return Array.from({ length: targetSets }, (_, index) => `
    <div class="sets-row">
      <span>${index + 1}</span>
      <span>${formatWeight(prescribedWeight)} x ${targetReps}</span>
      <input
        type="number"
        step="0.5"
        inputmode="decimal"
        data-record-exercise="${exercise}"
        data-record-kind="weight"
        data-set-order="${index + 1}"
        value="${prescribedWeight}"
      />
      <input
        type="number"
        step="1"
        inputmode="numeric"
        data-record-exercise="${exercise}"
        data-record-kind="reps"
        data-set-order="${index + 1}"
        value="${targetReps}"
      />
    </div>
  `).join("");
}

function renderRecordScreen() {
  const session = buildCurrentSession();
  const selectedItem = session.find((item) => item.exercise === appState.selectedExercise) || session[0];
  const navigation = getRecordNavigationState();
  if (selectedItem.isReadyForStrength) {
    recordExerciseList.innerHTML = `
      <div class="card record-card">
        <div class="section-title-row">
          <div>
            <p class="card-title">${selectedItem.exercise}</p>
            <p class="record-meta">이 운동은 연습 2세션을 마쳤습니다.</p>
            <p class="record-progress">${navigation.currentIndex + 1} / ${navigation.total} 운동 · 저장 ${navigation.completedCount}개</p>
          </div>
          <span class="pill success">스트렝스 시작 가능</span>
        </div>
        <p class="muted">세션 화면으로 돌아가서 이 운동 스트렝스 시작 버튼을 누르면 자동으로 스트렝스로 넘어갑니다.</p>
      </div>
    `;
    backoffSummary.textContent = "연습이 끝난 운동은 스트렝스 시작 여부를 선택할 수 있습니다.";
    return;
  }

  if (selectedItem.isCompleted) {
    recordExerciseList.innerHTML = `
      <div class="card record-card">
        <div class="section-title-row">
          <div>
            <p class="card-title">${selectedItem.exercise}</p>
            <p class="record-meta">${appState.programMode === "high_volume" ? "이 운동은 고반복 마지막 세션을 끝냈습니다." : "이 운동은 스트렝스 사이클이 끝났습니다."}</p>
            <p class="record-progress">${navigation.currentIndex + 1} / ${navigation.total} 운동 · 저장 ${navigation.completedCount}개</p>
          </div>
          <span class="pill success">${appState.programMode === "high_volume" ? "10RM 테스트 권장" : "PR 테스트 권장"}</span>
        </div>
        <p class="muted">${appState.programMode === "high_volume"
          ? "바로 10RM 테스트를 기록하고, 원하면 이 기록으로 새 기준 기록을 시작하면 됩니다."
          : "다음으로는 PR을 측정하거나, 새 기준 기록으로 다음 사이클을 시작하면 됩니다."}
        </p>
      </div>
    `;
    backoffSummary.textContent = "완료된 운동에는 더 이상 백오프 계산이 필요하지 않습니다.";
    return;
  }

  const savedRecord = getSessionRecord(selectedItem.exercise) || buildEmptyExerciseRecord(selectedItem);

  recordExerciseList.innerHTML = `
    <div class="card record-card">
        <div class="section-title-row">
          <div>
            <p class="card-title">${selectedItem.exercise}</p>
            <p class="record-meta">목표 ${formatWeight(selectedItem.prescribedWeight)} / ${selectedItem.phase === "strength" ? selectedItem.stage : selectedItem.summaryText}</p>
            <p class="record-progress">${navigation.currentIndex + 1} / ${navigation.total} 운동 · 저장 ${navigation.completedCount}개</p>
          </div>
          <div class="record-header-actions">
            <button class="secondary-button mini-button target-success-button" type="button" data-target-success="${selectedItem.exercise}">
              목표 성공
            </button>
            <span class="pill">${savedRecord.success ? "기록 준비 완료" : "실패로 판정됨"}</span>
          </div>
        </div>

      <div class="sets-table compact-record-table">
        ${selectedItem.setPlan.map((set, index) => `
          <div class="sets-row">
            <div class="set-line-label">
              <span class="set-chip">${set.label}</span>
              <span class="set-target-inline">${formatWeight(set.targetWeight)} x ${set.targetReps}</span>
            </div>
            <input
              type="number"
              step="0.5"
              inputmode="decimal"
              data-record-exercise="${selectedItem.exercise}"
              data-record-kind="weight"
              data-set-order="${index + 1}"
              placeholder="무게"
              value="${savedRecord.actualSets[index].weight}"
            />
            <input
              type="number"
              step="1"
              inputmode="numeric"
              data-record-exercise="${selectedItem.exercise}"
              data-record-kind="reps"
              data-set-order="${index + 1}"
              placeholder="횟수"
              value="${savedRecord.actualSets[index].reps === 0 ? "" : savedRecord.actualSets[index].reps}"
            />
          </div>
        `).join("")}
      </div>

      <div class="form-grid two-column compact">
        <label>
          <span>마지막 세트 RPE</span>
          <input type="number" inputmode="decimal" step="0.5" data-rpe-exercise="${selectedItem.exercise}" value="${savedRecord.lastSetRpe}" />
        </label>
        <label>
          <span>메모</span>
          <input type="text" data-note-exercise="${selectedItem.exercise}" value="${savedRecord.note}" placeholder="느낌을 짧게 적어두세요" />
        </label>
      </div>

      <div id="backoff-input-area"></div>
    </div>
  `;

  backoffSummary.textContent = "백오프 추천은 실패한 운동이 있으면 계산됩니다.";
  prevExerciseButton.disabled = !navigation.previousExercise;
  nextExerciseButton.disabled = !navigation.nextExercise;
  attachRecordInputListeners();
  attachFailureChoiceListeners(savedRecord.failureChoice);
  renderLiveBackoffSummary();
}

function navigateRecordExercise(direction) {
  const navigation = getRecordNavigationState();
  const targetExercise = direction === "prev"
    ? navigation.previousExercise
    : navigation.nextExercise;

  if (!targetExercise) {
    return;
  }

  appState.selectedExercise = targetExercise;
  saveState();
  rerender();
  showScreen("record");
}

function renderPrScreen() {
  const prEligibleExercises = getPrEligibleExercises();
  if (!prEligibleExercises.length) {
    prExerciseFilters.innerHTML = "";
    prContent.innerHTML = `
      <div class="card">
        <p class="card-title">아직 ${getPrTestTitle()} 대상이 없습니다.</p>
        <p class="muted">스트렝스는 2x2 종료 후, 고반복은 마지막 세션 완료 후 여기서 테스트를 기록할 수 있습니다.</p>
      </div>
    `;
    return;
  }

  if (!prEligibleExercises.includes(appState.selectedPrExercise)) {
    [appState.selectedPrExercise] = prEligibleExercises;
  }

  const exercise = appState.selectedPrExercise;
  const baseline = appState.baselines[exercise];
  const latestHistory = getLatestHistoryForExercise(exercise);
  const savedPr = getLatestPrRecord(exercise);

  prExerciseFilters.innerHTML = prEligibleExercises.map((item) => `
    <button class="filter-chip ${item === exercise ? "active-chip" : ""}" data-pr-exercise="${item}">
      ${item}
    </button>
  `).join("");

  const defaultWeight = savedPr?.weight ?? latestHistory?.prescribedWeight ?? baseline.weight;
  const defaultReps = savedPr?.reps ?? (isHighVolumeTestContext() ? 10 : 1);
  const defaultRpe = savedPr?.rpe ?? 10;
  const defaultNote = savedPr?.note ?? "";
  const missingTenRmExercises = getMissingTenRmExercises();
  const showStrengthTransition = isHighVolumeTestContext();

  prContent.innerHTML = `
    <div class="card">
      <div class="section-title-row">
        <div>
          <p class="card-title">${exercise}</p>
          <p class="muted">완료된 운동의 ${getPrTestTitle()} 기록을 남기고, 원하면 이 기록으로 새 사이클을 시작할 수 있습니다.</p>
        </div>
        <span class="pill success">${isHighVolumeTestContext() ? "고반복 완료" : "사이클 완료"}</span>
      </div>

      <div class="preview-grid">
        <div class="preview-item">
          <p class="preview-title">현재 기준 기록</p>
          <p class="preview-main">${formatWeight(baseline.weight)} x ${baseline.reps}</p>
        </div>
        <div class="preview-item">
          <p class="preview-title">최근 완료 세션</p>
          <p class="preview-main">${latestHistory ? `${latestHistory.sessionLabel} / ${latestHistory.stage}` : "기록 없음"}</p>
          <p class="muted">${latestHistory ? `${formatWeight(latestHistory.prescribedWeight)} / ${latestHistory.dateLabel}` : ""}</p>
        </div>
        <div class="preview-item">
          <p class="preview-title">최근 저장 ${getPrMetricLabel()}</p>
          <p class="preview-main">${savedPr ? `${formatWeight(savedPr.weight)} x ${savedPr.reps}` : "아직 없음"}</p>
          <p class="muted">${savedPr ? `${savedPr.dateLabel} / RPE ${savedPr.rpe}` : ""}</p>
        </div>
      </div>

      <div class="form-grid two-column compact">
        <label>
          <span>${getPrMetricLabel()} 중량</span>
          <input id="pr-weight-input" type="number" inputmode="decimal" step="0.5" value="${defaultWeight}" />
        </label>
        <label>
          <span>${getPrMetricLabel()} 반복</span>
          <input id="pr-reps-input" type="number" inputmode="numeric" step="1" value="${defaultReps}" />
        </label>
        <label>
          <span>${getPrMetricLabel()} RPE</span>
          <input id="pr-rpe-input" type="number" inputmode="decimal" step="0.5" value="${defaultRpe}" />
        </label>
        <label>
          <span>메모</span>
          <input id="pr-note-input" type="text" value="${defaultNote}" placeholder="테스트 느낌을 적어두세요" />
        </label>
      </div>

      <p class="record-meta" id="pr-status-message">${getPrTestTitle()} 기록을 저장한 뒤 이 기록으로 새 사이클을 다시 시작할 수 있습니다.</p>

      <div class="header-actions pr-actions">
        <button class="secondary-button" id="save-pr-button">${getPrTestTitle()} 기록 저장</button>
        <button class="primary-button" id="start-new-cycle-button">이 기록으로 새 사이클 시작</button>
      </div>

      ${showStrengthTransition ? `
        <div class="backoff-box">
          <p class="backoff-title">스트렝스로 이어가기</p>
          <p class="backoff-note">
            ${missingTenRmExercises.length
              ? `${missingTenRmExercises.join(", ")}은 기존 기준 기록을 유지하고, 저장된 10RM만 반영해서 스트렝스로 넘어갑니다.`
              : "저장된 10RM 기록을 새 기준 기록으로 반영하고 스트렝스 프로그램으로 넘어갑니다."
            }
          </p>
          <label class="toggle-row">
            <input id="pr-include-practice-input" type="checkbox" ${appState.includePracticePhase ? "checked" : ""} />
            <span>스트렝스 시작 전 연습 세션 2회 포함</span>
          </label>
          <div class="header-actions pr-actions">
            <button class="primary-button" id="start-strength-from-high-volume-button">이 기록들로 스트렝스 시작</button>
          </div>
        </div>
      ` : ""}
    </div>
  `;

  document.querySelectorAll("[data-pr-exercise]").forEach((button) => {
    button.addEventListener("click", () => {
      appState.selectedPrExercise = button.dataset.prExercise;
      saveState();
      renderPrScreen();
    });
  });

  document.getElementById("save-pr-button")?.addEventListener("click", handleSavePrRecord);
  document.getElementById("start-new-cycle-button")?.addEventListener("click", handleStartNewCycle);
  document.getElementById("start-strength-from-high-volume-button")?.addEventListener("click", handleStartStrengthFromHighVolume);
}

function collectPrRecord() {
  const prEligibleExercises = getPrEligibleExercises();
  const exercise = prEligibleExercises.includes(appState.selectedPrExercise)
    ? appState.selectedPrExercise
    : prEligibleExercises[0];
  const weight = Number(document.getElementById("pr-weight-input")?.value);
  const reps = Number(document.getElementById("pr-reps-input")?.value);
  const rpe = Number(document.getElementById("pr-rpe-input")?.value);
  const note = document.getElementById("pr-note-input")?.value?.trim() || "";

  return {
    exercise,
    weight,
    reps,
    rpe,
    note,
    testType: getPrMetricLabel(),
  };
}

function setPrStatusMessage(message) {
  const statusMessage = document.getElementById("pr-status-message");
  if (statusMessage) {
    statusMessage.textContent = message;
  }
}

function buildPrRecordWithDate(prRecord, overrides = {}) {
  const dateLabel = new Date().toLocaleDateString("ko-KR", {
    month: "numeric",
    day: "numeric",
  });

  return {
    ...prRecord,
    dateLabel,
    appliedToBaseline: false,
    ...overrides,
  };
}

function isSamePrRecord(left, right) {
  return (
    left.exercise === right.exercise &&
    left.weight === right.weight &&
    left.reps === right.reps &&
    left.rpe === right.rpe &&
    (left.note || "") === (right.note || "")
  );
}

function markPrRecordApplied(prRecord, baselineAppliedDateLabel) {
  if (!prRecord) {
    return;
  }

  const matchingIndex = appState.prHistory.findIndex((entry) => (
    entry.testType === prRecord.testType && isSamePrRecord(entry, prRecord)
  ));

  if (matchingIndex !== -1) {
    appState.prHistory[matchingIndex] = {
      ...appState.prHistory[matchingIndex],
      appliedToBaseline: true,
      baselineAppliedDateLabel,
    };
    appState.latestPrRecords[prRecord.exercise] = appState.prHistory[matchingIndex];
    upsertPrWorkoutHistory(appState.prHistory[matchingIndex]);
    return;
  }

  const appliedRecord = {
    ...prRecord,
    appliedToBaseline: true,
    baselineAppliedDateLabel,
  };
  appState.prHistory.push(appliedRecord);
  appState.latestPrRecords[prRecord.exercise] = appliedRecord;
  upsertPrWorkoutHistory(appliedRecord);
}

function upsertPrWorkoutHistory(recordWithDate) {
  const sessionLabel = `${recordWithDate.testType} 테스트`;
  const exerciseEntry = {
    exercise: recordWithDate.exercise,
    phase: "test",
    sessionLabel,
    summaryText: recordWithDate.testType,
    prescribedWeight: recordWithDate.weight,
    stage: recordWithDate.testType,
    targetSets: 1,
    targetReps: recordWithDate.reps,
    setPlan: [
      {
        setOrder: 1,
        label: recordWithDate.testType,
        targetWeight: recordWithDate.weight,
        targetReps: recordWithDate.reps,
        setType: "test_set",
      },
    ],
    success: true,
    cycleCompleted: false,
    lastSetRpe: recordWithDate.rpe,
    note: recordWithDate.note,
    actualSets: [
      {
        weight: recordWithDate.weight,
        reps: recordWithDate.reps,
      },
    ],
    backoffEntries: [],
    failureChoice: "continue",
    failureChoiceLabel: "테스트 기록",
  };

  const latestHistoryIndex = appState.history.length - 1;
  const latestHistory = appState.history[latestHistoryIndex];
  const sameLatestEntry = latestHistory
    && latestHistory.sessionLabel === sessionLabel
    && latestHistory.dateLabel === recordWithDate.dateLabel
    && latestHistory.exercises.length === 1
    && isSamePrRecord(
      {
        exercise: latestHistory.exercises[0].exercise,
        weight: latestHistory.exercises[0].actualSets?.[0]?.weight,
        reps: latestHistory.exercises[0].actualSets?.[0]?.reps,
        rpe: latestHistory.exercises[0].lastSetRpe,
        note: latestHistory.exercises[0].note,
      },
      recordWithDate,
    );

  if (sameLatestEntry) {
    appState.history[latestHistoryIndex] = {
      ...latestHistory,
      exercises: [exerciseEntry],
    };
    return;
  }

  appState.history.push({
    dateLabel: recordWithDate.dateLabel,
    sessionLabel,
    exercises: [exerciseEntry],
  });
}

function savePrHistoryEntry(prRecord, options = {}) {
  const recordWithDate = buildPrRecordWithDate(prRecord, options);
  const latestEntryIndex = appState.prHistory.length - 1;
  const latestEntry = appState.prHistory[latestEntryIndex];

  if (
    latestEntry &&
    isSamePrRecord(latestEntry, recordWithDate) &&
    options.appliedToBaseline
  ) {
    appState.prHistory[latestEntryIndex] = {
      ...latestEntry,
      appliedToBaseline: true,
      baselineAppliedDateLabel: recordWithDate.dateLabel,
    };
    appState.latestPrRecords[prRecord.exercise] = appState.prHistory[latestEntryIndex];
    upsertPrWorkoutHistory(appState.prHistory[latestEntryIndex]);
    return appState.prHistory[latestEntryIndex];
  }

  appState.latestPrRecords[prRecord.exercise] = recordWithDate;
  appState.prHistory.push(recordWithDate);
  upsertPrWorkoutHistory(recordWithDate);
  return recordWithDate;
}

function handleSavePrRecord() {
  const prRecord = collectPrRecord();
  if (
    !prRecord.exercise ||
    !Number.isFinite(prRecord.weight) ||
    !Number.isFinite(prRecord.reps) ||
    prRecord.weight <= 0 ||
    prRecord.reps <= 0
  ) {
    setPrStatusMessage("PR 기록을 저장하려면 중량과 반복을 모두 올바르게 입력해 주세요.");
    return;
  }

  savePrHistoryEntry(prRecord);
  saveState();
  rerender();
  setPrStatusMessage(`${getPrTestTitle()} 기록이 저장되었습니다. 원하면 이 기록으로 새 사이클을 시작하거나 스트렝스로 이어갈 수 있습니다.`);
}

function handleStartNewCycle() {
  const prRecord = collectPrRecord();
  if (
    !prRecord.exercise ||
    !Number.isFinite(prRecord.weight) ||
    !Number.isFinite(prRecord.reps) ||
    prRecord.weight <= 0 ||
    prRecord.reps <= 0
  ) {
    setPrStatusMessage("새 사이클을 시작하려면 사용할 PR 중량과 반복을 먼저 입력해 주세요.");
    return;
  }

  savePrHistoryEntry(prRecord, {
    appliedToBaseline: true,
    baselineAppliedDateLabel: new Date().toLocaleDateString("ko-KR", {
      month: "numeric",
      day: "numeric",
    }),
  });
  appState.baselines[prRecord.exercise] = {
    weight: prRecord.weight,
    reps: prRecord.reps,
  };
  appState.exerciseProgressions[prRecord.exercise] = 1;
  appState.exerciseStrengthStages[prRecord.exercise] = "5x5";
  appState.completedExercises[prRecord.exercise] = false;
  delete appState.manualNextSessionWeights[prRecord.exercise];
  delete appState.currentSessionRecords[prRecord.exercise];
  appState.selectedExercise = prRecord.exercise;
  saveState();
  rerender();
  showScreen("today");
}

function handleStartStrengthFromHighVolume() {
  const baselineAppliedDateLabel = new Date().toLocaleDateString("ko-KR", {
    month: "numeric",
    day: "numeric",
  });
  const currentPrRecord = collectPrRecord();
  if (
    currentPrRecord.exercise &&
    Number.isFinite(currentPrRecord.weight) &&
    Number.isFinite(currentPrRecord.reps) &&
    currentPrRecord.weight > 0 &&
    currentPrRecord.reps > 0
  ) {
    savePrHistoryEntry(currentPrRecord);
  }

  EXERCISES.forEach((exercise) => {
    const latestTenRmRecord = appState.latestPrRecords[exercise];
    if (latestTenRmRecord?.testType === "10RM") {
      appState.baselines[exercise] = {
        weight: latestTenRmRecord.weight,
        reps: latestTenRmRecord.reps,
      };
      markPrRecordApplied(latestTenRmRecord, baselineAppliedDateLabel);
    }
  });

  appState.programMode = "strength";
  appState.includePracticePhase = Boolean(document.getElementById("pr-include-practice-input")?.checked);
  appState.phase = appState.includePracticePhase ? "practice" : "strength";
  appState.programCompleted = false;
  appState.exercisePhases = {
    Squat: appState.phase,
    "Bench Press": appState.phase,
    Deadlift: appState.phase,
    Press: appState.phase,
  };
  appState.readyForStrength = {
    Squat: false,
    "Bench Press": false,
    Deadlift: false,
    Press: false,
  };
  appState.exerciseProgressions = {
    Squat: 1,
    "Bench Press": 1,
    Deadlift: 1,
    Press: 1,
  };
  appState.exerciseStrengthStages = {
    Squat: "5x5",
    "Bench Press": "5x5",
    Deadlift: "5x5",
    Press: "5x5",
  };
  appState.completedExercises = {
    Squat: false,
    "Bench Press": false,
    Deadlift: false,
    Press: false,
  };
  appState.manualNextSessionWeights = {};
  appState.currentSessionRecords = {};
  appState.selectedExercise = "Squat";
  appState.selectedPrExercise = "Squat";

  saveState();
  rerender();
  showScreen("today");
}

function startStrengthForExercise(exercise) {
  appState.exercisePhases[exercise] = "strength";
  appState.readyForStrength[exercise] = false;
  appState.exerciseProgressions[exercise] = 1;
  appState.exerciseStrengthStages[exercise] = "5x5";
  appState.completedExercises[exercise] = false;
  delete appState.manualNextSessionWeights[exercise];
  delete appState.currentSessionRecords[exercise];
  appState.selectedExercise = exercise;
  syncGlobalPhaseFromExercises();
  saveState();
  rerender();
  showScreen("today");
}

function startExtraPracticeForExercise(exercise) {
  appState.exercisePhases[exercise] = "practice";
  appState.readyForStrength[exercise] = false;
  appState.exerciseProgressions[exercise] = PRACTICE_TEMPLATES.length;
  delete appState.manualNextSessionWeights[exercise];
  delete appState.currentSessionRecords[exercise];
  appState.selectedExercise = exercise;
  syncGlobalPhaseFromExercises();
  saveState();
  rerender();
  showScreen("today");
}

function calculateBackoffRecommendation(failedExercise) {
  if (!failedExercise) {
    return null;
  }

  const referenceWeight = failedExercise.setPlan?.[0]?.targetWeight || failedExercise.prescribedWeight;
  const targetVolume = (failedExercise.setPlan || []).reduce(
    (sum, set) => sum + (set.targetWeight * set.targetReps),
    0,
  );
  const actualVolume = (failedExercise.setPlan || []).reduce((sum, set, index) => {
    const actualSet = failedExercise.actualSets[index];
    const completedReps = Math.min(actualSet?.reps || 0, set.targetReps);
    return sum + (set.targetWeight * completedReps);
  }, 0);
  const backoffWeight = roundToLoadableWeight(referenceWeight * 0.9);
  const missingVolume = Math.max(targetVolume - actualVolume, 0);
  const backoffSets = backoffWeight > 0 ? Math.floor(missingVolume / backoffWeight) : 0;

  return {
    exercise: failedExercise.exercise,
    backoffWeight,
    backoffSets: Math.max(backoffSets, 1),
  };
}

function collectSelectedExerciseResult() {
  const session = buildCurrentSession();
  const item = session.find((exercise) => exercise.exercise === appState.selectedExercise) || session[0];
  const actualSets = item.setPlan.map((set, index) => {
    const weightInput = document.querySelector(
      `[data-record-exercise="${item.exercise}"][data-record-kind="weight"][data-set-order="${index + 1}"]`,
    );
    const repsInput = document.querySelector(
      `[data-record-exercise="${item.exercise}"][data-record-kind="reps"][data-set-order="${index + 1}"]`,
    );

    return {
      weight: Number(weightInput.value),
      reps: Number(repsInput.value),
    };
  });

  const lastSetRpeInput = document.querySelector(`[data-rpe-exercise="${item.exercise}"]`);
  const lastSetRpe = lastSetRpeInput.value === "" ? "" : Number(lastSetRpeInput.value);
  const note = document.querySelector(`[data-note-exercise="${item.exercise}"]`).value;
  const activeChoiceButton = document.querySelector("[data-exercise-choice].active-choice");
  const failureChoice = activeChoiceButton?.dataset.exerciseChoice || "backoff";
  const backoffEntries = Array.from(document.querySelectorAll('[data-backoff-kind="weight"]')).map((input) => {
    const order = Number(input.dataset.backoffOrder);
    const weightInput = document.querySelector(`[data-backoff-kind="weight"][data-backoff-order="${order}"]`);
    const repsInput = document.querySelector(`[data-backoff-kind="reps"][data-backoff-order="${order}"]`);

    return {
      order,
      weight: Number(weightInput.value),
      reps: Number(repsInput.value),
    };
  });
  const success = actualSets.every((set, index) => set.reps >= item.setPlan[index].targetReps);

  return {
    ...item,
    actualSets,
    lastSetRpe,
    note,
    success,
    failureChoice,
    backoffEntries,
  };
}

function renderBackoffInputArea(exerciseResult, recommendation) {
  const backoffArea = document.getElementById("backoff-input-area");
  if (!backoffArea) {
    return;
  }

  if (exerciseResult.success || exerciseResult.failureChoice !== "backoff" || !recommendation) {
    backoffArea.innerHTML = "";
    return;
  }

  const previousEntries = exerciseResult.backoffEntries || [];
  const rows = previousEntries.map((entry, index) => {
    return `
      <div class="sets-row">
        <span>백오프 ${index + 1}</span>
        <span>${formatWeight(recommendation.backoffWeight)} / 1회 기준</span>
        <input
          type="number"
          step="0.5"
          inputmode="decimal"
          data-backoff-kind="weight"
          data-backoff-order="${index + 1}"
          value="${entry.weight}"
        />
        <input
          type="number"
          step="1"
          inputmode="numeric"
          data-backoff-kind="reps"
          data-backoff-order="${index + 1}"
          value="${entry.reps}"
        />
      </div>
    `;
  }).join("");

  backoffArea.innerHTML = `
    <div class="backoff-box">
      <p class="backoff-title">백오프 입력</p>
      <p class="backoff-note">추천값은 ${formatWeight(recommendation.backoffWeight)} / 최대 ${recommendation.backoffSets}개입니다. 필요하면 한 줄씩 추가해서 기록하세요.</p>
      <div class="backoff-actions">
        <button class="secondary-button" type="button" id="add-backoff-row-button">백오프 1개 추가</button>
      </div>
      ${previousEntries.length ? `
        <div class="sets-table">
          <div class="sets-row header">
            <span>구분</span>
            <span>추천</span>
            <span>실제 중량</span>
            <span>실제 반복</span>
          </div>
          ${rows}
        </div>
      ` : '<p class="backoff-note">아직 추가된 백오프 입력칸이 없습니다.</p>'}
    </div>
  `;

  const addBackoffRowButton = document.getElementById("add-backoff-row-button");
  if (!addBackoffRowButton) {
    return;
  }

  addBackoffRowButton.disabled = previousEntries.length >= recommendation.backoffSets;
  addBackoffRowButton.textContent = previousEntries.length >= recommendation.backoffSets
    ? "추천 개수만큼 추가됨"
    : "백오프 1개 추가";

  addBackoffRowButton.addEventListener("click", () => {
    const latestResult = collectSelectedExerciseResult();
    const nextEntries = [...latestResult.backoffEntries];

    if (nextEntries.length >= recommendation.backoffSets) {
      return;
    }

    nextEntries.push({
      order: nextEntries.length + 1,
      weight: recommendation.backoffWeight,
      reps: 1,
    });

    renderBackoffInputArea(
      {
        ...latestResult,
        backoffEntries: nextEntries,
      },
      recommendation,
    );
    attachRecordInputListeners();
  });
}

function renderLiveBackoffSummary() {
  const exerciseResult = collectSelectedExerciseResult();
  const statusPill = recordExerciseList.querySelector(".pill");
  const recommendation = calculateBackoffRecommendation(exerciseResult);

  if (statusPill) {
    statusPill.textContent = exerciseResult.success ? "기록 준비 완료" : "실패로 판정됨";
    statusPill.classList.toggle("success", exerciseResult.success);
    statusPill.classList.toggle("alert", !exerciseResult.success);
  }

  if (exerciseResult.success) {
    backoffSummary.textContent = "현재 입력 기준으로는 성공입니다. 백오프 개수를 계산할 필요가 없습니다.";
    renderBackoffInputArea(exerciseResult, null);
    return;
  }

  if (recommendation) {
    backoffSummary.textContent =
      `${recommendation.exercise} 백오프 추천 ${formatWeight(recommendation.backoffWeight)} / ${recommendation.backoffSets}개`;
    renderBackoffInputArea(exerciseResult, recommendation);
    return;
  }

  backoffSummary.textContent = "실패가 감지되었지만 아직 백오프 계산 정보가 부족합니다.";
  renderBackoffInputArea(exerciseResult, null);
}

function autosaveCurrentExerciseDraft() {
  const recordScreen = document.getElementById("screen-record");
  if (!recordScreen?.classList.contains("active")) {
    return;
  }

  const hasRecordInputs = recordExerciseList.querySelector("[data-record-exercise]");
  if (!hasRecordInputs) {
    return;
  }

  const exerciseResult = collectSelectedExerciseResult();
  appState.currentSessionRecords[exerciseResult.exercise] = exerciseResult;
  saveState();
}

function collectWorkoutResult() {
  return EXERCISES.map((exercise) => getSessionRecord(exercise)).filter(Boolean);
}

function getRequiredExercisesForCurrentSession() {
  const session = buildCurrentSession();
  return session
    .filter((item) => !item.isCompleted)
    .map((item) => item.exercise);
}

function calculateAdjustedWeight(currentWeight) {
  return roundToLoadableWeight(currentWeight * 0.95);
}

function applyFailureChoices(workoutResult) {
  const nextManualWeights = { ...appState.manualNextSessionWeights };

  workoutResult.forEach((exercise) => {
    const exercisePhase = getExercisePhase(exercise.exercise);

    if (exercisePhase === "high_volume" || exercisePhase === "practice") {
      const currentProgression = appState.exerciseProgressions[exercise.exercise] || 1;

      if (exercise.failureChoice === "repeat") {
        appState.exerciseProgressions[exercise.exercise] = currentProgression;
        delete nextManualWeights[exercise.exercise];
        return;
      }

      const nextProgression = currentProgression + 1;
      appState.exerciseProgressions[exercise.exercise] = nextProgression;
      if (exercise.failureChoice === "adjust") {
        nextManualWeights[exercise.exercise] = calculateAdjustedWeight(exercise.prescribedWeight);
      } else {
        delete nextManualWeights[exercise.exercise];
      }

      if (exercisePhase === "high_volume" && nextProgression > HIGH_VOLUME_TEMPLATES.length) {
        appState.completedExercises[exercise.exercise] = true;
      }

      if (exercisePhase === "practice" && nextProgression > PRACTICE_TEMPLATES.length) {
        appState.readyForStrength[exercise.exercise] = true;
      }

      return;
    }

    const currentProgression = appState.exerciseProgressions[exercise.exercise] || 1;
    const currentStage = getStrengthStage(exercise.exercise);
    if (shouldCompleteStrengthCycle(exercise)) {
      appState.completedExercises[exercise.exercise] = true;
      appState.exerciseProgressions[exercise.exercise] = currentProgression;
      appState.exerciseStrengthStages[exercise.exercise] = currentStage;
      delete nextManualWeights[exercise.exercise];
      return;
    }

    const nextStage = shouldAdvanceStrengthStage(exercise)
      ? getNextStrengthStage(currentStage)
      : currentStage;
    appState.exerciseStrengthStages[exercise.exercise] = nextStage;

    if (exercise.failureChoice === "repeat") {
      appState.exerciseProgressions[exercise.exercise] = currentProgression;
      delete nextManualWeights[exercise.exercise];
      return;
    }

    if (exercise.failureChoice === "adjust") {
      appState.exerciseProgressions[exercise.exercise] = currentProgression + 1;
      nextManualWeights[exercise.exercise] = calculateAdjustedWeight(exercise.prescribedWeight);
      return;
    }

    if (!exercise.success && exercise.failureChoice === "backoff") {
      appState.exerciseProgressions[exercise.exercise] = currentProgression + 1;
      delete nextManualWeights[exercise.exercise];
      return;
    }

    appState.exerciseProgressions[exercise.exercise] = currentProgression + 1;
    delete nextManualWeights[exercise.exercise];
  });

  if (appState.programMode === "high_volume") {
    appState.programCompleted = EXERCISES.every((exercise) => appState.completedExercises[exercise]);
  }

  appState.manualNextSessionWeights = nextManualWeights;
  syncGlobalPhaseFromExercises();
}

function renderHistory() {
  if (!appState.history.length && !appState.prHistory.length) {
    historyStats.innerHTML = "";
    historyFilters.innerHTML = "";
    historyChartGrid.innerHTML = "";
    historyList.innerHTML = `<p class="muted">아직 저장된 기록이 없습니다.</p>`;
    return;
  }

  const allEntries = appState.history.flatMap((sessionRecord) =>
    sessionRecord.exercises.map((exerciseRecord) => ({
      dateLabel: sessionRecord.dateLabel,
      sessionLabel: sessionRecord.sessionLabel,
      ...exerciseRecord,
    })),
  );

  renderHistoryStats(allEntries);
  renderHistoryFilters();
  renderHistoryCharts();

  const filteredEntries = historyExerciseFilter === "all"
    ? allEntries
    : allEntries.filter((entry) => entry.exercise === historyExerciseFilter);

  if (historyViewMode === "exercise") {
    renderExerciseHistory(filteredEntries);
    return;
  }

  renderSessionHistory(filteredEntries);
}

function renderHistoryStats(entries) {
  const sessionCount = appState.history.length;
  const workoutEntries = entries.filter((entry) => entry.phase !== "test");
  const completedCount = workoutEntries.filter((entry) => entry.success).length;
  const failedCount = workoutEntries.filter((entry) => !entry.success).length;
  const backoffCount = workoutEntries.filter((entry) => (entry.backoffEntries || []).length > 0).length;
  const prCount = appState.prHistory.length;

  historyStats.innerHTML = `
    <div class="history-stat">
      <p class="history-stat-label">저장된 세션</p>
      <p class="history-stat-value">${sessionCount}</p>
    </div>
    <div class="history-stat">
      <p class="history-stat-label">완료한 운동</p>
      <p class="history-stat-value">${completedCount}</p>
    </div>
    <div class="history-stat">
      <p class="history-stat-label">실패한 운동</p>
      <p class="history-stat-value">${failedCount}</p>
    </div>
    <div class="history-stat">
      <p class="history-stat-label">백오프 포함 운동</p>
      <p class="history-stat-value">${backoffCount}</p>
    </div>
    <div class="history-stat">
      <p class="history-stat-label">저장된 PR</p>
      <p class="history-stat-value">${prCount}</p>
    </div>
  `;
}

function renderHistoryFilters() {
  historyFilters.innerHTML = `
    <button class="filter-chip ${historyExerciseFilter === "all" ? "active-chip" : ""}" data-history-exercise="all">전체 운동</button>
    ${EXERCISES.map((exercise) => `
      <button class="filter-chip ${historyExerciseFilter === exercise ? "active-chip" : ""}" data-history-exercise="${exercise}">${exercise}</button>
    `).join("")}
  `;

  document.querySelectorAll("[data-history-exercise]").forEach((button) => {
    button.addEventListener("click", () => {
      historyExerciseFilter = button.dataset.historyExercise;
      renderHistory();
    });
  });

  historyViewSessionButton.classList.toggle("active-mini", historyViewMode === "session");
  historyViewExerciseButton.classList.toggle("active-mini", historyViewMode === "exercise");
}

function formatSetSummary(actualSets) {
  if (!actualSets || !actualSets.length) {
    return "세트 기록 없음";
  }

  return actualSets.map((set, index) => `${index + 1}세트 ${set.weight}kg x ${set.reps}`).join(" · ");
}

function formatBackoffSummary(backoffEntries) {
  if (!backoffEntries || !backoffEntries.length) {
    return "";
  }

  return backoffEntries.map((set) => `${set.order} ${set.weight}kg x ${set.reps}`).join(" · ");
}

function calculateBestEstimatedOneRepMax(entry) {
  const allSets = [
    ...(entry.actualSets || []),
    ...((entry.backoffEntries || []).map((set) => ({ weight: set.weight, reps: set.reps }))),
  ].filter((set) => Number.isFinite(set.weight) && Number.isFinite(set.reps) && set.weight > 0 && set.reps > 0);

  if (!allSets.length) {
    return null;
  }

  return Math.max(...allSets.map((set) => calculateEstimatedOneRepMax(set.weight, set.reps)));
}

function getExerciseTrendPoints(exercise) {
  return appState.history
    .map((sessionRecord) => {
      const entry = sessionRecord.exercises.find((item) => item.exercise === exercise);
      if (!entry) {
        return null;
      }

      const estimatedOneRepMax = calculateBestEstimatedOneRepMax(entry);
      if (!estimatedOneRepMax) {
        return null;
      }

      return {
        label: `${sessionRecord.dateLabel} ${entry.sessionLabel || sessionRecord.sessionLabel}`,
        value: estimatedOneRepMax,
        type: entry.phase === "test" ? "test" : "session",
      };
    })
    .filter(Boolean);
}

function buildTrendSvg(points, color) {
  const width = 560;
  const height = 140;
  const paddingX = 18;
  const paddingTop = 12;
  const paddingBottom = 26;
  const values = points.map((point) => point.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;

  const xyPoints = points.map((point, index) => {
    const x = points.length === 1
      ? width / 2
      : paddingX + ((width - paddingX * 2) * index / (points.length - 1));
    const y = paddingTop + ((height - paddingTop - paddingBottom) * (1 - ((point.value - minValue) / range)));
    return { ...point, x, y };
  });

  const polylinePoints = xyPoints.map((point) => `${point.x},${point.y}`).join(" ");

  return `
    <svg class="trend-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true">
      <line x1="${paddingX}" y1="${height - paddingBottom}" x2="${width - paddingX}" y2="${height - paddingBottom}" stroke="rgba(111,101,93,0.25)" stroke-width="1" />
      <line x1="${paddingX}" y1="${paddingTop}" x2="${paddingX}" y2="${height - paddingBottom}" stroke="rgba(111,101,93,0.18)" stroke-width="1" />
      <polyline fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="${polylinePoints}" />
      ${xyPoints.map((point) => `
        <circle cx="${point.x}" cy="${point.y}" r="4" fill="${point.type === "test" ? "#6f7f4f" : color}" />
      `).join("")}
      <text x="${paddingX}" y="${height - 6}" font-size="11" fill="#6f655d">${points[0].label}</text>
      <text x="${width - paddingX}" y="${height - 6}" text-anchor="end" font-size="11" fill="#6f655d">${points.at(-1).label}</text>
      <text x="${paddingX}" y="${paddingTop + 4}" font-size="11" fill="#6f655d">${formatWeight(maxValue)}</text>
      <text x="${paddingX}" y="${height - paddingBottom - 4}" font-size="11" fill="#6f655d">${formatWeight(minValue)}</text>
    </svg>
  `;
}

function renderHistoryCharts() {
  if (!historyChartGrid) {
    return;
  }

  const exercisesToRender = historyExerciseFilter === "all"
    ? EXERCISES
    : [historyExerciseFilter];

  const chartCards = exercisesToRender.map((exercise) => {
    const points = getExerciseTrendPoints(exercise);
    const latestValue = points.length ? points.at(-1).value : null;

    return `
      <section class="trend-card">
        <p class="trend-title">${exercise} 예상 1RM 추이</p>
        <p class="trend-meta">${latestValue ? `최근 추정 ${formatWeight(latestValue)}` : "아직 그래프를 그릴 기록이 없습니다."}</p>
        ${points.length >= 2
          ? buildTrendSvg(points, "#b44c2f")
          : `<p class="trend-empty">세션 또는 테스트 기록이 2개 이상 쌓이면 추세선이 표시됩니다.</p>`
        }
      </section>
    `;
  }).join("");

  historyChartGrid.innerHTML = chartCards;
}

function escapeCsvCell(value) {
  const stringValue = String(value ?? "");
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function buildHistoryExportRows() {
  const rows = [
    ["운동 기록"],
    ["날짜", "세션", "운동", "단계", "구성", "목표중량", "성공여부", "마지막세트RPE", "세트기록", "백오프", "메모"],
  ];

  appState.history.forEach((sessionRecord) => {
    sessionRecord.exercises
      .filter((entry) => entry.phase !== "test")
      .forEach((entry) => {
      rows.push([
        sessionRecord.dateLabel,
        entry.sessionLabel || sessionRecord.sessionLabel,
        entry.exercise,
        entry.phase,
        entry.phase === "strength" ? entry.stage : (entry.summaryText || `${entry.targetSets}x${entry.targetReps}`),
        entry.prescribedWeight,
        entry.success ? "완료" : `실패 (${entry.failureChoiceLabel || ""})`,
        entry.lastSetRpe ?? "",
        formatSetSummary(entry.actualSets),
        formatBackoffSummary(entry.backoffEntries),
        entry.note || "",
      ]);
      });
  });

  rows.push([]);
  rows.push(["PR/10RM 기록"]);
  rows.push(["날짜", "운동", "유형", "중량", "반복", "RPE", "새 기준 기록 적용", "메모"]);

  appState.prHistory.forEach((entry) => {
    rows.push([
      entry.dateLabel,
      entry.exercise,
      entry.testType || "PR",
      entry.weight,
      entry.reps,
      entry.rpe ?? "",
      entry.appliedToBaseline ? "적용됨" : "",
      entry.note || "",
    ]);
  });

  return rows;
}

function exportHistoryAsCsv() {
  const rows = buildHistoryExportRows();
  const csv = `\uFEFF${rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n")}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const dateStamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `workout-history-${dateStamp}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function resetHistoryRecords() {
  appState.history = [];
  appState.prHistory = [];
  appState.latestPrRecords = {};
  saveState();
  rerender();
}

function buildPrHistorySection() {
  const filteredPrEntries = appState.prHistory
    .filter((entry) => historyExerciseFilter === "all" || entry.exercise === historyExerciseFilter)
    .slice()
    .reverse();

  if (!filteredPrEntries.length) {
    return "";
  }

  return `
    <section class="history-group">
      <p class="history-group-title">PR/10RM 기록</p>
      <div class="history-group-list">
        ${filteredPrEntries.map((entry) => `
          <article class="history-item">
            <p class="history-date">${entry.exercise}</p>
            <div class="history-detail">
              <p class="history-title">${entry.dateLabel}</p>
              <p class="history-sub">${entry.testType || "PR"} · ${formatWeight(entry.weight)} x ${entry.reps} / RPE ${entry.rpe}</p>
              ${entry.appliedToBaseline ? `<p class="history-backoff">새 기준 기록으로 적용됨${entry.baselineAppliedDateLabel ? ` · ${entry.baselineAppliedDateLabel}` : ""}</p>` : ""}
              ${entry.note ? `<p class="history-meta">메모: ${entry.note}</p>` : ""}
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderSessionHistory(entries) {
  const groups = appState.history
    .slice()
    .reverse()
    .map((sessionRecord) => {
      const sessionEntries = sessionRecord.exercises.filter((exercise) =>
        historyExerciseFilter === "all" || exercise.exercise === historyExerciseFilter,
      );

      if (!sessionEntries.length) {
        return "";
      }

      return `
        <section class="history-group">
          <p class="history-group-title">${sessionRecord.dateLabel} · ${sessionRecord.sessionLabel}</p>
          <div class="history-group-list">
            ${sessionEntries.map((entry) => `
              <article class="history-item">
                <p class="history-date">${entry.exercise}</p>
                <div class="history-detail">
                  <p class="history-title">${formatWeight(entry.prescribedWeight)} / ${entry.phase === "strength" ? entry.stage : (entry.summaryText || `${entry.targetSets}x${entry.targetReps}`)}</p>
                  <p class="history-sub">${entry.success ? "완료" : `실패 (${entry.failureChoiceLabel})`}</p>
                  <p class="history-meta">세트 기록: ${formatSetSummary(entry.actualSets)}</p>
                  <p class="history-meta">마지막 세트 RPE: ${entry.lastSetRpe || "-"}</p>
                  ${entry.cycleCompleted ? `<p class="history-meta">이번 기록으로 스트렝스 사이클 종료</p>` : ""}
                  ${entry.note ? `<p class="history-meta">메모: ${entry.note}</p>` : ""}
                  ${entry.backoffEntries?.length ? `<p class="history-backoff">백오프: ${formatBackoffSummary(entry.backoffEntries)}</p>` : ""}
                </div>
              </article>
            `).join("")}
          </div>
        </section>
      `;
    })
    .filter(Boolean)
    .join("");

  const prSection = buildPrHistorySection();
  historyList.innerHTML = (groups || prSection)
    ? `${groups}${prSection}`
    : `<p class="muted">선택한 운동의 기록이 없습니다.</p>`;
}

function renderExerciseHistory(entries) {
  const groups = EXERCISES
    .filter((exercise) => historyExerciseFilter === "all" || historyExerciseFilter === exercise)
    .map((exercise) => {
      const exerciseEntries = entries
        .filter((entry) => entry.exercise === exercise)
        .slice()
        .reverse();

      if (!exerciseEntries.length) {
        return "";
      }

      return `
        <section class="history-group">
          <p class="history-group-title">${exercise}</p>
          <div class="history-group-list">
            ${exerciseEntries.map((entry) => `
              <article class="history-item">
                <p class="history-date">${entry.dateLabel}</p>
                <div class="history-detail">
                  <p class="history-title">${entry.sessionLabel}</p>
                  <p class="history-sub">${formatWeight(entry.prescribedWeight)} / ${entry.phase === "strength" ? entry.stage : (entry.summaryText || `${entry.targetSets}x${entry.targetReps}`)} / ${entry.success ? "완료" : `실패 (${entry.failureChoiceLabel})`}</p>
                  <p class="history-meta">세트 기록: ${formatSetSummary(entry.actualSets)}</p>
                  <p class="history-meta">마지막 세트 RPE: ${entry.lastSetRpe || "-"}</p>
                  ${entry.cycleCompleted ? `<p class="history-meta">이번 기록으로 스트렝스 사이클 종료</p>` : ""}
                  ${entry.note ? `<p class="history-meta">메모: ${entry.note}</p>` : ""}
                  ${entry.backoffEntries?.length ? `<p class="history-backoff">백오프: ${formatBackoffSummary(entry.backoffEntries)}</p>` : ""}
                </div>
              </article>
            `).join("")}
          </div>
        </section>
      `;
    })
    .filter(Boolean)
    .join("");

  const prSection = buildPrHistorySection();
  historyList.innerHTML = (groups || prSection)
    ? `${groups}${prSection}`
    : `<p class="muted">선택한 운동의 기록이 없습니다.</p>`;
}

function rerender() {
  renderSummary();
  renderSetupPreview();
  renderProgramSchedulePreview();
  renderTodayScreen();
  renderRecordScreen();
  renderPrScreen();
  renderHistory();
  updateInstallCard();
  updateUpdateCard();
}

function syncStateFromSetupInputs() {
  appState.userName = userNameInput.value.trim() || "사용자";
  appState.plateIncrement = Number(plateIncrementInput.value) || 1.25;
  appState.programMode = document.querySelector('[name="program-mode"]:checked')?.value || "strength";
  appState.includePracticePhase = includePracticeInput.checked;

  baselineInputs.forEach((input) => {
    const exercise = input.dataset.exercise;
    const field = input.dataset.field;
    appState.baselines[exercise][field] = Number(input.value) || 0;
  });
}

function previewProgramConfigFromSetupInputs() {
  appState.userName = userNameInput.value.trim() || "사용자";
  appState.plateIncrement = Number(plateIncrementInput.value) || 1.25;
  appState.programMode = document.querySelector('[name="program-mode"]:checked')?.value || "strength";
  appState.includePracticePhase = includePracticeInput.checked;

  baselineInputs.forEach((input) => {
    const exercise = input.dataset.exercise;
    const field = input.dataset.field;
    appState.baselines[exercise][field] = Number(input.value) || 0;
  });

  practiceToggleRow.hidden = appState.programMode !== "strength";
  renderSetupPreview();
  renderProgramSchedulePreview();
}

function getFailureChoiceLabel(choice) {
  const labels = {
    continue: "다음 세션 진행",
    repeat: "이번 세션 다시 하기",
    backoff: "백오프 세트",
    adjust: "이 운동만 중량 낮추기",
  };

  return labels[choice] || choice;
}

function attachFailureChoiceListeners(selectedChoice) {
  const buttons = document.querySelectorAll("[data-exercise-choice]");
  buttons.forEach((button) => {
    button.classList.toggle("active-choice", button.dataset.exerciseChoice === selectedChoice);
    button.addEventListener("click", () => {
      buttons.forEach((item) => {
        item.classList.toggle("active-choice", item === button);
      });
      renderLiveBackoffSummary();
      autosaveCurrentExerciseDraft();
    });
  });
}

function attachRecordInputListeners() {
  recordExerciseList.onclick = (event) => {
    const targetSuccessButton = event.target.closest("[data-target-success]");
    if (!targetSuccessButton) {
      return;
    }

    const exercise = targetSuccessButton.dataset.targetSuccess;
    const session = buildCurrentSession();
    const item = session.find((sessionExercise) => sessionExercise.exercise === exercise);

    if (!item) {
      return;
    }

    item.setPlan.forEach((set, index) => {
      const repsInput = recordExerciseList.querySelector(
        `[data-record-exercise="${exercise}"][data-record-kind="reps"][data-set-order="${index + 1}"]`,
      );

      if (repsInput) {
        repsInput.value = set.targetReps;
      }
    });

    renderLiveBackoffSummary();
    autosaveCurrentExerciseDraft();
  };

  recordExerciseList.oninput = () => {
    renderLiveBackoffSummary();
    autosaveCurrentExerciseDraft();
  };
}

generateProgramButton.addEventListener("click", () => {
  syncStateFromSetupInputs();
  appState.currentSessionNumber = 1;
  appState.phase = appState.programMode === "high_volume"
    ? "high_volume"
    : shouldUsePracticePhase() ? "practice" : "strength";
  appState.programCompleted = false;
  appState.exercisePhases = {
    Squat: appState.phase,
    "Bench Press": appState.phase,
    Deadlift: appState.phase,
    Press: appState.phase,
  };
  appState.readyForStrength = {
    Squat: false,
    "Bench Press": false,
    Deadlift: false,
    Press: false,
  };
  appState.exerciseProgressions = {
    Squat: 1,
    "Bench Press": 1,
    Deadlift: 1,
    Press: 1,
  };
  appState.exerciseStrengthStages = {
    Squat: "5x5",
    "Bench Press": "5x5",
    Deadlift: "5x5",
    Press: "5x5",
  };
  appState.completedExercises = {
    Squat: false,
    "Bench Press": false,
    Deadlift: false,
    Press: false,
  };
  appState.selectedPrExercise = "Squat";
  appState.manualNextSessionWeights = {};
  appState.currentSessionRecords = {};
  appState.selectedExercise = "Squat";
  saveState();
  rerender();
  showScreen("today");
});

saveExerciseButton.addEventListener("click", () => {
  const exerciseResult = collectSelectedExerciseResult();
  appState.currentSessionRecords[exerciseResult.exercise] = exerciseResult;
  const navigation = getRecordNavigationState();
  appState.selectedExercise = navigation.nextExercise || exerciseResult.exercise;
  saveState();
  rerender();
  showScreen("today");
  scrollToTodayScreenBottom();
});

backToSessionButton.addEventListener("click", () => {
  autosaveCurrentExerciseDraft();
  showScreen("today");
});

prevExerciseButton?.addEventListener("click", () => {
  navigateRecordExercise("prev");
});

nextExerciseButton?.addEventListener("click", () => {
  navigateRecordExercise("next");
});

completeSessionButton.addEventListener("click", () => {
  autosaveCurrentExerciseDraft();

  const requiredExercises = getRequiredExercisesForCurrentSession();
  const unrecordedExercises = requiredExercises.filter(
    (exercise) => !getSessionRecord(exercise),
  );

  if (unrecordedExercises.length) {
    const shouldFinish = window.confirm("기록되지 않은 운동이 있습니다. 세션을 마무리하시겠습니까?");
    if (!shouldFinish) {
      showScreen("today");
      return;
    }
  }

  const workoutResult = collectWorkoutResult();
  const completedBefore = { ...appState.completedExercises };

  if (!workoutResult.length) {
    backoffSummary.textContent = "세션을 마무리하려면 최소 한 개 운동은 먼저 기록해 주세요.";
    showScreen("record");
    return;
  }

  const failedExercises = workoutResult.filter((exercise) => !exercise.success);
  const failedExercise = failedExercises[0];
  const recommendation = calculateBackoffRecommendation(failedExercise);

  if (recommendation) {
    backoffSummary.textContent =
      `${recommendation.exercise} 백오프 추천 ${formatWeight(recommendation.backoffWeight)} / ${recommendation.backoffSets}개`;
  } else {
    backoffSummary.textContent = "실패한 운동이 없어 백오프가 필요하지 않습니다.";
  }

  const dateLabel = new Date().toLocaleDateString("ko-KR", {
    month: "numeric",
    day: "numeric",
  });

  const historyEntry = {
    dateLabel,
    sessionLabel: getCurrentPhaseSessionLabel(),
    exercises: workoutResult.map((exercise) => ({
      exercise: exercise.exercise,
      phase: exercise.phase,
      sessionLabel: exercise.sessionLabel,
      summaryText: exercise.summaryText,
      prescribedWeight: exercise.prescribedWeight,
      stage: exercise.stage,
      targetSets: exercise.targetSets,
      targetReps: exercise.targetReps,
      setPlan: exercise.setPlan,
      success: exercise.success,
      cycleCompleted: shouldCompleteStrengthCycle(exercise),
      lastSetRpe: exercise.lastSetRpe,
      note: exercise.note,
      actualSets: exercise.actualSets,
      backoffEntries: exercise.backoffEntries,
      failureChoice: exercise.failureChoice,
      failureChoiceLabel: getFailureChoiceLabel(exercise.failureChoice),
    })),
  };

  appState.history.push(historyEntry);
  applyFailureChoices(workoutResult);
  appState.currentSessionRecords = {};

  saveState();
  rerender();
  const newlyCompletedHighVolumeExercise = appState.programMode === "high_volume" && EXERCISES.some(
    (exercise) => !completedBefore[exercise] && appState.completedExercises[exercise],
  );
  if (newlyCompletedHighVolumeExercise) {
    showScreen("pr");
    return;
  }

  showScreen("history");
});

programModeInputs.forEach((input) => {
  input.addEventListener("change", () => {
    practiceToggleRow.hidden = input.value !== "strength";
    previewProgramConfigFromSetupInputs();
  });
});

includePracticeInput.addEventListener("change", () => {
  previewProgramConfigFromSetupInputs();
});

baselineInputs.forEach((input) => {
  input.addEventListener("input", () => {
    previewProgramConfigFromSetupInputs();
  });
});

plateIncrementInput.addEventListener("input", () => {
  previewProgramConfigFromSetupInputs();
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    autosaveCurrentExerciseDraft();
    showScreen(link.dataset.screen);
  });
});

goButtons.forEach((button) => {
  button.addEventListener("click", () => {
    autosaveCurrentExerciseDraft();
    showScreen(button.dataset.go);
  });
});

historyViewSessionButton.addEventListener("click", () => {
  historyViewMode = "session";
  renderHistory();
});

historyViewExerciseButton.addEventListener("click", () => {
  historyViewMode = "exercise";
  renderHistory();
});

installAppButton?.addEventListener("click", async () => {
  if (!deferredInstallPrompt) {
    updateInstallCard();
    return;
  }

  deferredInstallPrompt.prompt();
  try {
    await deferredInstallPrompt.userChoice;
  } catch (error) {
    // Ignore cancelled install prompt.
  }
  deferredInstallPrompt = null;
  updateInstallCard();
});

applyUpdateButton?.addEventListener("click", () => {
  if (!waitingServiceWorker) {
    return;
  }

  waitingServiceWorker.postMessage({ type: "SKIP_WAITING" });
});

exportHistoryButton?.addEventListener("click", () => {
  exportHistoryAsCsv();
});

resetHistoryButton?.addEventListener("click", () => {
  const shouldReset = window.confirm("저장된 운동 기록과 PR/10RM 기록을 모두 초기화할까요?");
  if (!shouldReset) {
    return;
  }

  resetHistoryRecords();
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  updateInstallCard();
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  updateInstallCard();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").then((registration) => {
      if (registration.waiting) {
        promptForAppUpdate(registration);
      }

      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) {
          return;
        }

        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            promptForAppUpdate(registration);
          }
        });
      });

      navigator.serviceWorker.addEventListener("controllerchange", () => {
        waitingServiceWorker = null;
        window.location.reload();
      });
    }).catch(() => {
      // Ignore registration failures in unsupported or local-file contexts.
    });
  });
}

updateSetupInputs();
rerender();
