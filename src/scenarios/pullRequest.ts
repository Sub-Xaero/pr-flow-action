import {addLabels, labels, removeAllLabels, removeLabels} from "../labelling";
import {PRFlowAction} from "../prFlowAction";

export async function handlePullRequestEvent(action: PRFlowAction) {
  let context = action.context;

  let {action: contextAction} = context;

  if (contextAction === 'opened') {
    console.log(`PR opened`);
    addLabels(action, [labels.inProgress]);
  } else if (contextAction === 'reopened') {
    //

  } else if (contextAction === 'converted_to_draft') {
    console.log(`PR drafted, removing review labels`);
    removeAllLabels(action);

  } else if (contextAction === 'ready_for_review') {
    addLabels(action, [labels.review]);

  } else if (contextAction === 'closed') {
    console.log(`PR closed, removing labels`);
    removeAllLabels(action);

  } else if (contextAction === 'review_requested') {
    console.log("reviewRequested: updating labels");

    addLabels(action, [labels.review]);
    removeLabels(action, [labels.approved, labels.changesRequested,]);
  } else if (contextAction == "synchronize") {
    console.log("synchronize");

    if (await action.previouslyReviewed()) {
      console.log("synchronize: updating labels");
      addLabels(action, [labels.changedSinceLastReview]);
    }
  }
}
