import type { ReactNode } from "react"

import { RendersAccordionDemo } from "./pieces/accordion"
import { RendersActionWheelDemo } from "./pieces/action-wheel"
import { RendersAlertDemo } from "./pieces/alert"
import { RendersAppBarDemo } from "./pieces/app-bar"
import { RendersAppGridDemo } from "./pieces/app-grid"
import { RendersArticleDemo } from "./pieces/article"
import { RendersAutocompleteInputDemo } from "./pieces/autocomplete-input"
import { RendersBadgeDemo } from "./pieces/badge"
import { RendersBadgeSelectDemo } from "./pieces/badge-select"
import { RendersBarStackDemo } from "./pieces/bar-stack"
import { RendersBentoGridDemo } from "./pieces/bento-grid"
import { RendersBroadcastBannerDemo } from "./pieces/broadcast-banner"
import { RendersBroadcastBannerContainerDemo } from "./pieces/broadcast-banner-container"
import { RendersButtonDemo } from "./pieces/button"
import { RendersButtonArrayDemo } from "./pieces/button-array"
import { RendersButtonBackDemo } from "./pieces/button-back"
import { RendersButtonIconDemo } from "./pieces/button-icon"
import { RendersButtonLinkDemo } from "./pieces/button-link"
import { RendersCaptionButtonDemo } from "./pieces/caption-button"
import { RendersCardDemo } from "./pieces/card"
import { RendersCardBarDemo } from "./pieces/card-bar"
import { RendersCarouselDemo } from "./pieces/carousel"
import { RendersChartDemo } from "./pieces/chart"
import { RendersCheckboxDemo } from "./pieces/checkbox"
import { RendersChipDemo } from "./pieces/chip"
import { RendersCommandDemo } from "./pieces/command"
import { RendersConfirmDialogDemo } from "./pieces/confirm-dialog"
import { RendersContextMenuDemo } from "./pieces/context-menu"
import { RendersControlBarDemo } from "./pieces/control-bar"
import { RendersCursorDemo } from "./pieces/cursor"
import { RendersDataGridDemo } from "./pieces/data-grid"
import { RendersDatePickerDemo } from "./pieces/date-picker"
import { RendersDialogDemo } from "./pieces/dialog"
import { RendersDialslideDemo } from "./pieces/dialslide"
import { RendersDropdownMenuDemo } from "./pieces/dropdown-menu"
import { RendersFieldDemo } from "./pieces/field"
import { RendersFilterSelectDemo } from "./pieces/filter-select"
import { RendersFloatingActionButtonDemo } from "./pieces/floating-action-button"
import { RendersFormDemo } from "./pieces/form"
import { RendersImageUploadDemo } from "./pieces/image-upload"
import { RendersIndicatorDemo } from "./pieces/indicator"
import { RendersInfoIconDemo } from "./pieces/info-icon"
import { RendersInputOtpDemo } from "./pieces/input-otp"
import { RendersLabelDemo } from "./pieces/label"
import { RendersLabelledSwitchDemo } from "./pieces/labelled-switch"
import { RendersLexicalEditorDemo } from "./pieces/lexical-editor"
import { RendersLoadingStateDemo } from "./pieces/loading-state"
import { RendersMathDemo } from "./pieces/math"
import { RendersMillerSelectDemo } from "./pieces/miller-select"
import { RendersMultiSelectDemo } from "./pieces/multi-select"
import { RendersNavigationBarDemo } from "./pieces/navigation-bar"
import { RendersNavigationDrawerDemo } from "./pieces/navigation-drawer"
import { RendersNavigationRailDemo } from "./pieces/navigation-rail"
import { RendersNotificationBadgeDemo } from "./pieces/notification-badge"
import { RendersNumberInputDemo } from "./pieces/number-input"
import { RendersPageHeaderDemo } from "./pieces/page-header"
import { RendersPillDemo } from "./pieces/pill"
import { RendersPopoverDemo } from "./pieces/popover"
import { RendersPopoverWizardDemo } from "./pieces/popover-wizard"
import { RendersProgressDemo } from "./pieces/progress"
import { RendersRadioGroupDemo } from "./pieces/radio-group"
import { RendersRefreshButtonDemo } from "./pieces/refresh-button"
import { RendersScrollAreaDemo } from "./pieces/scroll-area"
import { RendersScrollHorizontalButtonDemo } from "./pieces/scroll-horizontal-button"
import { RendersSearchDemo } from "./pieces/search"
import { RendersSelectDemo } from "./pieces/select"
import { RendersSeparatorDemo } from "./pieces/separator"
import { RendersSheetDemo } from "./pieces/sheet"
import { RendersSkeletonDemo } from "./pieces/skeleton"
import { RendersSpinnerDemo } from "./pieces/spinner"
import { RendersStandardCardDemo } from "./pieces/standard-card"
import { RendersStandardGridDemo } from "./pieces/standard-grid"
import { RendersStandardTableDemo } from "./pieces/standard-table"
import { RendersStandardTextDemo } from "./pieces/standard-text"
import { RendersStandardToolbarCountDemo } from "./pieces/standard-toolbar-count"
import { RendersSwitchDemo } from "./pieces/switch"
import { RendersSymbolDemo } from "./pieces/symbol"
import { RendersTabbedDialogDemo } from "./pieces/tabbed-dialog"
import { RendersTableDemo } from "./pieces/table"
import { RendersTabsDemo } from "./pieces/tabs"
import { RendersTextFieldDemo } from "./pieces/text-field"
import { RendersTextareaDemo } from "./pieces/textarea"
import { RendersThinScrollbarDemo } from "./pieces/thin-scrollbar"
import { RendersTimePickerDemo } from "./pieces/time-picker"
import { RendersToastDemo } from "./pieces/toast"
import { RendersToggleRowDemo } from "./pieces/toggle-row"
import { RendersToggleableBadgesDemo } from "./pieces/toggleable-badges"
import { RendersToolbarDemo } from "./pieces/toolbar"
import { RendersTooltipDemo } from "./pieces/tooltip"
import { RendersWizardDemo } from "./pieces/wizard"

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
  "Accordion": RendersAccordionDemo,
  "Action Wheel": RendersActionWheelDemo,
  "Alert": RendersAlertDemo,
  "App Bar": RendersAppBarDemo,
  "App Grid": RendersAppGridDemo,
  "Article": RendersArticleDemo,
  "Autocomplete Input": RendersAutocompleteInputDemo,
  "Badge": RendersBadgeDemo,
  "Badge Select": RendersBadgeSelectDemo,
  "Bar Stack": RendersBarStackDemo,
  "Bento Grid": RendersBentoGridDemo,
  "Broadcast Banner": RendersBroadcastBannerDemo,
  "Broadcast Banner Container": RendersBroadcastBannerContainerDemo,
  "Button": RendersButtonDemo,
  "Button Array": RendersButtonArrayDemo,
  "Button Back": RendersButtonBackDemo,
  "Button Icon": RendersButtonIconDemo,
  "Button Link": RendersButtonLinkDemo,
  "Caption Button": RendersCaptionButtonDemo,
  "Card": RendersCardDemo,
  "Card Bar": RendersCardBarDemo,
  "Carousel": RendersCarouselDemo,
  "Chart": RendersChartDemo,
  "Checkbox": RendersCheckboxDemo,
  "Chip": RendersChipDemo,
  "Command": RendersCommandDemo,
  "Confirm Dialog": RendersConfirmDialogDemo,
  "Context Menu": RendersContextMenuDemo,
  "Control Bar": RendersControlBarDemo,
  "Cursor": RendersCursorDemo,
  "Data Grid": RendersDataGridDemo,
  "Date Picker": RendersDatePickerDemo,
  "Dialog": RendersDialogDemo,
  "Dialslide": RendersDialslideDemo,
  "Dropdown Menu": RendersDropdownMenuDemo,
  "Field": RendersFieldDemo,
  "Filter Select": RendersFilterSelectDemo,
  "Floating Action Button": RendersFloatingActionButtonDemo,
  "Form": RendersFormDemo,
  "Image Upload": RendersImageUploadDemo,
  "Indicator": RendersIndicatorDemo,
  "Info Icon": RendersInfoIconDemo,
  "Input OTP": RendersInputOtpDemo,
  "Label": RendersLabelDemo,
  "Labelled Switch": RendersLabelledSwitchDemo,
  "Lexical Editor": RendersLexicalEditorDemo,
  "Loading State": RendersLoadingStateDemo,
  "Math": RendersMathDemo,
  "Miller Select": RendersMillerSelectDemo,
  "Multi Select": RendersMultiSelectDemo,
  "Navigation Bar": RendersNavigationBarDemo,
  "Navigation Drawer": RendersNavigationDrawerDemo,
  "Navigation Rail": RendersNavigationRailDemo,
  "Notification Badge": RendersNotificationBadgeDemo,
  "Number Input": RendersNumberInputDemo,
  "Page Header": RendersPageHeaderDemo,
  "Pill": RendersPillDemo,
  "Popover": RendersPopoverDemo,
  "Popover Wizard": RendersPopoverWizardDemo,
  "Progress": RendersProgressDemo,
  "Radio Group": RendersRadioGroupDemo,
  "Refresh Button": RendersRefreshButtonDemo,
  "Scroll Area": RendersScrollAreaDemo,
  "Scroll Horizontal Button": RendersScrollHorizontalButtonDemo,
  "Search": RendersSearchDemo,
  "Select": RendersSelectDemo,
  "Separator": RendersSeparatorDemo,
  "Sheet": RendersSheetDemo,
  "Skeleton": RendersSkeletonDemo,
  "Spinner": RendersSpinnerDemo,
  "Standard Card": RendersStandardCardDemo,
  "Standard Grid": RendersStandardGridDemo,
  "Standard Table": RendersStandardTableDemo,
  "Standard Text": RendersStandardTextDemo,
  "Standard Toolbar Count": RendersStandardToolbarCountDemo,
  "Switch": RendersSwitchDemo,
  "Symbol": RendersSymbolDemo,
  "Tabbed Dialog": RendersTabbedDialogDemo,
  "Table": RendersTableDemo,
  "Tabs": RendersTabsDemo,
  "Text field": RendersTextFieldDemo,
  "Textarea": RendersTextareaDemo,
  "Thin Scrollbar": RendersThinScrollbarDemo,
  "Time Picker": RendersTimePickerDemo,
  "Toast": RendersToastDemo,
  "Toggle Row": RendersToggleRowDemo,
  "Toggleable Badges": RendersToggleableBadgesDemo,
  "Toolbar": RendersToolbarDemo,
  "Tooltip": RendersTooltipDemo,
  "Wizard": RendersWizardDemo,
}
