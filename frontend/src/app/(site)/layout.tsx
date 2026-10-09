import { getCategoryTree } from "@/entities/category/server";
import { getLocation } from "@/entities/city/server";
import { FavoritesProvider } from "@/entities/favorite";
import { getFavoriteIds } from "@/entities/favorite/server";
import { UserProvider } from "@/entities/user";
import { getSessionUser, sessionHeaders } from "@/entities/user/server";
import AuthModal from "@/widgets/auth-modal";
import Footer from "@/widgets/footer";
import Header from "@/widgets/header";
import TabBar from "@/widgets/tab-bar";

/** Общая оболочка страниц сайта. Пользователь, избранное, место поиска и категории — с сервера. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const headers = await sessionHeaders();
  const [user, location, tree] = await Promise.all([
    headers ? getSessionUser(headers) : null,
    getLocation(),
    getCategoryTree(),
  ]);
  const favoriteIds = headers && user ? await getFavoriteIds(headers) : [];

  return (
    <UserProvider initialUser={user}>
      <FavoritesProvider key={user?.id ?? "guest"} initialIds={favoriteIds}>
        <Header city={location} tree={tree} />
        {children}
        <Footer />
        <TabBar />
        <AuthModal />
      </FavoritesProvider>
    </UserProvider>
  );
}
