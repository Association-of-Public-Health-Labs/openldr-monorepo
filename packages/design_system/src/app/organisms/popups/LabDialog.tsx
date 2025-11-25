
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog"

import { CalendarIcon } from "lucide-react"
import {
  Button as ButtonARIA,
  DateRangePicker,
  Dialog as DialogARIA,
  Group,
  // Label,
  Popover as PopoverARIA,
} from "react-aria-components"

import { cn } from "@/lib/utils"
import { RangeCalendar } from "../../../components/ui/calendar-rac"
import { DateInput, dateInputStyle } from "../../../components/ui/datefield-rac"

import { Label } from "../../../components/ui/label"
import MultipleSelector, { Option } from "../../../components/ui/multiselect"
import { Button } from "../../../components/ui/button"

import { useId, useState } from "react"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"

import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const frameworks: Option[] = [
  {
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
    disable: true,
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
  {
    value: "angular",
    label: "Angular",
  },
  {
    value: "vue",
    label: "Vue.js",
  },
  {
    value: "react",
    label: "React",
  },
  {
    value: "ember",
    label: "Ember.js",
  },
  {
    value: "gatsby",
    label: "Gatsby",
  },
  {
    value: "eleventy",
    label: "Eleventy",
    disable: true,
  },
  {
    value: "solid",
    label: "SolidJS",
  },
  {
    value: "preact",
    label: "Preact",
  },
  {
    value: "qwik",
    label: "Qwik",
  },
  {
    value: "alpine",
    label: "Alpine.js",
  },
  {
    value: "lit",
    label: "Lit",
  },
]

export type LabDialogProps = {

}

export function LabDialog() {
  const id = useId()
  const [date, setDate] = useState<DateRange | undefined>()

  return (
    <Dialog>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account
            and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>

        <div className="*:not-first:mt-2">
          <Label>Multiselect</Label>
          <MultipleSelector
            commandProps={{
              label: "Select frameworks",
              shouldFilter: true
            }}
            value={frameworks.slice(0, 2)}
            defaultOptions={frameworks}
            placeholder="Select frameworks"
            hidePlaceholderWhenSelected
            emptyIndicator={<p className="text-center text-sm">No results found</p>}
          />
        </div>
        <div className="*:not-first:mt-2">
          <Label>Multiselect</Label>
          <MultipleSelector
            commandProps={{
              label: "Select frameworks",
              shouldFilter: true
            }}
            value={frameworks.slice(0, 2)}
            defaultOptions={frameworks}
            placeholder="Select frameworks"
            hidePlaceholderWhenSelected
            emptyIndicator={<p className="text-center text-sm">No results found</p>}
          />
        </div>
        <div className="*:not-first:mt-2">
          <Label>Multiselect</Label>
          <MultipleSelector
            commandProps={{
              label: "Select frameworks",
              shouldFilter: true
            }}
            value={frameworks.slice(0, 2)}
            defaultOptions={frameworks}
            placeholder="Select frameworks"
            hidePlaceholderWhenSelected
            emptyIndicator={<p className="text-center text-sm">No results found</p>}
          />
        </div>

        <div>
          <div className="*:not-first:mt-2">
            <Label htmlFor={id}>Date range picker</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id={id}
                  variant="outline"
                  className="group w-full justify-between border-input bg-background px-3 font-normal outline-offset-0 outline-none hover:bg-background focus-visible:outline-[3px]"
                >
                  <span
                    className={cn("truncate", !date && "text-muted-foreground")}
                  >
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "LLL dd, y")} - {" "}
                          {format(date.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(date.from, "LLL dd, y")
                      )
                    ) : (
                      "Pick a date range"
                    )}
                  </span>
                  <CalendarIcon
                    size={16}
                    className="shrink-0 text-muted-foreground/80 transition-colors group-hover:text-foreground"
                    aria-hidden="true"
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="start">
                <Calendar mode="range" 
                  selected={date} 
                  onSelect={setDate} 
                />
              </PopoverContent>
            </Popover>
          </div>
          <p
            className="mt-2 text-xs text-muted-foreground"
            role="region"
            aria-live="polite"
          >
            Built with{" "}
            <a
              className="underline hover:text-foreground"
              href="https://daypicker.dev/"
              target="_blank"
              rel="noopener nofollow"
            >
              React DayPicker
            </a>
          </p>
        </div>

        <DateRangePicker className="*:not-first:mt-2">
          <Label className="text-sm font-medium text-foreground">
            Date range picker
          </Label>
          <div className="flex">
            <Group className={cn(dateInputStyle, "pe-9")}>
              <DateInput slot="start" unstyled />
              <span aria-hidden="true" className="px-2 text-muted-foreground/70">
                -
              </span>
              <DateInput slot="end" unstyled />
            </Group>
            <ButtonARIA className="z-10 -ms-9 -me-px flex w-9 items-center justify-center rounded-e-md text-muted-foreground/80 transition-[color,box-shadow] outline-none hover:text-foreground data-focus-visible:border-ring data-focus-visible:ring-[3px] data-focus-visible:ring-ring/50">
              <CalendarIcon size={16} />
            </ButtonARIA>
          </div>
          <PopoverARIA
            className="z-50 rounded-md border bg-background text-popover-foreground shadow-lg outline-hidden data-entering:animate-in data-exiting:animate-out data-[entering]:fade-in-0 data-[entering]:zoom-in-95 data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2"
            offset={4}
          >
            <DialogARIA className="max-h-[inherit] overflow-auto p-2">
              <RangeCalendar />
            </DialogARIA>
          </PopoverARIA>
          <p
            className="mt-2 text-xs text-muted-foreground"
            role="region"
            aria-live="polite"
          >
            Built with{" "}
            <a
              className="underline hover:text-foreground"
              href="https://react-spectrum.adobe.com/react-aria/DateRangePicker.html"
              target="_blank"
              rel="noopener nofollow"
            >
              React Aria
            </a>
          </p>
        </DateRangePicker>

        
      </DialogContent>
    </Dialog>
    
  )
}