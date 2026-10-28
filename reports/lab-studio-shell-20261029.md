# Общая оболочка SEDA AI Lab и редактора токенов

Lab и /tokens используют общие StudioHeader, StudioRail и studio-chrome.css. Rail 54 px, иконки с tooltip, нейтральное активное состояние; новый пункт SEDA AI Lab. Из Lab каждый раздел редактора открывает соответствующую область через area query.

В левом sidebar находятся шесть экранов Lab и отдельная группа из восьми reference-примеров. Правый sidebar переключает Параметры и Инспектор через публичный SEDA Tabs: панели остаются смонтированными. ProductWorkspace получает активный экран из одного состояния App; формы и данные не пересоздаются при навигации. Компилятор и контракты не менялись.

Проверено:
- TypeScript пилота и reference-приложений: PASS.
- Audited pilot build: PASS, 8 профилей, sourceAudit true.
- Worker build с D1: PASS.
- verify-lab-composition.mjs: PASS; desktop 1702/1280/1140/780, mobile 390; обе темы, scale 100/150; навигация по всем экранам, правые вкладки и клавиатура, сохранение scale 125 при переключении панелей, переход Lab → Palette → Lab; ошибок JS нет.
- verify-token-editor.mjs: PASS после исправления переноса действий мобильной шапки.
- verify-workspace.mjs: 21 passed, 0 failed — геометрия S/M/L/XL в двух темах, формы/валидация, участники, pending save через навигацию, меню/диалоги, editor/history/local save/tree.
- verify-workspace-filters.mjs: 240 samples, 8 constrained, ошибок нет; связанные фильтры, reset, focus/caret и tab order сохранены.
- Визуально просмотрены screenshots Lab в Light/Dark, параметры и инспектор, масштаб 150%; редактор компонентов в Dark. Снимки находятся в локальных .diagnostics-lab-composition и .diagnostics-studio.

Границы: reference-примеры сохраняют собственные оболочки; изменено место переходов к ним. Проверка Chrome на Windows; другие браузеры и OS/AT в этом изменении не проверялись. Настройки лаборатории остаются существующей моделью сессии; общая база токенов и её протокол не менялись. Локальный static preview не обслуживает D1 API, поэтому показывает сообщение о локальном сохранении при проверках редактора.
