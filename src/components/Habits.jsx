import React, { useEffect, useState, useRef } from "react";
import "../styles/Habits.scss";

function Habits() {
const today = new Date().toISOString().slice(0,10);
const [habits, setHabitList] = useState(() => {
  try {
    const saved = localStorage.getItem("savedHabits");
    const parsed = JSON.parse(saved) || [];
    const habitsWithTodayStatus = parsed.map(item => ({
      ...item,
      done: Array.isArray(item.completedDates) && item.completedDates.includes(today),
  }));
  
    return saved ? habitsWithTodayStatus : [];
  } catch {
    return [];
}
});
const [inputValue, setInputValue] = useState("");
const [filter, setFilter] = useState("all");
const fileInputRef = useRef(null)

useEffect(() => {
  localStorage.setItem("savedHabits",JSON.stringify(habits));
}, [habits])

function handleSubmit(event) {
  event.preventDefault();
  const text = inputValue.trim();
  const id  = typeof crypto !== "undefined" && crypto.randomUUID
  ? crypto.randomUUID()
  : Date.now().toString();
  //const id = crypto?.randomUUID?.() ?? Date.now().toString();
  if (!text) return;
  setHabitList(prev => [
    ...prev,
    { id, value: text, done: false, completedDates: [] }
  ])
  setInputValue("");
};

function showStreak(completedDates) {
  const oneDay = 86400000;

  const dates = [...completedDates]
    .map(d => new Date(d).getTime())
    .sort((a, b) => b - a);

  const todayTs = new Date(today).getTime();
  const yesterdayTs = todayTs - oneDay;

  let start =
    dates.includes(todayTs) ? todayTs :
    dates.includes(yesterdayTs) ? yesterdayTs :
    null;

  if (!start) return 0;

  let streak = 1;

  for (let i = dates.indexOf(start); i < dates.length - 1; i++) {
    if (dates[i] - dates[i + 1] !== oneDay) break;
    streak++;
  }

  return streak;
}

function onInputChange(e) {
  const value = e.target.value;
  setInputValue(value);
};

function onDelete(id) {
  setHabitList(prev => prev.filter(item => item.id !== id));
};

function onCheckboxChange(id) {
  
  setHabitList(prev => 
     prev.map(item => {
      if(item.id !== id) return item;      
        const completedDates = toggleDates(item.completedDates,today);
        return { ...item,
                  completedDates,
                  done: completedDates.includes(today)  
                };      
    })
  );
};

function toggleDates(completedDates,today) {
         if (completedDates.includes(today)) {
          return completedDates.filter(dt => dt !== today)
         } else {
           return [...completedDates, today]
         }
}
        

function getVisibleHabits() {
  let visibleHabits = habits
  switch (filter) {
    case "active":
      visibleHabits = habits.filter(item => !item.done)
      break;
    case "completed":
    visibleHabits = habits.filter(item => item.done)
      break;
    case "all":  
    default:
      visibleHabits =  habits
  }
  return visibleHabits;
}

function onDeleteCompleted () {
  setHabitList(prev => prev.filter(item => !item.done));
  setFilter("all"); 
};

function onInlineEdit(id, newValue) {

  setHabitList(prev => prev.map(h => {
    if(h.id === id) {
      return { ...h, value: newValue }
    } 
    return h;
  }))
}
function onImport() {
//read file and covert it into habits state and replace those habits with existing habits or merge it
  fileInputRef.current?.click();
}
async function onFileImport(e) {
  const file = e.target?.files[0]
  if(!file) return;
  try {
  const text = await file.text();
  const jsonObj = JSON.parse(text);
  if(!isValidHabitList(jsonObj)) {
     alert("Invalid habits file format.");
      e.target.value = "";
      return;
  }
    if (habits.length > 0) {
      const shouldReplace = window.confirm(
        "Importing will replace your current habits. Continue?"
      );

      if (!shouldReplace) {
        e.target.value = "";
        return;
      }
    }
  setHabitList(jsonObj);
}
catch(error) {
  console.error("Import failed:", error);
    alert("Could not import file. Please select a valid JSON file.");
}
  e.target.value = "";
}

function isValidHabitList(list) {
   if (!Array.isArray(list)) return false;
   
   return list.every(item => {
    return (item && 
    typeof item === "object" && 
    typeof item.done === "boolean" && 
    typeof item.value === "string" &&
   typeof item.id === "string" || typeof item.id === "number") && Array.isArray(item.completedDates)
})
}

function onExport() {
  const jsonString = JSON.stringify(habits, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "habits.json";
  link.click();
 console.log(url)
  URL.revokeObjectURL(url);
 
}

const visibleHabits = getVisibleHabits();
const hasCompleted = habits.some(h => h.done);

return (
  <div className="wrapper">
    <div className="card form">
    <h1>Habit Tracker</h1>
    <form onSubmit={handleSubmit}>
      <input onChange={onInputChange} value={inputValue} placeholder="Add a habit" aria-label="New habit"/>
      <button type="submit" disabled={!inputValue.trim()}>Add</button>
        <div>
          <button type="button" onClick={() => setFilter("all")} className={filter === "all"? "activeFilter": ""} disabled ={habits.length === 0}>All</button>
          <button type="button" onClick={() => setFilter("active")} className={filter === "active"? "activeFilter": ""} disabled={habits.length === 0}>Active</button>
          <button type="button" onClick={() => setFilter("completed")} className={filter === "completed"? "activeFilter": ""} disabled={habits.length === 0}>Completed</button>
          
          <button type="button" onClick={onDeleteCompleted} disabled={!hasCompleted}>Clear Completed</button>

          <button type="button" onClick={onImport}>Import</button>
          <input type="file" ref={fileInputRef} accept="application/json,.json" style={{ display: "none" }}
          onChange={(e) => onFileImport(e)}
          />
          <button type="button" onClick={onExport}>Export</button>
        </div>
      </form>
      </div>
      <div className="card visible-habits">
      <ul>
        { 
        visibleHabits && visibleHabits.length === 0 ? <li> {filter === "all" ? "No Habits yet " : `No ${filter} habits yet`}</li> :
        visibleHabits.map(item =>
          <li key={item.id}>
            <input type="checkbox" aria-label={`Mark ${item.value} done`} onChange={() => onCheckboxChange(item.id)} checked={item.done} /> Done Today!
            <input style={{ textDecoration: item.done ? "line-through" : "none", }} 
              value={item.value}
             onChange={(event) =>onInlineEdit(item.id, event.target.value)}
             disabled={item.done}
             aria-label={`Edit ${item.value}`}
             />
             {showStreak(item.completedDates) > 0 && (
              <span> 🔥 {showStreak(item.completedDates)} </span>
              )}
            <button type="button" aria-label={`Delete ${item.value}`} onClick={() => onDelete(item.id)}>Delete</button>
          </li>
        )}
      </ul>
      </div>
  </div>
)
};

export default Habits;