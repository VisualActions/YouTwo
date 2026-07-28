import { Button } from "@youtwo/ui-kit";

export function Variants() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
      <Button variant="primary">Save</Button>
      <Button variant="secondary">Cancel</Button>
      <Button variant="blue">Sign in</Button>
      <Button variant="outline">Sign in</Button>
      <Button variant="danger">Confirm delete</Button>
      <Button variant="ghost-danger">Delete video</Button>
    </div>
  );
}

export function Sizes() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  );
}

export function Disabled() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
      <Button disabled>Uploading...</Button>
      <Button variant="secondary" disabled>
        Cancel
      </Button>
    </div>
  );
}

export function FullWidth() {
  return (
    <div style={{ width: 320 }}>
      <Button variant="blue" size="lg" block>
        Create account
      </Button>
    </div>
  );
}
