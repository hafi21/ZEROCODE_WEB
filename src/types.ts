export type ElementType = 'text' | 'button' | 'image' | 'section' | 'navbar' | 'footer' | 'card' | 'form' | 'hero' | 'shape' | 'table';

export interface Frame {
  id: string;
  name: string;
  position: {
    top: number;
    left: number;
  };
  size: {
    width: number;
    height: number;
  };
  background: string;
}

export interface Connection {
  id: string;
  from: string; // ID of element or frame
  to: string;   // ID of element or frame
}

export interface CanvasTransform {
  x: number;
  y: number;
  scale: number;
}

export interface TableCell {
  id: string;
  content: string;
  styles?: {
    backgroundColor?: string;
    color?: string;
    fontWeight?: string;
    textAlign?: 'left' | 'center' | 'right';
  };
}

export interface TableRow {
  id: string;
  cells: TableCell[];
}

export interface WebsiteElement {
  id: string;
  frameId: string;
  type: ElementType;
  content: string;
  title?: string;
  description?: string;
  buttonText?: string;
  links?: { label: string; url: string }[];
  imageUrl?: string;
  shapeType?: 'rectangle' | 'circle' | 'square' | 'rounded-rectangle' | 'triangle' | 'star';
  tableData?: {
    rows: TableRow[];
    headerRow?: boolean;
    borderWidth?: string;
    borderColor?: string;
  };
  styles: {
    top: number;
    left: number;
    width: number;
    height: number;
    color?: string;
    backgroundColor?: string;
    backgroundGradient?: string;
    fontSize?: string;
    fontFamily?: string;
    fontWeight?: string;
    lineHeight?: string;
    letterSpacing?: string;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    textDecoration?: 'none' | 'underline' | 'line-through';
    padding?: string;
    margin?: string;
    border?: string;
    borderWidth?: string;
    borderStyle?: string;
    borderColor?: string;
    borderTop?: string;
    borderBottom?: string;
    borderRadius?: string;
    boxShadow?: string;
    zIndex?: number;
    opacity?: number;
    rotate?: string;
    scale?: string;
    visibility?: 'visible' | 'hidden';
    display?: 'block' | 'flex' | 'none';
    flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
    alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
    gap?: string;
    maxWidth?: string;
    overflow?: string;
    objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
    cursor?: string;
    transition?: string;
  };
  linkTo?: string;
}

export interface WebsiteLayout {
  frames: Frame[];
  elements: WebsiteElement[];
  connections: Connection[];
  canvasTransform: CanvasTransform;
}

export interface Project {
  id: string;
  name: string;
  data: WebsiteLayout;
  timestamp: number;
}

export interface Palette {
  id: string;
  name: string;
  colors: string[];
}
