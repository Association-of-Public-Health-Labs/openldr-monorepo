import EidStatusCards from "./reports/eid-status-cards";
import EidKeyIndicators from "./reports/eid-key-indicators";

export default function Page() {
  return (
    <div className="w-full @container">
      <div className="grid grid-cols-1 gap-6">
        <EidStatusCards />
        <EidKeyIndicators />
      </div>
    </div>
  );
}
