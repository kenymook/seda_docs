import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Button, IconButton, TextField } from "@seda-ai/ui";
import {
  createFormState,
  transitionForm,
} from "../../../../packages/seda-contracts/src/form.mjs";
import {
  createWebBindings,
  bindWebRecipe,
} from "../../../../packages/seda-contracts/src/web.mjs";
import { profiles, profile, provenance } from "seda:catalog";
import { ReviewFixtures } from "./test-fixtures";
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@seda-ai/ui/styles.css";
import "./styles.css";
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
    radius: 100,
    strict: true,
  });
  const [view, setView] = useState("table");
  const [query, setQuery] = useState("");
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
    { id: string; h: number; expected: number }[]
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
  const bindings = {
    ...baseBindings,
    recipes: Object.fromEntries(
      Object.entries(baseBindings.recipes).map(([role, b]) => [
        role,
        {
          ...b,
          vars: { ...b.vars, ...geometryVars },
          evidence: b.evidence.map((item) => {
            const calculated = (geometryVars as Record<string, string>)[
              item.property
            ];
            return calculated
              ? {
                  ...item,
                  baseCssValue: item.cssValue,
                  cssValue: calculated,
                  derivation: {
                    source: "lab-model.mjs#derive",
                    parameters,
                    inputs: compiled.geometry,
                  },
                }
              : item;
          }),
        },
      ]),
    ),
  };
  const real = (role: string) => ({
    ...bindings.recipes[role].attributes,
    style: {
      ...bindings.recipes[role].vars,
      ...geometryVars,
    } as React.CSSProperties,
  });

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
    setParameters({ scale: 100, air: 0, radius: 100, strict: true });
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
  const items = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(query.trim().toLowerCase()) &&
      (filter === "all" || p.status === filter),
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
      deps: "line-height + icon + padding-y + border + min-height → Button, IconButton, TextField",
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
    radius: {
      v: fmt(d.radius) + " px",
      desc:
        d.preset.radius + " × " + parameters.radius + "% = " + fmt(d.radius),
      deps: "size + radius multiplier → radius of controls",
    },
    components: {
      v: "5 контролов",
      desc: "Реальные Button, IconButton, TextField",
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
  const failed = measurements.filter((m) => Math.abs(m.h - m.expected) > 1);
  useEffect(() => {
    const measure = () =>
      setMeasurements(
        ["create", "save", "cancel", "help", "project"].map((id) => {
          const el = document.getElementById(id)!;
          return {
            id,
            h: (id === "project"
              ? el.closest(".seda-field__control")!
              : el
            ).getBoundingClientRect().height,
            expected:
              id === "save" && form.saving
                ? (pendingHeightRef.current ?? d.height)
                : d.height,
          };
        }),
      );
    const frame = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
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
      evidence: bindings,
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
    <>
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
            <span className="status-dot"></span> Live calculations{" "}
            <button
              onClick={() => {
                configure(initialConfiguration);
                setParameters({
                  scale: 100,
                  air: 0,
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
            <h2>Параметры</h2>
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
          <main className="canvas">
            <div className="section-top">
              <div>
                <div className="eyebrow">02 / LIVE PREVIEW</div>
                <h1>Product workspace</h1>
                <p>
                  Один набор правил управляет формой, фильтрами, таблицей и
                  карточками.
                </p>
              </div>
              <div className="view-switch">
                <button
                  data-view="table"
                  className={view === "table" ? "active" : ""}
                  onClick={() => setView("table")}
                >
                  Таблица
                </button>
                <button
                  data-view="cards"
                  className={view === "cards" ? "active" : ""}
                  onClick={() => setView("cards")}
                >
                  Карточки
                </button>
              </div>
            </div>
            <div className="preview" id="preview">
              <div className="panelhead">
                <div>
                  <b>Проекты</b>
                  <span className="hint">Управление рабочим пространством</span>
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
              <div className="toolbar">
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
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  id="filter"
                  aria-label="Фильтр статуса"
                >
                  <option value="all">Все статусы</option>
                  <option value="active">Активные</option>
                  <option value="draft">Черновики</option>
                  <option value="paused">Приостановлены</option>
                </select>
                <span className="count" id="count">
                  {items.length} проектов
                </span>
              </div>
              <div id="tableView" hidden={view !== "table"}>
                <table>
                  <thead>
                    <tr>
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
                          <IconButton
                            {...real("help")}
                            size={configuration.controlSize}
                            variant="ghost"
                            aria-label={"Открыть сведения " + p.name}
                            icon={<span>···</span>}
                            onClick={() => chooseProject(p.name)}
                          />
                        </td>
                      </tr>
                    ))}
                    {!items.length && (
                      <tr>
                        <td colSpan={5}>Проекты не найдены</td>
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
            <div className="secondaryGrid">
              <section className="pane">
                <div className="eyebrow">ПРОВЕРКА ПОВЕДЕНИЯ</div>
                <h3>Форма настроек</h3>
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
                    <Button {...propsFor("save")} {...real("save")} id="save" />
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
                  <label>
                    Ответ{" "}
                    <select
                      id="transport-mode"
                      value={transportMode}
                      onChange={(e) =>
                        setTransportMode(e.target.value as TransportMode)
                      }
                    >
                      <option value="manual">Вручную</option>
                      <option value="success">Успех через 900 мс</option>
                      <option value="failure">Ошибка через 900 мс</option>
                    </select>
                  </label>
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
                <h3>До → после</h3>
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
                  <b>5 элементов</b>
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
          </main>
          <aside className="inspector">
            <div className="eyebrow">04 / EXPLAIN ENGINE</div>
            <h2>Инспектор</h2>
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
              <div className="between">
                <span className="eyebrow">АКТИВНЫЙ УЗЕЛ</span>
                <code id="nodeName">{selected}</code>
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
                    : "PASS: 5 контролов, допуск ±1 px" +
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
                Button · IconButton · TextField — реальные SEDA UI. Table · Card
                · Dialog · Select · Range — демонстрационные композиции.
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
                      {(geometryVars as any)[item.property]
                        ? "Lab derive ← "
                        : ""}
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
        ref={modal}
        aria-labelledby="modal-title"
        style={{ ...geometryVars } as React.CSSProperties}
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
          <h2 id="modal-title">Создать проект</h2>
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
      {isReview && <ReviewFixtures compiled={compiled} />}
    </>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
