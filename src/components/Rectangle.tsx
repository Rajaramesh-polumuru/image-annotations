/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
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
  isSelected: initialSelectionState,
}) => {
  //#region [State]
  const [isSelected, setSelected] = useState(initialSelectionState);
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
    setSelected(true);
    setIsInteracting(true);
  };

  const handleDragEnd = () => {
    const node = shapeRef.current;
    const newRectangles = rectangles?.map((rect, index) =>
      id === index.toString()
        ? {
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
  };
//#endregion [Drag and Drop]


//#region [Transform]
  const handleTransformEnd = () => {
    const node = shapeRef.current;

    const newRectangles = rectangles.map((rect, index) =>
      id === index.toString()
        ? {
            x1: node.x(),
            y1: node.y(),
            x2: node.x() + node.width(),
            y2: node.y() + node.height(),
          }
        : rect
    );
    setRectangles(newRectangles);
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
          setSelected(true);
        }}
        onTap={(e) => {
          e.cancelBubble = true;
          setSelected(true);
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
