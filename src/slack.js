const axios = require("axios");
const config = require("./config");

const statusOrder = [
  "Closed",
  "Code Review & Merge",
  "Deployed on Demo",
  "Documentation/Design",
  "In Progress",
  "On Prod",
  "Open",
  "Ready For Demo",
  "Ready For Dev",
  "Ready For Release",
  "Reopened",
  "Staging",
];

function getOrderedStatuses(report) {
  const ordered = [];

  // Preferred known statuses first
  for (const status of statusOrder) {
    if (report[status]) {
      ordered.push(status);
    }
  }

  // Automatically include any new Jira statuses
  for (const status of Object.keys(report)) {
    if (!ordered.includes(status)) {
      ordered.push(status);
    }
  }

  return ordered;
}

function buildSummaryBlock(report) {
  const statuses = getOrderedStatuses(report);

  let grandTotal = 0;

  const rows = statuses.map((status) => {
    const count = report[status].count;

    grandTotal += count;

    return {
      status,
      count,
    };
  });

  const statusWidth = Math.max(
    24,
    ...rows.map((row) => row.status.length)
  );

  const header =
    `${"Status".padEnd(statusWidth)}  ${"Count".padStart(5)}`;

  const separator =
    "-".repeat(statusWidth + 7);

  const dataLines = rows.map((row) => {
    return (
      `${row.status.padEnd(statusWidth)}  ` +
      `${String(row.count).padStart(5)}`
    );
  });

  const totalLine =
    `${"Grand Total".padEnd(statusWidth)}  ` +
    `${String(grandTotal).padStart(5)}`;

  const table =
`${header}
${separator}
${dataLines.join("\n")}
${separator}
${totalLine}`;

  return {
    type: "section",
    text: {
      type: "mrkdwn",
      text:
        `\`\`\`\n${table}\n\`\`\`\n`,
    },
  };
}

function buildDetailBlocks(report) {
  const statuses = getOrderedStatuses(report);

  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "Details by Status",
      },
    },
  ];

  for (const status of statuses) {
    const data = report[status];

    const assignees = Object.entries(
      data.assignees || {}
    ).sort((a, b) => b[1] - a[1]);

    const lines = assignees
      .map(
        ([name, count]) =>
          `• ${name} — *${count}*`
      )
      .join("\n");

    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          `*${status} — ${data.count}*\n` +
          (lines || "_No assignee data_"),
      },
    });

    blocks.push({
      type: "divider",
    });
  }

  return blocks;
}

function buildSlackBlocks(report, sprint) {
  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `${sprint} Status Report`,
      },
    },

    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text:
            `Automated Jira snapshot • ` +
            `${new Date().toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
            })} IST`,
        },
      ],
    },

    {
      type: "divider",
    },

    buildSummaryBlock(report),
  ];

  // Optional full details
  if (config.slack.showDetails) {
    blocks.push({
      type: "divider",
    });

    blocks.push(
      ...buildDetailBlocks(report)
    );
  }

  return blocks;
}

async function sendSlackReport(
  report,
  sprint
) {
  const blocks = buildSlackBlocks(
    report,
    sprint
  );

  await axios.post(
    config.slack.webhookUrl,
    {
      text: `${sprint} Jira Status Report`,
      blocks,
    }
  );

  console.log(
    `Slack report sent successfully to ${config.slack.env}`
  );
}

module.exports = {
  sendSlackReport,
};