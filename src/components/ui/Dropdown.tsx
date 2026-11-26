"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

/**
 * THE SITE'S DROPDOWN, in place of the browser's own select (the human,
 * 2026-11-23: "custom made, not default ugly ones"). Each form keeps its own
 * field - the trigger takes that form's border, height and radius - and every
 * list opens the same way: a dark `pitch` panel under the field, the choices
 * in the body face, the one chosen marked with a gild check, the one the
 * keyboard is on lit in `ash`. It opens upwards when there's no room below.
 *
 * The WAI-ARIA select-only combobox: the trigger keeps focus and points at
 * the active option (`aria-activedescendant`). Arrows, Home/End, Enter or
 * Space to choose, Escape to close, and typing jumps to the first choice that
 * starts with what was typed (the state and LGA lists are long). A click
 * outside closes it. `required` is kept for the browser's own check by a
 * transparent input over the field, so an empty one stops the form and the
 * message points at it.
 *
 * The list scrolls inside itself (`data-lenis-prevent`), never the page.
 */
export type DropdownOption = { value: string; label: string };

export function Dropdown({
  id,
  labelledBy,
  options,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  triggerClassName,
  placeholderClassName = "text-white/60",
  caret,
}: {
  /** The trigger's id, for a `<label htmlFor>`. */
  id?: string;
  /** The label's id: the combobox's accessible name. */
  labelledBy: string;
  options: readonly DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  disabled?: boolean;
  /** The field's own look: border, height, radius, padding, type. */
  triggerClassName: string;
  /** How the placeholder reads while nothing is chosen. */
  placeholderClassName?: string;
  /** What sits at the field's right; the chevron by default. */
  caret?: ReactNode;
}) {
  const ownId = useId();
  const triggerId = id ?? `${ownId}-trigger`;
  const listId = `${ownId}-list`;
  const optionId = (i: number) => `${ownId}-option-${i}`;
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [upwards, setUpwards] = useState(false);
  const typed = useRef({ text: "", at: 0 });
  const selectedIndex = options.findIndex((o) => o.value === value);
  const current = selectedIndex >= 0 ? options[selectedIndex] : null;

  const show = () => {
    if (disabled || !options.length) return;
    setActive(selectedIndex >= 0 ? selectedIndex : 0);
    // Room below the field for the list's 18rem, or open upwards.
    const box = trigger.current?.getBoundingClientRect();
    setUpwards(!!box && window.innerHeight - box.bottom < 300 && box.top > window.innerHeight - box.bottom);
    setOpen(true);
  };
  const choose = (i: number) => {
    const option = options[i];
    if (option) onChange(option.value);
    setOpen(false);
  };

  // A click outside closes it.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // The active option stays in view as the keyboard moves.
  useLayoutEffect(() => {
    if (!open || active < 0) return;
    document.getElementById(`${ownId}-option-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [open, active, ownId]);

  /**
   * Typing jumps to a choice starting with what was typed in the last 0.7s.
   * One letter, or the same letter again, steps on to the next choice that
   * starts with it; more letters ("la") narrow from where it is.
   */
  const jump = (key: string) => {
    const now = Date.now();
    const text = (now - typed.current.at > 700 ? "" : typed.current.text) + key.toLowerCase();
    typed.current = { text, at: now };
    const oneLetter = [...text].every((c) => c === text[0]);
    const needle = oneLetter ? text[0] : text;
    const from = open ? active : selectedIndex;
    const start = oneLetter ? from + 1 : Math.max(from, 0);
    for (let k = 0; k < options.length; k++) {
      const i = (start + k) % options.length;
      if (!options[i].label.toLowerCase().startsWith(needle)) continue;
      if (open) setActive(i);
      else onChange(options[i].value);
      return;
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const last = options.length - 1;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        show();
      } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) jump(event.key);
      return;
    }
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActive((i) => Math.min(last, i + 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActive((i) => Math.max(0, i - 1));
        break;
      case "Home":
        event.preventDefault();
        setActive(0);
        break;
      case "End":
        event.preventDefault();
        setActive(last);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        choose(active);
        break;
      case "Escape":
        event.preventDefault();
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) jump(event.key);
    }
  };

  return (
    // Open, it rises above the fields after it, whatever stacking they make of their own.
    <div ref={root} className={`relative ${open ? "z-40" : ""}`}>
      <button
        ref={trigger}
        id={triggerId}
        type="button"
        role="combobox"
        aria-labelledby={`${labelledBy} ${triggerId}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
        aria-required={required || undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKeyDown}
        className={`${triggerClassName} flex cursor-pointer items-center justify-between gap-3 text-left disabled:cursor-not-allowed disabled:opacity-60`}
      >
        <span className={`min-w-0 flex-1 truncate ${current ? "" : placeholderClassName}`}>{current ? current.label : placeholder}</span>
        <span aria-hidden className="flex shrink-0 items-center">
          {caret ?? (
            <ChevronDown
              className={`ease-gate size-4 opacity-70 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              strokeWidth={1.75}
            />
          )}
        </span>
      </button>

      {/* The browser's own "required" check, pointing at the field; focus goes on to the trigger. */}
      {required ? (
        <input
          tabIndex={-1}
          aria-hidden
          required
          value={value}
          onChange={() => {}}
          onFocus={() => trigger.current?.focus()}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px w-full opacity-0"
        />
      ) : null}

      {open ? (
        <ul
          ref={list}
          id={listId}
          role="listbox"
          aria-labelledby={labelledBy}
          data-lenis-prevent
          className={`bg-pitch border-menu-fg/15 menu-in absolute inset-x-0 z-40 max-h-72 overflow-y-auto overscroll-contain rounded-md border p-1.5 shadow-[0_18px_40px_-12px_rgb(0_0_0/0.8)] ${
            upwards ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          {options.map((option, i) => {
            const selected = i === selectedIndex;
            return (
              <li
                key={option.value}
                id={optionId(i)}
                role="option"
                aria-selected={selected}
                onPointerMove={() => setActive(i)}
                onClick={() => {
                  choose(i);
                  trigger.current?.focus();
                }}
                className={`font-body flex cursor-pointer items-center justify-between gap-3 rounded-[0.1875rem] px-3.5 py-2.75 text-[0.9375rem] leading-snug ${
                  i === active ? "bg-ash text-white" : "text-white/80"
                } ${selected ? "font-semibold text-white" : ""}`}
              >
                <span className="min-w-0">{option.label}</span>
                {selected ? <Check aria-hidden className="text-gild size-4 shrink-0" strokeWidth={2.25} /> : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
