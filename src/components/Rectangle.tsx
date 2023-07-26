/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef } from "react";
import { Rect, Transformer } from "react-konva";

interface RectangleProps {
  x: number;
  y: number;
  width: number;
  height: number;
  id: string;
  setIsInteracting: React.Dispatch<React.SetStateAction<boolean>>;
  rectangles: { x1: number; y1: number; x2: number; y2: number }[];
  setRectangles: React.Dispatch<
    React.SetStateAction<{ x1: number; y1: number; x2: number; y2: number }[]>
  >;
  setCurrentFirstPoint: React.Dispatch<React.SetStateAction<any>>;
  setSelectedRectId: React.Dispatch<React.SetStateAction<string | null>>;
  isSelected: boolean;
  setIsSaved: React.Dispatch<React.SetStateAction<boolean | undefined>>;
}

const Rectangle: React.FC<RectangleProps> = ({
  x,
  y,
  width,
  height,
  id,
  setIsInteracting,
  rectangles,
  setRectangles,
  setCurrentFirstPoint,
  setSelectedRectId,
  isSelected,
  setIsSaved,
}) => {
  //#region [State]
  // const [isSelected, setSelected] = useState(initialSelectionState);
  //#endregion [State]

  //#region [Ref]
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  //#endregion [Ref]

  //#region [Effect]
  useEffect(() => {
    if (isSelected) {
      trRef?.current?.nodes([shapeRef.current]);
      trRef?.current?.getLayer().batchDraw();
      setSelectedRectId(id);
    }
  }, [id, isSelected, setSelectedRectId]);
  //#endregion [Effect]

  //#region [Drag and Drop]
  const handleDragStart = () => {
    // setSelected(true);
    setIsInteracting(true);
  };

  const handleDragEnd = () => {
    const node = shapeRef.current;

    const newRectangles = rectangles?.map((rect, index) =>
      id === index.toString()
        ? {
            ...rect,
            x1: node.x(),
            y1: node.y(),
            x2: node.x() + node.width(),
            y2: node.y() + node.height(),
          }
        : rect
    );
    setIsInteracting(false);
    setCurrentFirstPoint(null);
    setRectangles(newRectangles);
    setIsSaved(false);
  };
  //#endregion [Drag and Drop]

  //#region [Transform]
  const handleTransformEnd = () => {
    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    const width = Math.max(5, node.width() * scaleX);
    const height = Math.max(node.height() * scaleY);

    const rects = rectangles.slice();

    rects[Number(id)] = {
      ...rects[Number(id)],
      x1: node.x(),
      y1: node.y(),
      x2: node.x() + width,
      y2: node.y() + height,
    };
    setRectangles(rects);
    setIsSaved(false);
  };
  //#endregion [Transform]

  return (
    <>
      <Rect
        x={x}
        y={y}
        isSelected={isSelected}
        width={width}
        height={height}
        fill="rgba(0,0,0,0.3)"
        stroke="white"
        strokeWidth={1}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        ref={shapeRef}
        onClick={(e) => {
          e.cancelBubble = true;
          setSelectedRectId(id);
        }}
        onTap={(e) => {
          e.cancelBubble = true;
          setSelectedRectId(id);
          setIsInteracting(true);
          setCurrentFirstPoint(null);
        }}
        onTransform={() => {
          setIsInteracting(true);
          setCurrentFirstPoint(null);
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
          onTransformEnd={handleTransformEnd}
        />
      )}
    </>
  );
};

export default Rectangle;
