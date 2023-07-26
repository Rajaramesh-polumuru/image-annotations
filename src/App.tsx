/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  MouseEvent,
  TouchEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";
import { Layer, Stage } from "react-konva";
import useImage from "use-image";
import { images } from "./dummy-data/imageData";
import "./App.css";
import Rectangle from "./components/Rectangle";
import BackgroundImage from "./components/BackgroundImage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "react-toastify/dist/ReactToastify.css";
import {
  faCheck,
  faCheckCircle,
  faCircle,
  faEye,
  faEyeSlash,
  faTrash,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";

export interface RectangleObj {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  hide?: boolean;
  name?: string;
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

  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isInteracting, setIsInteracting] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>();
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  //#endregion [State]

  //#region [Ref]
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef(null);
  const timerRef = useRef<any>(null);
  //#endregion [Ref]

  //#region [Image]
  let [image] = useImage(images[imageIndex]);
  //#endregion [Image]

  //#region [Scale]
  const scaleWidth = 900 / (image?.width || 1);
  const scaleHeight = 600 / (image?.height || 1);
  const scale = Math.min(scaleWidth, scaleHeight);
  const stageWidth = (image?.width || 1) * scale;
  const stageHeight = (image?.height || 1) * scale;
  //#endregion [Scale]

  //#region [Event handlers]
  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (currentFirstPoint && isDrawing && !isInteracting) {
      const left = containerRef?.current?.getBoundingClientRect().left || 0;
      const top = containerRef?.current?.getBoundingClientRect().top || 0;
      const x = "clientX" in e ? e.clientX - left : e.touches[0].clientX - left;
      const y = "clientY" in e ? e.clientY - top : e.touches[0].clientY - top;
      setTempRectangle({
        x1: currentFirstPoint.x,
        y1: currentFirstPoint.y,
        x2: x,
        y2: y,
      });
    }
  };

  const handleMouseUp = (e: MouseEvent | TouchEvent) => {
    if (currentFirstPoint && !isInteracting && isDrawing) {
      const left = containerRef?.current?.getBoundingClientRect().left || 0;
      const top = containerRef?.current?.getBoundingClientRect().top || 0;

      const x =
        "clientX" in e ? e.clientX - left : e.changedTouches[0].clientX - left;
      const y =
        "clientY" in e ? e.clientY - top : e.changedTouches[0].clientY - top;

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
        setIsSaved(false);
      }
      setCurrentFirstPoint(null);
      setIsDrawing(false);
      setTempRectangle(null);
    }
  };

  const handleMouseDown = (e: MouseEvent | TouchEvent) => {
    if (isInteracting) return;
    e.stopPropagation();
    const left = containerRef?.current?.getBoundingClientRect().left || 0;
    const top = containerRef?.current?.getBoundingClientRect().top || 0;
    const x = "clientX" in e ? e.clientX - left : e.touches[0]?.clientX - left;
    const y = "clientY" in e ? e.clientY - top : e.touches[0]?.clientY - top;
    setCurrentFirstPoint({ x, y });
    setIsDrawing(true);
  };
  //#endregion [Event handlers]

  //#region [Effect]
  useEffect(() => {
    setRectangles(savedRectangles[imageIndex] || []);
    console.log(image);
    if (image) {
      setIsImageLoading(false);
    } else {
      setIsImageLoading(true);
    }
    return () => {
      clearTimeout(timerRef.current);
    };
  }, [imageIndex, savedRectangles, image]);

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
    toast.success("Logged coordinates to console!");
  };
  //#endregion [Helpers]
  return (
    <div className="main__container">
      <ToastContainer />
      <div
        className="canvas__container"
        onMouseUp={handleMouseUp}
        onMouseDown={handleMouseDown}
        onTouchEnd={
          handleMouseUp as unknown as TouchEventHandler<HTMLDivElement>
        }
        onTouchStart={
          handleMouseDown as unknown as TouchEventHandler<HTMLDivElement>
        }
        onMouseMove={handleMouseMove}
        onTouchMove={
          handleMouseMove as unknown as TouchEventHandler<HTMLDivElement>
        }
        ref={containerRef}
      >
        <div className="canvas__wrapper">
          {isImageLoading && (
            <div className="image__loading">
              <div className="spinner__square">
                <div className="square__1 square"></div>
                <div className="square__2 square"></div>
                <div className="square__3 square"></div>
              </div>
              Loading...
            </div>
          )}
          <Stage width={stageWidth} height={stageHeight} ref={stageRef}>
            <Layer>
              <BackgroundImage imageIndex={imageIndex} />
              {tempRectangle && (
                <Rectangle
                  x={tempRectangle.x1}
                  y={tempRectangle.y1}
                  width={tempRectangle.x2 - tempRectangle.x1}
                  height={tempRectangle.y2 - tempRectangle.y1}
                  setIsInteracting={() => {}}
                  rectangles={rectangles}
                  setRectangles={() => {}}
                  id={"temp"}
                  setCurrentFirstPoint={() => {}}
                  setSelectedRectId={() => {}}
                  isSelected={false}
                  setIsSaved={() => {}}
                />
              )}
              {rectangles.map((rect, index) => (
                <>
                  {!rect.hide && (
                    <Rectangle
                      key={index}
                      x={rect.x1}
                      y={rect.y1}
                      width={rect.x2 - rect.x1}
                      height={rect.y2 - rect.y1}
                      id={index.toString()}
                      isSelected={
                        selectedRectId?.toString() === index.toString()
                      }
                      setIsInteracting={setIsInteracting}
                      rectangles={rectangles}
                      setRectangles={setRectangles}
                      setCurrentFirstPoint={setCurrentFirstPoint}
                      setSelectedRectId={setSelectedRectId}
                      setIsSaved={setIsSaved}
                    />
                  )}
                </>
              ))}
            </Layer>
          </Stage>
        </div>
        <div>Image {`${imageIndex + 1}/${images.length}`}</div>
        <div className="buttons__wrapper">
          <button
            onClick={() => {
              setImageIndex((prev) => prev - 1);
              setIsInteracting(false);
              setSelectedRectId(null);
              image = undefined;

              if (isSaved !== undefined && !isSaved) {
                toast.warning(
                  "Please save your changes before moving to the previous image."
                );
                setIsSaved(undefined);
              }
            }}
            disabled={imageIndex === 0}
          >
            Previous Image
          </button>
          <button
            onClick={() => {
              const newSavedRectangles = [...savedRectangles];
              newSavedRectangles[imageIndex] = rectangles;
              setSavedRectangles(newSavedRectangles);
              toast.success("Saved!");
              setIsSaved(true);
            }}
          >
            Save
          </button>
          <button
            onClick={() => {
              setImageIndex((prev) => (prev + 1) % images.length);
              setIsInteracting(false);
              setSelectedRectId(null);
              image = undefined;
              if (isSaved !== undefined && !isSaved) {
                toast.warning(
                  "Please save your changes before moving to the next image."
                );
                setIsSaved(undefined);
              }
            }}
            disabled={imageIndex === images.length - 1}
          >
            Next Image
          </button>
        </div>
      </div>
      <div className="sidebar">
        <div className="sidebar__content">
          {/* <div className="sidebar__content__title">Annotations</div> */}
          <div>{`Click and drag to draw a rectangle.`}</div>
          <div className="sidebar__content__buttons">
            <button
              onClick={() => {
                setIsSaved(false);
                setRectangles([]);
                toast.success("Cleared all Annotations!");
              }}
            >
              Clear all annotations
              <FontAwesomeIcon icon={faTrash} />
            </button>
            <button onClick={handleLogRectangles}>
              Log annotation Coordinates
            </button>
            {isSaved !== undefined && (
              <div className="sidebar__content__list__saved_state">
                {isSaved ? (
                  <>
                    <FontAwesomeIcon icon={faCheck} color="green" />
                    Saved
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon
                      icon={faTriangleExclamation}
                      color="yellow"
                    />
                    Unsaved changes
                  </>
                )}
              </div>
            )}
          </div>
          <div className="sidebar__header">
            <div className="sidebar__header__title">{`Image-${
              imageIndex + 1
            }`}</div>
          </div>
          <div className="sidebar__content__list">
            {rectangles.map((rect, index) => (
              <div
                key={index}
                className="sidebar__content__list__item"
                onClick={() => {
                  setIsInteracting(false);
                  if (selectedRectId?.toString() === index.toString()) {
                    setSelectedRectId(null);
                  } else {
                    setSelectedRectId(index.toString());
                  }
                }}
              >
                <div className="sidebar__content__list__item__index">
                  <div className="sidebar__item__label_wrapper">
                    <div className="sidebar__content__list__item__selected">
                      {selectedRectId?.toString() === index.toString() ? (
                        <FontAwesomeIcon icon={faCheckCircle} />
                      ) : (
                        <FontAwesomeIcon
                          icon={faCircle}
                          style={{ opacity: 0.25 }}
                        />
                      )}
                    </div>
                    <input
                      type="text"
                      className="sidebar__item__label_input"
                      value={rect.name ?? `Selection-${index + 1}`}
                      onChange={(e) => {
                        const newRectangles = [...rectangles];
                        newRectangles[index].name = e.target.value;
                        setRectangles(newRectangles);
                        setIsSaved(false);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    />
                  </div>

                  <div className="item__buttons__container">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newRectangles = [...rectangles];
                        newRectangles[index].hide = !newRectangles[index].hide;

                        setRectangles(newRectangles);
                        setIsSaved(false);
                      }}
                      className="icon__button"
                    >
                      {rect.hide ? (
                        <FontAwesomeIcon icon={faEye} />
                      ) : (
                        <FontAwesomeIcon icon={faEyeSlash} />
                      )}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newRectangles = [...rectangles];
                        newRectangles.splice(index, 1);
                        setRectangles(newRectangles);
                        setIsSaved(false);
                        toast.success(
                          `Deleted ${rect.name ?? `Selection-${index + 1}`}`
                        );
                      }}
                      className="icon__button"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
