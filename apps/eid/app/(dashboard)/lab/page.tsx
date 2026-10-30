import EidTestedByLabConventional from "./reports/eid-tested-by-lab-conventional";
import EidTestedByLabPoc from "./reports/eid-tested-by-lab-poc";
import EidTestedByMonth from "./reports/eid-tested-by-month";
import EidTrlByLab from "./reports/eid-trl-by-lab";
import EidTatByLab from "./reports/eid-tat-by-lab";
import EidRegisteredByMonth from "./reports/eid-registered-by-month";
import EidEquipmentByMonth from "./reports/eid-equipment-by-month";
import EidEquipmentByLab from "./reports/eid-equipment-by-lab";
import EidRejectedByMonth from "./reports/eid-rejected-by-month";
import EidRejectedByLab from "./reports/eid-rejected-by-lab";

/** The ten Laboratório cards, in the legacy order. */
export default function Page() {
  return (
    <div className="w-full @container">
      <div className="grid grid-cols-1 gap-6 @[840px]:grid-cols-2">
        <EidTestedByLabConventional />
        <EidTestedByLabPoc />
        <EidTestedByMonth />
        <EidTrlByLab />
        <EidTatByLab />
        <EidRegisteredByMonth />
        <EidEquipmentByMonth />
        <EidEquipmentByLab />
        <EidRejectedByMonth />
        <EidRejectedByLab />
      </div>
    </div>
  );
}
