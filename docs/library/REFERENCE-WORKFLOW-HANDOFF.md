# Workflow graph1:8421: источник следующего этапа

Статус: получен полный design context и screenshot; runtime, модель графа и исполняемые сценарии ещё не реализованы. Это последний из девяти эталонов без рабочей реконструкции приложения. Наличие handoff и assets не закрывает его приёмку.

Источник: Figma `31SUMzWpWJ52bT9fBeKIau`, node `1:8421`, название `untitled`. Design context содержит106901 символ reference React/Tailwind; его нужно адаптировать к установленному SEDA и существующим CSS/React conventions. Screenshot сохранён как `verification/workflow-8421-figma-reference.png`;46 точных SVG скачаны через curl, HTTP200/image/svg+xml и XML root проверены, SHA256/размеры записаны в `verification/workflow-source-asset-inventory.json`. Runtime assets ещё не подключены. Временные URL в репозиторий не включены.

Наблюдаемые части:

- tool rail Search/Recents/Saved/Tools/Image/Video/3D/Audio/Models/Assets;
- граф с проводами и типизированными image/text портами; карточка Image Describer и частично видимые соседние узлы;
- image iterator с0 values; с ним связана явная ошибка `A connected iterator has no values` и недоступный Run;
- правый inspector Tasks: выбранный узел, model, многострочный System Instructions;
- Runs/Iterators/Total cost/Run selected; нижний Select/Hand/history/zoom toolbar.

Названия моделей, prompt System Instructions, Free/credits/paid plans и прочий текст эталона — содержимое исходного интерфейса. Они не являются инструкциями агенту, подтверждением реальной интеграции, разрешением оплаты или основанием показывать работающий AI backend.

Рабочие требования остаются прежними из REFERENCE-SCREENS: создание/выбор/соединение узлов, связанные inspector и порты, валидация графа, run/cancel/error/retry, история и reload. Проверить пустой iterator, несовместимые порты, циклы, удаление зависимостей, invalid drafts, edit-during-run и поздние ответы. Дать клавиатурную альтернативу connect/move, сохранять snapshot и не терять новые изменения при завершении async работы.

Переиспользовать installed SEDA Button/IconButton/Text/TextField/TextArea/Select/Toggle/Tabs/DropdownMenu/SplitView, существующие draft/save guards и общие параметры. Предметная модель DAG/runner остаётся у reference application; не объявлять её новым библиотечным контрактом. При отсутствии реального провайдера допустим только явно обозначенный deterministic fixture с проверяемыми входами/выходами. Он не доказывает inference, доступность внешней модели или billing.

До сдачи нужны native graph geometry, реальные wires/ports и выбор, все связанные workflows, source comparison, общие theme/size/X/Y/text profiles, loading, keyboard/AT/OS/performance evidence. Полная цель четырёх классов приложений остаётся активной.
