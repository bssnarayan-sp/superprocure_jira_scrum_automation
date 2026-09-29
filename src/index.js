const cron =
  require("node-cron");

const {
  getSprintIssues,
} = require("./jira");

const {
  buildReport,
} = require("./report");

const {
  sendSlackReport,
} = require("./slack");

const config =
  require("./config");

async function run() {
  try {
    console.log(
      `\nGenerating report for ${config.jira.sprint}`
    );

    const issues =
      await getSprintIssues();

    console.log(
      `Total Jira issues: ${issues.length}`
    );

    const report =
      buildReport(issues);

    console.table(
      Object.entries(report)
        .map(([status, data]) => ({
          status,
          count: data.count,
        }))
    );

    await sendSlackReport(
      report,
      config.jira.sprint
    );
  } catch (error) {
    console.error(
      "Report failed:"
    );

    console.error(
      error.response?.data ||
      error.message
    );
  }
}

//
// Run immediately
//

run();

//
// Then every 4 hours
//

cron.schedule(
  // "0 */4 * * *", // every 4 hours (production)
  "*/2 * * * *", // every 2 minutes (testing) — revert before deploying
  async () => {
    console.log(
      "\nScheduled Jira report started"
    );

    await run();
  }
);