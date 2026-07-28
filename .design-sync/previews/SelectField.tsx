import { SelectField } from "@youtwo/ui-kit";

export function Visibility() {
  return (
    <div style={{ width: 320 }}>
      <SelectField
        label="Visibility"
        options={[
          { value: "public", label: "Public" },
          { value: "unlisted", label: "Unlisted" },
          { value: "private", label: "Private" },
        ]}
      />
    </div>
  );
}

export function WithHint() {
  return (
    <div style={{ width: 320 }}>
      <SelectField
        label="Default quality"
        hint="Applies to new uploads only."
        options={[
          { value: "1080", label: "1080p" },
          { value: "720", label: "720p" },
          { value: "480", label: "480p" },
        ]}
      />
    </div>
  );
}
