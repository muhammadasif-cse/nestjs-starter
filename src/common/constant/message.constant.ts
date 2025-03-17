import { ActionEnum } from '../enum/action.enum';

export const NOT_FOUND = (name: string) =>
  `We couldn't find the ${name} you're looking for. Please ensure the details are correct.`;
export const NOT_FOUND_ERROR = (name: string) =>
  `The requested ${name} does not exist in our records. Please double-check and try again.`;

export const SUCCESS = (action: ActionEnum, name: string) => {
  switch (action) {
    case ActionEnum.GET:
      return `Your ${name} has been successfully retrieved.`;
    case ActionEnum.CREATE:
      return `Your ${name} has been successfully created.`;
    case ActionEnum.UPDATE:
      return `Your ${name} has been successfully updated.`;
    case ActionEnum.DELETE:
      return `Your ${name} has been successfully deleted.`;
    default:
      return `The operation on ${name} was successfully completed.`;
  }
};
