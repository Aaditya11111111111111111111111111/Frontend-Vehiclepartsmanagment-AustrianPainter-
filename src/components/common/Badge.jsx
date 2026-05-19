export default function Badge({ children, color = "gray" }) {
  return <span className={`badge badge-${color}`}>{children}</span>;
}

export function StatusBadge({ status }) {
  const map = {
    Active: "green", Inactive: "red", Pending: "yellow",
    Confirmed: "blue", Completed: "green", Cancelled: "red",
    Fulfilled: "green", Rejected: "red", Cash: "green",
    Credit: "yellow", Card: "blue", true: "green", false: "red"
  };
  return <Badge color={map[status] || map[String(status)] || "gray"}>{String(status)}</Badge>;
}
