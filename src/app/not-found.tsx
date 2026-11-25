import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-sm tracking-[0.16em] text-primary uppercase">404</p>
      <h1 className="mt-3 text-2xl font-bold">Страница не найдена</h1>
      <p className="mt-4 text-muted-foreground">Проверьте адрес или вернитесь в каталог услуг.</p>
      <Button asChild className="mt-8 h-11 px-5">
        <Link href="/services">Открыть каталог</Link>
      </Button>
    </section>
  );
}
