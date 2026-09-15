import { BrandMark } from "@/components/site/brand-mark";

const nodes = ["Task", "Verified reward", "Ownership"];

export function FlowVisual() {
  return (
    <div className="flow-visual" aria-hidden="true">
      <div className="flow-track">
        <span className="flow-line" />
        <span className="flow-rider">
          <BrandMark size={26} className="flow-token rounded-lg" />
        </span>
        {nodes.map((node, index) => (
          <span
            key={node}
            className="flow-node"
            style={{ animationDelay: `${index * 2.7}s` }}
          >
            <span className="flow-dot" />
            <span className="flow-label">{node}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
