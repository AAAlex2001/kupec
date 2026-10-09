import Link from "next/link";
import type { CategoryNode } from "@/entities/category";
import type { City } from "@/entities/city";
import { LocationButton } from "@/features/choose-location";
import { SearchForm } from "@/features/listing-search";
import { PublishButton } from "@/features/publish-listing";
import { HOME_PATH } from "@/shared/config/routes";
import { PlusIcon } from "@/shared/ui/icons";
import Logo from "@/shared/ui/logo";
import { HEADER_ACTIONS, PUBLISH_LABEL, SERVICE_LINKS } from "./data";
import AccountLink from "./ui/account-link";
import ActionLink from "./ui/action-link";
import CatalogButton from "./ui/catalog-button";
import styles from "./style.module.scss";

type HeaderProps = {
  city: City | null;
  tree: CategoryNode[];
};

/** Шапка как у Авито: сверху сервисные ссылки и личные разделы, ниже — категории, поиск и регион. */
const Header = ({ city, tree }: HeaderProps) => (
  <>
    <div className={styles.service}>
      <nav className={styles.links} aria-label="Сервис">
        {SERVICE_LINKS.map((link) => (
          <Link key={link.href} className={styles.link} href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>

      <nav className={styles.personal} aria-label="Личный раздел">
        {HEADER_ACTIONS.map(({ href, label, Icon, requiresAuth }) => (
          <ActionLink
            key={href}
            href={href}
            label={label}
            icon={<Icon />}
            requiresAuth={requiresAuth}
          />
        ))}
        <AccountLink />
        <PublishButton className={styles.publish} variant="ghost">
          <PlusIcon />
          {PUBLISH_LABEL}
        </PublishButton>
      </nav>
    </div>

    <header className={styles.main}>
      <div className={styles.brand}>
        <Logo href={HOME_PATH} ariaLabel="Купец — на главную" />

        <div className={styles.mobileCity}>
          <LocationButton city={city} />
        </div>
      </div>

      <CatalogButton className={styles.catalog} tree={tree} />
      <SearchForm className={styles.search} />

      <div className={styles.city}>
        <LocationButton city={city} />
      </div>
    </header>
  </>
);

export default Header;
