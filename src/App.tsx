/* eslint-disable @typescript-eslint/no-explicit-any */
import { MouseEvent, useEffect, useRef, useState } from "react";
import { Layer, Stage } from "react-konva";
import useImage from "use-image";
import { images } from "./dummy-data/imageData";
import "./App.css";
import Rectangle from "./components/Rectangle";
import BackgroundImage from "./components/BackgroundImage";

export interface RectangleObj {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function App() {
  //#region [State]
  const [imageIndex, setImageIndex] = useState<number>(0);
  const [savedRectangles, setSavedRectangles] = useState<RectangleObj[][]>([]);
  const [rectangles, setRectangles] = useState<RectangleObj[]>(
    savedRectangles[imageIndex] || []
  );
  const [currentFirstPoint, setCurrentFirstPoint] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [tempRectangle, setTempRectangle] = useState<RectangleObj | null>(null);
  const [selectedRectId, setSelectedRectId] = useState<string | null>(null);
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isInteracting, setIsInteracting] = useState<boolean>(false);
  //#endregion [State]

  //#region [Ref]
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef(null);
  const timerRef = useRef<any>(null);
  //#endregion [Ref]

  //#region [Image]
  const [image] = useImage(images[imageIndex]);
  //#endregion [Image]

  //#region [Scale]
  const scaleWidth = 600 / (image?.width || 1);
  const scaleHeight = 600 / (image?.height || 1);
  const scale = Math.min(scaleWidth, scaleHeight);
  const stageWidth = (image?.width || 1) * scale;
  const stageHeight = (image?.height || 1) * scale;
  //#endregion [Scale]

  //#region [Event handlers]
  const handleMouseMove = (e: MouseEvent) => {
    if (currentFirstPoint && isDrawing && !isInteracting) {
      const left = containerRef?.current?.getBoundingClientRect().left || 0;
      const top = containerRef?.current?.getBoundingClientRect().top || 0;
      const x = e.clientX - left;
      const y = e.clientY - top;
      setTempRectangle({
        x1: currentFirstPoint.x,
        y1: currentFirstPoint.y,
        x2: x,
        y2: y,
      });
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (currentFirstPoint && !isInteracting && isDrawing) {
      const left = containerRef?.current?.getBoundingClientRect().left || 0;
      const top = containerRef?.current?.getBoundingClientRect().top || 0;
      const x = e.clientX - left;
      const y = e.clientY - top;
      if (
        Math.abs(x - currentFirstPoint.x) > 10 &&
        Math.abs(y - currentFirstPoint.y) > 10
      ) {
        setRectangles((prev) => [
          ...prev,
          {
            x1: currentFirstPoint.x,
            y1: currentFirstPoint.y,
            x2: x,
            y2: y,
          },
        ]);
      }
      setCurrentFirstPoint(null);
      setIsDrawing(false);
      setTempRectangle(null);
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (isInteracting) return;
    e.stopPropagation();
    const left = containerRef?.current?.getBoundingClientRect().left || 0;
    const top = containerRef?.current?.getBoundingClientRect().top || 0;
    const x = e.clientX - left;
    const y = e.clientY - top;
    setCurrentFirstPoint({ x, y });
    setIsDrawing(true);
  };
  //#endregion [Event handlers]

  //#region [Effect]
  useEffect(() => {
    setRectangles(savedRectangles[imageIndex] || []);
    return () => {
      clearTimeout(timerRef.current);
    };
  }, [imageIndex, savedRectangles]);
  //#endregion [Effect]

  //#region [Helpers]
  const handleLogRectangles = () => {
    console.log({
      originalWidth: image?.width,
      originalHeight: image?.height,
      originalSizeRectangles: rectangles.map((rect) => ({
        x1: rect.x1 / scale,
        y1: rect.y1 / scale,
        x2: rect.x2 / scale,
        y2: rect.y2 / scale,
      })),
      scaleWidth,
      scaleHeight,
      scaledRectangles: rectangles,
    });
    setShowMessage(true);
    timerRef.current = setTimeout(() => {
      setShowMessage(false);
    }, 5000);
  };
  //#endregion [Helpers]

  return (
    <div
      className="App"
      onMouseUp={handleMouseUp}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      ref={containerRef}
    >
      <div className="canvas__wrapper">
        <Stage width={stageWidth} height={stageHeight} ref={stageRef}>
          <Layer>
            <BackgroundImage imageIndex={imageIndex} />
            {tempRectangle && (
              <Rectangle
                x={tempRectangle.x1}
                y={tempRectangle.y1}
                width={Math.abs(tempRectangle.x2 - tempRectangle.x1)}
                height={Math.abs(tempRectangle.y2 - tempRectangle.y1)}
                setIsInteracting={() => {}}
                rectangles={rectangles}
                setRectangles={() => {}}
                id={"temp"}
                setCurrentFirstPoint={() => {}}
                setSelectedRectId={() => {}}
                isSelected={false}
              />
            )}
            {rectangles.map((rect, index) => (
              <Rectangle
                key={index}
                x={rect.x1}
                y={rect.y1}
                width={Math.abs(rect.x2 - rect.x1)}
                height={Math.abs(rect.y2 - rect.y1)}
                id={index.toString()}
                isSelected={selectedRectId?.toString() === index.toString()}
                setIsInteracting={setIsInteracting}
                rectangles={rectangles}
                setRectangles={setRectangles}
                setCurrentFirstPoint={setCurrentFirstPoint}
                setSelectedRectId={setSelectedRectId}
              />
            ))}
          </Layer>
        </Stage>
      </div>
      <div>Image {`${imageIndex + 1}/${images.length}`}</div>
      <div className="buttons__wrapper">
        <button
          onClick={() => {
            setImageIndex((prev) => (prev + 1) % images.length);
          }}
        >
          Previous Image
        </button>
        <button
          onClick={() => {
            const newSavedRectangles = [...savedRectangles];
            newSavedRectangles[imageIndex] = rectangles;
            setSavedRectangles(newSavedRectangles);
          }}
        >
          Save
        </button>
        <button
          onClick={() => {
            setImageIndex((prev) => (prev + 1) % images.length);
          }}
        >
          Next Image
        </button>
      </div>
      <div className="buttons__wrapper">
        <button onClick={() => setRectangles([])}>Clear annotations</button>
        <button onClick={handleLogRectangles}>
          Log annotation Coordinates
        </button>
      </div>
      {showMessage ? <div>Logged the rectangles in console</div> : <></>}
    </div>
  );
}

export default App;
