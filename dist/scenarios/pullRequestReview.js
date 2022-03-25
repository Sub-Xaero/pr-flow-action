"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePullRequestReviewEvent = exports.applyReviewState = void 0;
const labelling_1 = require("../labelling");
function applyReviewState(action, state) {
    if (state === "approved") {
        console.log("pull_request_review approved: updating labels");
        (0, labelling_1.addLabels)(action, [labelling_1.labels.approved]);
    }
    else if (state === "changes_requested") {
        console.log("pull_request_review changes_requested: updating labels");
        (0, labelling_1.addLabels)(action, [labelling_1.labels.changesRequested]);
    }
    else {
        console.log(`pull_request_review other state: ${state}`);
    }
}
exports.applyReviewState = applyReviewState;
function handlePullRequestReviewEvent(action) {
    return __awaiter(this, void 0, void 0, function* () {
        let context = action.context;
        // If the review is approved, remove the for-review label
        console.log("pull_request_review: updating labels");
        (0, labelling_1.removeLabels)(action, [labelling_1.labels.review, labelling_1.labels.changedSinceLastReview]);
        applyReviewState(action, context.payload.review.state);
    });
}
exports.handlePullRequestReviewEvent = handlePullRequestReviewEvent;
