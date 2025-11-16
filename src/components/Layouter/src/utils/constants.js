// DPI and conversion
export const DPI = 300
export const MM_TO_PX = (mm) => Math.round((mm * DPI) / 25.4)

// Canvas dimensions (200mm × 300mm)
export const CANVAS_WIDTH_PX = MM_TO_PX(200)   // 2362px
export const CANVAS_HEIGHT_PX = MM_TO_PX(300)  // 3543px

// ID Card dimensions (56mm × 86mm)
export const ID_CARD_WIDTH_PX = MM_TO_PX(56)   // 661px
export const ID_CARD_HEIGHT_PX = MM_TO_PX(86)   // 1016px

// Box coordinates for ID card placement (top-left corners)
export const BOX_COORDS = [
  [90, 29],      // Box 1
  [1216, 29],    // Box 2
  [90, 690],     // Box 3
  [1216, 690],   // Box 4
  [90, 1350],    // Box 5
  [1216, 1350],  // Box 6
  [90, 2013],    // Box 7
  [1216, 2013],  // Box 8
  [90, 2675],    // Box 9
  [1216, 2675]   // Box 10
]

// Border dimensions
export const BORDER_GREY_WIDTH = 1016
export const BORDER_GREY_HEIGHT = 661
export const BORDER_BLACK_WIDTH = 1126
export const BORDER_BLACK_HEIGHT = 661

// Page number position (centered between columns to avoid overlap)
export const PAGE_NUMBER_X = 1160  // Center between left column (ends ~1106) and right column (starts 1216)
export const PAGE_NUMBER_Y = 50

// Border colors
export const BORDER_GREY_COLOR = [201 / 255, 202 / 255, 202 / 255]
export const BORDER_BLACK_COLOR = [0, 0, 0]

// A4 dimensions at 300 DPI
export const A4_WIDTH_PX = MM_TO_PX(210)   // 2480px
export const A4_HEIGHT_PX = MM_TO_PX(297)   // 3508px

// Ganci/Pin dimensions
export const GANCI_3CM_DIAMETER_PX = MM_TO_PX(30)   // 354px
export const GANCI_5CM_DIAMETER_PX = MM_TO_PX(50)   // 591px
export const GANCI_OFFSET_PX = MM_TO_PX(0.5)        // 6px (thin line offset)

// Mug dimensions (20x10 cm horizontal)
export const MUG_WIDTH_PX = MM_TO_PX(200)   // 2362px (20cm)
export const MUG_HEIGHT_PX = MM_TO_PX(100)   // 1181px (10cm)

// A4 Landscape dimensions (297mm x 210mm)
export const A4_LANDSCAPE_WIDTH_PX = MM_TO_PX(297)   // 3508px (width)
export const A4_LANDSCAPE_HEIGHT_PX = MM_TO_PX(210)   // 2480px (height)

// Lanyard dimensions
export const LANYARD_PAGE_WIDTH_PX = MM_TO_PX(10200)  // 120472px (1020cm)
export const LANYARD_PAGE_HEIGHT_PX = MM_TO_PX(210)   // 2480px (21cm)
export const LANYARD_COL1_WIDTH_PX = MM_TO_PX(100)   // 1181px (10cm)
export const LANYARD_COL2_WIDTH_PX = MM_TO_PX(900)    // 10630px (90cm)
export const LANYARD_ROW_HEIGHT_PX = MM_TO_PX(22.5)  // 266px (2.25cm)
export const LANYARD_COLS = 2
export const LANYARD_ROWS = 8

