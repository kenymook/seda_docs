import React, { useRef, useState } from "react";
import {
  Button,
  TextField,
  Select,
  Checkbox,
  Radio,
  Toggle,
} from "@seda-ai/ui";

type Props = {
  size: "s" | "m" | "l" | "xl";
  action: (role: string) => any;
  children: React.ReactNode;
};
const teams = [
  { value: "Core", label: "Core" },
  { value: "Product", label: "Product" },
  { value: "Design", label: "Design" },
  { value: "Mobile", label: "Mobile" },
];

/** Stateful product composition. Demo data stays in memory; no network invitation is sent. */
export function ProductWorkspace({ size, action, children }: Props) {
  const [page, setPage] = useState("projects");
  const [settings, setSettings] = useState({
    name: "Atlas Platform",
    email: "owner@atlas.example",
    url: "https://atlas.example",
    budget: "12000",
    date: "2026-11-01",
    team: "Core",
    region: "eu",
    visibility: "private",
    notifications: true,
    digest: true,
  });
  const [saved, setSaved] = useState(settings);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const update = (key: keyof typeof settings, value: string | boolean) =>
    setSettings((s) => ({ ...s, [key]: value }));
  const [members, setMembers] = useState([
    {
      id: 1,
      name: "Анна Смирнова",
      email: "anna@atlas.example",
      role: "owner",
    },
    { id: 2, name: "Марк Орлов", email: "mark@atlas.example", role: "editor" },
    { id: 3, name: "Елена Ким", email: "elena@atlas.example", role: "viewer" },
  ]);
  const [memberQuery, setMemberQuery] = useState("");
  const [memberRole, setMemberRole] = useState("all");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [inviteError, setInviteError] = useState("");
  const memberId = useRef(4);
  const roleOptions = [
    { value: "owner", label: "Владелец" },
    { value: "editor", label: "Редактор" },
    { value: "viewer", label: "Наблюдатель" },
  ];
  const visibleMembers = members.filter(
    (m) =>
      (m.name + " " + m.email)
        .toLowerCase()
        .includes(memberQuery.toLowerCase()) &&
      (memberRole === "all" || m.role === memberRole),
  );
  const field = (
    key: keyof typeof settings,
    label: string,
    type = "text",
    extra: Record<string, any> = {},
  ) => (
    <TextField
      id={"workspace-" + key}
      label={label}
      type={type}
      size={size}
      value={String(settings[key])}
      onChange={(e) => update(key, e.target.value)}
      errorText={errors[key]}
      {...extra}
    />
  );
  function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!settings.name.trim())
      next.name = "Введите название рабочего пространства";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email))
      next.email = "Введите корректный email";
    if (!settings.url.startsWith("https://"))
      next.url = "Используйте адрес https://";
    if (
      !Number.isFinite(Number(settings.budget)) ||
      Number(settings.budget) < 0
    )
      next.budget = "Укажите бюджет не меньше нуля";
    if (!settings.date) next.date = "Укажите дату запуска";
    setErrors(next);
    if (Object.keys(next).length) {
      document.getElementById("workspace-" + Object.keys(next)[0])?.focus();
      setNotice("Проверьте поля формы");
      return;
    }
    setSaved({ ...settings });
    setNotice("Настройки сохранены в текущей сессии");
  }
  return (
    <>
      <div className="product-masthead">
        <div>
          <span className="workspace-symbol" aria-hidden="true">
            A
          </span>
          <div>
            <strong>Atlas workspace</strong>
            <span>Рабочее пространство · локальная демонстрация</span>
          </div>
        </div>
        <span className="workspace-account">AK · Владелец</span>
      </div>
      <nav className="product-nav" aria-label="Навигация рабочего пространства">
        {[
          ["projects", "Проекты"],
          ["settings", "Настройки"],
          ["members", "Команда"],
        ].map(([id, label]) => (
          <Button
            key={id}
            {...action("cancel")}
            size={size}
            id={"nav-" + id}
            aria-current={page === id ? "page" : undefined}
            onClick={() => setPage(id)}
          >
            {label}
            {id === "members" ? " · " + members.length : ""}
          </Button>
        ))}
      </nav>
      <div id="projects-page" hidden={page !== "projects"}>
        {children}
      </div>
      <section
        className="workspace-page"
        id="settings-page"
        hidden={page !== "settings"}
        aria-labelledby="workspace-settings-title"
      >
        <div className="section-top">
          <div>
            <div className="eyebrow">РАБОЧЕЕ ПРОСТРАНСТВО</div>
            <h1 id="workspace-settings-title">Настройки</h1>
            <p>
              Общие параметры применяются к полям, выбору значений и действиям.
            </p>
          </div>
        </div>
        <form
          className="pane workspace-form"
          id="workspace-settings"
          noValidate
          onSubmit={saveSettings}
        >
          <div className="form-section-heading">
            <h2>Основная информация</h2>
            <span>Текст · email · URL · число · дата · Select</span>
          </div>
          <div className="workspace-form-grid">
            {field("name", "Название пространства", "text", { required: true })}
            {field("email", "Контактный email", "email", { required: true })}
            {field("url", "Адрес проекта", "url", {
              helperText: "Только HTTPS",
            })}
            {field("budget", "Месячный бюджет", "number", {
              min: 0,
              suffix: <span>₽</span>,
            })}
            {field("date", "Дата запуска", "date")}
            <Select
              className="workspace-select"
              id="workspace-team"
              size={size}
              label="Основная команда"
              value={settings.team}
              options={teams}
              onValueChange={(v) => update("team", String(v))}
            />
            <Select
              className="workspace-select"
              id="workspace-region"
              size={size}
              label="Регион данных"
              value={settings.region}
              options={[
                { value: "eu", label: "Европа" },
                { value: "us", label: "Северная Америка" },
                { value: "ap", label: "Азия и Океания" },
              ]}
              onValueChange={(v) => update("region", String(v))}
            />
            <TextField
              id="workspace-id"
              label="Идентификатор"
              size={size}
              value="atlas-workspace-01"
              disabled
              helperText="Назначается системой"
            />
          </div>
          <div className="form-section-heading">
            <h2>Доступ и уведомления</h2>
            <span>Radio · Toggle · Checkbox</span>
          </div>
          <div className="workspace-form-grid">
            <Radio
              className="workspace-radio"
              size={size}
              name="workspace-visibility"
              label="Доступ к проектам"
              value={settings.visibility}
              onValueChange={(v) => update("visibility", v)}
              options={[
                { value: "private", label: "Только участники" },
                { value: "team", label: "Вся команда" },
              ]}
            />
            <div className="workspace-preferences">
              <Toggle
                className="workspace-toggle"
                id="workspace-notifications"
                label="Уведомления о событиях"
                size={size}
                checked={settings.notifications}
                onCheckedChange={(v) => update("notifications", v)}
              />
              <Checkbox
                className="workspace-checkbox"
                id="workspace-digest"
                size={size}
                label="Еженедельный отчёт по email"
                checked={settings.digest}
                disabled={!settings.notifications}
                onCheckedChange={(v) => update("digest", v)}
              />
            </div>
          </div>
          <div className="workspace-form-footer">
            <div className="actions">
              <Button
                {...action("save")}
                size={size}
                type="submit"
                id="workspace-apply"
                variant="primary"
              >
                Применить настройки
              </Button>
              <Button
                {...action("cancel")}
                size={size}
                onClick={() => {
                  setSettings(saved);
                  setErrors({});
                  setNotice("Восстановлены сохранённые настройки");
                }}
              >
                Отменить изменения
              </Button>
            </div>
            <p role="status" id="workspace-notice">
              {notice || "Все данные остаются в этой демонстрации"}
            </p>
          </div>
        </form>
      </section>
      <section
        className="workspace-page"
        id="members-page"
        hidden={page !== "members"}
        aria-labelledby="workspace-members-title"
      >
        <div className="section-top">
          <div>
            <div className="eyebrow">ЛЮДИ И РОЛИ</div>
            <h1 id="workspace-members-title">Команда</h1>
            <p>Поиск, роли и добавление участника в локальную демонстрацию.</p>
          </div>
        </div>
        <div className="preview">
          <div className="toolbar workspace-members-toolbar">
            <TextField
              id="member-search"
              label="Поиск участников"
              size={size}
              value={memberQuery}
              onChange={(e) => setMemberQuery(e.target.value)}
            />
            <Select
              className="workspace-select"
              id="member-role-filter"
              label="Роль"
              size={size}
              value={memberRole}
              onValueChange={(v) => setMemberRole(String(v))}
              options={[{ value: "all", label: "Все роли" }, ...roleOptions]}
            />
          </div>
          <div
            className="workspace-table-scroll"
            tabIndex={0}
            aria-label="Таблица участников"
          >
            <table>
              <thead>
                <tr>
                  <th>УЧАСТНИК</th>
                  <th>EMAIL</th>
                  <th>РОЛЬ</th>
                </tr>
              </thead>
              <tbody>
                {visibleMembers.map((m) => (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td>{m.email}</td>
                    <td>
                      {roleOptions.find((o) => o.value === m.role)?.label}
                    </td>
                  </tr>
                ))}
                {!visibleMembers.length && (
                  <tr>
                    <td colSpan={3}>Участники не найдены</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <form
          className="pane workspace-invite"
          id="workspace-invite"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) {
              setInviteError("Введите корректный email");
              document.getElementById("invite-email")?.focus();
              return;
            }
            if (
              members.some(
                (m) =>
                  m.email.toLowerCase() === inviteEmail.trim().toLowerCase(),
              )
            ) {
              setInviteError("Этот участник уже добавлен");
              return;
            }
            setMembers((m) => [
              ...m,
              {
                id: memberId.current++,
                name: inviteEmail.split("@")[0],
                email: inviteEmail.trim(),
                role: inviteRole,
              },
            ]);
            setInviteEmail("");
            setInviteError("");
            setMemberQuery("");
            setMemberRole("all");
          }}
        >
          <h2>Добавить участника</h2>
          <p>Демонстрация добавления в таблицу. Письмо не отправляется.</p>
          <div className="workspace-form-grid">
            <TextField
              id="invite-email"
              label="Email участника"
              type="email"
              size={size}
              required
              value={inviteEmail}
              errorText={inviteError}
              onChange={(e) => {
                setInviteEmail(e.target.value);
                setInviteError("");
              }}
            />
            <Select
              className="workspace-select"
              id="invite-role"
              label="Роль участника"
              size={size}
              value={inviteRole}
              onValueChange={(v) => setInviteRole(String(v))}
              options={roleOptions.filter((o) => o.value !== "owner")}
            />
          </div>
          <Button
            {...action("save")}
            size={size}
            type="submit"
            variant="primary"
          >
            Добавить в демонстрацию
          </Button>
        </form>
      </section>
    </>
  );
}
