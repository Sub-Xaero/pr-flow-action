// Get the labels to use from the inputs
import * as core from "@actions/core";
import {PRFlowAction} from "./prFlowAction";

export let labels = {
  review: core.getInput("reviewLabel"),
  approved: core.getInput("approvedLabel"),
  changesRequested: core.getInput("changesRequestedLabel"),
  changedSinceLastReview: core.getInput("changedSinceLastReviewLabel"),
  inProgress: core.getInput("inProgressLabel"),
};

export function removeLabels(action: PRFlowAction, labels: Array<string | undefined>) {
  action.removePRLabels(labels)
    .then(() => console.log(`Labels '${labels.join(', ')}' removed`))
    .catch(() => core.setFailed(`Failed to remove labels`));
}

export function removeAllLabels(action: PRFlowAction) {
  removeLabels(
    action,
    [
      labels.inProgress,
      labels.review,
      labels.approved,
      labels.changesRequested,
      labels.changedSinceLastReview,
    ],
  );
}

export function addLabels(action: PRFlowAction, labels: Array<string | undefined>) {
  action.addPRLabels(labels)
    .then(() => console.log(`Labels '${labels.join(', ')}' added`))
    .catch(() => core.setFailed(`Failed to add labels`));
}
