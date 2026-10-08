import { FavoritesProvider } from "@/entities/favorite";
import { getFavoriteIds } from "@/entities/favorite/server";
import { UserProvider } from "@/entities/user";
import { getSessionUser, sessionHeaders } from "@/entities/user/server";
import AuthModal from "@/widgets/auth-modal";
import Footer from "@/widgets/footer";
import Header from "@/widgets/header";
import TabBar from "@/widgets/tab-bar";

/** Общая оболочка страниц сайта. Пользователь и его избранное читаются по cookie ещё на сервере. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const headers = await sessionHeaders();
  const user = headers ? await getSessionUser(headers) : null;
  const favoriteIds = headers && user ? await getFavoriteIds(headers) : [];

  return (
    <UserProvider initialUser={user}>
      <FavoritesProvider key={user?.id ?? "guest"} initialIds={favoriteIds}>
        <Header />
        {children}
        <Footer />
        <TabBar />
        <AuthModal />
      </FavoritesProvider>
    </UserProvider>
  );
}
