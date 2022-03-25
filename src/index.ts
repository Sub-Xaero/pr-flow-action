import * as core from "@actions/core";
import * as github from "@actions/github";

class PRFlowAction {

  // This should be a token with access to your repository scoped in as a secret.
  // The YML workflow will need to set myToken with the GitHub Secret Token
  // myToken: ${{ secrets.GITHUB_TOKEN }}
  // https://help.github.com/en/actions/automating-your-workflow-with-github-actions/authenticating-with-the-github_token#about-the-github_token-secret
  declare octokit: ReturnType<typeof github.getOctokit>;

  get context(): typeof github.context {
    return github.context;
  }

  get repo(): typeof github.context.repo {
    return github.context.repo;
  }

  get repoName(): string {
    return this.repo.repo;
  }

  get repoOwner(): string {
    return this.repo.owner;
  }

  get pullRequestNumber(): number {
    if (this.context.payload.pull_request) {
      return this.context.payload.pull_request.number;
    } else {
      throw new Error("No pull request found");
    }
  }

  constructor() {
    const token = core.getInput("token");
    this.octokit = github.getOctokit(token);
  }

  async getReviews(): Promise<any[]> {
    const reviews = await this.octokit.rest.pulls.listReviews({
      owner: this.repoOwner,
      repo: this.repoName,
      pull_number: this.pullRequestNumber,
    });
    return reviews.data;
  }

  async previouslyReviewed(): Promise<boolean> {
    const reviews = await this.getReviews();
    return reviews.length > 0;
  }

  async removePRLabels(labels: Array<string | undefined>) {
    labels = labels.filter(label => label !== undefined);
    console.log(`removingLabels: ${labels.join(",")}`);
    for (let label in labels) {
      if (!label) {
        continue;
      }

      try {
        await this.octokit.rest.issues.deleteLabel({
          owner: this.repoOwner,
          repo: this.repoName,
          issue_number: this.pullRequestNumber,
          name: label,
        });
      } catch (error) {
        //  Do nothing
      }
    }
  }

  async addPRLabels(labels: Array<string | undefined>) {
    let newLabels = labels.filter((label) => label) as string[];
    console.log(`addingLabels: ${newLabels.join(",")}`);

    try {
      await this.octokit.rest.issues.addLabels({
        owner: this.repoOwner,
        repo: this.repoName,
        issue_number: this.pullRequestNumber,
        labels: newLabels,
      });
    } catch (error) {
      //  Do nothing
    }
  }
}

console.log(`Booting...`);

try {
  let action = new PRFlowAction();
  let context = action.context;
  let contextEvent = context.eventName;
  let contextAction = context.payload.action;

  // Get the labels to use from the inputs
  let labels = {
    review: core.getInput("reviewLabel"),
    approved: core.getInput("approvedLabel"),
    changesRequested: core.getInput("changesRequestedLabel"),
    changedSinceLastReview: core.getInput("changedSinceLastReviewLabel"),
  };

  // console.log(`context: ${JSON.stringify(context)}`);
  console.log(`contextEvent: ${contextEvent}, contextAction: ${contextAction}`);
  switch (contextEvent) {
    case 'pull_request':
      if (contextAction === 'opened') {
        console.log(`PR opened`);
        // await action.addPRLabels([labels.review]);
      } else if (contextAction === 'closed') {

        console.log(`PR closed, removing labels`);
        action.removePRLabels([
          labels.review,
          labels.approved,
          labels.changesRequested,
          labels.changedSinceLastReview,
        ])
          .then(() => console.log(`PR closed, labels removed`))
          .catch(() => core.setFailed(`Failed to remove labels`));

      } else if (contextAction === 'review_requested') {
        console.log("reviewRequested: updating labels");

        action.addPRLabels([labels.review])
          .then(() => console.log(`reviewRequested: labels updated`))
          .catch(() => core.setFailed(`Failed to update labels`));

        action.removePRLabels([
          labels.approved,
          labels.changesRequested,
          labels.changedSinceLastReview,
        ]).then(() => {
          console.log(`reviewRequested: labels removed`);
        }).catch(() => core.setFailed(`Failed to remove labels`));

      } else if (contextAction == "synchronize") {
        // If PR previously reviewed
        console.log("synchronize");
        action.previouslyReviewed().then((reviewed) => {
          if (reviewed) {
            // If PR has changed since last review
            console.log("synchronize: updating labels");
            action.addPRLabels([labels.changedSinceLastReview])
              .then(() => console.log(`synchronize: labels updated`))
              .catch(() => core.setFailed(`Failed to update labels`));
          }
        });
      }
      break;
    case "pull_request_review":
      // If the review is approved, remove the for-review label
      console.log("pull_request: updating labels");
      action.removePRLabels([labels.review, labels.changedSinceLastReview])
        .then(() => console.log(`pull_request: labels removed`))
        .catch(() => core.setFailed(`Failed to remove labels`));

      if (context.payload.review.state === "APPROVED") {
        console.log("pull_request_review approved: updating labels");
        action.addPRLabels([labels.approved])
          .then(() => console.log(`pull_request_review approved: labels updated`))
          .catch(() => core.setFailed(`Failed to update labels`));


      } else if (context.payload.review.state === "CHANGES_REQUESTED") {
        console.log("pull_request_review changes_requested: updating labels");

        // If the review is changes requested, remove the for-review label
        action.addPRLabels([labels.changesRequested])
          .then(() => console.log(`pull_request_review changes_requested: labels updated`))
          .catch(() => core.setFailed(`Failed to update labels`));
      } else {
        console.log(`pull_request_review other state: ${context.payload.review.state}`);
      }
      break;
    default:
      console.log(`Unknown event: ${context.eventName}`);
      // core.setFailed(`Unsupported event: ${context.eventName}`);
      break;
  }

} catch (error: any) {
  core.setFailed(error.message);
}

