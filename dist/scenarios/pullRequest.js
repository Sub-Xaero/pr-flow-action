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
exports.handlePullRequestEvent = void 0;
const labelling_1 = require("../labelling");
function handlePullRequestEvent(action) {
    return __awaiter(this, void 0, void 0, function* () {
        let context = action.context;
        let { action: contextAction } = context;
        if (contextAction === 'opened') {
            console.log(`PR opened`);
            (0, labelling_1.addLabels)(action, [labelling_1.labels.inProgress]);
        }
        else if (contextAction === 'reopened') {
            //
        }
        else if (contextAction === 'converted_to_draft') {
            console.log(`PR drafted, removing review labels`);
            (0, labelling_1.removeAllLabels)(action);
        }
        else if (contextAction === 'ready_for_review') {
            (0, labelling_1.addLabels)(action, [labelling_1.labels.review]);
        }
        else if (contextAction === 'closed') {
            console.log(`PR closed, removing labels`);
            (0, labelling_1.removeAllLabels)(action);
        }
        else if (contextAction === 'review_requested') {
            console.log("reviewRequested: updating labels");
            (0, labelling_1.addLabels)(action, [labelling_1.labels.review]);
            (0, labelling_1.removeLabels)(action, [labelling_1.labels.approved, labelling_1.labels.changesRequested,]);
        }
        else if (contextAction == "synchronize") {
            console.log("synchronize");
            if (yield action.previouslyReviewed()) {
                console.log("synchronize: updating labels");
                (0, labelling_1.addLabels)(action, [labelling_1.labels.changedSinceLastReview]);
            }
        }
    });
}
exports.handlePullRequestEvent = handlePullRequestEvent;
