const {
  getSprintIssues,
} = require("../src/jira");

const {
  buildReport,
} = require("../src/report");

const {
  sendSlackReport,
} = require("../src/slack");

const config =
  require("../src/config");

module.exports = async function handler(req, res) {
  try {
    const authHeader =
      req.headers.authorization;

    const expectedSecret =
      process.env.CRON_SECRET;

    if (
      !expectedSecret ||
      authHeader !== `Bearer ${expectedSecret}`
    ) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    console.log(
      `Generating report for ${config.jira.sprint}`
    );

    const issues =
      await getSprintIssues();

    console.log(
      `Fetched ${issues.length} Jira issues`
    );

    const report =
      buildReport(issues);

    await sendSlackReport(
      report,
      config.jira.sprint
    );

    return res.status(200).json({
      success: true,
      sprint: config.jira.sprint,
      issues: issues.length,
    });
  } catch (error) {
    console.error(
      error.response?.data ||
      error.message
    );

    return res.status(500).json({
      success: false,
      error:
        error.response?.data ||
        error.message,
    });
  }
};