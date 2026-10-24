import React, { useLayoutEffect, useRef, useState } from "react";
import {
  Text,
  Button,
  TextField,
  Icon,
  IconButton,
  FileUpload,
  Alert,
  Toast,
  ToastProvider,
  ToastViewport,
  useToast,
  Badge,
  Tag,
  type AlertVariant,
} from "@seda-ai/ui";

import { Select, Checkbox, Radio, Toggle, Tabs } from "./contract-controls";
import {EditorWorkspace} from "./EditorWorkspace";

type Props = {
  size: "s" | "m" | "l" | "xl";
  action: (role: string) => any;
  children: React.ReactNode;
  typography: any;
  textScale: number;
};
const teams = [
  { value: "Core", label: "Core" },
  { value: "Product", label: "Product" },
  { value: "Design", label: "Design" },
  { value: "Mobile", label: "Mobile" },
];

/** Stateful product composition. Demo data stays in memory; no network invitation is sent. */
export function ProductWorkspace({ size, action, children, typography, textScale }: Props) {
  const [page, setPage] = useState("projects");
  const [settingsTab, setSettingsTab] = useState("general");
  const invalidFocus = useRef<string | null>(null);
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
  useLayoutEffect(() => {
    if (invalidFocus.current) {
      document.getElementById(invalidFocus.current)?.focus();
      invalidFocus.current = null;
    }
  }, [errors]);
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
      invalidFocus.current = "workspace-" + Object.keys(next)[0];
      setSettingsTab("general");
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
          ["editor", "Редактор"],
          ["components", "Компоненты"],
          ["feedback", "Состояния"],
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
            <Text as="h1" variant="heading/page" id="workspace-settings-title">Настройки</Text>
            <Text as="p" variant="body/default">
              Общие параметры применяются к полям, выбору значений и действиям.
            </Text>
          </div>
        </div>
        <form
          className="pane workspace-form"
          id="workspace-settings"
          noValidate
          onSubmit={saveSettings}
        >
          <Tabs
            id="settings-tabs"
            label="Разделы настроек пространства"
            size={size}
            variant="line"
            value={settingsTab}
            onValueChange={setSettingsTab}
            items={[
              { value: "general", label: "Основные параметры", content: <div className="workspace-settings-panel">
                  <div className="form-section-heading">
                    <Text as="h2" variant="heading/section">Основная информация</Text>
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
              </div> },
              { value: "access", label: "Доступ и уведомления", content: <div className="workspace-settings-panel">
                  <div className="form-section-heading">
                    <Text as="h2" variant="heading/section">Доступ и уведомления</Text>
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
              </div> },
            ]}
          />
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
            <Text as="p" variant="body/default" role="status" id="workspace-notice">
              {notice || "Все данные остаются в этой демонстрации"}
            </Text>
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
            <Text as="h1" variant="heading/page" id="workspace-members-title">Команда</Text>
            <Text as="p" variant="body/default">Поиск, роли и добавление участника в локальную демонстрацию.</Text>
          </div>
        </div>
        <div className="preview">
          <div className="toolbar workspace-members-toolbar">
            <TextField
              id="member-search"
              prefix={<Icon name="search" />}
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
          <Text as="h2" variant="heading/section">Добавить участника</Text>
          <Text as="p" variant="body/default">Демонстрация добавления в таблицу. Письмо не отправляется.</Text>
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
      <div id="editor-page" hidden={page!=="editor"}><EditorWorkspace size={size} action={action} typography={typography} textScale={textScale}/></div>
      <section id="components-page" className="workspace-page" hidden={page!=="components"} aria-labelledby="components-title">
        <Text as="h1" variant="heading/page" id="components-title">Согласованность компонентов</Text>
        <Text as="p" variant="body/default">Сравните текст, иконки, края и интервалы при изменении общих параметров. Это рабочая проверка визуального слоя, а не отметка готовности библиотеки.</Text>
        <VisualConsistency size={size} action={action} />
      </section>
      <section id="feedback-page" className="workspace-page" hidden={page!=="feedback"} aria-labelledby="feedback-title">
        <Text as="h1" variant="heading/page" id="feedback-title">Состояния рабочего интерфейса</Text>
        <Text as="p" variant="body/default">Сообщения, фильтр и счётчики собраны из SEDA. Выбор и удаление фильтра меняют локальный список; сетевые операции не выполняются.</Text>
        <FeedbackWorkspace />
      </section>
    </>
  );
}

function FeedbackWorkspace() {
  const [severity,setSeverity]=useState<AlertVariant>("info");
  const [selected,setSelected]=useState(false);
  const [hasFilter,setHasFilter]=useState(true);
  const [showAlert,setShowAlert]=useState(true);
  const [notice,setNotice]=useState<string|null>(null);
  const noticeTrigger=useRef<HTMLButtonElement>(null);
  const filterTrigger=useRef<HTMLButtonElement>(null);
  const alertTrigger=useRef<HTMLButtonElement>(null);
  const tone=severity==="error"?"danger":severity;
  const items=[{name:"Atlas",mine:true},{name:"Nova",mine:false},{name:"Orbit",mine:true},{name:"Horizon",mine:false}].filter(item=>!selected||item.mine);
  return <div className="feedback-workspace">
    <div className="pane feedback-workspace__controls">
      <Select id="feedback-severity" label="Вариант сообщения" value={severity} onValueChange={value=>setSeverity(value as AlertVariant)} options={[
        {value:"info",label:"Информация"},{value:"success",label:"Успех"},{value:"warning",label:"Предупреждение"},{value:"error",label:"Ошибка"},{value:"ai",label:"AI-предложение"}]} />
      <div className="visual-consistency__actions">
        <Button ref={noticeTrigger} id="feedback-show-toast" iconLeft={<Icon name="info" />} onClick={()=>setNotice(`Показано проектов: ${items.length}`)}>Показать уведомление</Button>
        <Button ref={alertTrigger} id="feedback-show-alert" disabled={showAlert} onClick={()=>{setShowAlert(true);requestAnimationFrame(()=>document.getElementById("feedback-severity")?.focus());}}>Вернуть сообщение</Button>
      </div>
    </div>
    {showAlert&&<Alert id="feedback-alert" variant={severity} title={severity==="ai"?"AI-предложение требует проверки":"Пример состояния: "+severity}
      description="Это визуальный пример сообщения. Его цвет, текст и иконка следуют общей системе; состояние сервера не имитируется."
      dismissLabel="Скрыть пример сообщения" onDismiss={()=>{setShowAlert(false);requestAnimationFrame(()=>alertTrigger.current?.focus());}} />}
    <div className="pane">
      <div className="visual-consistency__actions">
        {hasFilter&&<Tag id="feedback-filter" type="selectable" tone={tone} selected={selected} badgeValue={2}
          leadingIcon={<Icon name="user" />} dismissible dismissLabel="Удалить фильтр моих проектов"
          onSelectedChange={value=>{setSelected(value);setNotice(value?"Фильтр включён: 2 проекта":"Фильтр выключен: 4 проекта");}}
          onDismiss={()=>{setHasFilter(false);setSelected(false);setNotice("Фильтр удалён");requestAnimationFrame(()=>filterTrigger.current?.focus());}}>Мои проекты</Tag>}
        <Button ref={filterTrigger} id="feedback-restore-filter" disabled={hasFilter} onClick={()=>setHasFilter(true)}>Вернуть фильтр</Button>
        <Badge id="feedback-count" count={items.length} tone={tone} accessibleLabel={`Проектов в списке: ${items.length}`} />
      </div>
      <ul className="feedback-workspace__list" id="feedback-projects">{items.map(item=><li key={item.name}><Text as="span" variant="body/default">{item.name}</Text><Tag leadingIcon={<Icon name="info" />}>{item.mine?"Мой проект":"Командный проект"}</Tag></li>)}</ul>
    </div>
    {notice&&<Toast id="feedback-toast" intent={severity==="ai"?"info":severity} duration={null} title={notice}
      description="Постоянное уведомление: закройте его вручную. Автоочередь Toast здесь не имитируется."
      actionLabel={selected?"Сбросить фильтр":undefined} onAction={()=>{setSelected(false);setNotice("Фильтр сброшен: 4 проекта");}}
      dismissLabel="Закрыть уведомление" onDismiss={()=>{setNotice(null);noticeTrigger.current?.focus();}} />}
    <ToastProvider><ToastQueueDemo /></ToastProvider>
  </div>;
}

function ToastQueueDemo() {
  const {notify,clear,visible,queued}=useToast();
  const trigger=useRef<HTMLButtonElement>(null),serial=useRef(0);
  const [reviewed,setReviewed]=useState(0);
  return <div className="pane" id="feedback-queue-demo">
    <Text as="h3" variant="heading/section">Очередь уведомлений</Text>
    <Text as="p" variant="body/default">До трёх сообщений одновременно. Время показа начинается после выхода из очереди и останавливается при наведении, фокусе или неактивном окне. Действия и ошибки остаются до закрытия.</Text>
    <div className="visual-consistency__actions">
      <Button id="queue-add" ref={trigger} iconLeft={<Icon name="add" />} onClick={()=>notify({title:`Локальное событие ${++serial.current}`,intent:"success",description:"Автозакрытие через 5 секунд активного показа.",dismissLabel:"Закрыть сообщение очереди"})}>Добавить событие</Button>
      <Button id="queue-burst" onClick={()=>{for(let i=0;i<5;i++)notify({title:`Событие серии ${++serial.current}`,intent:"info",dismissLabel:"Закрыть сообщение очереди"});}}>Серия из 5</Button>
      <Button id="queue-review" onClick={()=>notify({dedupeKey:"review",title:"Проверка макета",description:"Повторное нажатие обновляет это сообщение.",actionLabel:"Отметить проверенным",onAction:()=>setReviewed(value=>value+1),dismissLabel:"Закрыть сообщение очереди"})}>Сообщение с действием</Button>
      <Button id="queue-clear" disabled={!visible.length&&!queued} onClick={clear}>Очистить очередь</Button>
    </div>
    <Text as="p" variant="body/default" id="queue-summary">Видимых: {visible.length} · В очереди: {queued} · Отметок проверки: {reviewed}</Text>
    <ToastViewport id="feedback-queue" aria-label="Очередь событий рабочего пространства" restoreFocusRef={trigger} />
  </div>;
}

function VisualConsistency({ size, action }: Pick<Props, "size" | "action">) {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [uploads, setUploads] = useState<Record<string, File[]>>({});
  return <div className="visual-consistency">
    <Checkbox id="visual-loading" label="Показать loading у действий" size={size} checked={loading} onChange={event=>setLoading(event.target.checked)} />
    {(["default", "error", "disabled"] as const).map(state=><div key={state} className="pane visual-consistency__sample" data-visual-state={state}>
      <Text as="h2" variant="heading/section">{state==="default"?"Обычное состояние":state==="error"?"Ошибка поля":"Недоступное состояние"}</Text>
      <div className="visual-consistency__fields">
        <TextField id={`visual-field-${state}`} label="Поиск" prefix={<Icon name="search" />} size={size} value={query} onChange={event=>setQuery(event.target.value)} disabled={state==="disabled"} errorText={state==="error"?"Уточните запрос":undefined} helperText="Иконка и текст используют общий масштаб" />
        <Select id={`visual-select-${state}`} label="Период" size={size} disabled={state==="disabled"} errorText={state==="error"?"Выберите другой период":undefined} options={[{value:"week",label:"Эта неделя"},{value:"month",label:"Этот месяц"}]} />
      </div>
      <div className="visual-consistency__actions">
        <Button {...action("save")} id={`visual-button-${state}`} size={size} variant="primary" iconLeft={<Icon name="add" />} disabled={state==="disabled"} loading={loading}>Создать проект</Button>
        <Button {...action("cancel")} size={size} iconRight={<Icon name="arrow-right" />} disabled={state==="disabled"} loading={loading}>Продолжить</Button>
        <IconButton id={`visual-icon-${state}`} size={size} aria-label="Информация" icon={<Icon name="info" />} disabled={state==="disabled"} loading={loading} />
      </div>
      <div className="visual-consistency__actions">
        <Checkbox label="Включить в отчёт" size={size} defaultChecked disabled={state==="disabled"} />
        <Toggle label="Уведомления" size={size} checked={enabled} onChange={event=>setEnabled(event.target.checked)} disabled={state==="disabled"} />
      </div>
      <Radio name={`visual-period-${state}`} label="Периодичность" options={[{value:"weekly",label:"Еженедельно"},{value:"monthly",label:"Ежемесячно"}]} size={size} defaultValue="weekly" disabled={state==="disabled"} />
      <Tabs label={`Вкладки — ${state}`} size={size} items={[{value:"activity",label:"Активность",icon:<Icon name="clock" />,disabled:state==="disabled",content:<Text as="p" variant="body/default">Иконки в полях, действиях и навигации следуют одному размеру.</Text>},{value:"calendar",label:"Календарь",icon:<Icon name="calendar" />,disabled:state==="disabled",content:<Text as="p" variant="body/default">Состояние вкладки сохраняется при смене масштаба.</Text>}]} />
      <div className="visual-consistency__uploads">
        {(["dropzone","button","inline"] as const).map(variant=>{
          const id=`visual-upload-${state}-${variant}`;
          return <FileUpload key={variant} id={id} label={`Файлы — ${variant}`} variant={variant} size={size}
            state={state==="disabled"?"disabled":loading?"uploading":"default"}
            errorText={state==="error"?"Демонстрация ошибки выбора":undefined}
            helperText="Локальный выбор файлов. Отправка не выполняется." actionLabel="Выбрать файлы" multiple
            files={uploads[id]??[]} onFilesChange={files=>setUploads(previous=>({...previous,[id]:files}))} />;
        })}
      </div>
    </div>)}
  </div>;
}
