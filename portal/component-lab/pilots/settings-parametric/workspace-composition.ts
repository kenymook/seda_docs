export type WorkspacePage = "projects" | "settings" | "members" | "editor" | "components" | "feedback";

type Composition = {
  title: string;
  path: string;
  components: string;
  application: string;
  rule: string;
  boundary: string;
};

/** Screen assembly is a recipe. The application keeps its data and history. */
export const workspaceCompositions: Record<WorkspacePage, Composition> = {
  projects: {
    title: "Проекты · поиск и просмотр",
    path: "Навигация → фильтры → таблица / карточки → страницы → действия",
    components: "TopBar, Button, TextField, Select, Checkbox, Table, Card, Avatar, DropdownMenu",
    application: "Проекты, фильтрация, сортировка, выбор строк и диалог создания",
    rule: "Счётчик, строки и страницы вычисляются из одного отфильтрованного набора.",
    boundary: "Table и Card используют публичный SEDA UI; геометрия композиции остаётся экспериментальной.",
  },
  settings: {
    title: "Настройки · форма",
    path: "Группы полей → проверка → сохранение → обратная связь",
    components: "TextField, TextArea, NumberField, Select, Checkbox, Radio, Toggle, Button, Alert",
    application: "Значения, ошибки, черновик и подтверждённый снимок формы",
    rule: "Ошибка указывает на поле; изменение общего размера не сбрасывает черновик.",
    boundary: "Form описан в спецификации; готовый исполняемый контракт всей формы ещё не принят.",
  },
  members: {
    title: "Команда · роли и данные",
    path: "Поиск и роль → таблица участников → добавление",
    components: "TextField, Select, Table, Avatar, AvatarGroup, Button",
    application: "Участники, фильтр, сортировка, валидация приглашения",
    rule: "Фильтр и таблица показывают одну модель; добавление остаётся локальным действием.",
    boundary: "Письмо и серверная модель членства не подключены.",
  },
  editor: {
    title: "Редактор · связанные панели",
    path: "Дерево → рабочая область → инспектор → история и сохранение",
    components: "SplitView, Tree, TextField, Select, Checkbox, Toggle, Button",
    application: "Документ, выделение, размеры панелей, undo/redo и local snapshot",
    rule: "Дерево, preview и инспектор разделяют одно выделение; resize не сохраняет документ.",
    boundary: "EditorDock и сам макет — экспериментальная композиция поверх SEDA UI.",
  },
  components: {
    title: "Компоненты · совместные состояния",
    path: "Варианты → реальные контролы → проверка размеров и состояний",
    components: "Button, TextField, Select, Checkbox, Radio, Toggle, Slider, NumberField",
    application: "Только сценарий просмотра; параметры поступают из общего компилятора",
    rule: "Каждый показанный контроль получает общую тему, размер, типографику и X/Y.",
    boundary: "Проверка отдельных контролов не означает приёмку всей композиции.",
  },
  feedback: {
    title: "Состояния · обратная связь",
    path: "Событие → статус → уведомление → восстановление",
    components: "Alert, Toast, Badge, Tag, FileUpload, Button",
    application: "Локальные события и демонстрационные ответы",
    rule: "Loading, error и success доступны в контексте действия и не теряют управление фокусом.",
    boundary: "У feedback и FileUpload пока нет полного набора исполняемых instance contracts.",
  },
};
