import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Suspense } from "react";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/shared/config/site";
import { OG_BASE } from "@/shared/lib/seo";
import YandexMetrikaPageViews from "@/shared/ui/yandex-metrika";
import "./globals.scss";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    ...OG_BASE,
    type: "website",
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <Script id="yandex-metrika" strategy="beforeInteractive">{`
          (function(m,e,t,r,i,k,a){
            m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0];
            k.async=1;k.src=r;a.parentNode.insertBefore(k,a);
          })(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=113599867','ym');
          ym(113599867,'init',{
            ssr:true,defer:true,webvisor:true,clickmap:true,ecommerce:"dataLayer",
            referrer:document.referrer,url:location.href,
            accurateTrackBounce:true,trackLinks:true
          });
        `}</Script>
        <noscript>
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element -- Пиксель Метрики должен обращаться напрямую к Яндексу. */}
            <img src="https://mc.yandex.ru/watch/113599867" style={{ position: "absolute", left: -9999 }} alt="" />
          </div>
        </noscript>
        <Suspense fallback={null}>
          <YandexMetrikaPageViews />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
