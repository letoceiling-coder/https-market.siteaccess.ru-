import type { Metadata } from "next";

export const metadata: Metadata = { title: "Условия использования" };

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-4 pb-10">
      <h1 className="text-2xl font-bold">Условия использования</h1>
      <p className="mt-4 leading-7">Справочные тексты имеют статус «нужна проверка специалиста». Они не являются проектом, сметой, офертой или инструкцией для самостоятельных газовых и электрических работ.</p>
      <p className="mt-4 leading-7">Карточки домов и профиль «Макет профиля» демонстрируют интерфейс. Они не продают имущество и не представляют компанию.</p>
      <p className="mt-4 leading-7">Калькуляторы дают предварительный набросок в заданных пределах и не заменяют нормативный расчёт.</p>
    </article>
  );
}
