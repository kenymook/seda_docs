# NotificationCenter: реальные локальные события Files

Статус: реализация и целевые проверки в текущей ветке; опубликованный сайт пока version49. Общая цель зрелости SEDA остаётся открытой.

Вместо показа последнего toast-сообщения Files использует общий `NotificationCenter` установленного `@seda-ai/ui`. Отдельная неблокирующая страница показывает до200 событий успешных операций с названиями изменённых файлов. Все/Упоминания/Непрочитанные — общие Tabs; реальных внешних упоминаний нет. Прочитанные записи остаются в истории, unread count выводится из snapshot. Состояния loading/error имеют понятный текст и настоящую retry Button.

UI не выполняет транспорт и не сохраняет бизнес-данные. Все read/mark-all/retry intents принадлежат приложению. Отдельный storage key журнала позволяет восстановить его запись или очистить повреждённую историю, не сбрасывая файлы. Ошибка журнала не выдаётся за ошибку уже сохранённой операции с файлами. Pending history сохраняется в памяти и повторяется явно; это не серверный durable audit log и не multi-tab synchronization.

Компонент использует существующие Notification Center token roles, Text/Button/Badge/Icon/Tabs и общий provider. Размеры иконок следуют параметрам контролов, длинный текст переносится. Geometry gap явно описан в specs/overlays-layout/notification-center.md; новых tokens нет. Визуальный проход убрал анимацию цветов действий между loading/disabled/ready, чтобы не оставалось кратковременного тусклого label.

Целевые промежуточные проверки: installed React18 consumer96 parameter cases,18 invalid models, SSR/Strict hydration, фильтры и read ownership, retry duplicate guard, keyboard/RTL, local focus repair, external focus, reduced motion и text contrast. Реальный Files —24 selected viewport/theme/profile cases, reload, сохранение read status, failed history write/retry и corrupted-history isolation. Предыдущая сборка прошла9/9 исходных Files workflows. После последнего уточнения контекста сообщений требуется финальная пересборка и полный прогон; эти промежуточные результаты не выданы за release proof.

Открыты: полный React18/19 package/application прогон, final browser/production proof, fresh Figma6977:2860 (service quota), screen readers/target OS/Firefox/WebKit, surface instance contract и самостоятельный overlay host. Placement overlay обозначает содержимое поверхности; host-owned non-modal position/dismiss/focus return не симулируется компонентом.30 entry modules/37 runtime exports не являются30 готовыми production-компонентами.
