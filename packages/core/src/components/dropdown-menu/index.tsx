import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import * as React from 'react'

import { cn } from '../../utils'

const DropdownMenu = DropdownMenuPrimitive.Root
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger
const DropdownMenuGroup = DropdownMenuPrimitive.Group
const DropdownMenuPortal = DropdownMenuPrimitive.Portal
const DropdownMenuSub = DropdownMenuPrimitive.Sub
const DropdownMenuSubTrigger = DropdownMenuPrimitive.SubTrigger
const DropdownMenuSubContent = DropdownMenuPrimitive.SubContent
const DropdownMenuCheckboxItem = DropdownMenuPrimitive.CheckboxItem
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup
const DropdownMenuRadioItem = DropdownMenuPrimitive.RadioItem

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn('mdk-dropdown-menu__content', className)}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn('mdk-dropdown-menu__item', className)}
    {...props}
  />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn('mdk-dropdown-menu__label', className)}
    {...props}
  />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn('mdk-dropdown-menu__separator', className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuArrow = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Arrow>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Arrow>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Arrow
    ref={ref}
    className={cn('mdk-dropdown-menu__arrow', className)}
    {...props}
  />
))
DropdownMenuArrow.displayName = DropdownMenuPrimitive.Arrow.displayName

type DropdownMenuItemDefinition = {
  key: string
  label?: React.ReactNode
  icon?: React.ReactNode
  disabled?: boolean
  danger?: boolean
  type?: 'group' | 'divider'
  children?: DropdownMenuItemDefinition[]
  onClick?: (info: { key: string }) => void
}

type DropdownMenuProps = {
  menu?: {
    items?: DropdownMenuItemDefinition[]
    onClick?: (info: { key: string }) => void
  }
  popupRender?: () => React.ReactNode
  trigger?: Array<'click' | 'hover' | 'contextMenu'>
  placement?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  overlayClassName?: string
  className?: string
  arrow?: boolean
  children: React.ReactNode
}

function mapPlacement(placement?: string): {
  side: 'top' | 'bottom' | 'left' | 'right'
  align: 'start' | 'center' | 'end'
} {
  switch (placement) {
    case 'bottomLeft':
      return { side: 'bottom', align: 'start' }
    case 'bottomRight':
      return { side: 'bottom', align: 'end' }
    case 'topLeft':
      return { side: 'top', align: 'start' }
    case 'topRight':
      return { side: 'top', align: 'end' }
    case 'leftTop':
      return { side: 'left', align: 'start' }
    case 'leftBottom':
      return { side: 'left', align: 'end' }
    case 'rightTop':
      return { side: 'right', align: 'start' }
    case 'rightBottom':
      return { side: 'right', align: 'end' }
    default:
      return { side: 'bottom', align: 'start' }
  }
}

function renderMenuItems(
  items: DropdownMenuItemDefinition[] = [],
  menuOnClick?: (info: { key: string }) => void,
): React.ReactNode {
  return items.map((item) => {
    if (item.type === 'divider') {
      return <DropdownMenuSeparator key={item.key} />
    }

    if (item.type === 'group' || item.children?.length) {
      return (
        <DropdownMenuGroup key={item.key}>
          {item.label && <DropdownMenuLabel>{item.label}</DropdownMenuLabel>}
          {renderMenuItems(item.children ?? [], menuOnClick)}
        </DropdownMenuGroup>
      )
    }

    return (
      <DropdownMenuItem
        key={item.key}
        disabled={item.disabled}
        onSelect={() => {
          item.onClick?.({ key: item.key })
          menuOnClick?.({ key: item.key })
        }}
        className={cn(item.danger ? 'mdk-dropdown-menu__item--danger' : null)}
      >
        {item.icon && <span className="mdk-dropdown-menu__item-icon">{item.icon}</span>}
        <span className="mdk-dropdown-menu__item-label">{item.label}</span>
      </DropdownMenuItem>
    )
  })
}

function Dropdown({
  menu,
  popupRender,
  trigger,
  placement,
  open,
  onOpenChange,
  disabled,
  overlayClassName,
  className,
  arrow,
  children,
}: DropdownMenuProps): JSX.Element {
  const { side, align } = mapPlacement(placement)
  const hasMenuItems = Boolean(menu?.items && menu.items.length)
  const content = popupRender
    ? popupRender()
    : hasMenuItems
      ? renderMenuItems(menu?.items, menu?.onClick)
      : null

  return (
    <DropdownMenuPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DropdownMenuPrimitive.Trigger
        asChild
        disabled={disabled}
        className={className}
        data-trigger={trigger?.join(',')}
      >
        {children}
      </DropdownMenuPrimitive.Trigger>
      {content && (
        <DropdownMenuContent side={side} align={align} className={overlayClassName}>
          {content}
          {arrow && <DropdownMenuArrow />}
        </DropdownMenuContent>
      )}
    </DropdownMenuPrimitive.Root>
  )
}

export {
  Dropdown,
  DropdownMenu,
  DropdownMenuArrow,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
}
export * from '@radix-ui/react-dropdown-menu'
