import * as PopoverPrimitive from '@radix-ui/react-popover'
import * as SelectPrimitive from '@radix-ui/react-select'
import * as React from 'react'

import { cn } from '../../utils'

export type SelectStatus = '' | 'error' | 'warning' | 'success'
export type SelectSize = 'sm' | 'md' | 'lg'
export type SelectAntdSize = 'small' | 'middle' | 'large'
export type SelectMode = 'multiple' | 'tags'

export type SelectOptionValue = string
export type SelectOption = {
  value: SelectOptionValue
  label?: React.ReactNode
  disabled?: boolean
}

export type SelectProps = {
  options?: SelectOption[]
  placeholder?: string
  value?: SelectOptionValue | SelectOptionValue[] | null
  defaultValue?: SelectOptionValue | SelectOptionValue[]
  onChange?: (value: SelectOptionValue | SelectOptionValue[] | undefined) => void
  onSelect?: (value: SelectOptionValue) => void
  onClear?: () => void
  allowClear?: boolean
  mode?: SelectMode
  tokenSeparators?: string[]
  status?: SelectStatus
  size?: SelectSize | SelectAntdSize
  loading?: boolean
  disabled?: boolean
  className?: string
  dropdownClassName?: string
  suffixIcon?: React.ReactNode
  children?: React.ReactNode
}

export type SelectOptionProps = {
  value: SelectOptionValue
  disabled?: boolean
  children?: React.ReactNode
}

const SelectOption = (_props: SelectOptionProps): React.ReactElement | null => null
SelectOption.displayName = 'SelectOption'

const sizeMap: Record<SelectSize | SelectAntdSize, SelectSize> = {
  sm: 'sm',
  small: 'sm',
  md: 'md',
  middle: 'md',
  lg: 'lg',
  large: 'lg',
}

function sizeToSize(size?: SelectSize | SelectAntdSize): SelectSize {
  return size ? sizeMap[size] : 'md'
}

function getOptionsFromChildren(children: React.ReactNode): SelectOption[] {
  const options: SelectOption[] = []
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) {
      return
    }
    const childType = child.type as { displayName?: string }
    if (childType === SelectOption || childType?.displayName === SelectOption.displayName) {
      const { value, disabled, children: label } = child.props as SelectOptionProps
      options.push({ value, label, disabled })
    }
  })
  return options
}

function normalizeOptions(options?: SelectOption[], children?: React.ReactNode): SelectOption[] {
  if (options?.length) {
    return options
  }
  if (!children) {
    return []
  }
  return getOptionsFromChildren(children)
}

function getOptionLabel(option: SelectOption): React.ReactNode {
  return option.label ?? option.value
}

function getOptionText(option: SelectOption): string {
  if (typeof option.label === 'string') {
    return option.label
  }
  return String(option.value)
}

function escapeRegex(value: string): string {
  return value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
}

function useControllableValue<T>(value: T | undefined, defaultValue: T): [T, (next: T) => void] {
  const [internalValue, setInternalValue] = React.useState<T>(defaultValue)
  const isControlled = value !== undefined
  const currentValue = isControlled ? value : internalValue
  const setValue = React.useCallback(
    (next: T) => {
      if (!isControlled) {
        setInternalValue(next)
      }
    },
    [isControlled],
  )
  return [currentValue, setValue]
}

function isValueSelected(value: SelectOptionValue[], optionValue: SelectOptionValue): boolean {
  return value.includes(optionValue)
}

function removeValue(
  value: SelectOptionValue[],
  optionValue: SelectOptionValue,
): SelectOptionValue[] {
  return value.filter((item) => item !== optionValue)
}

function addValue(value: SelectOptionValue[], optionValue: SelectOptionValue): SelectOptionValue[] {
  if (value.includes(optionValue)) {
    return value
  }
  return [...value, optionValue]
}

function buildTagsInputValue(
  rawValue: SelectOptionValue | SelectOptionValue[] | null | undefined,
): SelectOptionValue[] {
  if (!rawValue) {
    return []
  }
  if (Array.isArray(rawValue)) {
    return rawValue
  }
  return [rawValue]
}

type SingleSelectProps = {
  options: SelectOption[]
  placeholder?: string
  value?: SelectOptionValue | null
  defaultValue?: SelectOptionValue
  onChange?: (value: SelectOptionValue | SelectOptionValue[] | undefined) => void
  onSelect?: (value: SelectOptionValue) => void
  onClear?: () => void
  allowClear?: boolean
  status?: SelectStatus
  size?: SelectSize
  loading?: boolean
  disabled?: boolean
  className?: string
  dropdownClassName?: string
  suffixIcon?: React.ReactNode
}

const SingleSelect = React.forwardRef<HTMLDivElement, SingleSelectProps>(
  (
    {
      options,
      placeholder,
      value,
      defaultValue,
      onChange,
      onSelect,
      onClear,
      allowClear,
      status,
      size = 'md',
      loading,
      disabled,
      className,
      dropdownClassName,
      suffixIcon,
    },
    ref,
  ) => {
    const [currentValue, setCurrentValue] = useControllableValue<SelectOptionValue | undefined>(
      value === null ? undefined : value,
      defaultValue,
    )
    const showClear = allowClear && Boolean(currentValue)
    const handleValueChange = (nextValue: string): void => {
      setCurrentValue(nextValue)
      onChange?.(nextValue)
      onSelect?.(nextValue)
    }

    const handleClear = (): void => {
      setCurrentValue(undefined)
      onClear?.()
      onChange?.(undefined)
    }

    return (
      <div
        ref={ref}
        className={cn(
          'mdk-select',
          `mdk-select--size-${size}`,
          status ? `mdk-select--status-${status}` : null,
          disabled ? 'mdk-select--disabled' : null,
        )}
      >
        <SelectPrimitive.Root
          value={currentValue}
          onValueChange={handleValueChange}
          disabled={disabled}
        >
          <div className="mdk-select__control">
            <SelectPrimitive.Trigger className={cn('mdk-select__trigger', className)}>
              <SelectPrimitive.Value placeholder={placeholder} className="mdk-select__value" />
            </SelectPrimitive.Trigger>
            {showClear && (
              <button
                type="button"
                className="mdk-select__clear"
                aria-label="Clear selection"
                onClick={handleClear}
                disabled={disabled}
              >
                ×
              </button>
            )}
            <span className="mdk-select__suffix" aria-hidden="true">
              {loading ? <span className="mdk-select__spinner" /> : (suffixIcon ?? <ChevronIcon />)}
            </span>
          </div>
          <SelectPrimitive.Portal>
            <SelectPrimitive.Content
              className={cn('mdk-select__content', dropdownClassName)}
              position="popper"
              sideOffset={4}
            >
              <SelectPrimitive.Viewport className="mdk-select__viewport">
                {options.length ? (
                  options.map((option) => (
                    <SelectPrimitive.Item
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                      className="mdk-select__item"
                    >
                      <SelectPrimitive.ItemText>{getOptionLabel(option)}</SelectPrimitive.ItemText>
                      <SelectPrimitive.ItemIndicator className="mdk-select__item-indicator">
                        <CheckIcon />
                      </SelectPrimitive.ItemIndicator>
                    </SelectPrimitive.Item>
                  ))
                ) : (
                  <div className="mdk-select__empty">No options</div>
                )}
              </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
      </div>
    )
  },
)
SingleSelect.displayName = 'SingleSelect'

type TagsSelectProps = {
  options: SelectOption[]
  placeholder?: string
  value: SelectOptionValue[]
  defaultValue: SelectOptionValue[]
  onChange?: (value: SelectOptionValue[] | undefined) => void
  onSelect?: (value: SelectOptionValue) => void
  onClear?: () => void
  allowClear?: boolean
  tokenSeparators: string[]
  status?: SelectStatus
  size?: SelectSize
  loading?: boolean
  disabled?: boolean
  className?: string
  dropdownClassName?: string
  suffixIcon?: React.ReactNode
  allowCustomValues?: boolean
}

const TagsSelect = React.forwardRef<HTMLDivElement, TagsSelectProps>(
  (
    {
      options,
      placeholder,
      value,
      defaultValue,
      onChange,
      onSelect,
      onClear,
      allowClear,
      tokenSeparators,
      status,
      size = 'md',
      loading,
      disabled,
      className,
      dropdownClassName,
      suffixIcon,
      allowCustomValues = true,
    },
    ref,
  ) => {
    const [currentValue, setCurrentValue] = useControllableValue<SelectOptionValue[]>(
      value,
      defaultValue,
    )
    const [inputValue, setInputValue] = React.useState('')
    const [open, setOpen] = React.useState(false)
    const inputRef = React.useRef<HTMLInputElement | null>(null)
    const showClear = allowClear && currentValue.length > 0

    const filteredOptions = React.useMemo(() => {
      if (!inputValue) {
        return options
      }
      const term = inputValue.toLowerCase()
      return options.filter((option) => getOptionText(option).toLowerCase().includes(term))
    }, [options, inputValue])

    const handleSelectionChange = (nextValue: SelectOptionValue[]): void => {
      setCurrentValue(nextValue)
      onChange?.(nextValue)
    }

    const handleAddTag = (tagValue: string): void => {
      const trimmed = tagValue.trim()
      if (!trimmed) {
        return
      }
      const nextValue = addValue(currentValue, trimmed)
      handleSelectionChange(nextValue)
      onSelect?.(trimmed)
    }

    const handleRemoveTag = (tagValue: string): void => {
      const nextValue = removeValue(currentValue, tagValue)
      handleSelectionChange(nextValue)
    }

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
      const nextValue = event.target.value
      if (tokenSeparators.some((separator) => nextValue.includes(separator))) {
        const separatorPattern = new RegExp(
          `[${tokenSeparators.map((separator) => escapeRegex(separator)).join('')}]`,
        )
        const parts = nextValue.split(separatorPattern).map((part) => part.trim())
        const lastPart = parts[parts.length - 1] ?? ''
        const toAdd = parts.slice(0, -1).filter(Boolean)
        if (allowCustomValues) {
          toAdd.forEach(handleAddTag)
        }
        setInputValue(lastPart)
        return
      }
      setInputValue(nextValue)
    }

    const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
      if (event.key === 'Backspace' && !inputValue && currentValue.length) {
        handleRemoveTag(currentValue[currentValue.length - 1])
        return
      }
      if (event.key === 'Enter' || tokenSeparators.includes(event.key)) {
        if (inputValue && allowCustomValues) {
          event.preventDefault()
          handleAddTag(inputValue)
          setInputValue('')
        }
      }
    }

    const handleClear = (): void => {
      setCurrentValue([])
      onClear?.()
      onChange?.([])
    }

    return (
      <div
        ref={ref}
        className={cn(
          'mdk-select',
          'mdk-select--tags',
          `mdk-select--size-${size}`,
          status ? `mdk-select--status-${status}` : null,
          disabled ? 'mdk-select--disabled' : null,
          className,
        )}
      >
        <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
          <PopoverPrimitive.Anchor asChild>
            <div
              className="mdk-select__control"
              onClick={() => inputRef.current?.focus()}
              role="presentation"
            >
              <div className="mdk-select__tags">
                {currentValue.map((tag) => (
                  <span key={tag} className="mdk-select__tag">
                    <span className="mdk-select__tag-label">{tag}</span>
                    <button
                      type="button"
                      className="mdk-select__tag-remove"
                      aria-label={`Remove ${tag}`}
                      onClick={() => handleRemoveTag(tag)}
                      disabled={disabled}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  ref={inputRef}
                  className="mdk-select__input"
                  placeholder={currentValue.length ? undefined : placeholder}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleInputKeyDown}
                  onFocus={() => setOpen(true)}
                  disabled={disabled}
                />
              </div>
              {showClear && (
                <button
                  type="button"
                  className="mdk-select__clear"
                  aria-label="Clear selection"
                  onClick={handleClear}
                  disabled={disabled}
                >
                  ×
                </button>
              )}
              <span className="mdk-select__suffix" aria-hidden="true">
                {loading ? (
                  <span className="mdk-select__spinner" />
                ) : (
                  (suffixIcon ?? <ChevronIcon />)
                )}
              </span>
            </div>
          </PopoverPrimitive.Anchor>
          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
              className={cn('mdk-select__content', dropdownClassName)}
              sideOffset={4}
              align="start"
            >
              <div className="mdk-select__viewport">
                {filteredOptions.length ? (
                  filteredOptions.map((option) => {
                    const selected = isValueSelected(currentValue, option.value)
                    return (
                      <button
                        type="button"
                        key={option.value}
                        disabled={option.disabled}
                        className={cn(
                          'mdk-select__item',
                          selected ? 'mdk-select__item--selected' : null,
                        )}
                        onClick={() => {
                          if (option.disabled) {
                            return
                          }
                          if (!selected) {
                            handleAddTag(option.value)
                          }
                          setInputValue('')
                        }}
                      >
                        <span className="mdk-select__item-text">{getOptionLabel(option)}</span>
                        {selected && (
                          <span className="mdk-select__item-indicator">
                            <CheckIcon />
                          </span>
                        )}
                      </button>
                    )
                  })
                ) : (
                  <div className="mdk-select__empty">No options</div>
                )}
              </div>
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>
      </div>
    )
  },
)
TagsSelect.displayName = 'TagsSelect'

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      options: optionsProp,
      placeholder,
      value,
      defaultValue,
      onChange,
      onSelect,
      onClear,
      allowClear,
      mode,
      tokenSeparators = [','],
      status = '',
      size,
      loading,
      disabled,
      className,
      dropdownClassName,
      suffixIcon,
      children,
    },
    ref,
  ) => {
    const resolvedSize = sizeToSize(size)
    const options = React.useMemo(
      () => normalizeOptions(optionsProp, children),
      [optionsProp, children],
    )
    const isTagMode = mode === 'tags' || mode === 'multiple'

    if (isTagMode) {
      return (
        <TagsSelect
          ref={ref}
          options={options}
          placeholder={placeholder}
          value={buildTagsInputValue(value)}
          defaultValue={buildTagsInputValue(defaultValue)}
          onChange={(next) => onChange?.(next)}
          onSelect={onSelect}
          onClear={onClear}
          allowClear={allowClear}
          tokenSeparators={tokenSeparators}
          status={status}
          size={resolvedSize}
          loading={loading}
          disabled={disabled}
          className={className}
          dropdownClassName={dropdownClassName}
          suffixIcon={suffixIcon}
          allowCustomValues={mode === 'tags'}
        />
      )
    }

    return (
      <SingleSelect
        ref={ref}
        options={options}
        placeholder={placeholder}
        value={value as SelectOptionValue | null | undefined}
        defaultValue={defaultValue as SelectOptionValue | undefined}
        onChange={onChange}
        onSelect={onSelect}
        onClear={onClear}
        allowClear={allowClear}
        status={status}
        size={resolvedSize}
        loading={loading}
        disabled={disabled}
        className={className}
        dropdownClassName={dropdownClassName}
        suffixIcon={suffixIcon}
      />
    )
  },
)
Select.displayName = 'Select'

function ChevronIcon(): React.ReactElement {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mdk-select__chevron"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function CheckIcon(): React.ReactElement {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

const SelectWithOption = Object.assign(Select, { Option: SelectOption })

export { SelectWithOption as Select, SelectOption }
