import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { SedaProvider, Text, Button, IconButton, TextField } from "@seda-ai/ui";
import {
  createFormState,
  transitionForm,
} from "../../../../packages/seda-contracts/src/form.mjs";
import {
  createWebBindings,
  bindWebRecipe,
} from "../../../../packages/seda-contracts/src/web.mjs";
import { profiles, profile, provenance } from "seda:catalog";
import { ControlFixtures } from "./control-fixtures";
import { ReviewFixtures } from "./test-fixtures";
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@seda-ai/ui/styles.css";
import "../../../../packages/seda-ui/src/navigation.css";
import "../../../../packages/seda-ui/src/overlays.css";
import "../../../../packages/seda-ui/src/layout.css";
import "./styles.css";
import { Select, Checkbox, DropdownMenu, ControlContractProvider } from "./contract-controls";
import { ProductWorkspace } from "./ProductWorkspace";
import { createWorkspaceBindings } from "./workspace-bindings.mjs";
import "./workspace.css";
import { derive, fmt } from "./lab-model.mjs";

type Configuration = {
  theme: "Light" | "Dark";
  controlSize: "s" | "m" | "l" | "xl";
  density: "regular";
};
type TransportMode = "success" | "failure" | "manual";
type RequestRecord = {
  requestId: number;
  value: string;
  status: "pending" | "success" | "failure";
};
const isReview =
  new URLSearchParams(window.location.search).get("review") === "1";
const initialConfiguration: Configuration = { ...profile.configuration };
const HelpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
    <path
      d="M9.7 9.4a2.4 2.4 0 0 1 4.5 1.2c0 1.8-2.2 2-2.2 3.6"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <circle cx="12" cy="16.7" r=".85" fill="currentColor" />
  </svg>
);

function App() {
  const [parameters, setParameters] = useState({
    scale: 100,
    air: 0,
    airX: 0,
    radius: 100,
    strict: true,
  });
  const [view, setView] = useState("table");
  const [teamFilter, setTeamFilter] = useState("all");
  const [onlyActive, setOnlyActive] = useState(false);
  const [sort, setSort] = useState("original");
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [query, setQuery] = useState("");
  const [deleteProject, setDeleteProject] = useState<string | null>(null);
  const deleteDialog = useRef<HTMLDialogElement>(null);
  const deleteReturnFocus = useRef<HTMLElement | null>(null);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState("size");
  const [projects, setProjects] = useState([
    {
      name: "Atlas Platform",
      status: "active",
      team: "Core",
      updated: "Сегодня",
    },
    {
      name: "Nova Console",
      status: "draft",
      team: "Product",
      updated: "Вчера",
    },
    {
      name: "Orbit Studio",
      status: "active",
      team: "Design",
      updated: "12 окт",
    },
    { name: "Horizon App", status: "paused", team: "Mobile", updated: "9 окт" },
  ]);
  const [modalName, setModalName] = useState("");
  const modal = useRef<HTMLDialogElement>(null);
  const [measurements, setMeasurements] = useState<
    { id: string; h: number; expected: number; flexible?: boolean }[]
  >([]);
  const [configuration, setConfiguration] =
    useState<Configuration>(initialConfiguration);
  const [replacement, setReplacement] = useState<any>(null);
  const [form, setForm] = useState(() => createFormState("Atlas Platform"));
  const [transportMode, setTransportModeState] =
    useState<TransportMode>("manual");
  const [requestRevision, setRequestRevision] = useState(0);
  const [inspectedRole, setInspectedRole] = useState("save");
  const formRef = useRef(form);
  const configurationRef = useRef(configuration);
  const replacementRef = useRef<any>(null);
  const transportRef = useRef<TransportMode>("manual");
  const requestsRef = useRef<RequestRecord[]>([]);
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const generationRef = useRef(0);
  const routeRef = useRef<"click" | "enter" | "programmatic" | "retry">(
    "programmatic",
  );
  const fieldRef = useRef<HTMLInputElement>(null);
  const pendingHeightRef = useRef<number | null>(null);
  const pendingPaddingRef = useRef<{ value: number; airX: number } | null>(
    null,
  );
  const compiled =
    replacement ??
    profiles[`${configuration.theme}:${configuration.controlSize}`];
  const baseBindings = createWebBindings(compiled);
  const d = derive(compiled, parameters);
  const geometryVars = {
    "--seda-control-height": d.height + "px",
    "--seda-control-radius": d.radius + "px",
    "--seda-control-font-size": d.font + "px",
    "--seda-control-line-height": d.line + "px",
  };
  const geometryFor = (role: string, preserveRequest = false) => ({
    ...geometryVars,
    ...(compiled.instances[role].component === "IconButton"
      ? {}
      : {
          "--seda-control-padding-inline":
            (compiled.instances[role].component === "TextField"
              ? d.fieldPaddingX
              : preserveRequest && form.saving
                ? (pendingPaddingRef.current?.value ?? d.buttonPaddingX)
                : d.buttonPaddingX) + "px",
        }),
  });
  const bindings = {
    ...baseBindings,
    recipes: Object.fromEntries(
      Object.entries(baseBindings.recipes).map(([role, b]) => [
        role,
        {
          ...b,
          vars: { ...b.vars, ...geometryFor(role, role === "save") },
          evidence: b.evidence.map((item) => {
            const calculated = (
              geometryFor(role, role === "save") as Record<string, string>
            )[item.property];
            return calculated
              ? {
                  ...item,
                  baseCssValue: item.cssValue,
                  cssValue: calculated,
                  derivation: {
                    source: "lab-model.mjs#derive",
                    parameters:
                      role === "save" &&
                      form.saving &&
                      item.property === "--seda-control-padding-inline"
                        ? {
                            ...parameters,
                            airX:
                              pendingPaddingRef.current?.airX ??
                              parameters.airX,
                          }
                        : parameters,
                    inputs: compiled.geometry,
                  },
                }
              : item;
          }),
        },
      ]),
    ),
  };
  const real = (role: string, preserveRequest = false) => ({
    ...bindings.recipes[role].attributes,
    style: {
      ...bindings.recipes[role].vars,
      ...geometryFor(role, preserveRequest),
    } as React.CSSProperties,
  });

  const workspaceBinding = createWorkspaceBindings(
    compiled,
    d,
    parameters,

  );
  const workspaceStyle = workspaceBinding.vars as React.CSSProperties;
  const activeCompiled = () =>
    replacementRef.current ??
    profiles[
      `${configurationRef.current.theme}:${configurationRef.current.controlSize}`
    ];
  const refreshRequests = () => setRequestRevision((value) => value + 1);

  function dispatch(event: any) {
    const result = transitionForm(
      formRef.current,
      event,
      activeCompiled().form.policy,
    );
    // Update before React renders: multiple submit routes in one event loop share the guard.
    formRef.current = result.state;
    setForm(result.state);
    for (const effect of result.effects) {
      if (effect.type === "focus") {
        if (effect.target === "projectName") fieldRef.current?.focus();
      } else if (effect.type === "save") {
        pendingHeightRef.current = d.height;
        pendingPaddingRef.current = {
          value: d.buttonPaddingX,
          airX: parameters.airX,
        };
        requestsRef.current.push({
          requestId: effect.requestId,
          value: effect.value,
          status: "pending",
        });
        refreshRequests();
        const outcome = transportRef.current;
        if (outcome !== "manual") {
          const generation = generationRef.current;
          const timer = setTimeout(() => {
            timersRef.current.delete(timer);
            if (generation === generationRef.current)
              respond(effect.requestId, outcome);
          }, 900);
          timersRef.current.add(timer);
        }
      }
    }
  }

  function respond(requestId: number, outcome: "success" | "failure") {
    if (!["success", "failure"].includes(outcome))
      throw new TypeError("Response must be success or failure.");
    const request = requestsRef.current.find(
      (item) => item.requestId === requestId,
    );
    // The model also receives unknown/duplicate IDs so its stale-response guard remains authoritative.
    dispatch({
      type: outcome === "success" ? "saveSucceeded" : "saveFailed",
      requestId,
    });
    if (request?.status === "pending") {
      request.status = outcome;
      refreshRequests();
    }
  }

  function configure(update: Partial<Configuration>) {
    if (!update || typeof update !== "object" || Array.isArray(update))
      throw new TypeError("Configuration update must be an object.");
    if (
      Object.keys(update).some(
        (key) => !["theme", "controlSize", "density"].includes(key),
      )
    )
      throw new TypeError("Unknown configuration option.");
    const next = { ...configurationRef.current, ...update };
    if (
      next.density !== "regular" ||
      !profiles[`${next.theme}:${next.controlSize}`]
    )
      throw new TypeError("Unsupported profile configuration.");
    dispatch({ type: "profileChanged" });
    configurationRef.current = next;
    replacementRef.current = null;
    setReplacement(null);
    setConfiguration(next);
  }

  function setTransportMode(mode: TransportMode) {
    if (!["success", "failure", "manual"].includes(mode))
      throw new TypeError("Unsupported demo transport mode.");
    transportRef.current = mode;
    setTransportModeState(mode);
  }

  function reset() {
    generationRef.current += 1;
    timersRef.current.forEach(clearTimeout);
    timersRef.current.clear();
    requestsRef.current = [];
    routeRef.current = "programmatic";
    const next = createFormState("SEDA AI");
    formRef.current = next;
    setForm(next);
    configurationRef.current = { ...initialConfiguration };
    setConfiguration(configurationRef.current);
    replacementRef.current = null;
    setReplacement(null);
    setTransportMode("manual");
    setParameters({ scale: 100, air: 0, airX: 0, radius: 100, strict: true });
    refreshRequests();
  }

  function replaceCompiled(candidate: any) {
    if (!isReview)
      throw new Error(
        "Compiled replacement is available only in the review fixture.",
      );
    createWebBindings(candidate);
    if (
      !profiles[
        `${candidate.configuration.theme}:${candidate.configuration.controlSize}`
      ]
    )
      throw new Error("Unsupported replacement configuration.");
    const next = structuredClone(candidate);
    dispatch({ type: "profileChanged" });
    configurationRef.current = { ...next.configuration };
    setConfiguration(configurationRef.current);
    replacementRef.current = next;
    setReplacement(next);
  }

  useEffect(() => {
    document.documentElement.dataset.theme = compiled.domTheme;
    document.body.classList.toggle("dark", compiled.domTheme === "dark");
  }, [compiled.domTheme]);

  useEffect(() => {
    (window as any).sedaPilot = {
      configure,
      setTransportMode,
      respond,
      reset,
      getState: () => structuredClone(formRef.current),
      getCompiled: () => structuredClone(activeCompiled()),
      getLab: () => ({ parameters, derived: d }),
      getWorkspaceEvidence: () => structuredClone(workspaceBinding),
      getEvidence: () => structuredClone(bindings),
      getRequests: () => structuredClone(requestsRef.current),
      ...(isReview ? { replaceCompiled } : {}),
    };
  });

  useEffect(
    () => () => {
      generationRef.current += 1;
      timersRef.current.forEach(clearTimeout);
      timersRef.current.clear();
      delete (window as any).sedaPilot;
    },
    [],
  );

  const handlers = {
    "form.change": (event: React.ChangeEvent<HTMLInputElement>) =>
      dispatch({ type: "change", value: event.currentTarget.value }),
    "form.blur": () => dispatch({ type: "blur" }),
    "form.cancel": () => dispatch({ type: "cancel" }),
    "form.toggleHelp": () => dispatch({ type: "toggleHelp" }),
  };
  const slots = { "help-icon": <HelpIcon /> };
  const propsFor = (role: string): any =>
    bindWebRecipe(profile.recipes[role], compiled.configuration, form, {
      handlers,
      slots,
    });
  const requests = requestsRef.current;
  const lastRequest = requests[requests.length - 1];
  const stateLabel = form.saving
    ? "Сохранение…"
    : form.saveError
      ? "Не удалось сохранить"
      : form.dirty
        ? "Есть несохранённые изменения"
        : lastRequest?.status === "success"
          ? "Изменения сохранены"
          : "Все изменения сохранены";
  const evidence = bindings.recipes[inspectedRole].evidence;
  const statusLabels: Record<string, string> = {
    active: "Активный",
    draft: "Черновик",
    paused: "Приостановлен",
  };
  const filteredItems = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(query.trim().toLowerCase()) &&
      (filter === "all" || p.status === filter) &&
      (teamFilter === "all" || p.team === teamFilter) &&
      (!onlyActive || p.status === "active"),
  );
  if (sort === "name-asc")
    filteredItems.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "name-desc")
    filteredItems.sort((a, b) => b.name.localeCompare(a.name));
  const currentPage = Math.min(
    pageIndex,
    Math.max(0, Math.ceil(filteredItems.length / pageSize) - 1),
  );
  const items = filteredItems.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize,
  );
  const selectedVisible = items.filter((p) =>
    selectedProjects.includes(p.name),
  );
  const resetFilters = () => {
    setQuery("");
    setFilter("all");
    setTeamFilter("all");
    setOnlyActive(false);
    setSort("original");
    setPageIndex(0);
  };
  useEffect(
    () => setPageIndex(0),
    [query, filter, teamFilter, onlyActive, sort, pageSize],
  );
  const chooseProject = (name: string) => {
    dispatch({ type: "change", value: name });
    fieldRef.current?.focus();
  };
  const nodes: Record<string, { v: string; desc: string; deps: string }> = {
    size: {
      v: configuration.controlSize + " · " + d.preset.height + " px",
      desc: "Компилированный профиль settings-form",
      deps: "size → line-height, font-size, padding, minimum height, radius",
    },
    lineHeight: {
      v: d.line + " px",
      desc: d.preset.line + " × " + parameters.scale + "% = " + d.line,
      deps: "size + text scale → line-height → height",
    },
    height: {
      v: fmt(d.height) + " px",
      desc: d.formula,
      deps: "line-height + icon + padding-y + border + min-height → Button, IconButton, TextField, Select",
    },
    air: {
      v: fmt(d.py) + " px",
      desc:
        "(" +
        d.preset.height +
        " − " +
        d.preset.line +
        " − 2 × " +
        d.preset.border +
        ") / 2 + " +
        parameters.air +
        " = " +
        fmt(d.py),
      deps: "compiled geometry + vertical air → padding-y → height",
    },
    airX: {
      v:
        "Button " +
        fmt(d.buttonPaddingX) +
        " / TextField " +
        fmt(d.fieldPaddingX) +
        " px",
      desc:
        "Button: " +
        d.preset.buttonPaddingX +
        " + " +
        parameters.airX +
        " = " +
        fmt(d.buttonPaddingX) +
        " px; TextField: " +
        d.preset.fieldPaddingX +
        " + " +
        parameters.airX +
        " = " +
        fmt(d.fieldPaddingX) +
        " px",
      deps: "compiled buttonPaddingInline / textFieldPaddingInline + X → padding-inline → Button width / TextField inner space; IconButton → height × height",
    },
    radius: {
      v: fmt(d.radius) + " px",
      desc:
        d.preset.radius + " × " + parameters.radius + "% = " + fmt(d.radius),
      deps: "size + radius multiplier → radius of controls",
    },
    components: {
      v: measurements.length + " видимых контролов",
      desc: "SEDA UI: Button, IconButton, TextField, Select, Checkbox, Radio, Toggle, Tabs, DropdownMenu",
      deps: "height + radius + font → React → DOM",
    },
  };
  const node = nodes[selected];
  const issues = [
    ...(d.line > d.preset.line
      ? [
          "Масштаб текста выше базового: высота увеличена для сохранения содержимого.",
        ]
      : []),
    ...(d.constraint
      ? ["Сработало ограничение минимальной высоты пресета."]
      : []),
    ...(d.font < 12
      ? ["Размер текста меньше 12 px: требуется проверка читаемости."]
      : []),
  ];
  const failed = measurements.filter((m) =>
    m.flexible ? m.h < m.expected - 1 : Math.abs(m.h - m.expected) > 1,
  );
  useEffect(() => {
    let frame = 0;
    const measure = () =>
      setMeasurements(
        Array.from(
          document.querySelectorAll(
            "[data-workspace] .seda-button,[data-workspace] .seda-icon-button,[data-workspace] .seda-field__control,[data-workspace] .seda-choice,[data-workspace] .seda-toggle,[data-workspace] .seda-tabs__tab",
          ),
        )
          .filter((el) => el.getBoundingClientRect().height > 0)
          .map((el, index) => ({
            id:
              el.id ||
              el.querySelector("input,select")?.id ||
              "control-" + index,
            h: el.getBoundingClientRect().height,
            expected: el.matches(".workspace-row-choice")
              ? Math.max(d.preset.icon, d.font)
              : el.id === "save" && form.saving
                ? (pendingHeightRef.current ?? d.height)
                : d.height,
            flexible: el.matches(".seda-choice,.seda-toggle"),
          })),
      );
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    const target = document.querySelector("main[data-workspace]")!;
    const mutation = new MutationObserver(schedule);
    mutation.observe(target, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["hidden", "style", "data-state", "data-loading"],
    });
    const resize = new ResizeObserver(schedule);
    resize.observe(target);
    schedule();
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      mutation.disconnect();
      resize.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, [compiled, parameters, form.saving]);
  function exportJson() {
    const payload = {
      name: "SEDA AI Lab 2.0",
      source: "seda-compiled-profile",
      configuration,
      parameters,
      calculated: d,
      baseGeometry: compiled.geometry,
      pendingHeight: form.saving ? pendingHeightRef.current : null,
      pendingPaddingX: form.saving ? pendingPaddingRef.current : null,
      evidence: bindings,
      workspace: workspaceBinding,
      provenance,
      scope:
        "Custom geometry is a laboratory derivation; Table/Card/Dialog are demo compositions.",
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "seda-lab2-config.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <ControlContractProvider compiled={compiled}>
      <div
        className="shell"
        id="lab"
        data-theme={compiled.domTheme}
        style={
          {
            "--control-height": d.height + "px",
            "--control-radius": d.radius + "px",
            "--control-font": d.font + "px",
          } as React.CSSProperties
        }
      >
        <header className="top">
          <div className="brand">
            <span className="mark">S</span>
            <div>
              <b>SEDA AI</b>
              <small>PARAMETRIC DESIGN LAB · 2.0</small>
            </div>
          </div>
          <div className="topmeta">
            <a className="subtle" href="./references/recents.html">Файлы</a><a className="subtle" href="./references/building.html">Документы</a><a className="subtle" href="./references/chat.html">Чат</a><a className="subtle" href="./references/sandbox.html">Sandbox</a>
            <span className="status-dot"></span> Live calculations{" "}
            <button
              onClick={() => {
                configure(initialConfiguration);
                setParameters({
                  scale: 100,
                  air: 0,
                  airX: 0,
                  radius: 100,
                  strict: true,
                });
              }}
              id="reset"
              className="subtle"
            >
              Сбросить
            </button>
            <button onClick={exportJson} id="export" className="subtle">
              Экспорт JSON
            </button>
          </div>
        </header>
        <div className="workspace">
          <aside className="rail">
            <div className="eyebrow">01 / КОНФИГУРАЦИЯ</div>
            <Text as="h2" variant="heading/section">Параметры</Text>
            <p>
              Измените параметры системы. Результат пересчитывается в
              интерфейсе.
            </p>
            <label>
              Тема{" "}
              <select
                id="theme"
                value={compiled.domTheme}
                onChange={(e) =>
                  configure({
                    theme: e.target.value === "light" ? "Light" : "Dark",
                  })
                }
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>
            <label>
              Размер{" "}
              <select
                id="size"
                value={configuration.controlSize}
                onChange={(e) =>
                  configure({
                    controlSize: e.target.value as Configuration["controlSize"],
                  })
                }
              >
                {["s", "m", "l", "xl"].map((s) => (
                  <option key={s} value={s}>
                    {s.toUpperCase()} ·{" "}
                    {
                      profiles[configuration.theme + ":" + s].geometry.height
                        .value
                    }
                  </option>
                ))}
              </select>
            </label>
            <div className="control">
              <div className="between">
                <label htmlFor="scale">Масштаб текста</label>
                <output id="scaleValue">{parameters.scale}%</output>
              </div>
              <input
                id="scale"
                type="range"
                min="80"
                max="150"
                step="5"
                value={parameters.scale}
                onChange={(e) =>
                  setParameters((p) => ({
                    ...p,
                    scale: Number(e.target.value),
                  }))
                }
              />
              <div className="ends">
                <span>80%</span>
                <span>150%</span>
              </div>
            </div>
            <div className="control">
              <div className="between">
                <label htmlFor="air">Дополнительный отступ по Y</label>
                <output id="airValue">+{parameters.air} px</output>
              </div>
              <input
                id="air"
                type="range"
                min="0"
                max="12"
                step="1"
                value={parameters.air}
                onChange={(e) =>
                  setParameters((p) => ({ ...p, air: Number(e.target.value) }))
                }
              />
              <div className="ends">
                <span>0</span>
                <span>12px</span>
              </div>
            </div>
            <div className="control">
              <div className="between">
                <label htmlFor="airX">Дополнительный отступ по X</label>
                <output id="airXValue">+{parameters.airX} px</output>
              </div>
              <input
                id="airX"
                type="range"
                min="0"
                max="24"
                step="1"
                value={parameters.airX}
                onChange={(e) =>
                  setParameters((p) => ({ ...p, airX: Number(e.target.value) }))
                }
              />
              <div className="ends">
                <span>0</span>
                <span>24px</span>
              </div>
              <p className="small">
                К базовым отступам Button, TextField и Select. IconButton остаётся
                квадратным.
              </p>
            </div>
            <div className="control">
              <div className="between">
                <label htmlFor="radius">Множитель радиуса</label>
                <output id="radiusValue">
                  {(parameters.radius / 100).toFixed(2)}×
                </output>
              </div>
              <input
                id="radius"
                type="range"
                min="50"
                max="175"
                step="5"
                value={parameters.radius}
                onChange={(e) =>
                  setParameters((p) => ({
                    ...p,
                    radius: Number(e.target.value),
                  }))
                }
              />
              <div className="ends">
                <span>0.5×</span>
                <span>1.75×</span>
              </div>
            </div>
            <div className="sectionline"></div>
            <div className="eyebrow">ЦЕЛЬ ПРОЕКТИРОВАНИЯ</div>
            <label className="check">
              <input
                id="strict"
                type="checkbox"
                checked={parameters.strict}
                onChange={(e) =>
                  setParameters((p) => ({ ...p, strict: e.target.checked }))
                }
              />{" "}
              Сохранять минимум высоты пресета
            </label>
            <p className="small">
              Если вычисленная высота меньше пресета, ограничение поднимает её
              до минимальной.
            </p>
            <div className="note">
              Исходные S / M / L / XL — фиксированные пресеты. Формула
              применяется только к дополнительным настройкам лаборатории.
            </div>
          </aside>
          <main className="canvas" data-workspace style={workspaceStyle}>
            <SedaProvider textScale={parameters.scale} style={{display:'contents'}}>
            <ProductWorkspace size={configuration.controlSize} action={real} typography={compiled.typography.roles} textScale={parameters.scale}>
              <div className="section-top">
                <div>
                  <div className="eyebrow">02 / LIVE PREVIEW</div>
                  <Text as="h1" variant="heading/page">Product workspace</Text>
                  <p>
                    Один набор правил управляет формой, фильтрами, таблицей и
                    карточками.
                  </p>
                </div>
                <div className="view-switch">
                  <Button
                    {...real("cancel")}
                    size={configuration.controlSize}
                    data-view="table"
                    className={view === "table" ? "active" : ""}
                    onClick={() => setView("table")}
                  >
                    Таблица
                  </Button>
                  <Button
                    {...real("cancel")}
                    size={configuration.controlSize}
                    data-view="cards"
                    className={view === "cards" ? "active" : ""}
                    onClick={() => setView("cards")}
                  >
                    Карточки
                  </Button>
                </div>
              </div>
              <div className="preview" id="preview">
                <div className="panelhead">
                  <div>
                    <b>Проекты</b>
                    <span className="hint">
                      Управление рабочим пространством
                    </span>
                  </div>
                  <Button
                    {...real("save")}
                    id="create"
                    size={configuration.controlSize}
                    variant="primary"
                    onClick={() => modal.current?.showModal()}
                  >
                    + Создать проект
                  </Button>
                </div>
                <div className="toolbar workspace-filters">
                  <div className="searchwrap" {...real("projectName")}>
                    <TextField
                      id="search"
                      label="Поиск проектов"
                      aria-label="Поиск проектов"
                      size={configuration.controlSize}
                      placeholder="Поиск проектов..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                  <Select
                    className="workspace-select"
                    id="filter"
                    label="Статус"
                    aria-label="Фильтр статуса"
                    size={configuration.controlSize}
                    value={filter}
                    onValueChange={(v) => setFilter(String(v))}
                    options={[
                      { value: "all", label: "Все статусы" },
                      { value: "active", label: "Активные" },
                      { value: "draft", label: "Черновики" },
                      { value: "paused", label: "Приостановлены" },
                    ]}
                  />
                  <Select
                    className="workspace-select"
                    id="team-filter"
                    label="Команда"
                    size={configuration.controlSize}
                    value={teamFilter}
                    onValueChange={(v) => setTeamFilter(String(v))}
                    options={["all", "Core", "Product", "Design", "Mobile"].map(
                      (v) => ({
                        value: v,
                        label: v === "all" ? "Все команды" : v,
                      }),
                    )}
                  />
                  <Select
                    className="workspace-select"
                    id="project-sort"
                    label="Сортировка"
                    size={configuration.controlSize}
                    value={sort}
                    onValueChange={(v) => setSort(String(v))}
                    options={[
                      { value: "original", label: "Исходный порядок" },
                      { value: "name-asc", label: "Название А → Я" },
                      { value: "name-desc", label: "Название Я → А" },
                    ]}
                  />
                  <div className="workspace-filter-actions">
                    <Checkbox
                      className="workspace-checkbox"
                      id="only-active"
                      label="Только активные"
                      size={configuration.controlSize}
                      checked={onlyActive}
                      onCheckedChange={setOnlyActive}
                    />
                    <Button
                      {...real("cancel")}
                      size={configuration.controlSize}
                      id="reset-filters"
                      onClick={resetFilters}
                    >
                      Сбросить фильтры
                    </Button>
                  </div>
                  <span className="count" id="count">
                    {filteredItems.length} проектов
                  </span>
                </div>
                {selectedProjects.length > 0 && (
                  <div
                    className="workspace-bulk"
                    role="region"
                    aria-label="Групповые действия"
                  >
                    <strong>Выбрано: {selectedProjects.length}</strong>
                    <Button
                      {...real("cancel")}
                      id="bulk-pause"
                      size={configuration.controlSize}
                      onClick={() => {
                        setProjects((previous) =>
                          previous.map((p) =>
                            selectedProjects.includes(p.name)
                              ? { ...p, status: "paused" }
                              : p,
                          ),
                        );
                        setSelectedProjects([]);
                      }}
                    >
                      Приостановить выбранные
                    </Button>
                    <Button
                      {...real("cancel")}
                      size={configuration.controlSize}
                      onClick={() => setSelectedProjects([])}
                    >
                      Снять выбор
                    </Button>
                  </div>
                )}
                <div
                  id="tableView"
                  className="workspace-table-scroll"
                  tabIndex={0}
                  aria-label="Таблица проектов"
                  hidden={view !== "table"}
                >
                  <table>
                    <thead>
                      <tr>
                        <th>
                          <Checkbox
                            className="workspace-checkbox workspace-row-choice"
                            id="select-all-projects"
                            size={configuration.controlSize}
                            label="Выбрать видимые проекты"
                            checked={
                              items.length > 0 &&
                              selectedVisible.length === items.length
                            }
                            indeterminate={
                              selectedVisible.length > 0 &&
                              selectedVisible.length < items.length
                            }
                            disabled={!items.length}
                            onCheckedChange={(checked) =>
                              setSelectedProjects((previous) =>
                                checked
                                  ? Array.from(
                                      new Set([
                                        ...previous,
                                        ...items.map((p) => p.name),
                                      ]),
                                    )
                                  : previous.filter(
                                      (name) =>
                                        !items.some((p) => p.name === name),
                                    ),
                              )
                            }
                          />
                        </th>
                        <th>ПРОЕКТ</th>
                        <th>СТАТУС</th>
                        <th>КОМАНДА</th>
                        <th>ОБНОВЛЁН</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody id="tbody">
                      {items.map((p) => (
                        <tr key={p.name}>
                          <td>
                            <Checkbox
                              className="workspace-checkbox workspace-row-choice"
                              size={configuration.controlSize}
                              label={"Выбрать " + p.name}
                              checked={selectedProjects.includes(p.name)}
                              onCheckedChange={(checked) =>
                                setSelectedProjects((previous) =>
                                  checked
                                    ? [...previous, p.name]
                                    : previous.filter(
                                        (name) => name !== p.name,
                                      ),
                                )
                              }
                            />
                          </td>
                          <td>
                            <span className="avatar">{p.name.slice(0, 1)}</span>
                            {p.name}
                          </td>
                          <td>
                            <span className={"pill " + p.status}>
                              {statusLabels[p.status]}
                            </span>
                          </td>
                          <td>{p.team}</td>
                          <td>{p.updated}</td>
                          <td>
                            <DropdownMenu
                              style={real("help").style}
                              size={configuration.controlSize}
                              triggerLabel={"Действия проекта " + p.name}
                              iconOnly
                              triggerIcon={<span>···</span>}
                              variant="grouped"
                              items={[
                                {type:"group",id:"project",label:p.name,items:[
                                  {id:"open",label:"Открыть сведения",onSelect:()=>chooseProject(p.name)},
                                  {id:"duplicate",label:"Создать копию",onSelect:()=>{setModalName(p.name+" — копия");modal.current?.showModal();}},
                                ]},
                                {type:"separator",id:"danger-separator"},
                                {id:"delete",label:"Удалить проект",danger:true,onSelect:()=>{
                                  deleteReturnFocus.current=document.activeElement as HTMLElement;
                                  setDeleteProject(p.name);deleteDialog.current?.showModal();
                                }},
                              ]}
                            />
                          </td>
                        </tr>
                      ))}
                      {!items.length && (
                        <tr>
                          <td colSpan={6}>Проекты не найдены</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="cards" id="cardsView" hidden={view !== "cards"}>
                  {items.map((p) => (
                    <article className="productcard" key={p.name}>
                      <header>
                        <b>{p.name}</b>
                        <span className={"pill " + p.status}>
                          {statusLabels[p.status]}
                        </span>
                      </header>
                      <div>
                        <p>Команда: {p.team}</p>
                        <p>Обновлён: {p.updated}</p>
                      </div>
                      <Button
                        {...real("cancel")}
                        size={configuration.controlSize}
                        onClick={() => chooseProject(p.name)}
                      >
                        Подробнее
                      </Button>
                    </article>
                  ))}
                  {!items.length && <p>Проекты не найдены</p>}
                </div>
              </div>
              <div className="workspace-pagination">
                <p role="status">
                  {filteredItems.length ? currentPage * pageSize + 1 : 0}–
                  {Math.min((currentPage + 1) * pageSize, filteredItems.length)}{" "}
                  из {filteredItems.length}
                </p>
                <div>
                  <Select
                    className="workspace-select"
                    id="page-size"
                    label="Строк на странице"
                    size={configuration.controlSize}
                    value={String(pageSize)}
                    onValueChange={(v) => setPageSize(Number(v))}
                    options={[3, 5, 10].map((n) => ({
                      value: String(n),
                      label: String(n),
                    }))}
                  />
                  <Button
                    {...real("cancel")}
                    id="previous-page"
                    size={configuration.controlSize}
                    disabled={currentPage === 0}
                    onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                  >
                    Назад
                  </Button>
                  <Button
                    {...real("cancel")}
                    id="next-page"
                    size={configuration.controlSize}
                    disabled={
                      (currentPage + 1) * pageSize >= filteredItems.length
                    }
                    onClick={() => setPageIndex((p) => p + 1)}
                  >
                    Далее
                  </Button>
                </div>
              </div>
              <div className="secondaryGrid">
                <section className="pane">
                  <div className="eyebrow">ПРОВЕРКА ПОВЕДЕНИЯ</div>
                  <Text as="h3" variant="heading/panel">Форма настроек</Text>
                  <form
                    id="settings-form"
                    noValidate
                    onSubmit={(e) => {
                      e.preventDefault();
                      dispatch({
                        type: "submit",
                        route: formRef.current.saveError
                          ? "retry"
                          : "programmatic",
                      });
                    }}
                  >
                    <div className="fieldrow">
                      <div className="fieldslot" {...real("projectName")}>
                        <TextField
                          {...propsFor("projectName")}
                          id="project"
                          ref={fieldRef}
                        />
                      </div>
                      <IconButton
                        {...propsFor("help")}
                        {...real("help")}
                        id="help"
                        aria-controls="help-panel"
                      />
                    </div>
                    <div id="help-panel" hidden={!form.helpExpanded}>
                      {compiled.copy.helpText}
                    </div>
                    <div className="msg" id="validation" aria-live="polite">
                      {form.saveError}
                    </div>
                    <div className="actions">
                      <Button
                        {...propsFor("save")}
                        {...real("save", true)}
                        id="save"
                      />
                      <Button
                        {...propsFor("cancel")}
                        {...real("cancel")}
                        id="cancel"
                      />
                    </div>
                  </form>
                  <div className="transport">
                    <b>Тест запросов · демо без сервера</b>
                    <span id="requestState" role="status">
                      {form.activeRequest
                        ? "Запрос #" +
                          form.activeRequest.id +
                          " · отправлено: «" +
                          form.activeRequest.value +
                          "»"
                        : stateLabel}
                    </span>
                    <Select
                      className="workspace-select"
                      id="transport-mode"
                      label="Ответ демо-транспорта"
                      size={configuration.controlSize}
                      value={transportMode}
                      onValueChange={(v) =>
                        setTransportMode(String(v) as TransportMode)
                      }
                      options={[
                        { value: "manual", label: "Вручную" },
                        { value: "success", label: "Успех через 900 мс" },
                        { value: "failure", label: "Ошибка через 900 мс" },
                      ]}
                    />
                    <div className="transportActions">
                      <Button
                        {...real("cancel")}
                        id="success"
                        size="s"
                        disabled={!form.saving}
                        onClick={() =>
                          form.activeRequest &&
                          respond(form.activeRequest.id, "success")
                        }
                      >
                        Ответ: успех
                      </Button>
                      <Button
                        {...real("cancel")}
                        id="failure"
                        size="s"
                        disabled={!form.saving}
                        onClick={() =>
                          form.activeRequest &&
                          respond(form.activeRequest.id, "failure")
                        }
                      >
                        Ответ: ошибка
                      </Button>
                    </div>
                  </div>
                </section>
                <section className="pane">
                  <div className="eyebrow">03 / СРАВНЕНИЕ</div>
                  <Text as="h3" variant="heading/panel">До → после</Text>
                  <div className="compare">
                    <div>
                      <span>Базовый профиль</span>
                      <strong id="before">{d.preset.height} px</strong>
                    </div>
                    <span className="arrow">→</span>
                    <div>
                      <span>Текущая система</span>
                      <strong id="after">{fmt(d.height)} px</strong>
                    </div>
                  </div>
                  <div className="delta" id="delta">
                    Изменение высоты: {fmt(d.height - d.preset.height)} px
                  </div>
                  <div className="metricrow">
                    <span>Размер шрифта</span>
                    <b id="fontMetric">{d.font} px</b>
                  </div>
                  <div className="metricrow">
                    <span>Радиус</span>
                    <b id="radiusMetric">{fmt(d.radius)} px</b>
                  </div>
                  <div className="metricrow">
                    <span>Затронутые контролы</span>
                    <b>{measurements.length} видимых</b>
                  </div>
                  <div
                    id="conflict"
                    className={issues.length ? "conflict warn" : "conflict"}
                    role="status"
                  >
                    {issues.join(" ") || "Конфликтов геометрии не обнаружено."}
                  </div>
                </section>
              </div>
            </ProductWorkspace>
            </SedaProvider>
          </main>
          <aside className="inspector">
            <div className="eyebrow">04 / EXPLAIN ENGINE</div>
            <Text as="h2" variant="heading/section">Инспектор</Text>
            <p>
              Выберите узел, чтобы увидеть значение, формулу и зависимые части
              интерфейса.
            </p>
            <div className="graph" id="graph">
              <button
                data-node="size"
                className={"node " + (selected === "size" ? "chosen" : "")}
                onClick={() => setSelected("size")}
              >
                size
              </button>
              <span className="edge">→</span>
              <button
                data-node="lineHeight"
                className={
                  "node " + (selected === "lineHeight" ? "chosen" : "")
                }
                onClick={() => setSelected("lineHeight")}
              >
                line-height
              </button>
              <span className="edge">→</span>
              <button
                data-node="height"
                className={"node " + (selected === "height" ? "chosen" : "")}
                onClick={() => setSelected("height")}
              >
                height
              </button>
              <div className="graphsecond">
                <button
                  data-node="airX"
                  className={"node " + (selected === "airX" ? "chosen" : "")}
                  onClick={() => setSelected("airX")}
                >
                  padding-x
                </button>
                <span className="edge">→</span>
                <span className="deps">Button / TextField / Select</span>
              </div>
              <div className="graphsecond">
                <button
                  data-node="air"
                  className={"node " + (selected === "air" ? "chosen" : "")}
                  onClick={() => setSelected("air")}
                >
                  padding-y
                </button>
                <span className="edge">↗</span>
                <button
                  data-node="radius"
                  className={"node " + (selected === "radius" ? "chosen" : "")}
                  onClick={() => setSelected("radius")}
                >
                  radius
                </button>
                <span className="edge">→</span>
                <button
                  data-node="components"
                  className={
                    "node " + (selected === "components" ? "chosen" : "")
                  }
                  onClick={() => setSelected("components")}
                >
                  UI
                </button>
              </div>
            </div>
            <div className="inspectcard">
              <div className="eyebrow">ОХВАТ WORKSPACE</div>
              <p>
                Общие параметры применяются ко всей рабочей области приложения.
                У Checkbox/Radio/Toggle X меняет интервал до подписи, Y — высоту
                строки. Круг Radio и форма Toggle сохраняются. Служебная панель
                лаборатории отделена.
              </p>
              <p>
                Контракты: {workspaceBinding.coverage.contract.join(", ")}. Формы и таблицы —
                композиции.
              </p>
              <details className="workspace-tokens">
                <summary>Источники дополнительных контролов</summary>
                {workspaceBinding.evidence.map((item: any) => (
                  <div key={`${item.component}:${item.property}:${item.path}`}>
                    <code>
                      {item.property} = {item.cssValue}
                    </code>
                    <small>
                      {item.chain
                        .map(
                          (step: any) =>
                            step.collection + "/" + step.path.join("/"),
                        )
                        .join(" → ")}
                    </small>
                  </div>
                ))}
              </details>
            </div>
            <div className="inspectcard">
              <div className="between">
                <span className="eyebrow">АКТИВНЫЙ УЗЕЛ</span>
                <code id="lab-active-node">{selected}</code>
              </div>
              <div className="result" id="nodeResult">
                {node.v}
              </div>
              <p id="nodeDesc">{node.desc}</p>
            </div>
            <div className="inspectcard">
              <div className="eyebrow">ФОРМУЛА</div>
              <div className="formula" id="formula">
                H = max(L, I) + 2P + 2B
              </div>
              <div className="equation" id="equation">
                {d.formula}
                {d.constraint
                  ? ` → max(${fmt(d.raw)}, ${d.preset.height}) = ${fmt(d.height)} px`
                  : ""}
              </div>
              <div className="metricrow">
                <span>Вычисленная высота</span>
                <b id="calculated">{fmt(d.height)} px</b>
              </div>
              <div className="metricrow">
                <span>Фактическая высота DOM</span>
                <b id="measured">
                  {measurements.length ? fmt(measurements[0].h) + " px" : "—"}
                </b>
              </div>
              <div
                id="conformance"
                className={failed.length ? "conflict warn" : "passed"}
              >
                {!measurements.length
                  ? "Измерение…"
                  : failed.length
                    ? "Расхождение > 1 px: " +
                      failed.map((m) => m.id).join(", ")
                    : "PASS: " +
                      measurements.length +
                      " контролов, допуск ±1 px" +
                      (form.saving ? " · loading сохраняет snapshot" : "")}
              </div>
            </div>
            <div className="inspectcard">
              <div className="eyebrow">ЗАВИСИМОСТИ</div>
              <div id="deps" className="deps">
                {node.deps}
              </div>
            </div>
            <div className="inspectcard">
              <div className="eyebrow">ПРОВЕРКИ</div>
              <div id="checks" className="checks">
                <div>
                  <span>Источник профиля</span>
                  <b>compiler/resolver</b>
                </div>
                <div>
                  <span>Формула конечна</span>
                  <b>{Number.isFinite(d.height) ? "PASS" : "FAIL"}</b>
                </div>
                <div>
                  <span>Геометрия DOM ±1 px</span>
                  <b>
                    {!measurements.length
                      ? "ожидание"
                      : failed.length
                        ? "FAIL"
                        : "PASS"}
                  </b>
                </div>
              </div>
              <p className="small">
                {workspaceBinding.coverage.contract.join(" · ")} — исполняемые контракты SEDA UI. Table · Card · Dialog — композиции.
                SplitView — общий experimental layout; размеры панелей управляются отдельно.
                Дополнительная геометрия — эксперимент Lab, не сертифицированный
                профиль.
              </p>
              <details>
                <summary>Источники применённых значений</summary>
                <select
                  aria-label="Источник компонента"
                  value={inspectedRole}
                  onChange={(e) => setInspectedRole(e.target.value)}
                >
                  {Object.keys(bindings.recipes).map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
                {evidence.map((item: any) => (
                  <div className="source" key={item.property}>
                    <code>
                      {item.property} ={" "}
                      {String(
                        (geometryVars as any)[item.property] ?? item.cssValue,
                      )}
                    </code>
                    <span>
                      {item.derivation ? "Lab derive ← " : ""}
                      {item.path}
                    </span>
                    <small>
                      {item.chain?.length
                        ? item.chain
                            .map(
                              (s: any) =>
                                s.collection +
                                "/" +
                                s.path.join("/") +
                                " [" +
                                s.mode +
                                "]",
                            )
                            .join(" → ")
                        : item.source}
                    </small>
                  </div>
                ))}
                <code>tokens SHA256: {provenance.tokensSha256}</code>
              </details>
            </div>
          </aside>
        </div>
      </div>
      <dialog
        id="modal"
        data-workspace
        ref={modal}
        aria-labelledby="modal-title"
        style={workspaceStyle}
      >
        <form
          className="modalBody"
          onSubmit={(e) => {
            e.preventDefault();
            if (!modalName.trim()) return;
            setProjects((p) => [
              {
                name: modalName.trim(),
                status: "draft",
                team: "Product",
                updated: "Сейчас",
              },
              ...p,
            ]);
            setModalName("");
            setQuery("");
            setFilter("all");
            modal.current?.close();
          }}
        >
          <div className="eyebrow">НОВЫЙ ПРОЕКТ</div>
          <Text as="h2" variant="heading/section" id="modal-title">Создать проект</Text>
          <div {...real("projectName")}>
            <TextField
              id="modalName"
              label="Название"
              required
              size={configuration.controlSize}
              placeholder="Например, Nova Console"
              value={modalName}
              onChange={(e) => setModalName(e.target.value)}
            />
          </div>
          <div className="modalActions">
            <Button {...real("cancel")} onClick={() => modal.current?.close()}>
              Отмена
            </Button>
            <Button
              {...real("save")}
              id="confirmCreate"
              type="submit"
              variant="primary"
            >
              Создать
            </Button>
          </div>
        </form>
      </dialog>
      <dialog id="delete-project-dialog" ref={deleteDialog} aria-labelledby="delete-project-title" data-workspace style={workspaceStyle}
        onClose={()=>{setDeleteProject(null);if(deleteReturnFocus.current?.isConnected)deleteReturnFocus.current.focus();else document.getElementById("search")?.focus();}}>
        <div className="modalBody">
          <Text as="h2" variant="heading/section" id="delete-project-title">Удалить проект?</Text>
          <p>Проект «{deleteProject}» будет удалён из демонстрационного списка. Несохранённая форма останется без изменений.</p>
          <div className="modalActions">
            <Button {...real("cancel")} onClick={()=>deleteDialog.current?.close()}>Отмена</Button>
            <Button {...real("save")} id="confirmDeleteProject" onClick={()=>{
              if(deleteProject===null)return;
              setProjects(previous=>previous.filter(project=>project.name!==deleteProject));
              setSelectedProjects(previous=>previous.filter(name=>name!==deleteProject));
              deleteDialog.current?.close();
            }}>Удалить проект</Button>
          </div>
        </div>
      </dialog>
      {isReview && <ControlFixtures size={configuration.controlSize} style={workspaceStyle} />}
      {isReview && (
        <ReviewFixtures
          compiled={compiled}
          actionVars={bindings.recipes.save.vars as React.CSSProperties}
        />
      )}
    </ControlContractProvider>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
