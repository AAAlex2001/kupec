import Loader from "@/shared/ui/loader";

/** Пока грузится каталог — крутилка по центру экрана. */
export default function Loading() {
  return (
    <main>
      <Loader page />
    </main>
  );
}
