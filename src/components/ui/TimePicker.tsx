import { useEffect, useRef, useState } from "react";
import { TimepickerUI } from "timepicker-ui";
import "timepicker-ui/main.css";

// Inject orange theme CSS overrides once
const STYLE_ID = "tp-orange-theme";
if (typeof document !== "undefined" && !document.getElementById(STYLE_ID)) {
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
    .tp-ui-wrapper.tp-orange {
      --tp-primary: #FF5E01;
      --tp-on-primary: #fff;
      --tp-surface: #fff;
      --tp-on-surface: #1a1a1a;
      --tp-primary-container: #FFF0E6;
      --tp-on-primary-container: #FF5E01;
      --tp-tertiary-container: #FFE0CC;
      --tp-on-tertiary-container: #CC4B00;
      --tp-outline: #e0e0e0;
    }
    .tp-ui-wrapper.tp-orange .tp-ui-ok,
    .tp-ui-wrapper.tp-orange .tp-ui-cancel {
      color: #FF5E01 !important;
    }
    .tp-ui-wrapper.tp-orange .tp-ui-ok:hover,
    .tp-ui-wrapper.tp-orange .tp-ui-cancel:hover {
      background-color: #FFF0E6 !important;
    }
    .tp-ui-wrapper.tp-orange .tp-ui-dot {
      background-color: #FF5E01 !important;
    }
    .tp-ui-wrapper.tp-orange .tp-ui-clock-hand {
      background-color: #FF5E01 !important;
    }
    .tp-ui-wrapper.tp-orange .tp-ui-circle-hand {
      background-color: #FF5E01 !important;
      border-color: #FF5E01 !important;
    }
    .tp-ui-wrapper.tp-orange .tp-ui-clock-hand-circle {
      background-color: #FF5E01 !important;
      border-color: #FF5E01 !important;
    }
  `;
    document.head.appendChild(style);
}

interface TimePickerProps {
    value: string;
    onChange: (time: string) => void;
    placeholder?: string;
    className?: string;
}

export function TimePicker({ value, onChange, placeholder = "Pilih waktu", className = "" }: TimePickerProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const pickerRef = useRef<any>(null);
    const [displayValue, setDisplayValue] = useState(value || "");

    useEffect(() => {
        if (!inputRef.current) return;

        const picker = new TimepickerUI(inputRef.current, {
            clock: {
                type: "24h",
                incrementMinutes: 5,
            },
            ui: {
                theme: "crane-straight",
                animation: true,
                backdrop: true,
                editable: true,
                cssClass: "tp-orange",
            },
            labels: {
                ok: "Pilih",
                cancel: "Batal",
                time: "Pilih Waktu",
                mobileTime: "Masukkan Waktu",
                mobileHour: "Jam",
                mobileMinute: "Menit",
            },
            callbacks: {
                onConfirm: (data: any) => {
                    const hour = String(data.hour).padStart(2, "0");
                    const minutes = String(data.minutes).padStart(2, "0");
                    const timeStr = `${hour}:${minutes}`;
                    setDisplayValue(timeStr);
                    onChange(timeStr);
                },
            },
        });

        picker.create();
        pickerRef.current = picker;

        return () => {
            picker.destroy();
            pickerRef.current = null;
        };
    }, []);

    // Sync external value changes
    useEffect(() => {
        setDisplayValue(value || "");
    }, [value]);

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        setDisplayValue("");
        onChange("");
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    return (
        <div className="relative">
            <input
                ref={inputRef}
                type="text"
                value={displayValue}
                readOnly
                placeholder={placeholder}
                className={`cursor-pointer ${className}`}
            />
            {displayValue && (
                <button
                    onClick={handleClear}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full hover:bg-gray-100"
                    title="Hapus waktu"
                >
                    ×
                </button>
            )}
        </div>
    );
}
