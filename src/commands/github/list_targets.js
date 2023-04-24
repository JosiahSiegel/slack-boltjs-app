const list_targets = async ({ respond }) => {
  const deployTargets = process.env.GITHUB_TARGET_BRANCHES.split(",");
  if (deployTargets.length === 0) {
    return respond(
      "No targets branches defined. Set GITHUB_TARGET_BRANCHES first."
    );
  } else {
    respond("Available Target Branches");
    return Array.from(deployTargets).map((target) => respond(`- ${target}`));
  }
};

module.exports = list_targets;
