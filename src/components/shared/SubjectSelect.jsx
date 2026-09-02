import React from "react";

export default function SubjectSelect({ subjects, value, onSelect, inputCls }) {
  return (
    <select className={inputCls} value={value} onChange={(e) => onSelect(e.target.value)}>
      <option value="">Select a subject</option>
      {subjects.map((s) => (
        <option key={s.id} value={s.id}>{s.name}</option>
      ))}
    </select>
  );
}
