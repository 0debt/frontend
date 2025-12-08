'use client'

import { ChevronDown, ChevronUp } from 'lucide-react'
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react'
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
    const [value, setValue] = useState<number | undefined>(
      controlledValue ?? defaultValue
    )

    const handleIncrement = useCallback(() => {
      setValue((prev) =>
        prev === undefined ? stepper ?? 1 : Math.min(prev + (stepper ?? 1), max)
      )
    }, [stepper, max])

    const handleDecrement = useCallback(() => {
      setValue((prev) =>
        prev === undefined
          ? -(stepper ?? 1)
          : Math.max(prev - (stepper ?? 1), min)
      )
    }, [stepper, min])

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (document.activeElement === combinedRef.current) {
          if (e.key === 'ArrowUp') handleIncrement()
          if (e.key === 'ArrowDown') handleDecrement()
        }
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }, [handleIncrement, handleDecrement, combinedRef])

    useEffect(() => {
      if (controlledValue !== undefined) {
        setValue(controlledValue)
      }
    }, [controlledValue])

    const handleChange = (values: {
      value: string
      floatValue: number | undefined
    }) => {
      const newValue =
        values.floatValue === undefined ? undefined : values.floatValue
      setValue(newValue)
      onValueChange?.(newValue)
    }

    const handleBlur = () => {
      if (value !== undefined) {
        if (value < min) {
          setValue(min)
          if (combinedRef.current) combinedRef.current.value = String(min)
        } else if (value > max) {
          setValue(max)
          if (combinedRef.current) combinedRef.current.value = String(max)
        }
      }
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
          >
            <ChevronDown size={15} />
          </Button>
        </div>
      </div>
    )
  }
)

NumberInput.displayName = 'NumberInput'

