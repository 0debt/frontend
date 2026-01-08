'use client'

import { ChevronDown, ChevronUp } from 'lucide-react'
import { forwardRef, useCallback, useRef, useState } from 'react'
import { NumericFormat, type NumericFormatProps } from 'react-number-format'
import { Button } from '@/shadcn/components/ui/button'
import { Input } from '@/shadcn/components/ui/input'

export interface NumberInputProps
  extends Omit<NumericFormatProps, 'value' | 'onValueChange'> {
  stepper?: number
  defaultValue?: number
  min?: number
  max?: number
  value?: number
  suffix?: string
  prefix?: string
  onValueChange?: (value: number | undefined) => void
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      stepper,
      placeholder,
      defaultValue,
      min = -Infinity,
      max = Infinity,
      onValueChange,
      suffix,
      prefix,
      value: controlledValue,
      ...props
    },
    ref
  ) => {
    const internalRef = useRef<HTMLInputElement>(null)
    const combinedRef = (ref as React.RefObject<HTMLInputElement>) || internalRef
    
    // Internal state for uncontrolled mode
    const [internalValue, setInternalValue] = useState<number | undefined>(defaultValue)

    const isControlled = controlledValue !== undefined
    const value = isControlled ? controlledValue : internalValue

    const handleChange = useCallback((values: {
      value: string
      floatValue: number | undefined
    }) => {
      const newValue = values.floatValue === undefined ? undefined : values.floatValue
      
      if (!isControlled) {
        setInternalValue(newValue)
      }
      
      onValueChange?.(newValue)
    }, [isControlled, onValueChange])

    const handleIncrement = useCallback(() => {
      const currentValue = value ?? 0
      const nextValue = Math.min(currentValue + (stepper ?? 1), max)
      
      if (!isControlled) {
        setInternalValue(nextValue)
      }
      onValueChange?.(nextValue)
    }, [value, stepper, max, isControlled, onValueChange])

    const handleDecrement = useCallback(() => {
      const currentValue = value ?? 0
      const nextValue = Math.max(currentValue - (stepper ?? 1), min)

      if (!isControlled) {
        setInternalValue(nextValue)
      }
      onValueChange?.(nextValue)
    }, [value, stepper, min, isControlled, onValueChange])

    // We can use the 'onKeyDown' prop of Input instead of global listener!
    // Much simpler and avoids useEffect.
    
    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        handleIncrement()
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        handleDecrement()
      }
      props.onKeyDown?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (value !== undefined) {
        if (value < min) {
          if (!isControlled) setInternalValue(min)
          onValueChange?.(min)
        } else if (value > max) {
          if (!isControlled) setInternalValue(max)
          onValueChange?.(max)
        }
      }
      props.onBlur?.(e)
    }

    return (
      <div className="flex items-center">
        <NumericFormat
          value={value}
          onValueChange={handleChange}
          allowNegative={min < 0}
          valueIsNumericString
          onBlur={handleBlur}
          max={max}
          min={min}
          suffix={suffix}
          prefix={prefix}
          customInput={Input}
          placeholder={placeholder}
          className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none rounded-r-none relative"
          getInputRef={combinedRef}
          onKeyDown={handleInputKeyDown}
          {...props}
        />
        <div className="flex flex-col">
          <Button
            aria-label="Increase value"
            className="px-2 h-5 rounded-l-none rounded-br-none border-input border-l-0 border-b-[0.5px] focus-visible:relative"
            variant="outline"
            onClick={handleIncrement}
            disabled={value === max}
            type="button"
            tabIndex={-1}
          >
            <ChevronUp size={15} />
          </Button>
          <Button
            aria-label="Decrease value"
            className="px-2 h-5 rounded-l-none rounded-tr-none border-input border-l-0 border-t-[0.5px] focus-visible:relative"
            variant="outline"
            onClick={handleDecrement}
            disabled={value === min}
            type="button"
            tabIndex={-1}
          >
            <ChevronDown size={15} />
          </Button>
        </div>
      </div>
    )
  }
)

NumberInput.displayName = 'NumberInput'

