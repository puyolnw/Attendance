import React from 'react';
import { MapPin } from 'lucide-react';

/*
 * Weekly timetable grid.
 * X-axis: Mon–Fri (day_of_week 1..5). Y-axis: 08:00–20:00.
 * props.items: [{ id, course_code, course_name, room, day_of_week, start_time("HH:MM"), end_time("HH:MM") }]
 */

const DAYS = [
  { dow: 1, label: 'จันทร์' },
  { dow: 2, label: 'อังคาร' },
  { dow: 3, label: 'พุธ' },
  { dow: 4, label: 'พฤหัสบดี' },
  { dow: 5, label: 'ศุกร์' },
];

const START_HOUR = 8;   // 08:00
const END_HOUR = 20;    // 20:00
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);
const ROW_PX = 56; // height per hour

const toMinutes = (hhmm) => {
  const [h, m] = String(hhmm).split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

// palette per class (stable by code hash) — subtle tinted blocks
const PALETTE = [
  'bg-accent-dim border-accent/40 text-accent',
  'bg-indigo-dim border-indigo/40 text-indigo',
  'bg-ok/12 border-ok/35 text-ok',
  'bg-warn/12 border-warn/35 text-warn',
  'bg-info/12 border-info/35 text-info',
  'bg-bad/12 border-bad/35 text-bad',
];
const colorFor = (code) => {
  let h = 0;
  for (const ch of String(code)) h = (h * 31 + ch.charCodeAt(0)) % PALETTE.length;
  return PALETTE[h];
};

const TimetableGrid = ({ items = [] }) => {
  const gridStartMin = START_HOUR * 60;
  const byDay = (dow) => items.filter((it) => it.day_of_week === dow);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[720px]">
        {/* Header row: day names */}
        <div className="grid" style={{ gridTemplateColumns: `64px repeat(5, 1fr)` }}>
          <div />
          {DAYS.map((d) => (
            <div key={d.dow} className="px-2 pb-3 text-center text-sm font-semibold text-ink">
              {d.label}
            </div>
          ))}
        </div>

        {/* Body: time gutter + 5 day columns */}
        <div className="grid" style={{ gridTemplateColumns: `64px repeat(5, 1fr)` }}>
          {/* Time gutter */}
          <div className="relative" style={{ height: HOURS.length * ROW_PX }}>
            {HOURS.map((h, i) => (
              <div
                key={h}
                className="absolute left-0 right-1 text-[11px] text-muted text-right pr-1 -translate-y-1/2"
                style={{ top: i * ROW_PX }}
              >
                {String(h).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Day columns */}
          {DAYS.map((d) => (
            <div
              key={d.dow}
              className="relative border-l border-border"
              style={{ height: HOURS.length * ROW_PX }}
            >
              {/* hour gridlines */}
              {HOURS.map((h, i) => (
                <div
                  key={h}
                  className="absolute left-0 right-0 border-t border-border/50"
                  style={{ top: i * ROW_PX }}
                />
              ))}

              {/* class blocks */}
              {byDay(d.dow).map((it) => {
                const top = ((toMinutes(it.start_time) - gridStartMin) / 60) * ROW_PX;
                const height = ((toMinutes(it.end_time) - toMinutes(it.start_time)) / 60) * ROW_PX;
                return (
                  <div
                    key={it.id}
                    className={`absolute left-1 right-1 rounded-lg border px-2 py-1.5 overflow-hidden ${colorFor(it.course_code)}`}
                    style={{ top: Math.max(0, top), height: Math.max(24, height - 4) }}
                    title={`${it.course_code} ${it.course_name} ${it.start_time}-${it.end_time}`}
                  >
                    <p className="text-[11px] font-bold leading-tight truncate">{it.course_code}</p>
                    <p className="text-[10px] leading-tight truncate opacity-90">{it.course_name}</p>
                    <p className="text-[10px] leading-tight opacity-75">{it.start_time}-{it.end_time}</p>
                    {it.room && height > 60 && (
                      <p className="flex items-center gap-0.5 text-[10px] leading-tight opacity-75 mt-0.5">
                        <MapPin size={9} /> {it.room}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimetableGrid;
