import { FilterChips } from "@youtwo/ui-kit";

export function HomeCategories() {
  return (
    <div style={{ width: 640 }}>
      <FilterChips
        chips={["All", "Gaming", "Music", "Live", "Tutorials", "Devlogs", "Recently uploaded"]}
        active="All"
      />
    </div>
  );
}

export function WithACategorySelected() {
  return (
    <div style={{ width: 640 }}>
      <FilterChips chips={["All", "Gaming", "Music", "Live", "Tutorials"]} active="Live" />
    </div>
  );
}
