import Link from "next/link";
import { SearchForm } from "@/features/listing-search";
import { PublishButton } from "@/features/publish-listing";
import { POPULAR_CATEGORIES } from "@/shared/config/navigation";
import { PlusIcon } from "@/shared/ui/icons";
import Logo from "@/shared/ui/logo";
import { ALL_LISTINGS_LINK, DEFAULT_CITY, HEADER_ACTIONS, HELP_LINK, PUBLISH_LABEL } from "./data";
import AccountLink from "./ui/account-link";
import ActionLink from "./ui/action-link";
import CityButton from "./ui/city-button";
import styles from "./style.module.scss";

/** Шапка сайта: город, поиск, личные разделы и категории; до ПК разделы — в нижнем баре. */
const Header = () => (
  <header className={styles.header}>
    <div className={styles.service}>
      <CityButton city={DEFAULT_CITY} />

      <Link className={styles.help} href={HELP_LINK.href}>
        {HELP_LINK.label}
      </Link>
    </div>

    <div className={styles.main}>
      <div className={styles.brand}>
        <Logo href="/" ariaLabel="Купец — на главную" />

        <div className={styles.mobileCity}>
          <CityButton city={DEFAULT_CITY} />
        </div>
      </div>

      <SearchForm className={styles.search} />

      <nav className={styles.actions} aria-label="Личный раздел">
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
      </nav>

      <PublishButton className={styles.publish}>
        <PlusIcon />
        {PUBLISH_LABEL}
      </PublishButton>
    </div>

    <nav className={styles.categories} aria-label="Категории">
      {POPULAR_CATEGORIES.map((category) => (
        <Link key={category.href} className={styles.category} href={category.href}>
          {category.label}
        </Link>
      ))}

      <Link className={styles.all} href={ALL_LISTINGS_LINK.href}>
        {ALL_LISTINGS_LINK.label}
      </Link>
    </nav>
  </header>
);

export default Header;
