import Image from "next/image";
import styles from "./style.module.scss";

type MediaViewProps = {
  url: string;
  video: boolean;
};

/** Фото или видео с плеером на всю плитку. Плитка задаёт размер. */
const MediaView = ({ url, video }: MediaViewProps) => {
  if (video) {
    return <video className={styles.media} src={url} controls preload="metadata" />;
  }

  return <Image className={styles.media} src={url} alt="" fill sizes="240px" unoptimized />;
};

export default MediaView;
