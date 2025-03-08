'use client'
import { useState, type HTMLInputTypeAttribute } from "react";

import { useFormContext } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Skeleton } from "./skeleton";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./form";
import { Input, InputProps } from "./input";
import { cn } from "@repo/ui/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Calendar, CalendarProps } from "./calendar";
import { CalendarIcon, CheckIcon } from "lucide-react";
import { Textarea } from "./textarea";
import { Checkbox } from "./checkbox";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Modal } from "../extensive/modal";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { ScrollArea } from "./scroll-area";


interface FormFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  description?: string | React.ReactNode;
  type?: HTMLInputTypeAttribute;
  disabled?: boolean;
}

const desktop = "(min-width: 768px)";

function FormFieldInput(props: InputProps & FormFieldProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={props.name}
      disabled={props.disabled}
      render={({ field }) => (
        <FormItem className="w-full">
          {props.label && <FormLabel>{props.label}</FormLabel>}
          <FormControl>
            <Input
              type={props.type}
              placeholder={props.placeholder}
              {...props}
              {...field}
              value={field.value || ''}
            />
          </FormControl>
          {props.description && (
            <FormDescription>{props.description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}


function FormFieldInputOtp(props: InputProps & FormFieldProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={props.name}
      disabled={props.disabled}
      render={({ field }) => (
        <FormItem className="w-full">
          {props.label && <FormLabel>{props.label}</FormLabel>}
          <FormControl>
            <InputOTP maxLength={6} {...field} >
              <InputOTPGroup  >
                <InputOTPSlot index={0} className="md:size-10" />
                <InputOTPSlot index={1} className="md:size-10" />
                <InputOTPSlot index={2} className="md:size-10" />
                <InputOTPSlot index={3} className="md:size-10" />
                <InputOTPSlot index={4} className="md:size-10" />
                <InputOTPSlot index={5} className="md:size-10" />
              </InputOTPGroup>
            </InputOTP>
          </FormControl>
          {props.description && (
            <FormDescription>{props.description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function FormFieldSelect(
  props: FormFieldProps & {
    defaultValue?: string;
    options: { label: string; value: string }[];
  },
) {
  const isDesktop = useMediaQuery(desktop);
  const form = useFormContext();

  if (!isDesktop) return <SelectModal {...props} />

  return (
    <FormField
      control={form.control}
      name={props.name}
      render={({ field }) => (
        <FormItem className="w-full">
          {props.label && <FormLabel>{props.label}</FormLabel>}
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            value={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={props.placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {props.options.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {props.description && (
            <FormDescription>{props.description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FormFieldSkeleton(props: { label?: string, className?: string }) {
  return (
    <FormItem className="w-full">
      {props.label && <FormLabel>{props.label}</FormLabel>}
      <Skeleton className={cn("h-10 w-full", props.className)} />
    </FormItem>
  );
}

function FormFieldDatePicker(
  props: FormFieldProps & { options?: CalendarProps },
) {
  const form = useFormContext();
  return (
    <FormField
      control={form.control}
      name={props.name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          {props.label && <FormLabel>{props.label}</FormLabel>}
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className={cn(
                    "pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground",
                  )}
                >
                  {field.value
                    ? (
                      format(field.value, "PPP", { locale: it })
                    )
                    : (
                      <span>{props.placeholder || "Scegli una Data"}</span>
                    )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                locale={it}
                initialFocus
                {...props.options}
              />
            </PopoverContent>
          </Popover>
          {props.description && (
            <FormDescription>{props.description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FormFieldTextArea(props: React.ComponentProps<"textarea"> & FormFieldProps) {
  const form = useFormContext();
  return (
    <FormField
      control={form.control}
      name={props.name}
      render={({ field }) => (
        <FormItem>
          {props.label && <FormLabel>{props.label}</FormLabel>}
          <FormControl>
            <Textarea
              placeholder={props.placeholder}
              className="resize-none"
              {...props}
              {...field}
            />
          </FormControl>
          {props.description && (
            <FormDescription>{props.description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}


function FormFieldCheckBox(props: FormFieldProps) {
  const form = useFormContext();
  return (
    <FormField
      control={form.control}
      name={props.name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
          <FormControl>
            <Checkbox
              checked={field.value}
              defaultChecked={field.value}
              onCheckedChange={field.onChange}
              disabled={props.disabled}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            {props.label && (
              <FormLabel className="text-sm">{props.label}</FormLabel>
            )}
            {props.description && (
              <FormDescription>{props.description}</FormDescription>
            )}
          </div>
        </FormItem>
      )}
    />
  );
}

function SelectModal(
  props: FormFieldProps & {
    defaultValue?: string;
    options: { label: string; value: string }[];
  },
) {
  const form = useFormContext();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(props.defaultValue || null);


  function handleSelect(val: string) {
    setSelected(val)
    form.setValue(props.name, val);
    setIsOpen(false);
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <div>
        {props.label && <FormLabel>{props.label}</FormLabel>}
        <DrawerTrigger asChild>
          <Button variant="outline" className="w-full bg-transparent justify-start px-3 !mt-2">
            <p className="line-clamp-1">{props.options.find(o => o.value === selected)?.label || "Seleziona"}</p>
          </Button>
        </DrawerTrigger>
        {props.description && (
          <FormDescription>{props.description}</FormDescription>
        )}
      </div>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>{props.label || 'Seleziona'}</DrawerTitle>
            <DrawerDescription>{props.description || ''}</DrawerDescription>
          </DrawerHeader>
          <ScrollArea>
            <div className="max-h-[50vh]">
              {props.options.map(option => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "text-left text-sm font-medium w-full flex items-center justify-between py-3 px-4 border-b dark:border-muted border-muted-foreground/20  cursor-pointertext-left",
                    selected === option.value && "bg-primary bg-opacity-10"
                  )}
                >
                  <p>{option.label}</p>
                  {selected === option.value && <CheckIcon className="text-primary size-5" />}
                </button>
              ))}
            </div>

          </ScrollArea>
        </div>
        <DrawerFooter />
      </DrawerContent>
    </Drawer>
  )
}



export const FormFields = {
  Input: FormFieldInput,
  Select: FormFieldSelect,
  Skeleton: FormFieldSkeleton,
  DatePicker: FormFieldDatePicker,
  TextArea: FormFieldTextArea,
  Checkbox: FormFieldCheckBox,
  InputOtp: FormFieldInputOtp,
};
