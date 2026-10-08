import Loader from "@/shared/ui/loader";

/** Пока грузится страница сайта — крутилка по центру экрана. */
export default function Loading() {
  return (
    <main>
      <Loader page />
    </main>
  );
}
