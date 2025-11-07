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

