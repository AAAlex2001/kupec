import Loader from "@/shared/ui/loader";

/** Пока идёт поиск — крутилка по центру экрана. */
export default function Loading() {
  return (
    <main>
      <Loader page />
    </main>
  );
}
