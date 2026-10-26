(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const STORAGE_KEY = "jt-motion-project-v1";
  const defaultProject = () => ({
    schemaVersion: 1,
    title: "Untitled Film",
    format: "Short film",
    frameRate: "24 fps",
    description: "",
    scenes: []
  });
  let project = loadProject();
  let saveTimer;
  const sceneList = $("#sceneList");
  const template = $("#sceneTemplate");

  function loadProject() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultProject();
      return normalizeProject(JSON.parse(raw));
    } catch (error) {
      console.warn("Could not load saved JT Motion project:", error);
      return defaultProject();
    }
  }

  function normalizeProject(value) {
    if (!value || typeof value !== "object" || !Array.isArray(value.scenes)) throw new Error("Invalid project file");
    return {
      schemaVersion: 1,
      title: safeText(value.title, "Untitled Film", 120),
      format: safeText(value.format, "Short film", 80),
      frameRate: ["24 fps","25 fps","30 fps","50 fps","60 fps"].includes(value.frameRate) ? value.frameRate : "24 fps",
      description: safeText(value.description, "", 1200),
      scenes: value.scenes.slice(0, 200).map((scene, index) => ({
        id: safeText(scene?.id, makeId(), 80) || makeId(),
        title: safeText(scene?.title, "Scene " + (index + 1), 120),
        visual: safeText(scene?.visual, "", 2000),
        action: safeText(scene?.action, "", 1500),
        audio: safeText(scene?.audio, "", 1500),
        duration: clampNumber(scene?.duration, 1, 3600, 10)
      }))
    };
  }

  function safeText(value, fallback, max) {
    return typeof value === "string" ? value.slice(0, max) : fallback;
  }
  function clampNumber(value, min, max, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(min, Math.min(max, Math.round(n))) : fallback;
  }
  function makeId() {
    return globalThis.crypto?.randomUUID?.() || "scene-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
  function formatTime(totalSeconds) {
    const total = Math.max(0, Math.round(totalSeconds));
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return minutes + ":" + String(seconds).padStart(2, "0");
  }

  function render() {
    $("#projectTitle").value = project.title;
    $("#projectFormat").value = project.format;
    $("#frameRate").value = project.frameRate;
    $("#projectDescription").value = project.description;
    $("#formatSummary").textContent = project.format;
    $("#sceneCount").textContent = String(project.scenes.length);
    $("#runtime").textContent = formatTime(project.scenes.reduce((sum, scene) => sum + scene.duration, 0));
    $("#sceneHint").textContent = project.scenes.length ? "Scenes are shown in playback order" : "Add a scene to start planning";
    $("#emptyState").classList.toggle("hidden", project.scenes.length > 0);
    sceneList.replaceChildren();

    project.scenes.forEach((scene, index) => {
      const node = template.content.firstElementChild.cloneNode(true);
      $(".scene-number", node).textContent = String(index + 1).padStart(2, "0");
      const title = $(".scene-title", node);
      title.value = scene.title;
      $(".scene-meta", node).textContent = "SCENE " + String(index + 1).padStart(2, "0") + " · " + formatTime(scene.duration);
      $(".scene-visual", node).value = scene.visual;
      $(".scene-action", node).value = scene.action;
      $(".scene-audio", node).value = scene.audio;
      $(".scene-duration", node).value = scene.duration;
      $(".scene-duration-readout", node).textContent = "Estimated shot: " + formatTime(scene.duration);
      $(".move-up", node).disabled = index === 0;
      $(".move-down", node).disabled = index === project.scenes.length - 1;
      $(".move-up", node).addEventListener("click", () => moveScene(index, -1));
      $(".move-down", node).addEventListener("click", () => moveScene(index, 1));
      $(".delete-scene", node).addEventListener("click", () => deleteScene(scene.id));
      title.addEventListener("change", () => updateScene(scene.id, "title", title.value.trim() || "Scene " + (index + 1)));
      $(".scene-visual", node).addEventListener("input", e => updateScene(scene.id, "visual", e.target.value));
      $(".scene-action", node).addEventListener("input", e => updateScene(scene.id, "action", e.target.value));
      $(".scene-audio", node).addEventListener("input", e => updateScene(scene.id, "audio", e.target.value));
      $(".scene-duration", node).addEventListener("change", e => {
        updateScene(scene.id, "duration", clampNumber(e.target.value, 1, 3600, 10));
        render();
      });
      sceneList.append(node);
    });
  }

  function persist() {
    $("#saveStatus").textContent = "Saving…";
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
        $("#saveStatus").textContent = "Saved locally";
      } catch (error) {
        $("#saveStatus").textContent = "Local save unavailable";
        console.error("JT Motion could not save locally:", error);
      }
    }, 250);
  }
  function updateProject(key, value) {
    project[key] = value;
    $("#formatSummary").textContent = project.format;
    persist();
    if (key === "format") $("#formatSummary").textContent = value;
  }
  function updateScene(id, key, value) {
    const scene = project.scenes.find(item => item.id === id);
    if (!scene) return;
    scene[key] = value;
    if (key === "duration") {
      $("#runtime").textContent = formatTime(project.scenes.reduce((sum, item) => sum + item.duration, 0));
    }
    persist();
  }
  function addScene() {
    project.scenes.push({id: makeId(), title: "Scene " + (project.scenes.length + 1), visual: "", action: "", audio: "", duration: 10});
    render();
    persist();
    const titles = $$(".scene-title", sceneList);
    titles[titles.length - 1]?.focus();
  }
  function moveScene(index, offset) {
    const target = index + offset;
    if (target < 0 || target >= project.scenes.length) return;
    [project.scenes[index], project.scenes[target]] = [project.scenes[target], project.scenes[index]];
    render();
    persist();
  }
  function deleteScene(id) {
    const scene = project.scenes.find(item => item.id === id);
    if (!scene) return;
    if (!confirm('Delete "' + scene.title.replace(/["']/g, "") + '"? This cannot be undone unless you exported a backup.')) return;
    project.scenes = project.scenes.filter(item => item.id !== id);
    render();
    persist();
  }
  function exportProject() {
    const blob = new Blob([JSON.stringify(project, null, 2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = (project.title || "jt-motion-project").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + ".json";
    link.click();
    URL.revokeObjectURL(url);
  }
  async function importProject(file) {
    if (!file) return;
    try {
      if (file.size > 2_000_000) throw new Error("The project file is too large (maximum 2 MB).");
      const parsed = normalizeProject(JSON.parse(await file.text()));
      if (!confirm("Import this project and replace the current project in this app? Export the current project first if you need a backup.")) return;
      project = parsed;
      render();
      persist();
    } catch (error) {
      alert("Could not import project: " + (error?.message || "Invalid JSON file"));
    } finally {
      $("#fileInput").value = "";
    }
  }

  $("#projectTitle").addEventListener("input", e => updateProject("title", e.target.value.slice(0, 120)));
  $("#projectFormat").addEventListener("change", e => updateProject("format", e.target.value));
  $("#frameRate").addEventListener("change", e => updateProject("frameRate", e.target.value));
  $("#projectDescription").addEventListener("input", e => updateProject("description", e.target.value.slice(0, 1200)));
  $("#addSceneBtn").addEventListener("click", addScene);
  $("#emptyAddBtn").addEventListener("click", addScene);
  $("#exportBtn").addEventListener("click", exportProject);
  $("#importBtn").addEventListener("click", () => $("#fileInput").click());
  $("#fileInput").addEventListener("change", e => importProject(e.target.files?.[0]));
  $("#printBtn").addEventListener("click", () => window.print());
  render();
})();