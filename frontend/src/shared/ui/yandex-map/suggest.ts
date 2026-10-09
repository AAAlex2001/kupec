import { reportError } from "@/shared/lib/report-error";

const SUGGEST_KEY = process.env.NEXT_PUBLIC_YANDEX_SUGGEST_API_KEY;

const SUGGEST_URL = "https://suggest-maps.yandex.ru/v1/suggest";

const RESULTS = "7";

export type AddressSuggestion = {
  title: string;
  subtitle: string;
  full: string;
};

type SuggestResponse = {
  results?: {
    title: { text: string };
    subtitle?: { text: string };
    address?: { formatted_address: string };
  }[];
};

/** Подсказки адресов от Геосаджеста Яндекса: «212-й квартал, 9» и где это. Ошибка — пусто. */
export const suggestAddresses = async (text: string): Promise<AddressSuggestion[]> => {
  const params = new URLSearchParams({
    apikey: SUGGEST_KEY ?? "",
    text,
    lang: "ru",
    results: RESULTS,
    print_address: "1",
    types: "house,street",
  });

  try {
    const response = await fetch(`${SUGGEST_URL}?${params}`);
    if (!response.ok) return [];

    const data: SuggestResponse = await response.json();

    return (data.results ?? []).map((item) => ({
      title: item.title.text,
      subtitle: item.subtitle?.text ?? "",
      full: item.address?.formatted_address ?? item.title.text,
    }));
  } catch (failure) {
    reportError(failure);

    return [];
  }
};
