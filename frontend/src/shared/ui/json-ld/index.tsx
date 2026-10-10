type JsonLdProps = {
  data: Record<string, unknown>;
};

/** Разметка schema.org для поисковиков. «<» экранируется: текст пользователя не закроет тег script. */
const JsonLd = ({ data }: JsonLdProps) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
  />
);

export default JsonLd;
