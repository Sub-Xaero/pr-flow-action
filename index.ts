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

(async () => {
  try {
    let action = new PRFlowAction();
    let context = action.context;
    let contextAction = context.action;

    // Get the labels to use from the inputs
    let labels = {
      review: core.getInput("reviewLabel"),
      approved: core.getInput("approvedLabel"),
      changesRequested: core.getInput("changesRequestedLabel"),
      changedSinceLastReview: core.getInput("changedSinceLastReviewLabel"),
    };

    switch (context.eventName) {
      case 'pull_request':
        if (contextAction === 'opened') {
          // await action.addPRLabels([labels.review]);
        } else if (contextAction === 'closed') {
          await action.removePRLabels([
            labels.review,
            labels.approved,
            labels.changesRequested,
            labels.changedSinceLastReview,
          ]);
        } else if (contextAction === 'review_requested') {
          await action.addPRLabels([labels.review]);
          await action.removePRLabels([
            labels.approved,
            labels.changesRequested,
            labels.changedSinceLastReview,
          ]);

        } else if (contextAction == "synchronize") {
          // If PR previously reviewed
          if (await action.previouslyReviewed()) {
            // If PR has changed since last review
            await action.addPRLabels([labels.changedSinceLastReview]);
          }
        }
        break;
      case "pull_request_review":
        // If the review is approved, remove the for-review label
        await action.removePRLabels([labels.review, labels.changedSinceLastReview]);
        if (context.payload.review.state === "APPROVED") {
          await action.addPRLabels([labels.approved]);
        } else if (context.payload.review.state === "CHANGES_REQUESTED") {
          // If the review is changes requested, remove the for-review label
          await action.addPRLabels([labels.changesRequested]);
        }
        break;
      default:
        // core.setFailed(`Unsupported event: ${context.eventName}`);
        break;
    }

  } catch (error: any) {
    core.setFailed(error.message);
  }

})();
