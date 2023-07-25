import { memo } from "react";
import { Image } from "react-konva";
import useImage from "use-image";
import { images } from "../dummy-data/imageData";

const BackgroundImage = memo(({ imageIndex }: { imageIndex: number }) => {
  const [image] = useImage(images[imageIndex]);

  if (!image) return null;

  const scaleWidth = 900 / image.width;
  const scaleHeight = 600 / image.height;
  const scale = Math.min(scaleWidth, scaleHeight);

  const x = 0;
  const y = 0;

  return (
    <Image
      image={image}
      width={image.width * scale}
      height={image.height * scale}
      x={x}
      y={y}
    />
  );
});

export default BackgroundImage;
