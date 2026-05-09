import { useState, useEffect, useRef } from "react";

// ─── SEDA UI Design Tokens as CSS Variables ───
const TOKENS_LIGHT = {
  "--seda-surface-default": "#ffffff",
  "--seda-surface-hover": "#f5f5f5",
  "--seda-surface-pressed": "#ebebeb",
  "--seda-surface-inverse": "#1a1a1a",
  "--seda-surface-brand": "#0072F5",
  "--seda-surface-brand-hover": "#005BC4",
  "--seda-surface-brand-pressed": "#004999",
  "--seda-container-default": "rgba(0,0,0,0.05)",
  "--seda-container-hover": "rgba(0,0,0,0.10)",
  "--seda-container-pressed": "rgba(0,0,0,0.15)",
  "--seda-container-brand": "#0072F5",
  "--seda-container-brand-hover": "#005BC4",
  "--seda-container-brand-pressed": "#004999",
  "--seda-container-inverse": "#1a1a1a",
  "--seda-border-default": "rgba(0,0,0,0.08)",
  "--seda-border-hover": "rgba(0,0,0,0.12)",
  "--seda-border-pressed": "rgba(0,0,0,0.18)",
  "--seda-border-brand": "#0072F5",
  "--seda-text-primary": "#111111",
  "--seda-text-secondary": "rgba(0,0,0,0.85)",
  "--seda-text-tertiary": "rgba(0,0,0,0.60)",
  "--seda-text-muted": "rgba(0,0,0,0.40)",
  "--seda-text-on-brand": "#ffffff",
  "--seda-text-on-inverse": "#ffffff",
  "--seda-link-default": "#0072F5",
  "--seda-link-hover": "#005BC4",
  "--seda-status-info-surface": "#0072F5",
  "--seda-status-info-container": "#E6F0FF",
  "--seda-status-info-border": "#0072F5",
  "--seda-status-info-text": "#0072F5",
  "--seda-status-error-surface": "#E53935",
  "--seda-status-error-container": "#FEECEB",
  "--seda-status-error-border": "#E53935",
  "--seda-status-error-text": "#E53935",
  "--seda-status-warning-surface": "#F5A623",
  "--seda-status-warning-container": "#FFF8E6",
  "--seda-status-warning-border": "#F5A623",
  "--seda-status-warning-text": "#9A6700",
  "--seda-status-success-surface": "#2E7D32",
  "--seda-status-success-container": "#E8F5E9",
  "--seda-status-success-border": "#2E7D32",
  "--seda-status-success-text": "#2E7D32",
  "--seda-status-disabled-surface": "#f5f5f5",
  "--seda-status-disabled-container": "rgba(0,0,0,0.05)",
  "--seda-status-disabled-border": "rgba(0,0,0,0.08)",
  "--seda-status-disabled-text": "rgba(0,0,0,0.25)",
  "--seda-focus-ring": "rgba(0,114,245,0.24)",
  "--seda-shadow-base": "0 1px 3px rgba(0,0,0,0.05)",
  "--seda-shadow-darker": "0 4px 12px rgba(0,0,0,0.10)",
  "--seda-radius-sm": "6px",
  "--seda-radius-md": "8px",
  "--seda-radius-lg": "10px",
  "--seda-radius-xl": "12px",
};

const TOKENS_DARK = {
  "--seda-surface-default": "#111111",
  "--seda-surface-hover": "#1a1a1a",
  "--seda-surface-pressed": "#222222",
  "--seda-surface-inverse": "#ffffff",
  "--seda-surface-brand": "#0072F5",
  "--seda-surface-brand-hover": "#005BC4",
  "--seda-surface-brand-pressed": "#004999",
  "--seda-container-default": "rgba(255,255,255,0.10)",
  "--seda-container-hover": "rgba(255,255,255,0.12)",
  "--seda-container-pressed": "rgba(255,255,255,0.15)",
  "--seda-container-brand": "#0072F5",
  "--seda-container-brand-hover": "#005BC4",
  "--seda-container-brand-pressed": "#004999",
  "--seda-container-inverse": "#f5f5f5",
  "--seda-border-default": "rgba(255,255,255,0.08)",
  "--seda-border-hover": "rgba(255,255,255,0.12)",
  "--seda-border-pressed": "rgba(255,255,255,0.18)",
  "--seda-border-brand": "#0072F5",
  "--seda-text-primary": "#f0f0f0",
  "--seda-text-secondary": "rgba(255,255,255,0.85)",
  "--seda-text-tertiary": "rgba(255,255,255,0.60)",
  "--seda-text-muted": "rgba(255,255,255,0.40)",
  "--seda-text-on-brand": "#ffffff",
  "--seda-text-on-inverse": "#111111",
  "--seda-link-default": "#4DA3FF",
  "--seda-link-hover": "#0072F5",
  "--seda-status-info-surface": "#0072F5",
  "--seda-status-info-container": "#0A1A2F",
  "--seda-status-info-border": "#4DA3FF",
  "--seda-status-info-text": "#4DA3FF",
  "--seda-status-error-surface": "#CF6679",
  "--seda-status-error-container": "#2A0F0F",
  "--seda-status-error-border": "#CF6679",
  "--seda-status-error-text": "#CF6679",
  "--seda-status-warning-surface": "#F5A623",
  "--seda-status-warning-container": "#2A1F0A",
  "--seda-status-warning-border": "#F5A623",
  "--seda-status-warning-text": "#FFD073",
  "--seda-status-success-surface": "#66BB6A",
  "--seda-status-success-container": "#0A2A0F",
  "--seda-status-success-border": "#66BB6A",
  "--seda-status-success-text": "#66BB6A",
  "--seda-status-disabled-surface": "#1a1a1a",
  "--seda-status-disabled-container": "rgba(255,255,255,0.05)",
  "--seda-status-disabled-border": "rgba(255,255,255,0.05)",
  "--seda-status-disabled-text": "rgba(255,255,255,0.25)",
  "--seda-focus-ring": "rgba(0,114,245,0.24)",
  "--seda-shadow-base": "0 1px 3px rgba(0,0,0,0.30)",
  "--seda-shadow-darker": "0 4px 12px rgba(0,0,0,0.40)",
  "--seda-radius-sm": "6px",
  "--seda-radius-md": "8px",
  "--seda-radius-lg": "10px",
  "--seda-radius-xl": "12px",
};

// ─── NAV STRUCTURE ───
const NAV = [
  { id: "overview", label: "Обзор", icon: "◈" },
  { id: "tokens", label: "Токены", icon: "◉" },
  { id: "sizes", label: "Размеры", icon: "⊞" },
  {
    id: "actions", label: "Actions", icon: "▸",
    children: [
      { id: "button", label: "Button" },
      { id: "icon-button", label: "Icon Button" },
      { id: "link", label: "Link" },
    ]
  },
  {
    id: "inputs", label: "Inputs & Forms", icon: "☐",
    children: [
      { id: "text-field", label: "Text Field" },
      { id: "checkbox", label: "Checkbox" },
      { id: "radio", label: "Radio" },
      { id: "toggle", label: "Toggle" },
      { id: "select", label: "Select" },
    ]
  },
  {
    id: "data", label: "Data Display", icon: "☷",
    children: [
      { id: "avatar", label: "Avatar" },
      { id: "badge", label: "Badge" },
      { id: "tag", label: "Tag" },
      { id: "card", label: "Card" },
    ]
  },
  {
    id: "feedback", label: "Feedback", icon: "◬",
    children: [
      { id: "alert", label: "Alert" },
      { id: "toast", label: "Toast" },
      { id: "progress", label: "Progress Bar" },
      { id: "spinner", label: "Spinner" },
    ]
  },
  {
    id: "navigation", label: "Navigation", icon: "⇢",
    children: [
      { id: "breadcrumbs", label: "Breadcrumbs" },
      { id: "tabs", label: "Tabs" },
      { id: "pagination", label: "Pagination" },
    ]
  },
];

// ─── COMPONENT PREVIEWS ───
function ButtonExamples() {
  const [loading, setLoading] = useState(false);
  return (
    <div>
      <SectionTitle>Типы / Variants</SectionTitle>
      <PropTable data={[
        ["primary", "Главное действие на экране. Один на контекст"],
        ["secondary", "Второстепенное действие рядом с Primary"],
        ["ghost", "Третичное действие, нет заливки"],
        ["text", "Минимальный вес, встраивается в текст"],
        ["destruction", "Необратимые действия: удаление, отзыв"],
      ]} headers={["Тип", "Назначение"]} />

      <SectionTitle>Примеры</SectionTitle>
      <ExampleRow label="Primary, Secondary, Ghost, Text, Destruction">
        <SedaBtn variant="primary">Сохранить</SedaBtn>
        <SedaBtn variant="secondary">Отмена</SedaBtn>
        <SedaBtn variant="ghost">Фильтр</SedaBtn>
        <SedaBtn variant="text">Подробнее</SedaBtn>
        <SedaBtn variant="destruction">Удалить</SedaBtn>
      </ExampleRow>

      <SectionTitle>Размеры</SectionTitle>
      <ExampleRow label="small → extraLarge">
        <SedaBtn variant="primary" size="small">Small</SedaBtn>
        <SedaBtn variant="primary" size="medium">Medium</SedaBtn>
        <SedaBtn variant="primary" size="large">Large</SedaBtn>
        <SedaBtn variant="primary" size="extraLarge">Extra Large</SedaBtn>
      </ExampleRow>

      <SectionTitle>Состояния</SectionTitle>
      <ExampleRow label="Default, Hover, Focus, Loading, Disabled">
        <SedaBtn variant="primary">Default</SedaBtn>
        <SedaBtn variant="primary" loading={loading} onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 2000); }}>
          {loading ? "Загрузка…" : "Click → Loading"}
        </SedaBtn>
        <SedaBtn variant="primary" disabled>Disabled</SedaBtn>
      </ExampleRow>

      <SectionTitle>С иконками</SectionTitle>
      <ExampleRow label="icon-left / icon-right / icon-only">
        <SedaBtn variant="secondary" iconLeft="＋">Добавить</SedaBtn>
        <SedaBtn variant="secondary" iconRight="→">Далее</SedaBtn>
        <SedaBtn variant="ghost" iconOnly aria-label="Настройки">⚙</SedaBtn>
      </ExampleRow>

      <TokenTable tokens={[
        { component: "--btn-primary-bg", semantic: "container/brand/default", desc: "Фон primary" },
        { component: "--btn-primary-bg-hover", semantic: "container/brand/hover", desc: "Фон hover" },
        { component: "--btn-primary-label", semantic: "text/on-brand/primary", desc: "Текст / иконка" },
        { component: "--btn-secondary-bg", semantic: "container/default", desc: "Фон secondary" },
        { component: "--btn-secondary-border", semantic: "border/default", desc: "Граница secondary" },
        { component: "--btn-danger-bg", semantic: "status/error/surface", desc: "Фон destruction" },
      ]} />
    </div>
  );
}

function IconButtonExamples() {
  return (
    <div>
      <SectionTitle>Icon Button</SectionTitle>
      <p style={{ color: "var(--seda-text-secondary)", marginBottom: 16, fontSize: 14, lineHeight: 1.6 }}>
        Кнопка без текстовой метки. Используется в тулбарах, карточках, строках таблиц. Всегда требует <code style={{ background: "var(--seda-container-default)", padding: "2px 6px", borderRadius: 4 }}>aria-label</code> и Tooltip.
      </p>
      <ExampleRow label="Типы: primary, secondary, ghost, destruction">
        <SedaBtn variant="primary" iconOnly>✎</SedaBtn>
        <SedaBtn variant="secondary" iconOnly>⊕</SedaBtn>
        <SedaBtn variant="ghost" iconOnly>☰</SedaBtn>
        <SedaBtn variant="destruction" iconOnly>✕</SedaBtn>
      </ExampleRow>
      <ExampleRow label="Размеры: S, M, L, XL">
        <SedaBtn variant="secondary" iconOnly size="small">⚙</SedaBtn>
        <SedaBtn variant="secondary" iconOnly size="medium">⚙</SedaBtn>
        <SedaBtn variant="secondary" iconOnly size="large">⚙</SedaBtn>
        <SedaBtn variant="secondary" iconOnly size="extraLarge">⚙</SedaBtn>
      </ExampleRow>
    </div>
  );
}

function LinkExamples() {
  return (
    <div>
      <SectionTitle>Link</SectionTitle>
      <p style={{ color: "var(--seda-text-secondary)", marginBottom: 16, fontSize: 14, lineHeight: 1.6 }}>
        Текстовая навигация. В отличие от Button, ведёт к ресурсу, а не инициирует действие.
      </p>
      <ExampleRow label="default · subtle · visited · disabled">
        <SedaLink>Default Link</SedaLink>
        <SedaLink subtle>Subtle Link</SedaLink>
        <SedaLink visited>Visited Link</SedaLink>
        <SedaLink disabled>Disabled Link</SedaLink>
      </ExampleRow>
      <ExampleRow label="С иконкой">
        <SedaLink iconRight="↗">Открыть в Figma</SedaLink>
      </ExampleRow>
    </div>
  );
}

function TextFieldExamples() {
  const [val, setVal] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  return (
    <div>
      <SectionTitle>Text Field</SectionTitle>
      <p style={{ color: "var(--seda-text-secondary)", marginBottom: 16, fontSize: 14, lineHeight: 1.6 }}>
        Однострочное поле ввода. Label всегда видим, валидация после blur.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        <SedaTextField label="Имя" placeholder="Введите имя" value={val} onChange={setVal} />
        <SedaTextField label="Email" placeholder="user@mail.com" prefixIcon="✉" />
        <SedaTextField label="Пароль" placeholder="••••••••" type={showPw ? "text" : "password"}
          value={pw} onChange={setPw}
          suffixIcon={<span style={{ cursor: "pointer" }} onClick={() => setShowPw(!showPw)}>{showPw ? "◉" : "◎"}</span>}
        />
        <SedaTextField label="Сумма" placeholder="0.00" suffixText="₽" />
      </div>
      <SectionTitle>Состояния</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <SedaTextField label="Error" placeholder="Ошибка" error="Поле обязательно" />
        <SedaTextField label="Success" placeholder="OK" success helperText="Данные верны" />
        <SedaTextField label="Disabled" placeholder="Недоступно" disabled />
        <SedaTextField label="Read-only" value="Только чтение" readOnly />
      </div>
    </div>
  );
}

function CheckboxExamples() {
  const [checks, setChecks] = useState([true, false, false]);
  return (
    <div>
      <SectionTitle>Checkbox</SectionTitle>
      <ExampleRow label="Checked / Unchecked / Indeterminate">
        <SedaCheckbox label="Принять условия" checked={checks[0]} onChange={() => { const n = [...checks]; n[0] = !n[0]; setChecks(n); }} />
        <SedaCheckbox label="Рассылка" checked={checks[1]} onChange={() => { const n = [...checks]; n[1] = !n[1]; setChecks(n); }} />
        <SedaCheckbox label="Indeterminate" indeterminate />
        <SedaCheckbox label="Disabled" disabled />
      </ExampleRow>
    </div>
  );
}

function RadioExamples() {
  const [selected, setSelected] = useState(0);
  return (
    <div>
      <SectionTitle>Radio</SectionTitle>
      <ExampleRow label="Группа взаимоисключающих вариантов">
        {["Месяц", "Квартал", "Год"].map((l, i) => (
          <SedaRadio key={i} label={l} checked={selected === i} onChange={() => setSelected(i)} />
        ))}
        <SedaRadio label="Disabled" disabled />
      </ExampleRow>
    </div>
  );
}

function ToggleExamples() {
  const [on1, setOn1] = useState(true);
  const [on2, setOn2] = useState(false);
  return (
    <div>
      <SectionTitle>Toggle</SectionTitle>
      <p style={{ color: "var(--seda-text-secondary)", marginBottom: 16, fontSize: 14, lineHeight: 1.6 }}>
        Мгновенное переключение. Применяет изменение без подтверждения.
      </p>
      <ExampleRow label="On / Off / Disabled">
        <SedaToggle label="Тёмная тема" checked={on1} onChange={() => setOn1(!on1)} />
        <SedaToggle label="Уведомления" checked={on2} onChange={() => setOn2(!on2)} />
        <SedaToggle label="Disabled" disabled />
      </ExampleRow>
    </div>
  );
}

function SelectExamples() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const opts = ["Россия", "Казахстан", "Узбекистан", "Беларусь"];
  return (
    <div>
      <SectionTitle>Select</SectionTitle>
      <div style={{ maxWidth: 320, position: "relative" }}>
        <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6, color: "var(--seda-text-primary)" }}>Страна</label>
        <div onClick={() => setOpen(!open)} style={{
          height: 40, padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "var(--seda-surface-default)", border: "1px solid var(--seda-border-default)",
          borderRadius: "var(--seda-radius-lg)", cursor: "pointer", color: value ? "var(--seda-text-primary)" : "var(--seda-text-muted)",
          fontSize: 16,
        }}>
          <span>{value || "Выберите страну"}</span>
          <span style={{ fontSize: 10, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
        </div>
        {open && (
          <div style={{
            position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4,
            background: "var(--seda-surface-default)", border: "1px solid var(--seda-border-default)",
            borderRadius: "var(--seda-radius-lg)", boxShadow: "var(--seda-shadow-darker)", zIndex: 10,
            overflow: "hidden",
          }}>
            {opts.map((o) => (
              <div key={o} onClick={() => { setValue(o); setOpen(false); }} style={{
                padding: "10px 16px", cursor: "pointer", fontSize: 14,
                background: value === o ? "var(--seda-container-brand)" : "transparent",
                color: value === o ? "var(--seda-text-on-brand)" : "var(--seda-text-primary)",
              }}
                onMouseEnter={(e) => { if (value !== o) e.currentTarget.style.background = "var(--seda-container-hover)"; }}
                onMouseLeave={(e) => { if (value !== o) e.currentTarget.style.background = "transparent"; }}
              >{o}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AvatarExamples() {
  const sizes = [24, 32, 40, 48, 64];
  return (
    <div>
      <SectionTitle>Avatar</SectionTitle>
      <ExampleRow label="Размеры и типы">
        {sizes.map((s) => (
          <div key={s} style={{
            width: s, height: s, borderRadius: "50%", background: "var(--seda-container-brand)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--seda-text-on-brand)", fontSize: s * 0.4, fontWeight: 600,
          }}>A</div>
        ))}
        <div style={{
          width: 48, height: 48, borderRadius: "50%", background: "var(--seda-container-default)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--seda-text-tertiary)", fontSize: 20,
        }}>👤</div>
      </ExampleRow>
      <ExampleRow label="С индикатором статуса">
        {["#2E7D32", "#E53935", "#F5A623", "var(--seda-status-disabled-text)"].map((c, i) => (
          <div key={i} style={{ position: "relative", width: 48, height: 48 }}>
            <div style={{
              width: 48, height: 48, borderRadius: "50%", background: "var(--seda-container-brand)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--seda-text-on-brand)", fontSize: 18, fontWeight: 600,
            }}>{["RK","AM","DL","OP"][i]}</div>
            <div style={{
              position: "absolute", bottom: 0, right: 0, width: 14, height: 14, borderRadius: "50%",
              background: c, border: "2px solid var(--seda-surface-default)",
            }} />
          </div>
        ))}
      </ExampleRow>
    </div>
  );
}

function BadgeExamples() {
  return (
    <div>
      <SectionTitle>Badge</SectionTitle>
      <ExampleRow label="Числовой / Dot">
        <div style={{ position: "relative", display: "inline-flex" }}>
          <div style={{ width: 40, height: 40, borderRadius: "var(--seda-radius-md)", background: "var(--seda-container-default)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🔔</div>
          <span style={{
            position: "absolute", top: -4, right: -4, minWidth: 20, height: 20, borderRadius: 10,
            background: "var(--seda-status-error-surface)", color: "#fff", fontSize: 11, fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px",
          }}>3</span>
        </div>
        <div style={{ position: "relative", display: "inline-flex" }}>
          <div style={{ width: 40, height: 40, borderRadius: "var(--seda-radius-md)", background: "var(--seda-container-default)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✉</div>
          <span style={{
            position: "absolute", top: 0, right: 0, width: 10, height: 10, borderRadius: "50%",
            background: "var(--seda-status-error-surface)", border: "2px solid var(--seda-surface-default)",
          }} />
        </div>
        <div style={{ position: "relative", display: "inline-flex" }}>
          <div style={{ width: 40, height: 40, borderRadius: "var(--seda-radius-md)", background: "var(--seda-container-default)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>💬</div>
          <span style={{
            position: "absolute", top: -4, right: -4, minWidth: 20, height: 20, borderRadius: 10,
            background: "var(--seda-status-info-surface)", color: "#fff", fontSize: 11, fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px",
          }}>99+</span>
        </div>
      </ExampleRow>
    </div>
  );
}

function TagExamples() {
  const types = [
    { label: "Новый", bg: "var(--seda-status-info-container)", color: "var(--seda-status-info-text)", border: "var(--seda-status-info-border)" },
    { label: "Активный", bg: "var(--seda-status-success-container)", color: "var(--seda-status-success-text)", border: "var(--seda-status-success-border)" },
    { label: "Ожидание", bg: "var(--seda-status-warning-container)", color: "var(--seda-status-warning-text)", border: "var(--seda-status-warning-border)" },
    { label: "Ошибка", bg: "var(--seda-status-error-container)", color: "var(--seda-status-error-text)", border: "var(--seda-status-error-border)" },
    { label: "Нейтральный", bg: "var(--seda-container-default)", color: "var(--seda-text-secondary)", border: "var(--seda-border-default)" },
  ];
  return (
    <div>
      <SectionTitle>Tag</SectionTitle>
      <ExampleRow label="Семантические варианты">
        {types.map((t) => (
          <span key={t.label} style={{
            display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px",
            borderRadius: "var(--seda-radius-sm)", fontSize: 12, fontWeight: 500, lineHeight: 1,
            background: t.bg, color: t.color, border: `1px solid ${t.border}`,
          }}>{t.label}</span>
        ))}
      </ExampleRow>
    </div>
  );
}

function CardExamples() {
  return (
    <div>
      <SectionTitle>Card</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        {[
          { title: "Проект Alpha", desc: "12 задач · 3 участника", tag: "Активный", tc: "var(--seda-status-success-text)", tb: "var(--seda-status-success-container)" },
          { title: "Аналитика Q4", desc: "Отчёт за квартал", tag: "В работе", tc: "var(--seda-status-warning-text)", tb: "var(--seda-status-warning-container)" },
          { title: "Миграция API", desc: "Обновление до v3", tag: "Ошибка", tc: "var(--seda-status-error-text)", tb: "var(--seda-status-error-container)" },
        ].map((c) => (
          <div key={c.title} style={{
            padding: 20, borderRadius: "var(--seda-radius-lg)",
            background: "var(--seda-surface-default)", border: "1px solid var(--seda-border-default)",
            boxShadow: "var(--seda-shadow-base)", cursor: "pointer",
            transition: "box-shadow 0.2s, border-color 0.2s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--seda-shadow-darker)"; e.currentTarget.style.borderColor = "var(--seda-border-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "var(--seda-shadow-base)"; e.currentTarget.style.borderColor = "var(--seda-border-default)"; }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 10 }}>
              <span style={{ fontWeight: 600, fontSize: 15, color: "var(--seda-text-primary)" }}>{c.title}</span>
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: "var(--seda-radius-sm)", background: c.tb, color: c.tc, fontWeight: 500 }}>{c.tag}</span>
            </div>
            <span style={{ fontSize: 13, color: "var(--seda-text-tertiary)" }}>{c.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlertExamples() {
  const types = [
    { type: "info", icon: "ℹ", title: "Обновление доступно", desc: "Новая версия API опубликована." },
    { type: "success", icon: "✓", title: "Сохранено", desc: "Все изменения успешно сохранены." },
    { type: "warning", icon: "⚠", title: "Внимание", desc: "Действие невозможно отменить." },
    { type: "error", icon: "✕", title: "Ошибка", desc: "Не удалось загрузить файл." },
  ];
  return (
    <div>
      <SectionTitle>Alert</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {types.map((a) => {
          const pre = `--seda-status-${a.type}`;
          return (
            <div key={a.type} style={{
              padding: "12px 16px", borderRadius: "var(--seda-radius-md)",
              background: `var(${pre}-container)`, borderLeft: `3px solid var(${pre}-border)`,
              display: "flex", gap: 12, alignItems: "start",
            }}>
              <span style={{ fontSize: 16, color: `var(${pre}-text)`, flexShrink: 0, marginTop: 1 }}>{a.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: `var(${pre}-text)`, marginBottom: 2 }}>{a.title}</div>
                <div style={{ fontSize: 13, color: "var(--seda-text-secondary)", lineHeight: 1.5 }}>{a.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ToastExamples() {
  const [visible, setVisible] = useState(null);
  return (
    <div>
      <SectionTitle>Toast</SectionTitle>
      <ExampleRow label="Нажмите для показа">
        {["info", "success", "warning", "error"].map((t) => (
          <SedaBtn key={t} variant="secondary" size="small" onClick={() => { setVisible(t); setTimeout(() => setVisible(null), 3000); }}>
            {t}
          </SedaBtn>
        ))}
      </ExampleRow>
      {visible && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 999,
          padding: "12px 20px", borderRadius: "var(--seda-radius-md)",
          background: `var(--seda-status-${visible}-container)`,
          border: `1px solid var(--seda-status-${visible}-border)`,
          boxShadow: "var(--seda-shadow-darker)", display: "flex", alignItems: "center", gap: 10,
          animation: "slideIn 0.3s ease",
        }}>
          <span style={{ color: `var(--seda-status-${visible}-text)`, fontWeight: 600, fontSize: 14 }}>
            {{info: "ℹ Info", success: "✓ Success", warning: "⚠ Warning", error: "✕ Error"}[visible]}
          </span>
          <span style={{ fontSize: 13, color: "var(--seda-text-secondary)" }}>Временное уведомление</span>
          <span onClick={() => setVisible(null)} style={{ cursor: "pointer", marginLeft: 8, color: "var(--seda-text-muted)", fontSize: 16 }}>✕</span>
        </div>
      )}
    </div>
  );
}

function ProgressExamples() {
  const [val, setVal] = useState(65);
  return (
    <div>
      <SectionTitle>Progress Bar</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, color: "var(--seda-text-secondary)" }}>
            <span>Загрузка файлов</span><span>{val}%</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: "var(--seda-container-default)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${val}%`, borderRadius: 3, background: "var(--seda-container-brand)", transition: "width 0.5s ease" }} />
          </div>
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, color: "var(--seda-text-secondary)" }}>
            <span>Успешно</span><span>100%</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: "var(--seda-status-success-container)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: "100%", borderRadius: 3, background: "var(--seda-status-success-surface)" }} />
          </div>
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, color: "var(--seda-text-secondary)" }}>
            <span>Ошибка</span><span>42%</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: "var(--seda-status-error-container)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: "42%", borderRadius: 3, background: "var(--seda-status-error-surface)" }} />
          </div>
        </div>
        <input type="range" min={0} max={100} value={val} onChange={(e) => setVal(+e.target.value)}
          style={{ width: 200, accentColor: "var(--seda-container-brand)" }} />
      </div>
    </div>
  );
}

function SpinnerExamples() {
  return (
    <div>
      <SectionTitle>Spinner</SectionTitle>
      <ExampleRow label="Размеры: small (16px) · medium (24px) · large (40px)">
        {[16, 24, 40].map((s) => (
          <div key={s} style={{ width: s, height: s }}>
            <svg viewBox="0 0 24 24" width={s} height={s} style={{ animation: "spin 0.8s linear infinite" }}>
              <circle cx="12" cy="12" r="10" fill="none" stroke="var(--seda-container-default)" strokeWidth="3" />
              <path d="M12 2a10 10 0 0 1 10 10" fill="none" stroke="var(--seda-container-brand)" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        ))}
      </ExampleRow>
    </div>
  );
}

function BreadcrumbsExamples() {
  return (
    <div>
      <SectionTitle>Breadcrumbs</SectionTitle>
      <ExampleRow label="ghost / text / collapsed">
        <nav style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>
          {["Главная", "Проекты", "Alpha", "Настройки"].map((item, i, arr) => (
            <span key={item} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{
                padding: "4px 8px", borderRadius: "var(--seda-radius-sm)", cursor: "pointer",
                color: i === arr.length - 1 ? "var(--seda-text-primary)" : "var(--seda-link-default)",
                fontWeight: i === arr.length - 1 ? 600 : 400,
                background: "transparent",
              }}
                onMouseEnter={(e) => { if (i < arr.length - 1) e.currentTarget.style.background = "var(--seda-container-hover)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >{item}</span>
              {i < arr.length - 1 && <span style={{ color: "var(--seda-text-muted)" }}>/</span>}
            </span>
          ))}
        </nav>
      </ExampleRow>
    </div>
  );
}

function TabsExamples() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ["Обзор", "Участники", "Файлы", "Настройки"];
  return (
    <div>
      <SectionTitle>Tabs</SectionTitle>
      <div style={{ borderBottom: "1px solid var(--seda-border-default)", display: "flex", gap: 0, marginBottom: 16 }}>
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setActiveTab(i)} style={{
            padding: "10px 20px", fontSize: 14, fontWeight: i === activeTab ? 600 : 400, cursor: "pointer",
            color: i === activeTab ? "var(--seda-container-brand)" : "var(--seda-text-secondary)",
            borderBottom: i === activeTab ? "2px solid var(--seda-container-brand)" : "2px solid transparent",
            background: "transparent", border: "none", borderBottomWidth: 2, borderBottomStyle: "solid",
            borderBottomColor: i === activeTab ? "var(--seda-container-brand)" : "transparent",
            transition: "all 0.2s",
          }}
            onMouseEnter={(e) => { if (i !== activeTab) e.currentTarget.style.color = "var(--seda-text-primary)"; }}
            onMouseLeave={(e) => { if (i !== activeTab) e.currentTarget.style.color = "var(--seda-text-secondary)"; }}
          >{t}</button>
        ))}
      </div>
      <div style={{ padding: 16, fontSize: 14, color: "var(--seda-text-secondary)", background: "var(--seda-container-default)", borderRadius: "var(--seda-radius-md)" }}>
        Контент вкладки «{tabs[activeTab]}»
      </div>
    </div>
  );
}

function PaginationExamples() {
  const [page, setPage] = useState(3);
  return (
    <div>
      <SectionTitle>Pagination</SectionTitle>
      <ExampleRow label="numbered">
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <PgBtn onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>←</PgBtn>
          {[1, 2, 3, 4, 5].map((p) => (
            <PgBtn key={p} active={p === page} onClick={() => setPage(p)}>{p}</PgBtn>
          ))}
          <PgBtn onClick={() => setPage(Math.min(5, page + 1))} disabled={page === 5}>→</PgBtn>
        </div>
      </ExampleRow>
    </div>
  );
}

// ─── OVERVIEW PAGE ───
function OverviewPage() {
  const stats = [
    { n: "50+", l: "Компонентов" },
    { n: "6", l: "Категорий" },
    { n: "4", l: "Размера" },
    { n: "2", l: "Темы" },
  ];
  return (
    <div>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 36, fontWeight: 700, color: "var(--seda-text-primary)", marginBottom: 12, letterSpacing: "-0.02em" }}>
          SEDA UI
        </h1>
        <p style={{ fontSize: 18, color: "var(--seda-text-secondary)", lineHeight: 1.6, maxWidth: 640 }}>
          Атомарная дизайн-система для построения собственных UI-систем. Composable, cross-platform, scalable.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 40 }}>
        {stats.map((s) => (
          <div key={s.l} style={{
            padding: "24px 20px", borderRadius: "var(--seda-radius-lg)",
            background: "var(--seda-surface-default)", border: "1px solid var(--seda-border-default)",
          }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: "var(--seda-container-brand)", marginBottom: 4 }}>{s.n}</div>
            <div style={{ fontSize: 13, color: "var(--seda-text-tertiary)" }}>{s.l}</div>
          </div>
        ))}
      </div>
      <SectionTitle>Принципы</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {[
          { t: "Atomic first", d: "Всё строится от токенов к компонентам" },
          { t: "Composable", d: "Компоненты комбинируются и расширяются" },
          { t: "Cross-platform", d: "Единая логика для Web, iOS, Android" },
          { t: "Governed flexibility", d: "Гибкость с контролем без фрагментации" },
        ].map((p) => (
          <div key={p.t} style={{
            padding: 20, borderRadius: "var(--seda-radius-md)",
            border: "1px solid var(--seda-border-default)",
          }}>
            <div style={{ fontWeight: 600, fontSize: 15, color: "var(--seda-text-primary)", marginBottom: 6 }}>{p.t}</div>
            <div style={{ fontSize: 13, color: "var(--seda-text-tertiary)", lineHeight: 1.5 }}>{p.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TokensPage() {
  const groups = [
    { name: "Surface", tokens: [
      ["surface/default", "Основной фон", "#ffffff", "#111111"],
      ["surface/hover", "Фон при наведении", "#f5f5f5", "#1a1a1a"],
      ["surface/brand/default", "Фирменный фон", "#0072F5", "#0072F5"],
    ]},
    { name: "Container", tokens: [
      ["container/default", "Контейнер по умолчанию", "rgba(0,0,0,0.05)", "rgba(255,255,255,0.10)"],
      ["container/brand/default", "Фирменный контейнер", "#0072F5", "#0072F5"],
    ]},
    { name: "Text", tokens: [
      ["text/primary", "Основной текст", "#111111", "#f0f0f0"],
      ["text/secondary", "Вторичный текст", "rgba(0,0,0,0.85)", "rgba(255,255,255,0.85)"],
      ["text/tertiary", "Третичный", "rgba(0,0,0,0.60)", "rgba(255,255,255,0.60)"],
      ["text/muted", "Плейсхолдеры", "rgba(0,0,0,0.40)", "rgba(255,255,255,0.40)"],
    ]},
    { name: "Status", tokens: [
      ["status/info/surface", "Info", "#0072F5", "#0072F5"],
      ["status/success/surface", "Success", "#2E7D32", "#66BB6A"],
      ["status/warning/surface", "Warning", "#F5A623", "#F5A623"],
      ["status/error/surface", "Error", "#E53935", "#CF6679"],
    ]},
  ];
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--seda-text-primary)", marginBottom: 8 }}>Токены</h2>
      <p style={{ color: "var(--seda-text-secondary)", marginBottom: 24, fontSize: 14, lineHeight: 1.6 }}>
        Семантические CSS-переменные. Схема: <code style={{ background: "var(--seda-container-default)", padding: "2px 6px", borderRadius: 4 }}>категория / вариант / состояние</code>
      </p>
      {groups.map((g) => (
        <div key={g.name} style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--seda-text-primary)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.04em", fontSize: 12 }}>{g.name}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {g.tokens.map(([name, role, light, dark]) => (
              <div key={name} style={{
                display: "grid", gridTemplateColumns: "20px 1fr 1fr 100px 100px", gap: 12, alignItems: "center",
                padding: "8px 12px", borderRadius: 6, fontSize: 13,
                background: "var(--seda-surface-default)", border: "1px solid var(--seda-border-default)",
              }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, background: light, border: "1px solid rgba(0,0,0,0.1)" }} />
                <code style={{ color: "var(--seda-text-primary)", fontFamily: "monospace", fontSize: 12 }}>{name}</code>
                <span style={{ color: "var(--seda-text-tertiary)" }}>{role}</span>
                <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--seda-text-muted)" }}>{light}</span>
                <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--seda-text-muted)" }}>{dark}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SizesPage() {
  const sizes = [
    { name: "small", h: 24, font: "12 / 16", radius: 6 },
    { name: "medium", h: 32, font: "14 / 20", radius: 8 },
    { name: "large", h: 40, font: "16 / 24", radius: 10 },
    { name: "extraLarge", h: 48, font: "18 / 28", radius: 12 },
  ];
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--seda-text-primary)", marginBottom: 8 }}>Размеры</h2>
      <p style={{ color: "var(--seda-text-secondary)", marginBottom: 24, fontSize: 14, lineHeight: 1.6 }}>
        Четыре фиксированных ступени: единая высота, типографика и скругления.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {sizes.map((s) => (
          <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ width: 100 }}>
              <code style={{ fontSize: 13, fontWeight: 600, color: "var(--seda-text-primary)" }}>{s.name}</code>
            </div>
            <div style={{
              height: s.h, paddingLeft: 16, paddingRight: 16,
              display: "flex", alignItems: "center", gap: 8,
              background: "var(--seda-container-brand)", color: "var(--seda-text-on-brand)",
              borderRadius: s.radius, fontSize: parseInt(s.font), fontWeight: 500,
            }}>
              Button {s.h}px
            </div>
            <div style={{
              height: s.h, paddingLeft: 16, paddingRight: 16,
              display: "flex", alignItems: "center",
              background: "var(--seda-surface-default)", border: "1px solid var(--seda-border-default)",
              borderRadius: s.radius, fontSize: parseInt(s.font), color: "var(--seda-text-muted)",
              minWidth: 200,
            }}>
              Text Field
            </div>
            <span style={{ fontSize: 12, color: "var(--seda-text-muted)", fontFamily: "monospace", whiteSpace: "nowrap" }}>
              {s.h}px · {s.font}px · r{s.radius}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── REUSABLE SEDA COMPONENTS ───
function SedaBtn({ variant = "primary", size = "medium", disabled, loading, iconLeft, iconRight, iconOnly, children, onClick }) {
  const sizeMap = { small: { h: 24, f: 12, px: 8, r: 6, ic: 13 }, medium: { h: 32, f: 14, px: 12, r: 8, ic: 15 }, large: { h: 40, f: 16, px: 16, r: 10, ic: 17 }, extraLarge: { h: 48, f: 18, px: 20, r: 12, ic: 19 } };
  const s = sizeMap[size];
  const styles = {
    primary: { bg: "var(--seda-container-brand)", color: "var(--seda-text-on-brand)", border: "none", hoverBg: "var(--seda-container-brand-hover)" },
    secondary: { bg: "var(--seda-surface-default)", color: "var(--seda-text-primary)", border: "1px solid var(--seda-border-default)", hoverBg: "var(--seda-container-hover)" },
    ghost: { bg: "transparent", color: "var(--seda-text-primary)", border: "1px solid var(--seda-border-default)", hoverBg: "var(--seda-container-hover)" },
    text: { bg: "transparent", color: "var(--seda-text-secondary)", border: "none", hoverBg: "transparent" },
    destruction: { bg: "var(--seda-status-error-surface)", color: "#fff", border: "none", hoverBg: "#C62828" },
  };
  const st = styles[variant];
  const [hovered, setHovered] = useState(false);
  return (
    <button
      disabled={disabled || loading}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        height: s.h, width: iconOnly ? s.h : "auto",
        padding: iconOnly ? 0 : `0 ${s.px}px`,
        fontSize: s.f, fontWeight: 500, lineHeight: 1,
        borderRadius: s.r,
        background: disabled ? "var(--seda-status-disabled-surface)" : (hovered ? st.hoverBg : st.bg),
        color: disabled ? "var(--seda-status-disabled-text)" : st.color,
        border: disabled ? "1px solid var(--seda-status-disabled-border)" : st.border,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
        transition: "all 0.15s ease",
        opacity: loading ? 0.7 : 1,
        fontFamily: "inherit",
      }}
    >
      {loading && <span style={{ animation: "spin 0.8s linear infinite", display: "inline-block" }}>⟳</span>}
      {iconLeft && !loading && <span style={{ fontSize: s.ic }}>{iconLeft}</span>}
      {!iconOnly && children}
      {iconRight && <span style={{ fontSize: s.ic }}>{iconRight}</span>}
      {iconOnly && !loading && children}
    </button>
  );
}

function SedaLink({ children, subtle, visited, disabled, iconRight }) {
  const [h, setH] = useState(false);
  return (
    <span
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        fontSize: 14, cursor: disabled ? "not-allowed" : "pointer",
        color: disabled ? "var(--seda-status-disabled-text)" : visited ? "#7B1FA2" : (h ? "var(--seda-link-hover)" : (subtle ? "var(--seda-text-secondary)" : "var(--seda-link-default)")),
        textDecoration: h && !disabled ? "underline" : "none",
        display: "inline-flex", alignItems: "center", gap: 4,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}{iconRight && <span>{iconRight}</span>}
    </span>
  );
}

function SedaTextField({ label, placeholder, type = "text", value, onChange, prefixIcon, suffixIcon, suffixText, error, success, disabled, readOnly, helperText }) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? "var(--seda-status-error-border)" : success ? "var(--seda-status-success-border)" : focused ? "var(--seda-border-brand)" : "var(--seda-border-default)";
  return (
    <div style={{ opacity: disabled ? 0.5 : 1 }}>
      <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6, color: "var(--seda-text-primary)" }}>{label}</label>
      <div style={{
        height: 40, display: "flex", alignItems: "center", gap: 8,
        padding: "0 12px", borderRadius: "var(--seda-radius-lg)",
        background: disabled ? "var(--seda-status-disabled-surface)" : "var(--seda-surface-default)",
        border: `1px solid ${borderColor}`,
        boxShadow: focused ? `0 0 0 3px var(--seda-focus-ring)` : "none",
        transition: "all 0.15s",
      }}>
        {prefixIcon && <span style={{ color: "var(--seda-text-muted)", fontSize: 16 }}>{prefixIcon}</span>}
        <input
          type={type} placeholder={placeholder} value={value} readOnly={readOnly} disabled={disabled}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            flex: 1, border: "none", outline: "none", background: "transparent",
            fontSize: 14, color: "var(--seda-text-primary)", fontFamily: "inherit",
          }}
        />
        {suffixIcon && <span style={{ color: "var(--seda-text-muted)", fontSize: 16 }}>{suffixIcon}</span>}
        {suffixText && <span style={{ color: "var(--seda-text-muted)", fontSize: 14 }}>{suffixText}</span>}
      </div>
      {(error || helperText) && (
        <div style={{ marginTop: 4, fontSize: 12, color: error ? "var(--seda-status-error-text)" : success ? "var(--seda-status-success-text)" : "var(--seda-text-tertiary)" }}>
          {error || helperText}
        </div>
      )}
    </div>
  );
}

function SedaCheckbox({ label, checked, onChange, indeterminate, disabled }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, fontSize: 14, color: "var(--seda-text-primary)" }}>
      <div style={{
        width: 18, height: 18, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center",
        background: checked || indeterminate ? "var(--seda-container-brand)" : "var(--seda-surface-default)",
        border: checked || indeterminate ? "none" : "1.5px solid var(--seda-border-default)",
        color: "var(--seda-text-on-brand)", fontSize: 12, fontWeight: 700,
        transition: "all 0.15s",
      }} onClick={!disabled ? onChange : undefined}>
        {checked && "✓"}{indeterminate && "—"}
      </div>
      {label}
    </label>
  );
}

function SedaRadio({ label, checked, onChange, disabled }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, fontSize: 14, color: "var(--seda-text-primary)" }}>
      <div style={{
        width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
        border: checked ? "none" : "1.5px solid var(--seda-border-default)",
        background: checked ? "var(--seda-container-brand)" : "var(--seda-surface-default)",
        transition: "all 0.15s",
      }} onClick={!disabled ? onChange : undefined}>
        {checked && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff" }} />}
      </div>
      {label}
    </label>
  );
}

function SedaToggle({ label, checked, onChange, disabled }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, fontSize: 14, color: "var(--seda-text-primary)" }}>
      <div onClick={!disabled ? onChange : undefined} style={{
        width: 44, height: 24, borderRadius: 12, padding: 2,
        background: checked ? "var(--seda-container-brand)" : "var(--seda-container-default)",
        transition: "background 0.2s", display: "flex", alignItems: "center",
      }}>
        <div style={{
          width: 20, height: 20, borderRadius: "50%",
          background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          transform: checked ? "translateX(20px)" : "translateX(0)",
          transition: "transform 0.2s",
        }} />
      </div>
      {label}
    </label>
  );
}

function PgBtn({ children, active, disabled, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        width: 32, height: 32, borderRadius: "var(--seda-radius-md)", border: "none",
        background: active ? "var(--seda-container-brand)" : (h && !disabled ? "var(--seda-container-hover)" : "transparent"),
        color: active ? "var(--seda-text-on-brand)" : disabled ? "var(--seda-status-disabled-text)" : "var(--seda-text-primary)",
        fontWeight: active ? 600 : 400, fontSize: 14, cursor: disabled ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit",
      }}>{children}</button>
  );
}

// ─── LAYOUT HELPERS ───
function SectionTitle({ children }) {
  return <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--seda-text-primary)", marginTop: 28, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.03em" }}>{children}</h3>;
}

function ExampleRow({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      {label && <div style={{ fontSize: 12, color: "var(--seda-text-muted)", marginBottom: 10, fontFamily: "monospace" }}>{label}</div>}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>{children}</div>
    </div>
  );
}

function PropTable({ headers, data }) {
  return (
    <div style={{ borderRadius: "var(--seda-radius-md)", border: "1px solid var(--seda-border-default)", overflow: "hidden", marginBottom: 20, fontSize: 13 }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${headers.length}, 1fr)`, background: "var(--seda-container-default)" }}>
        {headers.map((h) => <div key={h} style={{ padding: "8px 14px", fontWeight: 600, color: "var(--seda-text-primary)" }}>{h}</div>)}
      </div>
      {data.map((row, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: `repeat(${headers.length}, 1fr)`, borderTop: "1px solid var(--seda-border-default)" }}>
          {row.map((cell, j) => (
            <div key={j} style={{ padding: "8px 14px", color: j === 0 ? "var(--seda-text-primary)" : "var(--seda-text-secondary)" }}>
              {j === 0 ? <code style={{ fontFamily: "monospace" }}>{cell}</code> : cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function TokenTable({ tokens }) {
  return (
    <div style={{ marginTop: 24 }}>
      <SectionTitle>Design Tokens</SectionTitle>
      <div style={{ borderRadius: "var(--seda-radius-md)", border: "1px solid var(--seda-border-default)", overflow: "hidden", fontSize: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "var(--seda-container-default)", padding: "6px 14px", fontWeight: 600, color: "var(--seda-text-primary)" }}>
          <span>Component token</span><span>Semantic</span><span>Роль</span>
        </div>
        {tokens.map((t) => (
          <div key={t.component} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "6px 14px", borderTop: "1px solid var(--seda-border-default)" }}>
            <code style={{ color: "var(--seda-text-primary)", fontFamily: "monospace" }}>{t.component}</code>
            <code style={{ color: "var(--seda-link-default)", fontFamily: "monospace" }}>{t.semantic}</code>
            <span style={{ color: "var(--seda-text-tertiary)" }}>{t.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PAGE ROUTER ───
const PAGE_MAP = {
  overview: OverviewPage,
  tokens: TokensPage,
  sizes: SizesPage,
  button: ButtonExamples,
  "icon-button": IconButtonExamples,
  link: LinkExamples,
  "text-field": TextFieldExamples,
  checkbox: CheckboxExamples,
  radio: RadioExamples,
  toggle: ToggleExamples,
  select: SelectExamples,
  avatar: AvatarExamples,
  badge: BadgeExamples,
  tag: TagExamples,
  card: CardExamples,
  alert: AlertExamples,
  toast: ToastExamples,
  progress: ProgressExamples,
  spinner: SpinnerExamples,
  breadcrumbs: BreadcrumbsExamples,
  tabs: TabsExamples,
  pagination: PaginationExamples,
};

const PAGE_TITLES = {
  overview: "Обзор системы",
  tokens: "Токены",
  sizes: "Размеры",
  button: "Button",
  "icon-button": "Icon Button",
  link: "Link",
  "text-field": "Text Field",
  checkbox: "Checkbox",
  radio: "Radio",
  toggle: "Toggle",
  select: "Select",
  avatar: "Avatar",
  badge: "Badge",
  tag: "Tag",
  card: "Card",
  alert: "Alert",
  toast: "Toast",
  progress: "Progress Bar",
  spinner: "Spinner",
  breadcrumbs: "Breadcrumbs",
  tabs: "Tabs",
  pagination: "Pagination",
};

// ─── MAIN APP ───
export default function SedaDocs() {
  const [dark, setDark] = useState(false);
  const [activePage, setActivePage] = useState("overview");
  const [expandedGroups, setExpandedGroups] = useState(new Set(["actions", "inputs", "data", "feedback", "navigation"]));
  const tokens = dark ? TOKENS_DARK : TOKENS_LIGHT;
  const mainRef = useRef(null);

  const toggleGroup = (id) => {
    setExpandedGroups((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [activePage]);

  const PageComponent = PAGE_MAP[activePage] || OverviewPage;

  return (
    <div style={{ ...tokens, display: "flex", height: "100vh", fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif", background: "var(--seda-surface-hover)", color: "var(--seda-text-primary)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Mono:wght@400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        code, pre { font-family: 'DM Mono', 'SF Mono', Consolas, monospace; }
        input::placeholder { color: var(--seda-text-muted); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--seda-border-default); border-radius: 3px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      {/* SIDEBAR */}
      <aside style={{
        width: 260, flexShrink: 0, height: "100vh", overflowY: "auto",
        background: "var(--seda-surface-default)", borderRight: "1px solid var(--seda-border-default)",
        padding: "20px 0", display: "flex", flexDirection: "column",
      }}>
        {/* Logo */}
        <div style={{ padding: "0 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "var(--seda-radius-md)",
            background: "var(--seda-container-brand)", display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 700, fontSize: 14, letterSpacing: "0.04em",
          }}>S</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--seda-text-primary)", letterSpacing: "-0.01em" }}>SEDA UI</div>
            <div style={{ fontSize: 11, color: "var(--seda-text-muted)" }}>Design System v1.0</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "0 8px" }}>
          {NAV.map((item) => {
            if (item.children) {
              const isExpanded = expandedGroups.has(item.id);
              const isChildActive = item.children.some((c) => c.id === activePage);
              return (
                <div key={item.id} style={{ marginBottom: 4 }}>
                  <div onClick={() => toggleGroup(item.id)} style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: "var(--seda-radius-md)",
                    cursor: "pointer", fontSize: 13, fontWeight: 500,
                    color: isChildActive ? "var(--seda-text-primary)" : "var(--seda-text-secondary)",
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--seda-container-hover)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ fontSize: 14, width: 18, textAlign: "center", opacity: 0.6 }}>{item.icon}</span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    <span style={{ fontSize: 9, transform: isExpanded ? "rotate(90deg)" : "none", transition: "transform 0.15s", opacity: 0.4 }}>▶</span>
                  </div>
                  {isExpanded && (
                    <div style={{ paddingLeft: 20 }}>
                      {item.children.map((child) => (
                        <div key={child.id} onClick={() => setActivePage(child.id)} style={{
                          padding: "6px 12px", borderRadius: "var(--seda-radius-sm)", cursor: "pointer",
                          fontSize: 13, marginBottom: 1,
                          color: activePage === child.id ? "var(--seda-container-brand)" : "var(--seda-text-tertiary)",
                          fontWeight: activePage === child.id ? 600 : 400,
                          background: activePage === child.id ? "var(--seda-status-info-container)" : "transparent",
                        }}
                          onMouseEnter={(e) => { if (activePage !== child.id) e.currentTarget.style.background = "var(--seda-container-hover)"; }}
                          onMouseLeave={(e) => { if (activePage !== child.id) e.currentTarget.style.background = activePage === child.id ? "var(--seda-status-info-container)" : "transparent"; }}
                        >{child.label}</div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <div key={item.id} onClick={() => setActivePage(item.id)} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: "var(--seda-radius-md)",
                cursor: "pointer", fontSize: 13, fontWeight: activePage === item.id ? 600 : 400, marginBottom: 2,
                color: activePage === item.id ? "var(--seda-container-brand)" : "var(--seda-text-secondary)",
                background: activePage === item.id ? "var(--seda-status-info-container)" : "transparent",
              }}
                onMouseEnter={(e) => { if (activePage !== item.id) e.currentTarget.style.background = "var(--seda-container-hover)"; }}
                onMouseLeave={(e) => { if (activePage !== item.id) e.currentTarget.style.background = activePage === item.id ? "var(--seda-status-info-container)" : "transparent"; }}
              >
                <span style={{ fontSize: 14, width: 18, textAlign: "center", opacity: 0.6 }}>{item.icon}</span>
                {item.label}
              </div>
            );
          })}
        </nav>

        {/* Theme toggle */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid var(--seda-border-default)" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13, color: "var(--seda-text-secondary)" }}>
            <div onClick={() => setDark(!dark)} style={{
              width: 36, height: 20, borderRadius: 10, padding: 2,
              background: dark ? "var(--seda-container-brand)" : "var(--seda-container-default)",
              transition: "background 0.2s", display: "flex", alignItems: "center",
            }}>
              <div style={{
                width: 16, height: 16, borderRadius: "50%",
                background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                transform: dark ? "translateX(16px)" : "translateX(0)",
                transition: "transform 0.2s",
              }} />
            </div>
            {dark ? "Dark" : "Light"} mode
          </label>
        </div>
      </aside>

      {/* MAIN */}
      <main ref={mainRef} style={{ flex: 1, overflowY: "auto", padding: "32px 48px 64px" }}>
        {/* Header */}
        <div style={{ marginBottom: 32, paddingBottom: 20, borderBottom: "1px solid var(--seda-border-default)" }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: "var(--seda-text-primary)", letterSpacing: "-0.02em" }}>
            {PAGE_TITLES[activePage] || activePage}
          </h2>
        </div>

        <PageComponent />
      </main>
    </div>
  );
}
