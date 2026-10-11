/** Тело сообщения для отправки: текст и фото одним multipart-запросом. */
export const messageBody = (text: string, files: File[]) => {
  const body = new FormData();
  body.append("text", text);
  files.forEach((file) => body.append("photos", file));

  return body;
};
