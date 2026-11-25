export function MapSetupState({
  compact = false,
  reason = "missing",
}: {
  compact?: boolean;
  reason?: "missing" | "rejected";
}) {
  const rejected = reason === "rejected";
  return (
    <div className={compact ? "grid h-full place-items-center bg-[#eef2f6] px-4 text-center" : "grid min-h-[240px] place-items-center rounded-2xl bg-[#eef2f6] px-4 text-center"}>
      <div className="max-w-sm">
        <p className="text-[16px] font-bold">{rejected ? "Яндекс отклонил API-ключ" : "Требуется настройка Яндекс Карт"}</p>
        <p className="mt-2 text-[13px] leading-5 text-[#555]">
          {rejected
            ? "Ключ задан в проекте, но JavaScript API 3.0 ответил 403 Invalid api key. Список объявлений работает без тайлов."
            : "Карта подключается только через официальный JavaScript API 3.0. Ключ с ограничением HTTP Referer ещё не задан. Список объявлений справа и снизу работает без тайлов."}
        </p>
        <p className="mt-2 text-[12px] leading-4 text-[#767676]">
          {rejected
            ? "В кабинете разработчика нужен пакет «JavaScript API», поле HTTP Referer со значением localhost, активация до 15 минут. Геокодер не вызывается."
            : "Добавьте NEXT_PUBLIC_YANDEX_MAPS_API_KEY в локальный env. Платные вызовы Геокодера не включались."}
        </p>
      </div>
    </div>
  );
}
