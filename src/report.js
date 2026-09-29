function buildReport(issues) {
  const report = {};

  for (const issue of issues) {
    const status =
      issue.fields?.status?.name || "Unknown";

    const assignee =
      issue.fields?.assignee?.displayName ||
      "Unassigned";

    if (!report[status]) {
      report[status] = {
        count: 0,
        assignees: {},
      };
    }

    report[status].count++;

    report[status].assignees[assignee] =
      (report[status].assignees[assignee] || 0) + 1;
  }

  return report;
}

function getTopAssignees(
  assignees,
  limit = 5
) {
  const sorted =
    Object.entries(assignees)
      .sort((a, b) => b[1] - a[1]);

  return {
    top: sorted.slice(0, limit),
    remaining:
      Math.max(0, sorted.length - limit),
  };
}

module.exports = {
  buildReport,
  getTopAssignees,
};