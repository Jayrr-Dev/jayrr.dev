import type { ReactNode } from "react"

import { RendersAccordionDemo } from "./pieces/accordion"
import { RendersActionWheelDemo } from "./pieces/action-wheel"
import { RendersAlertDemo } from "./pieces/alert"
import { RendersAppBarDemo } from "./pieces/app-bar"
import { RendersActivityOverviewDemo } from "./pieces/activity-overview"
import { RendersAppGridDemo } from "./pieces/app-grid"
import { RendersCalendarHeatmapDemo } from "./pieces/calendar-heatmap"
import { RendersCellGridDemo } from "./pieces/cell-grid"
import { RendersHeatmapDemo } from "./pieces/heatmap"
import { RendersHeadlineDemo } from "./pieces/headline"
import { RendersHeroCardDemo } from "./pieces/hero-card"
import { RendersArticleDemo } from "./pieces/article"
import { RendersArtDemo } from "./pieces/art"
import { RendersAutocompleteInputDemo } from "./pieces/autocomplete-input"
import { RendersAvatarDemo } from "./pieces/avatar"
import { RendersBannerDemo } from "./pieces/banner"
import { RendersBadgeDemo } from "./pieces/badge"
import { RendersBadgeSelectDemo } from "./pieces/badge-select"
import { RendersBentoGridDemo } from "./pieces/bento-grid"
import { RendersButtonDemo } from "./pieces/button"
import { RendersButtonArrayDemo } from "./pieces/button-array"
import { RendersCardDemo } from "./pieces/card"
import { RendersCardBarDemo } from "./pieces/card-bar"
import { RendersListDemo } from "./pieces/list"
import { RendersCardGridDemo } from "./pieces/card-grid"
import { RendersCarouselDemo } from "./pieces/carousel"
import { RendersChartDemo } from "./pieces/chart"
import { RendersChatroomDemo } from "./pieces/chatroom"
import { RendersCheckboxDemo } from "./pieces/checkbox"
import { RendersChipDemo } from "./pieces/chip"
import { RendersCommandDemo } from "./pieces/command"
import { RendersColumnFilterDemo } from "./pieces/column-filter"
import { RendersConfirmDialogDemo } from "./pieces/confirm-dialog"
import { RendersContextMenuDemo } from "./pieces/context-menu"
import { RendersControlBarDemo } from "./pieces/control-bar"
import { RendersCursorDemo } from "./pieces/cursor"
import { RendersCursorLabelDemo } from "./pieces/cursor-label"
import { RendersDataGridDemo } from "./pieces/data-grid"
import { RendersDataTableDemo } from "./pieces/data-table"
import { RendersDatePickerDemo } from "./pieces/date-picker"
import { RendersDialogDemo } from "./pieces/dialog"
import { RendersDialslideDemo } from "./pieces/dialslide"
import { RendersDropdownMenuDemo } from "./pieces/dropdown-menu"
import { RendersFieldDemo } from "./pieces/field"
import { RendersFilterSelectDemo } from "./pieces/filter-select"
import { RendersArrayDemo } from "./pieces/array"
import { RendersPlanetaryDemo } from "./pieces/planetary"
import { RendersCardCorridorDemo } from "./pieces/card-corridor"
import { RendersBarDemo } from "./pieces/bar"
import { RendersIncrementDemo } from "./pieces/increment"
import { RendersDigitalClockDemo } from "./pieces/digital-clock"
import { RendersTimelineDemo } from "./pieces/timeline"
import { RendersCommentsDemo } from "./pieces/comments"
import { RendersChatDemo } from "./pieces/chat"
import { RendersCharacterChatDemo } from "./pieces/character-chat"
import { RendersFloatingWindowDemo } from "./pieces/floating-window"
import { RendersAudioDisplayDemo } from "./pieces/audio-display"
import { RendersDrawDisplayDemo } from "./pieces/draw-display"
import { RendersJsonDisplayDemo } from "./pieces/json-display"
import { RendersJsonViewerDemo } from "./pieces/json-viewer"
import { RendersMarkdownDisplayDemo } from "./pieces/markdown-display"
import { RendersPdfDisplayDemo } from "./pieces/pdf-display"
import { RendersSvgDisplayDemo } from "./pieces/svg-display"
import { RendersVideoDisplayDemo } from "./pieces/video-display"
import { RendersFlipDotsDemo } from "./pieces/flip-dots"
import { RendersReelDemo } from "./pieces/reel"
import { RendersAtomGridDemo } from "./pieces/atom-grid"
import { RendersInfiniteCanvasDemo } from "./pieces/infinite-canvas"
import { RendersFloatingActionButtonDemo } from "./pieces/floating-action-button"
import { RendersFormDemo } from "./pieces/form"
import { RendersImageDemo } from "./pieces/image"
import { RendersComparisonSliderDemo } from "./pieces/comparison-slider"
import { RendersImageUploadDemo } from "./pieces/image-upload"
import { RendersIndicatorDemo } from "./pieces/indicator"
import { RendersInfiniteScrollDemo } from "./pieces/infinite-scroll"
import { RendersParallaxDemo } from "./pieces/parallax"
import { RendersRevealDemo } from "./pieces/reveal"
import { RendersScrollMaskDemo } from "./pieces/scroll-mask"
import { RendersScrollTrackDemo } from "./pieces/scroll-track"
import { RendersInfoIconDemo } from "./pieces/info-icon"
import { RendersInputDemo } from "./pieces/input"
import { RendersInputFillDemo } from "./pieces/input-fill"
import { RendersInputOtpDemo } from "./pieces/input-otp"
import { RendersLabelDemo } from "./pieces/label"
import { RendersLexicalEditorDemo } from "./pieces/lexical-editor"
import { RendersBlockEditorDemo } from "./pieces/block-editor"
import { RendersInlineEditorDemo } from "./pieces/inline-editor"
import { RendersMarkdownEditorDemo } from "./pieces/markdown-editor"
import { RendersMentionComposerDemo } from "./pieces/mention-composer"
import { RendersLoadingStateDemo } from "./pieces/loading-state"
import { RendersMathDemo } from "./pieces/math"
import { RendersMoodTextDemo } from "./pieces/mood-text"
import { RendersTextHighlightDemo } from "./pieces/text-highlight"
import { RendersMillerSelectDemo } from "./pieces/miller-select"
import { RendersNavigationBarDemo } from "./pieces/navigation-bar"
import { RendersNavigationDrawerDemo } from "./pieces/navigation-drawer"
import { RendersNavigationRailDemo } from "./pieces/navigation-rail"
import { RendersNotificationBadgeDemo } from "./pieces/notification-badge"
import { RendersInputCalculatorDemo } from "./pieces/input-calculator"
import { RendersNumberInputDemo } from "./pieces/number-input"
import { RendersPageHeaderDemo } from "./pieces/page-header"
import { RendersParagraphDemo } from "./pieces/paragraph"
import { RendersPhoneInputDemo } from "./pieces/phone-input"
import { RendersPillDemo } from "./pieces/pill"
import { RendersPopoverDemo } from "./pieces/popover"
import { RendersPopoverWizardDemo } from "./pieces/popover-wizard"
import { RendersProgressDemo } from "./pieces/progress"
import { RendersRadioGroupDemo } from "./pieces/radio-group"
import { RendersRaterDemo } from "./pieces/rater"
import { RendersThumbsDemo } from "./pieces/thumbs"
import { RendersHeartDemo } from "./pieces/heart"
import { RendersResponsiveTooltipDemo } from "./pieces/responsive-tooltip"
import { RendersRefreshButtonDemo } from "./pieces/refresh-button"
import { RendersPrintButtonDemo } from "./pieces/print-button"
import { RendersExcelButtonDemo } from "./pieces/excel-button"
import { RendersCsvButtonDemo } from "./pieces/csv-button"
import { RendersDownloadButtonDemo } from "./pieces/download-button"
import { RendersUploadButtonDemo } from "./pieces/upload-button"
import { RendersWebcamButtonDemo } from "./pieces/webcam-button"
import { RendersMicButtonDemo } from "./pieces/mic-button"
import { RendersVolumeButtonDemo } from "./pieces/volume-button"
import { RendersEmailButtonDemo } from "./pieces/email-button"
import { RendersCopyButtonDemo } from "./pieces/copy-button"
import { RendersScrollAreaDemo } from "./pieces/scroll-area"
import { RendersScrollHorizontalButtonDemo } from "./pieces/scroll-horizontal-button"
import { RendersSearchDemo } from "./pieces/search"
import { RendersSelectDemo } from "./pieces/select"
import { RendersSeparatorDemo } from "./pieces/separator"
import { RendersSheetDemo } from "./pieces/sheet"
import { RendersSkeletonDemo } from "./pieces/skeleton"
import { RendersSpreadsheetDemo } from "./pieces/spreadsheet"
import { RendersSpinnerDemo } from "./pieces/spinner"
import { RendersStandardGridDemo } from "./pieces/standard-grid"
import { RendersTableListDemo } from "./pieces/table-list"
import { RendersStandardTableDemo } from "./pieces/standard-table"
import { RendersToolbarCountDemo } from "./pieces/toolbar-count"
import { RendersSwitchDemo } from "./pieces/switch"
import { RendersSymbolDemo } from "./pieces/symbol"
import { RendersTabbedDialogDemo } from "./pieces/tabbed-dialog"
import { RendersTableDemo } from "./pieces/table"
import { RendersTabsDemo } from "./pieces/tabs"
import { RendersDynamicTabsDemo } from "./pieces/dynamic-tabs"
import { RendersTextFieldDemo } from "./pieces/text-field"
import { RendersTextareaDemo } from "./pieces/textarea"
import { RendersTimePickerDemo } from "./pieces/time-picker"
import { RendersToastDemo } from "./pieces/toast"
import { RendersToggleDemo } from "./pieces/toggle"
import { RendersModeToggleDemo } from "./pieces/mode-toggle"
import { RendersThemeDemo } from "./pieces/theme"
import { RendersToolbarDemo } from "./pieces/toolbar"
import { RendersTooltipDemo } from "./pieces/tooltip"
import { RendersArrangeableGridDemo } from "./pieces/arrangeable-grid"
import { RendersDraggableDemo } from "./pieces/draggable"
import { RendersKanbanDemo } from "./pieces/kanban"
import { RendersGanttDemo } from "./pieces/gantt"
import { RendersStepperDemo } from "./pieces/stepper"
import { RendersStepsDemo } from "./pieces/steps"
import { RendersWizardDemo } from "./pieces/wizard"
import { RendersGradientDemo } from "./pieces/gradient"
import { RendersNoiseDemo } from "./pieces/noise"
import { RendersPatternDemo } from "./pieces/pattern"
import { RendersScreentoneDemo } from "./pieces/screentone"
import { RendersShaderDemo } from "./pieces/shader"
import { RendersShareButtonDemo } from "./pieces/share-button"
import { RendersSocialMediaButtonsDemo } from "./pieces/social-media-buttons"
import { RendersImageShaderDemo } from "./pieces/image-shader"
import { RendersColorGradeDemo } from "./pieces/color-grade"
import { RendersColorPickerDemo } from "./pieces/color-picker"
import { RendersDistortDemo } from "./pieces/distort"
import { RendersMaskDemo } from "./pieces/mask"
import { RendersSurfaceDemo } from "./pieces/surface"

/**
 * A Standard piece demo. Called as a plain function by the gallery, so it
 * must hold no hooks: stateful parts live in child components it renders.
 */
export type StandardPieceDemo = (props: { pieceName: string }) => ReactNode

/**
 * One demo per catalog piece whose `demos` include "standard", keyed by the
 * piece name in galleryComponents.json.
 */
export const STANDARD_PIECE_DEMOS: Record<string, StandardPieceDemo> = {
  Accordion: RendersAccordionDemo,
  "Action Wheel": RendersActionWheelDemo,
  Alert: RendersAlertDemo,
  "App Bar": RendersAppBarDemo,
  "Activity Overview": RendersActivityOverviewDemo,
  "App Grid": RendersAppGridDemo,
  "Calendar Heatmap": RendersCalendarHeatmapDemo,
  "Cell Grid": RendersCellGridDemo,
  Heatmap: RendersHeatmapDemo,
  Headline: RendersHeadlineDemo,
  "Hero Card": RendersHeroCardDemo,
  "Flip-Dots": RendersFlipDotsDemo,
  Reel: RendersReelDemo,
  "Atom Grid": RendersAtomGridDemo,
  "Infinite Canvas": RendersInfiniteCanvasDemo,
  Array: RendersArrayDemo,
  Planetary: RendersPlanetaryDemo,
  "Card Corridor": RendersCardCorridorDemo,
  Bar: RendersBarDemo,
  Increment: RendersIncrementDemo,
  "Digital Clock": RendersDigitalClockDemo,
  Timeline: RendersTimelineDemo,
  Comments: RendersCommentsDemo,
  "Chat Card": RendersChatDemo,
  "Character Chat": RendersCharacterChatDemo,
  "Floating Window": RendersFloatingWindowDemo,
  "PDF Display": RendersPdfDisplayDemo,
  "Markdown Display": RendersMarkdownDisplayDemo,
  "SVG Display": RendersSvgDisplayDemo,
  "Video Display": RendersVideoDisplayDemo,
  "Audio Display": RendersAudioDisplayDemo,
  "JSON Display": RendersJsonDisplayDemo,
  "JSON Viewer": RendersJsonViewerDemo,
  "Draw Display": RendersDrawDisplayDemo,
  Article: RendersArticleDemo,
  Art: RendersArtDemo,
  "Autocomplete Input": RendersAutocompleteInputDemo,
  Avatar: RendersAvatarDemo,
  Badge: RendersBadgeDemo,
  Banner: RendersBannerDemo,
  "Badge Select": RendersBadgeSelectDemo,
  "Bento Grid": RendersBentoGridDemo,
  "Card Grid": RendersCardGridDemo,
  Button: RendersButtonDemo,
  "Button Array": RendersButtonArrayDemo,
  Card: RendersCardDemo,
  "Card Bar": RendersCardBarDemo,
  List: RendersListDemo,
  Carousel: RendersCarouselDemo,
  Chart: RendersChartDemo,
  Chatroom: RendersChatroomDemo,
  Checkbox: RendersCheckboxDemo,
  Chip: RendersChipDemo,
  Command: RendersCommandDemo,
  "Column Filter": RendersColumnFilterDemo,
  "Confirm Dialog": RendersConfirmDialogDemo,
  "Context Menu": RendersContextMenuDemo,
  "Control Bar": RendersControlBarDemo,
  Cursor: RendersCursorDemo,
  "Cursor Label": RendersCursorLabelDemo,
  "Data Grid": RendersDataGridDemo,
  "Data Table": RendersDataTableDemo,
  "Date Picker": RendersDatePickerDemo,
  Dialog: RendersDialogDemo,
  Dialslide: RendersDialslideDemo,
  "Dropdown Menu": RendersDropdownMenuDemo,
  Field: RendersFieldDemo,
  "Filter Select": RendersFilterSelectDemo,
  "Floating Action Button": RendersFloatingActionButtonDemo,
  Form: RendersFormDemo,
  Image: RendersImageDemo,
  "Comparison Slider": RendersComparisonSliderDemo,
  "Image Upload": RendersImageUploadDemo,
  Indicator: RendersIndicatorDemo,
  "Infinite Scroll": RendersInfiniteScrollDemo,
  Parallax: RendersParallaxDemo,
  Reveal: RendersRevealDemo,
  "Scroll Mask": RendersScrollMaskDemo,
  "Scroll Track": RendersScrollTrackDemo,
  "Info Icon": RendersInfoIconDemo,
  Draggable: RendersDraggableDemo,
  "Arrangeable Grid": RendersArrangeableGridDemo,
  Input: RendersInputDemo,
  "Input Fill": RendersInputFillDemo,
  "Input OTP": RendersInputOtpDemo,
  Kanban: RendersKanbanDemo,
  Gantt: RendersGanttDemo,
  Label: RendersLabelDemo,
  "Lexical Editor": RendersLexicalEditorDemo,
  "Block Editor": RendersBlockEditorDemo,
  "Inline Editor": RendersInlineEditorDemo,
  "Markdown Editor": RendersMarkdownEditorDemo,
  "Mention Composer": RendersMentionComposerDemo,
  "Loading State": RendersLoadingStateDemo,
  Math: RendersMathDemo,
  "Mood Text": RendersMoodTextDemo,
  "Text Highlight": RendersTextHighlightDemo,
  "Miller Select": RendersMillerSelectDemo,
  "Navigation Bar": RendersNavigationBarDemo,
  "Navigation Drawer": RendersNavigationDrawerDemo,
  "Navigation Rail": RendersNavigationRailDemo,
  "Notification Badge": RendersNotificationBadgeDemo,
  "Input Calculator": RendersInputCalculatorDemo,
  "Number Input": RendersNumberInputDemo,
  "Page Header": RendersPageHeaderDemo,
  Paragraph: RendersParagraphDemo,
  "Phone Input": RendersPhoneInputDemo,
  Pill: RendersPillDemo,
  Popover: RendersPopoverDemo,
  "Popover Wizard": RendersPopoverWizardDemo,
  Progress: RendersProgressDemo,
  "Radio Group": RendersRadioGroupDemo,
  Rater: RendersRaterDemo,
  Thumbs: RendersThumbsDemo,
  Heart: RendersHeartDemo,
  "Refresh Button": RendersRefreshButtonDemo,
  "Scroll Area": RendersScrollAreaDemo,
  "Scroll Horizontal Button": RendersScrollHorizontalButtonDemo,
  Search: RendersSearchDemo,
  Select: RendersSelectDemo,
  Separator: RendersSeparatorDemo,
  Sheet: RendersSheetDemo,
  Skeleton: RendersSkeletonDemo,
  Spinner: RendersSpinnerDemo,
  Spreadsheet: RendersSpreadsheetDemo,
  "Table Grid": RendersStandardGridDemo,
  "Table List": RendersTableListDemo,
  "Standard Table": RendersStandardTableDemo,
  "Toolbar Count": RendersToolbarCountDemo,
  Switch: RendersSwitchDemo,
  Symbol: RendersSymbolDemo,
  "Tabbed Dialog": RendersTabbedDialogDemo,
  Table: RendersTableDemo,
  Tabs: RendersTabsDemo,
  "Dynamic Tabs": RendersDynamicTabsDemo,
  "Text field": RendersTextFieldDemo,
  Textarea: RendersTextareaDemo,
  "Time Picker": RendersTimePickerDemo,
  Toast: RendersToastDemo,
  Toggle: RendersToggleDemo,
  "Mode Toggle": RendersModeToggleDemo,
  Theme: RendersThemeDemo,
  Toolbar: RendersToolbarDemo,
  Tooltip: RendersTooltipDemo,
  "Responsive Tooltip": RendersResponsiveTooltipDemo,
  Stepper: RendersStepperDemo,
  Steps: RendersStepsDemo,
  Wizard: RendersWizardDemo,
  Gradient: RendersGradientDemo,
  Noise: RendersNoiseDemo,
  Pattern: RendersPatternDemo,
  Screentone: RendersScreentoneDemo,
  Shader: RendersShaderDemo,
  "Share Button": RendersShareButtonDemo,
  "Print Button": RendersPrintButtonDemo,
  "Excel Button": RendersExcelButtonDemo,
  "CSV Button": RendersCsvButtonDemo,
  "Download Button": RendersDownloadButtonDemo,
  "Upload Button": RendersUploadButtonDemo,
  "Webcam Button": RendersWebcamButtonDemo,
  "Mic Button": RendersMicButtonDemo,
  "Volume Button": RendersVolumeButtonDemo,
  "Email Button": RendersEmailButtonDemo,
  "Copy Button": RendersCopyButtonDemo,
  "Social Media Buttons": RendersSocialMediaButtonsDemo,
  "Image Shader": RendersImageShaderDemo,
  "Color Grade": RendersColorGradeDemo,
  "Color Picker": RendersColorPickerDemo,
  Distort: RendersDistortDemo,
  Mask: RendersMaskDemo,
  Surface: RendersSurfaceDemo,
}
